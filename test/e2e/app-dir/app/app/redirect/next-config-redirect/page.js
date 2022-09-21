import Link from 'next/link'

export default function Page() {
  return (
    <>
      <Link href="/redirect/a">
        <a id="redirect-a">To Dashboard through /redirect/a</a>
      </Link>
    </>
  )
}
