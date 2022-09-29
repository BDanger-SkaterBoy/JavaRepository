import MuxPlayer from '@mux/mux-player-react'
import Link from 'next/link'
import Layout from '../../components/layout'
import Spinner from '../../components/spinner'
import { MUX_HOME_PAGE_URL } from '../../constants'
import { useRouter } from 'next/router'

export function getStaticProps({ params: { id: playbackId } }) {
  const poster = `https://image.mux.com/${playbackId}/thumbnail.png`

  return { props: { playbackId, poster } }
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

const Code = ({ children }) => (
  <>
    <span className="code">{children}</span>
    <style jsx>{`
      .code {
        font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
          DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace,
          serif;
        color: #ff2b61;
      }
    `}</style>
  </>
)

export default function Playback({ playbackId, poster }) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  return (
    <Layout
      metaTitle="View this video created with Mux + Next.js"
      image={poster}
      loadTwitterWidget
    >
      <div className="flash-message">This video is ready for playback</div>
      <MuxPlayer style={{ width: '100%' }} playbackId={playbackId} />
      <p>
        Go{' '}
        <Link href="/">
          <a>back home</a>
        </Link>{' '}
        to upload another video.
      </p>
      <div className="about-playback">
        <p>
          This video was uploaded and processed by{' '}
          <a href={MUX_HOME_PAGE_URL} target="_blank" rel="noopener noreferrer">
            Mux
          </a>
          . This page was pre-rendered with{' '}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>{' '}
          using <Code>`getStaticPaths`</Code> and <Code>`getStaticProps`</Code>.
        </p>
        <p>
          Thanks to pre-rendering this page is easily sharable on social and has
          an <Code>`og:image`</Code> thumbnail generated by Mux. Try clicking
          the Twitter button below to share:
        </p>
        <div className="share-button">
          <a
            className="twitter-share-button"
            data-size="large"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://twitter.com/intent/tweet?text=Check%20out%20the%20video%20I%20uploaded%20with%20Next.js%2C%20%40Vercel%2C%20and%20%40muxhq%20`}
          >
            Tweet this
          </a>
        </div>
        <p>
          To learn more,{' '}
          <a
            href="https://github.com/vercel/next.js/tree/canary/examples/with-mux-video"
            target="_blank"
            rel="noopener noreferrer"
          >
            check out the source code on GitHub
          </a>
          .
        </p>
      </div>
      <style jsx>{`
        .flash-message {
          position: absolute;
          top: 0;
          background-color: #c1dcc1;
          width: 100%;
          text-align: center;
          padding: 20px 0;
        }
        .share-button {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 40px 0;
        }
      `}</style>
    </Layout>
  )
}
