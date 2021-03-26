import { codecs as supportedFormats, preprocessors } from './codecs'
import ImageData from './image_data'

type RotateOperation = {
  type: 'rotate'
  numRotations: number
}
type ResizeOperation = {
  type: 'resize'
  width: number
}
export type Operation = RotateOperation | ResizeOperation
export type Encoding = 'jpeg' | 'png' | 'webp'

export async function processBuffer(
  buffer: Buffer | Uint8Array,
  operations: Operation[],
  encoding: Encoding,
  quality: number
): Promise<Buffer | Uint8Array> {
  let imageData = await decodeBuffer(buffer)
  for (const operation of operations) {
    if (operation.type === 'rotate') {
      imageData = await rotate(imageData, operation.numRotations)
    } else if (operation.type === 'resize') {
      if (imageData.width && imageData.width > operation.width) {
        imageData = await resize(imageData, operation.width)
      }
    }
  }

  switch (encoding) {
    case 'jpeg':
      return encodeJpeg(imageData, { quality })
    case 'webp':
      return encodeWebp(imageData, { quality })
    case 'png':
      return encodePng(imageData)
    default:
      throw Error(`Unsupported encoding format`)
  }
}

async function decodeBuffer(_buffer: Buffer | Uint8Array): Promise<ImageData> {
  const buffer = Buffer.from(_buffer)
  const firstChunk = buffer.slice(0, 16)
  const firstChunkString = Array.from(firstChunk)
    .map((v) => String.fromCodePoint(v))
    .join('')
  const key = Object.entries(supportedFormats).find(([, { detectors }]) =>
    detectors.some((detector) => detector.exec(firstChunkString))
  )?.[0] as keyof typeof supportedFormats
  if (!key) {
    throw Error(`Buffer has an unsupported format`)
  }
  const d = await supportedFormats[key].dec()
  const rgba = d.decode(new Uint8Array(buffer))
  return rgba
}

async function rotate(
  image: ImageData,
  numRotations: number
): Promise<ImageData> {
  image = ImageData.from(image)

  const m = await preprocessors['rotate'].instantiate()
  return await m(image.data, image.width, image.height, { numRotations })
}

async function resize(image: ImageData, width: number) {
  image = ImageData.from(image)

  const p = preprocessors['resize']
  const m = await p.instantiate()
  return await m(image.data, image.width, image.height, {
    ...p.defaultOptions,
    width,
  })
}

async function encodeJpeg(
  image: ImageData,
  { quality }: { quality: number }
): Promise<Buffer | Uint8Array> {
  image = ImageData.from(image)

  const e = supportedFormats['mozjpeg']
  const m = await e.enc()
  const r = await m.encode!(image.data, image.width, image.height, {
    ...e.defaultEncoderOptions,
    quality,
  })
  return Buffer.from(r)
}

async function encodeWebp(
  image: ImageData,
  { quality }: { quality: number }
): Promise<Buffer | Uint8Array> {
  image = ImageData.from(image)

  const e = supportedFormats['webp']
  const m = await e.enc()
  const r = await m.encode!(image.data, image.width, image.height, {
    ...e.defaultEncoderOptions,
    quality,
  })
  return Buffer.from(r)
}

async function encodePng(image: ImageData): Promise<Buffer | Uint8Array> {
  image = ImageData.from(image)

  const e = supportedFormats['oxipng']
  const m = await e.enc()
  const r = await m.encode(image.data, image.width, image.height, {
    ...e.defaultEncoderOptions,
  })
  return Buffer.from(r)
}
