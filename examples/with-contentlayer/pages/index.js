import Link from 'next/link'
import Head from 'next/head'
import { allPosts } from '.contentlayer/data'
import { pick } from '../lib/pick'
import utilStyles from '../styles/utils.module.css'

export default function Home({ posts }) {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {posts.map(({ slug, date, title }) => (
            <li className={utilStyles.listItem} key={slug}>
              <Link href={`/posts/${slug}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>{date}</small>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export async function getStaticProps() {
  const posts = allPosts.map((post) => pick(post, ['title', 'date', 'slug']))

  return { props: { posts } }
}
