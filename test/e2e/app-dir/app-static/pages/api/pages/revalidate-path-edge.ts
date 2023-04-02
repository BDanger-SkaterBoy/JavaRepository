import { NextRequest, NextResponse, revalidatePath } from 'next/server'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '/'
  try {
    console.log('revalidating path', path)
    await revalidatePath(path)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    console.error('Failed to revalidate', path, err)
    return NextResponse.json({ revalidated: false, now: Date.now() })
  }
}
