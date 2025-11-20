"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Send, Volume2, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { GeminiLiveSDK } from "@/lib/gemini-live-sdk"
import { InterviewContext } from "@/lib/gemini"

type Message = {
  role: "ai" | "user"
  content: string
  timestamp: Date
}

type InterviewPhase = "intro" | "technical" | "behavioral" | "closing"

export function InterviewInterface({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>("intro")
  const [questionCount, setQuestionCount] = useState(0)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [interviewType, setInterviewType] = useState<'personality' | 'technical'>('personality')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const geminiClientRef = useRef<GeminiLiveSDK | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)

  const totalQuestions = 8
  const progress = (questionCount / totalQuestions) * 100

  // Initialize Gemini Live connection
  useEffect(() => {
    console.log('🎬 Starting interview initialization for job ID:', jobId)
    
    const initializeGemini = async () => {
      try {
        console.log('📡 Fetching job data for ID:', jobId)
        // Fetch job data and user profile
        const jobResponse = await fetch(`/api/jobs/${jobId}`)
        
        if (!jobResponse.ok) {
          throw new Error(`Failed to fetch job: ${jobResponse.status} ${jobResponse.statusText}`)
        }
        
        const jobData = await jobResponse.json()
        console.log('✅ Job data loaded:')
        console.log('  - Title:', jobData.title)
        console.log('  - Company:', jobData.company)
        console.log('  - Skills:', jobData.skills?.length || 0)
        console.log('  - Responsibilities:', jobData.responsibilities?.length || 0)
        
        // Get user profile from localStorage (set during onboarding)
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
        console.log('✅ User profile loaded:')
        console.log('  - Name:', userProfile.fullName || 'Not set')
        console.log('  - Experience:', userProfile.experience || '0', 'years')
        console.log('  - Skills:', userProfile.skills || 'Not set')
        console.log('  - Resume:', userProfile.resumeFileName || 'Not uploaded')
        
        // Create interview context
        const context: InterviewContext = {
          jobTitle: jobData.title || 'Software Engineer',
          company: jobData.company || 'Company',
          jobDescription: jobData.description || '',
          responsibilities: jobData.responsibilities || [],
          requiredQualifications: jobData.required || [],
          preferredQualifications: jobData.preferred || [],
          skills: jobData.skills || [],
          userProfile: {
            name: userProfile.fullName || 'Candidate',
            email: userProfile.email || '',
            age: userProfile.age,
            nationality: userProfile.nationality || '',
            skills: userProfile.skills || '',
            experience: userProfile.experience || '0',
            resumeText: userProfile.resumeText
          }
        }

        // Get API key from environment
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
        
        console.log('🔑 API Key check:', apiKey ? 'Found ✅' : 'Missing ❌')
        console.log('📄 Job data:', jobData.title)
        console.log('👤 User profile:', userProfile.fullName || 'Not set')
        
        if (!apiKey) {
          console.error('❌ Gemini API key not found')
          setMessages([{
            role: "ai",
            content: "Error: API key not configured. Please add your Gemini API key to continue.",
            timestamp: new Date()
          }])
          return
        }

        console.log('💬 Using text-based interview mode')
        
        // Store context for text-based API
        sessionStorage.setItem('interviewContext', JSON.stringify(context))
        setIsConnected(true)
        
        // Send initial greeting based on interview type
        const getInitialMessage = () => {
          if (interviewType === 'technical') {
            return "안녕하세요! 기술 면접 연습 세션에 오신 것을 환영합니다. 오늘은 지원자님의 기술적 역량과 문제 해결 능력을 평가하겠습니다.\n\n지원자님의 프로필과 채용 공고를 검토했습니다. 바로 시작하겠습니다.\n\n최근에 작업하신 기술적으로 가장 복잡했던 프로젝트에 대해 말씀해 주세요. 어떤 기술 스택을 사용하셨고, 어떤 기술적 챌린지가 있었으며, 어떻게 해결하셨나요?"
          } else {
            return "안녕하세요! 인성 면접 연습 세션에 오신 것을 환영합니다. 오늘은 지원자님의 행동 특성, 팀워크 능력, 그리고 문화 적합성을 평가하겠습니다.\n\n지원자님의 프로필과 배경을 검토했습니다. 먼저 간단한 자기소개로 시작하겠습니다.\n\n본인에 대해, 커리어 여정, 강점, 그리고 이 포지션에 관심을 가지게 된 이유를 말씀해 주세요."
          }
        }
        
        if (!hasInitialized.current) {
          setMessages([{
            role: "ai",
            content: getInitialMessage(),
            timestamp: new Date()
          }])
          hasInitialized.current = true
        }
        
        console.log('✅ Text interview ready!')
      } catch (error) {
        console.error('❌ Failed to initialize Gemini:', error)
        console.error('Error details:', error)
        
        // Fallback to initial message and enable text API mode
        setMessages([{
          role: "ai",
          content: "Hello! Welcome to your interview practice session. I'm your AI interviewer today. Let's start with a brief introduction. Could you tell me about yourself and why you're interested in this position?",
          timestamp: new Date()
        }])
        
        // Store context for text-based API fallback
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
        const context: InterviewContext = {
          jobTitle: 'Interview Position',
          company: 'Company',
          jobDescription: '',
          responsibilities: [],
          requiredQualifications: [],
          preferredQualifications: [],
          skills: [],
          userProfile: {
            name: userProfile.fullName || 'Candidate',
            email: userProfile.email || '',
            age: userProfile.age,
            nationality: userProfile.nationality || '',
            skills: userProfile.skills || '',
            experience: userProfile.experience || '0',
            resumeText: userProfile.resumeText
          }
        }
        sessionStorage.setItem('interviewContext', JSON.stringify(context))
        setIsConnected(true) // Enable text-based API fallback
        console.log('✅ Fallback mode enabled - using Text API')
      }
    }

    initializeGemini()

    return () => {
      // Cleanup on unmount
      if (geminiClientRef.current) {
        geminiClientRef.current.disconnect()
      }
    }
  }, [jobId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update initial message when interview type changes
  useEffect(() => {
    if (messages.length === 1 && hasInitialized.current) {
      const getInitialMessage = () => {
        if (interviewType === 'technical') {
          return "안녕하세요! 기술 면접 연습 세션에 오신 것을 환영합니다. 오늘은 지원자님의 기술적 역량과 문제 해결 능력을 평가하겠습니다.\n\n지원자님의 프로필과 채용 공고를 검토했습니다. 바로 시작하겠습니다.\n\n최근에 작업하신 기술적으로 가장 복잡했던 프로젝트에 대해 말씀해 주세요. 어떤 기술 스택을 사용하셨고, 어떤 기술적 챌린지가 있었으며, 어떻게 해결하셨나요?"
        } else {
          return "안녕하세요! 인성 면접 연습 세션에 오신 것을 환영합니다. 오늘은 지원자님의 행동 특성, 팀워크 능력, 그리고 문화 적합성을 평가하겠습니다.\n\n지원자님의 프로필과 배경을 검토했습니다. 먼저 간단한 자기소개로 시작하겠습니다.\n\n본인에 대해, 커리어 여정, 강점, 그리고 이 포지션에 관심을 가지게 된 이유를 말씀해 주세요."
        }
      }

      setMessages([{
        role: "ai",
        content: getInitialMessage(),
        timestamp: new Date()
      }])
    }
  }, [interviewType])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: currentInput,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = currentInput
    setCurrentInput("")
    setIsLoading(true)

    try {
      // Use text-based API
      if (isConnected) {
        // Fallback to text-based API
        console.log('📤 Sending via Text API fallback')
        
        const storedContext = JSON.parse(sessionStorage.getItem('interviewContext') || '{}')
        
        // Ensure context has required arrays with defaults
        const context: InterviewContext = {
          jobTitle: storedContext.jobTitle || 'Position',
          company: storedContext.company || 'Company',
          jobDescription: storedContext.jobDescription || '',
          responsibilities: Array.isArray(storedContext.responsibilities) ? storedContext.responsibilities : [],
          requiredQualifications: Array.isArray(storedContext.requiredQualifications) ? storedContext.requiredQualifications : [],
          preferredQualifications: Array.isArray(storedContext.preferredQualifications) ? storedContext.preferredQualifications : [],
          skills: Array.isArray(storedContext.skills) ? storedContext.skills : [],
          userProfile: storedContext.userProfile || {
            name: 'Candidate',
            email: '',
            nationality: '',
            skills: '',
            experience: '0'
          }
        }
        
        console.log('📋 Context prepared:', {
          job: context.jobTitle,
          skills: context.skills.length,
          responsibilities: context.responsibilities.length
        })
        
        // Get job data for this specific interview
        const jobResponse = await fetch(`/api/jobs/${jobId}`)
        const jobData = await jobResponse.json()
        
        // Get user profile
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
        
        // Convert messages to OpenAI format (exclude initial AI greeting)
        const conversationHistory = messages
          .slice(1) // Skip the first AI greeting
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))

        console.log('📋 Sending context:', {
          job: jobData.title,
          company: jobData.company,
          userSkills: userProfile.skills,
          resumeLength: userProfile.resumeText?.length || 0
        })

        const response = await fetch('/api/interview/openai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewType,
            jobData: {
              title: jobData.title,
              company: jobData.company,
              description: jobData.description,
              skills: jobData.skills,
              responsibilities: jobData.responsibilities
            },
            userProfile: {
              fullName: userProfile.fullName,
              experience: userProfile.experience,
              skills: userProfile.skills,
              targetRole: userProfile.targetRole,
              resumeText: userProfile.resumeText
            },
            conversationHistory,
            userMessage: messageText
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error:', response.status, errorText)
          throw new Error(`API request failed: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('✅ API response received:', data.message?.substring(0, 50) + '...')
        
        const aiMessage: Message = {
          role: "ai",
          content: data.message,
          timestamp: new Date()
        }
        
        setMessages((prev) => [...prev, aiMessage])
        setIsLoading(false)
        
        const newQuestionCount = questionCount + 1
        setQuestionCount(newQuestionCount)
        
        // Update phases
        if (newQuestionCount === 3) setInterviewPhase("technical")
        else if (newQuestionCount === 5) setInterviewPhase("behavioral")
        else if (newQuestionCount === 7) setInterviewPhase("closing")
        
        if (newQuestionCount >= totalQuestions) {
          setInterviewComplete(true)
        }
      } else {
        // No connection at all - should not happen but handle gracefully
        console.error('⚠️ No connection available - using emergency fallback')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const fallbackMessage: Message = {
          role: "ai",
          content: "Thank you for sharing. Could you tell me more about your experience with that?",
          timestamp: new Date()
        }
        setMessages((prev) => [...prev, fallbackMessage])
        setIsLoading(false)
        setQuestionCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      // Ultimate fallback
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const fallbackMessage: Message = {
        role: "ai",
        content: "Thank you for sharing. Could you tell me more about your experience with that?",
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, fallbackMessage])
      setIsLoading(false)
      setQuestionCount(prev => prev + 1)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      stopRecording()
    } else {
      // Start recording
      await startRecording()
    }
  }

  const startRecording = async () => {
    try {
      console.log('🎤 Requesting microphone access...')
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('✅ Microphone access granted')
      mediaStreamRef.current = stream
      setIsRecording(true)

      // If Gemini Live is connected, stream audio to it
      if (geminiClientRef.current && geminiClientRef.current.isConnected()) {
        console.log('🎙️ Streaming audio to Gemini Live...')
        
        // Create audio context for processing
        const audioContext = new AudioContext({ sampleRate: 24000 })
        audioContextRef.current = audioContext
        
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        audioProcessorRef.current = processor

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0)
          
          // Convert Float32Array to Int16Array (PCM)
          const pcmData = new Int16Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]))
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
          }

          // Send audio chunks to Gemini Live
          if (geminiClientRef.current) {
            geminiClientRef.current.sendAudio(pcmData.buffer)
          }
        }

        source.connect(processor)
        processor.connect(audioContext.destination)
        
        console.log('✅ Audio streaming started')
      } else {
        console.warn('⚠️ Gemini Live not connected - recording locally only')
        
        // Fallback: Use MediaRecorder for local recording
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        
        const audioChunks: Blob[] = []
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          console.log('🎤 Audio recorded:', audioBlob.size, 'bytes')
          
          // Convert to text using Web Speech API or send to backend
          // For now, just log
          console.log('💡 Tip: Connect to Gemini Live for real-time voice interaction')
        }
        
        mediaRecorder.start(100) // Collect data every 100ms
      }
    } catch (error) {
      console.error('❌ Microphone access denied or error:', error)
      alert('Microphone access is required for voice input. Please grant permission and try again.')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    console.log('🛑 Stopping recording...')
    
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Stop audio processor
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect()
      audioProcessorRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    setIsRecording(false)
    console.log('✅ Recording stopped')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [])

  const getPhaseLabel = () => {
    switch (interviewPhase) {
      case "intro": return "Introduction"
      case "technical": return "Technical Questions"
      case "behavioral": return "Behavioral Questions"
      case "closing": return "Closing"
    }
  }

  const getPhaseColor = () => {
    switch (interviewPhase) {
      case "intro": return "bg-blue-500"
      case "technical": return "bg-purple-500"
      case "behavioral": return "bg-green-500"
      case "closing": return "bg-orange-500"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="IpsaGo Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl">IpsaGo</span>
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:flex">
                {getPhaseLabel()}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Question {questionCount} / {totalQuestions}
              </div>
            </div>
          </div>
          
          {/* Interview Type Navigation */}
          <div className="mt-4 flex items-center gap-3 pb-3">
            <span className="text-sm font-medium text-muted-foreground">Interview Type:</span>
            <div className="flex gap-2">
              <Button
                variant={interviewType === 'personality' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInterviewType('personality')}
                className="text-xs h-8"
              >
                Personality Test
              </Button>
              <Button
                variant={interviewType === 'technical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInterviewType('technical')}
                className="text-xs h-8"
              >
                Technical Interview
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Interview Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full flex flex-col max-w-4xl">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "ai" && (
                  <Avatar className="size-10 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === "user" && (
                  <Avatar className="size-10 border-2 border-accent">
                    <AvatarFallback className="bg-accent text-accent-foreground">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="size-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              </div>
            )}

            {interviewComplete && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto flex items-center justify-center">
                    <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Interview Complete!</h3>
                    <p className="text-muted-foreground">
                      Great job! Your responses have been analyzed and your feedback is ready.
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={() => router.push(`/feedback/${jobId}`)}
                  >
                    View Your Feedback
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div ref={messagesEndRef} />
          </div>


          {/* Input Area */}
          {!interviewComplete && (
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Textarea
                    placeholder={
                      interviewType === 'technical' 
                        ? "기술적 세부사항과 구체적인 구현 방법을 설명해주세요... (Enter: 전송)"
                        : "경험과 상황을 구체적으로 말씀해주세요... (Enter: 전송)"
                    }
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[60px] max-h-[200px] resize-none"
                    disabled={isLoading}
                  />
                  
                  <Button
                    size="icon"
                    className="flex-shrink-0"
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isLoading}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {isLoading && (
                      <span className="flex items-center gap-2 text-primary">
                        <Loader2 className="size-4 animate-spin" />
                        AI가 답변을 생성 중입니다...
                      </span>
                    )}
                  </div>
                  <span>Enter를 눌러 전송</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
