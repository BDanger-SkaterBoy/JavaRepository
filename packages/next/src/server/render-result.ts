import type { OutgoingHttpHeaders, ServerResponse } from 'http'
import type { Revalidate } from './lib/revalidate'
import type { FetchMetrics } from './base-http'

import {
  chainStreams,
  streamFromBuffer,
  streamFromString,
  streamToBuffer,
  streamToString,
} from './stream-utils'
import { isAbortError, pipeToNodeResponse } from './pipe-readable'
import type { Readable, Writable } from 'stream'

type ContentTypeOption = string | undefined

export type AppPageRenderResultMetadata = {
  flightData?: Uint8Array
  revalidate?: Revalidate
  staticBailoutInfo?: {
    stack?: string
    description?: string
  }

  /**
   * The postponed state if the render had postponed and needs to be resumed.
   */
  postponed?: string

  /**
   * The headers to set on the response that were added by the render.
   */
  headers?: OutgoingHttpHeaders
  fetchTags?: string
  fetchMetrics?: FetchMetrics
}

export type PagesRenderResultMetadata = {
  pageData?: any
  revalidate?: Revalidate
  assetQueryString?: string
  isNotFound?: boolean
  isRedirect?: boolean
}

export type StaticRenderResultMetadata = {}

export type RenderResultMetadata = AppPageRenderResultMetadata &
  PagesRenderResultMetadata &
  StaticRenderResultMetadata

export type RenderResultResponse =
  | Readable[]
  | Readable
  | ReadableStream<Uint8Array>[]
  | ReadableStream<Uint8Array>
  | string
  | Uint8Array
  | null

export type RenderResultOptions<
  Metadata extends RenderResultMetadata = RenderResultMetadata,
> = {
  contentType?: ContentTypeOption
  waitUntil?: Promise<unknown>
  metadata: Metadata
}

export default class RenderResult<
  Metadata extends RenderResultMetadata = RenderResultMetadata,
> {
  /**
   * The detected content type for the response. This is used to set the
   * `Content-Type` header.
   */
  public readonly contentType: ContentTypeOption

  /**
   * The metadata for the response. This is used to set the revalidation times
   * and other metadata.
   */
  public readonly metadata: Readonly<Metadata>

  /**
   * The response itself. This can be a string, a stream, or null. If it's a
   * string, then it's a static response. If it's a stream, then it's a
   * dynamic response. If it's null, then the response was not found or was
   * already sent.
   */
  private response: RenderResultResponse

  /**
   * Creates a new RenderResult instance from a static response.
   *
   * @param value the static response value
   * @returns a new RenderResult instance
   */
  public static fromStatic(value: string | Buffer) {
    return new RenderResult<StaticRenderResultMetadata>(value, { metadata: {} })
  }

  private readonly waitUntil?: Promise<unknown>

  constructor(
    response: RenderResultResponse,
    { contentType, waitUntil, metadata }: RenderResultOptions<Metadata>
  ) {
    this.response = response
    this.contentType = contentType
    this.metadata = metadata
    this.waitUntil = waitUntil
  }

  public assignMetadata(metadata: Metadata) {
    Object.assign(this.metadata, metadata)
  }

  /**
   * Returns true if the response is null. It can be null if the response was
   * not found or was already sent.
   */
  public get isNull(): boolean {
    return this.response === null
  }

  /**
   * Returns false if the response is a string. It can be a string if the page
   * was prerendered. If it's not, then it was generated dynamically.
   */
  public get isDynamic(): boolean {
    return typeof this.response !== 'string'
  }

  public toUnchunkedBuffer(stream?: false): Uint8Array
  public toUnchunkedBuffer(stream: true): Promise<Uint8Array>
  public toUnchunkedBuffer(stream = false): Promise<Uint8Array> | Uint8Array {
    if (this.response === null) {
      throw new Error('Invariant: null responses cannot be unchunked')
    }

    if (typeof this.response !== 'string') {
      if (!stream) {
        throw new Error(
          'Invariant: dynamic responses cannot be unchunked. This is a bug in Next.js'
        )
      }

      return streamToBuffer(this.readable)
    }

    const encoder = new TextEncoder()

    return encoder.encode(this.response)
  }

  /**
   * Returns the response if it is a string. If the page was dynamic, this will
   * return a promise if the `stream` option is true, or it will throw an error.
   *
   * @param stream Whether or not to return a promise if the response is dynamic
   * @returns The response as a string
   */
  public toUnchunkedString(stream?: false): string
  public toUnchunkedString(stream: true): Promise<string>
  public toUnchunkedString(stream = false): Promise<string> | string {
    if (this.response === null) {
      throw new Error('Invariant: null responses cannot be unchunked')
    }

    if (typeof this.response !== 'string') {
      if (!stream) {
        throw new Error(
          'Invariant: dynamic responses cannot be unchunked. This is a bug in Next.js'
        )
      }

      return streamToString(this.readable)
    }

    return this.response
  }

  /**
   * Returns the response if it is a stream, or throws an error if it is a
   * string.
   */
  private get readable(): Readable | ReadableStream<Uint8Array> {
    if (this.response === null) {
      throw new Error('Invariant: null responses cannot be streamed')
    }
    if (typeof this.response === 'string') {
      throw new Error('Invariant: static responses cannot be streamed')
    }

    if (this.response instanceof Uint8Array) {
      return streamFromBuffer(this.response)
    }

    // If the response is an array of streams, then chain them together.
    if (Array.isArray(this.response)) {
      return chainStreams(...this.response)
    }

    return this.response
  }

  /**
   * Chains a new stream to the response. This will convert the response to an
   * array of streams if it is not already one and will add the new stream to
   * the end. When this response is piped, all of the streams will be piped
   * one after the other.
   *
   * @param readable The new stream to chain
   */
  public chain(readable: Readable | ReadableStream<Uint8Array>) {
    if (this.response === null) {
      throw new Error('Invariant: response is null. This is a bug in Next.js')
    }

    // If the response is not an array of streams already, make it one.
    let responses: ReadableStream<Uint8Array>[] | Readable[]
    if (typeof this.response === 'string') {
      // @ts-ignore
      responses = [streamFromString(this.response)]
    } else if (Array.isArray(this.response)) {
      responses = this.response
    } else if (this.response instanceof Uint8Array) {
      // @ts-ignore
      responses = [streamFromBuffer(this.response)]
    } else {
      // @ts-ignore
      responses = [this.response]
    }

    if (
      (responses[0] instanceof ReadableStream &&
        !(readable instanceof ReadableStream)) ||
      (!(responses[0] instanceof ReadableStream) &&
        readable instanceof ReadableStream)
    ) {
      throw new Error('Invariant. Cannot mix stream types')
    }

    // Add the new stream to the array.
    // @ts-ignore
    responses.push(readable)

    // Update the response.
    this.response = responses
  }

  /**
   * Pipes the response to a writable stream. This will close/cancel the
   * writable stream if an error is encountered. If this doesn't throw, then
   * the writable stream will be closed or aborted.
   *
   * @param writable Writable stream to pipe the response to
   */
  public async pipeTo(
    writable: Writable | WritableStream<Uint8Array>
  ): Promise<void> {
    const writableInstanceOfWritableStream = writable instanceof WritableStream
    const readableInstanceOfReadableStream =
      this.readable instanceof ReadableStream

    if (writableInstanceOfWritableStream && readableInstanceOfReadableStream) {
      try {
        // @ts-ignore
        await this.readable.pipeTo(writable, {
          // We want to close the writable stream ourselves so that we can wait
          // for the waitUntil promise to resolve before closing it. If an error
          // is encountered, we'll abort the writable stream if we swallowed the
          // error.
          preventClose: true,
        })

        // If there is a waitUntil promise, wait for it to resolve before
        // closing the writable stream.
        if (this.waitUntil) await this.waitUntil

        // Close the writable stream.
        // @ts-ignore
        await writable.close()
      } catch (err) {
        // If this is an abort error, we should abort the writable stream (as we
        // took ownership of it when we started piping). We don't need to re-throw
        // because we handled the error.
        if (isAbortError(err)) {
          // Abort the writable stream if an error is encountered.
          // @ts-ignore
          await writable.abort(err)

          return
        }

        // We're not aborting the writer here as when this method throws it's not
        // clear as to how so the caller should assume it's their responsibility
        // to clean up the writer.
        throw err
      }
    } else if (
      process.env.NEXT_RUNTIME === 'nodejs' &&
      !readableInstanceOfReadableStream &&
      !writableInstanceOfWritableStream
    ) {
      const { Writable } =
        require('node:stream') as typeof import('node:stream')
      // at least we know `this.readable` is a Readable
      if (writable instanceof WritableStream) {
        writable = Writable.fromWeb(writable)
      }

      this.readable.pipe(writable, { end: false })
      if (this.waitUntil) await this.waitUntil
      writable.end()
    } else {
      throw new Error(
        `Invariant. Mistmatching stream types. Readable ${readableInstanceOfReadableStream ? 'is' : 'is not'} an instance of ReadableStream. Writable ${writableInstanceOfWritableStream ? 'is' : 'is not'} an instance of WritableStream.`
      )
    }
  }

  /**
   * Pipes the response to a node response. This will close/cancel the node
   * response if an error is encountered.
   *
   * @param res
   */
  public async pipeToNodeResponse(res: ServerResponse) {
    await pipeToNodeResponse(this.readable, res, this.waitUntil)
  }
}
