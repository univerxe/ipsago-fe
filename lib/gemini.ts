import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface InterviewContext {
  jobTitle: string
  company: string
  jobDescription: string
  responsibilities: string[]
  requiredQualifications: string[]
  preferredQualifications: string[]
  skills: string[]
  userProfile: {
    name: string
    email: string
    age?: string
    nationality?: string
    skills: string
    experience: string
    resumeText?: string
  }
}

export function createInterviewPrompt(context: InterviewContext, phase: 'intro' | 'technical' | 'behavioral' | 'closing') {
  const skills = Array.isArray(context.skills) ? context.skills.join(', ') : 'General skills'
  const responsibilities = Array.isArray(context.responsibilities) && context.responsibilities.length > 0
    ? context.responsibilities.slice(0, 3).join('; ')
    : 'Various responsibilities'
  
  const basePrompt = `You are an expert Korean HR interviewer conducting an interview in English for a ${context.jobTitle || 'position'} at ${context.company || 'the company'}.

**Job Details:**
- Position: ${context.jobTitle || 'Not specified'}
- Company: ${context.company || 'Not specified'}
- Key Skills: ${skills}
- Responsibilities: ${responsibilities}

**Candidate Profile:**
- Name: ${context.userProfile?.name || 'Candidate'}
- Nationality: ${context.userProfile?.nationality || 'Not specified'}
- Experience: ${context.userProfile?.experience || '0'} years
- Skills: ${context.userProfile?.skills || 'Not specified'}
${context.userProfile?.resumeText ? `- Resume Summary: ${context.userProfile.resumeText.substring(0, 500)}` : ''}

**Interview Phase:** ${phase}

**Instructions:**
- Be professional, friendly, and encouraging
- Ask ONE question at a time
- Keep questions relevant to the job requirements
- For technical phase: Focus on skills and experience
- For behavioral phase: Use STAR method questions
- Provide natural conversation flow
- Keep responses concise (2-3 sentences max)
- If candidate struggles, offer helpful hints

**Current Phase Guidelines:**
${getPhaseGuidelines(phase)}

Remember: You are helping a foreigner prepare for Korean job market interviews. Be supportive while maintaining professionalism.`

  return basePrompt
}

function getPhaseGuidelines(phase: string): string {
  switch (phase) {
    case 'intro':
      return `- Welcome the candidate warmly
- Ask them to introduce themselves briefly
- Show genuine interest in their background
- Transition naturally to main interview`
    
    case 'technical':
      return `- Ask about specific technical skills from their resume
- Probe into past projects and experiences
- Ask how they would solve relevant problems
- Assess their knowledge depth`
    
    case 'behavioral':
      return `- Use STAR method (Situation, Task, Action, Result)
- Ask about teamwork, challenges, leadership
- Explore cultural fit and adaptability
- Understand their motivations`
    
    case 'closing':
      return `- Ask if they have questions about the role/company
- Discuss next steps
- Thank them for their time
- End on a positive note`
    
    default:
      return ''
  }
}

export async function generateInterviewResponse(
  context: InterviewContext,
  conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  phase: 'intro' | 'technical' | 'behavioral' | 'closing'
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  const systemPrompt = createInterviewPrompt(context, phase)
  
  const chat = model.startChat({
    history: conversationHistory,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 200,
    },
  })

  return chat
}

export async function generateFeedback(
  context: InterviewContext,
  conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  const feedbackPrompt = `You are an expert interview coach. Analyze this interview conversation and provide detailed feedback.

**Job Position:** ${context.jobTitle} at ${context.company}

**Conversation:**
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.parts[0].text}`).join('\n\n')}

Provide comprehensive feedback in JSON format with these categories:
{
  "overallScore": number (0-100),
  "categories": [
    {
      "name": "Communication Skills",
      "score": number (0-100),
      "feedback": ["point 1", "point 2"],
      "strengths": ["strength 1"],
      "improvements": ["improvement 1"]
    },
    {
      "name": "Technical Knowledge",
      "score": number (0-100),
      "feedback": ["point 1"],
      "strengths": ["strength 1"],
      "improvements": ["improvement 1"]
    },
    {
      "name": "Problem Solving",
      "score": number (0-100),
      "feedback": ["point 1"],
      "strengths": ["strength 1"],
      "improvements": ["improvement 1"]
    },
    {
      "name": "Cultural Fit",
      "score": number (0-100),
      "feedback": ["point 1"],
      "strengths": ["strength 1"],
      "improvements": ["improvement 1"]
    }
  ],
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2", "area 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Be specific, constructive, and encouraging.`

  const result = await model.generateContent(feedbackPrompt)
  const response = await result.response
  const text = response.text()
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  
  throw new Error('Failed to generate feedback')
}

