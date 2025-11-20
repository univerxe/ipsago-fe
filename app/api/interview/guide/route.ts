import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadJobById } from '@/lib/jobs-data'

const GUIDE_SYSTEM_PROMPT = `You are a Korean interview coach who creates actionable preparation guides for foreign candidates.
Your response must be strictly valid JSON with the following structure:
{
  "jobOverview": string,
  "companyInsight": string,
  "keyCompetencies": string[],
  "preparationTimeline": [
    {
      "phase": string,
      "focus": string,
      "actions": string[]
    }
  ],
  "practiceQuestions": [
    {
      "question": string,
      "whyItMatters": string,
      "howToAnswer": string
    }
  ],
  "bonusTips": string[]
}

- Keep tone encouraging and concise.
- Tailor the content to the given job description and required skills.
- Provide 4-6 key competencies, 3-4 timeline steps, and 4-5 practice questions.
- Use Korean language throughout.`

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const jobId = body?.jobId

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const job = await loadJobById(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: GUIDE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `
Job Title: ${job.title}
Company: ${job.company}
Role Category: ${job.roleCategory}

Responsibilities:
${job.responsibilities.join('\n')}

Required Qualifications:
${job.required.join('\n')}

Preferred Qualifications:
${job.preferred.join('\n')}

Key Skills:
${job.skills.join(', ')}

Job Description:
${job.description}
`,
        },
      ],
    })

    const rawContent = response.choices[0]?.message?.content?.trim()

    if (!rawContent) {
      throw new Error('No content returned from OpenAI')
    }

    const cleaned = rawContent.replace(/```json|```/g, '').trim()
    let guideData

    try {
      guideData = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse JSON from OpenAI:', parseError, cleaned)
      return NextResponse.json(
        {
          error: 'Failed to parse guide response',
          details: rawContent,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ guide: guideData })
  } catch (error) {
    console.error('Failed to generate interview guide:', error)
    return NextResponse.json(
      { error: 'Failed to generate interview guide' },
      { status: 500 },
    )
  }
}

