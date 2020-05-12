import { useState } from 'react'
import Router from 'next/router'
import Layout from '../components/layout'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const createUpload = async evt => {
    try {
      evt.preventDefault()
      await setIsLoading(true)
      const { upload_id } = await fetch('/api/upload', {
        method: 'POST',
      }).then(res => res.json())
      Router.push(`/upload/${upload_id}`)
    } catch (e) {
      console.error('Error in createUpload', e)
      setErrorMessage('Error creating upload')
    }
  }

  console.log('debug isLoading', isLoading)

  return (
    <Layout
      title="Welcome to Mux + Next.js"
      description="Get started by uploading a video"
    >
      {errorMessage ? (
        <div>Error: {errorMessage}</div>
      ) : (
        <form onSubmit={createUpload}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <button type="submit">Upload a video</button>
          )}
        </form>
      )}
    </Layout>
  )
}
