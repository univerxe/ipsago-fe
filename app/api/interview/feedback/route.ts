import { NextRequest, NextResponse } from 'next/server'
import { generateFeedback, InterviewContext } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, history } = body as {
      context: InterviewContext
      history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const feedback = await generateFeedback(context, history)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Feedback generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}

