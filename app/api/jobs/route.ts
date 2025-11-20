import { NextRequest, NextResponse } from 'next/server'
import { loadJobs } from '@/lib/jobs-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Number(limitParam) : undefined

    const jobs = await loadJobs(limit)
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Failed to load jobs list:', error)
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 })
  }
}

