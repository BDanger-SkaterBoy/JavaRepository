'use client'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

export const dynamicParams = false

function Pathname() {
  return <p id="pathname">{usePathname()}</p>
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Pathname />
    </Suspense>
  )
}
