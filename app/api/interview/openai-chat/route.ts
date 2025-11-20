import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

type DeltaContentChunk = string | { text?: string }

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Received OpenAI interview chat request')
    
    const body = await request.json()
    const { interviewType = 'standard', jobData, userProfile, conversationHistory, userMessage } = body

    console.log('📝 User message:', userMessage.substring(0, 50) + '...')
    console.log('🔑 API Key check:', process.env.OPENAI_API_KEY ? 'Found ✅' : 'Missing ❌')

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get interview type specific instructions
    const getInterviewTypeInstructions = () => {
      if (interviewType === 'personality') {
        return `
**면접 유형: 인성 면접 (Personality Test)**

지원자의 인성, 가치관, 행동, 문화 적합성을 평가하는 면접입니다.

**질문 카테고리:**
1. 팀워크 & 협업
2. 갈등 해결
3. 리더십 경험
4. 스트레스 관리
5. 실패 & 학습
6. 윤리적 딜레마
7. 회사 문화 적합성
8. 장기 커리어 목표

**질문 스타일:**
- "~했던 경험에 대해 말씀해 주세요"
- "~을 어떻게 처리하셨나요"
- "~한 상황을 설명해 주세요"
- STAR 방식 유도 (Situation, Task, Action, Result)
- 과거 경험과 행동에 초점
- 가치관과 동기 파악
- 답변에 대해 깊이 있게 질문

**질문 특징:**
- 개방형 질문
- 실제 경험 기반
- 행동 패턴 중심
- 질문당 2-3문장 이내
`
      } else {
        return `
**면접 유형: 기술 면접 (Technical Interview)**

지원자의 기술적 역량, 문제 해결 능력, 실무 경험을 평가하는 면접입니다.

**질문 카테고리:**
1. 기술 스택 경험 (${jobData.skills?.join(', ')})
2. 시스템 아키텍처 & 설계
3. 문제 해결 접근 방식
4. 코드 품질 & 최적화
5. 디버깅 & 트러블슈팅
6. 최신 기술 트렌드 & 베스트 프랙티스
7. 도구 & 방법론
8. 기술적 의사결정

**질문 스타일:**
- "~를 어떻게 구현하셨나요..."
- "왜 ~를 선택하셨나요..."
- "~를 어떻게 최적화하시겠습니까..."
- "어떤 문제가 있었고 어떻게 해결하셨나요..."
- "아키텍처 결정에 대해 설명해 주세요..."
- 구체적인 기술 세부사항 요청
- 지표와 결과 요청
- 기술 선택에 대해 도전적 질문
- Trade-off에 대해 질문

**질문 특징:**
- 기술적으로 구체적
- 실제 구현에 초점
- 구체적인 예시 요청
- 성능과 확장성에 대해 질문
- 질문당 2-3문장 이내
`
      }
    }
    
    // Build system message with job and resume context - IN KOREAN
    const systemMessage = `당신은 ${jobData.company}의 ${jobData.title} 포지션에 대한 면접을 진행하는 전문 HR 면접관입니다.

${getInterviewTypeInstructions()}

**채용 공고:**
${jobData.description || '정보 없음'}

**요구 기술:**
${jobData.skills?.join(', ') || '명시되지 않음'}

**주요 업무:**
${jobData.responsibilities?.slice(0, 3).join('\n') || '명시되지 않음'}

**지원자 정보:**
- 이름: ${userProfile.fullName || '지원자'}
- 경력: ${userProfile.experience || '0'}년
- 기술: ${userProfile.skills || '명시되지 않음'}
- 희망 직무: ${userProfile.targetRole || '명시되지 않음'}

**이력서 내용:**
${userProfile.resumeText ? userProfile.resumeText.substring(0, 2000) : '이력서 정보 없음. 위의 기술과 경력 정보를 사용하세요.'}

**면접 진행 방식:**
1. 채용 공고와 지원자 배경을 바탕으로 관련 질문
2. 한 번에 하나의 질문만
3. 전문적이면서도 친근하게
4. 지원자 답변에 대해 후속 질문
5. 이 직무에 대한 적합성 평가
6. 답변은 간결하게 (2-3문장 이내)
7. 답변에 따라 점진적으로 난이도 상승
8. 면접 유형에 따라 관련 영역 커버

**중요 지침:**
- 한국 취업 시장 진입을 위한 면접 연습
- 지지적이고 격려하는 태도
- 명확하고 구체적인 질문 제공
- 구체적인 예시와 세부사항 요청
- 실제 경험에 초점
- 모든 질문과 답변은 한국어로 진행`

    // Build conversation messages
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ]

    console.log('🚀 Sending to OpenAI (streaming)...')

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Fast and cost-effective
            messages,
            temperature: 0.7,
            max_tokens: 300,
            stream: true,
          })

          for await (const part of completion) {
            const deltaContent = part.choices?.[0]?.delta?.content
            let contentChunk = ''

            if (typeof deltaContent === 'string') {
              contentChunk = deltaContent
            } else if (Array.isArray(deltaContent)) {
              contentChunk = (deltaContent as DeltaContentChunk[])
                .map((chunk) => (typeof chunk === 'string' ? chunk : chunk?.text ?? ''))
                .join('')
            }

            if (contentChunk) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token: contentChunk })}\n\n`)
              )
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, timestamp: new Date().toISOString() })}\n\n`
            )
          )
          controller.close()
        } catch (streamError: any) {
          console.error('❌ Streaming error:', streamError)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: streamError?.message || 'Streaming error' })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('❌ OpenAI chat error:', error)
    console.error('❌ Error message:', error?.message)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

