import { NextRequest, NextResponse } from 'next/server'
import { generateInterviewResponse, InterviewContext } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Received interview chat request')
    
    const body = await request.json()
    const { context, history, phase, userMessage } = body as {
      context: InterviewContext
      history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
      phase: 'intro' | 'technical' | 'behavioral' | 'closing'
      userMessage: string
    }

    console.log('📝 User message:', userMessage.substring(0, 50) + '...')
    console.log('🔑 API Key check:', process.env.GEMINI_API_KEY ? 'Found ✅' : 'Missing ❌')

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 Generating response via Gemini API...')
    
    // Generate response using Gemini
    const chat = await generateInterviewResponse(context, history, phase)
    console.log('✅ Chat session created')
    
    const result = await chat.sendMessage(userMessage)
    console.log('✅ Message sent')
    
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Response received:', text.substring(0, 100) + '...')

    return NextResponse.json({
      message: text,
      phase,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Interview chat error:', error)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error stack:', error?.stack)
    
    // Return more detailed error
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error?.message || 'Unknown error',
        type: error?.constructor?.name || 'Error'
      },
      { status: 500 }
    )
  }
}

