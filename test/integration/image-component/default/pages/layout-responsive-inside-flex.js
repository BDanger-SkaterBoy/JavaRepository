import React from 'react'
import Image from 'next/image'
import img from '../public/test.jpg'

const Page = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Image layout="responsive" src={img} />
    </div>
  )
}

export default Page
