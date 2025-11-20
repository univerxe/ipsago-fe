"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { GeminiLiveSDK } from "@/lib/gemini-live-sdk"
import { InterviewContext } from "@/lib/gemini"
import { AudioRecorder, transcribeAudio, playTextToSpeech } from "@/lib/recordAudio"

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
  const [speakerEnabled, setSpeakerEnabled] = useState(true) // TTS toggle - enabled by default
  const [interviewStarted, setInterviewStarted] = useState(false) // Track if interview has started
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const geminiClientRef = useRef<GeminiLiveSDK | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const audioRecorderRef = useRef<AudioRecorder | null>(null) // New audio recorder

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
        hasInitialized.current = true
        
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

  // Function to get initial message based on interview type
  const getInitialMessage = () => {
    if (interviewType === 'technical') {
      return "안녕하세요! 기술 면접 연습 세션에 오신 것을 환영합니다. 오늘은 지원자님의 기술적 역량과 문제 해결 능력을 평가하겠습니다.\n\n지원자님의 프로필과 채용 공고를 검토했습니다. 바로 시작하겠습니다.\n\n최근에 작업하신 기술적으로 가장 복잡했던 프로젝트에 대해 말씀해 주세요. 어떤 기술 스택을 사용하셨고, 어떤 기술적 챌린지가 있었으며, 어떻게 해결하셨나요?"
    } else {
      return "안녕하세요! 인성 면접 연습 세션에 오신 것을 환영합니다. 오늘은 지원자님의 행동 특성, 팀워크 능력, 그리고 문화 적합성을 평가하겠습니다.\n\n지원자님의 프로필과 배경을 검토했습니다. 먼저 간단한 자기소개로 시작하겠습니다.\n\n본인에 대해, 커리어 여정, 강점, 그리고 이 포지션에 관심을 가지게 된 이유를 말씀해 주세요."
    }
  }

  // Start interview function
  const handleStartInterview = async () => {
    if (!hasInitialized.current || !isConnected) {
      console.warn('⚠️ Interview not ready yet')
      return
    }

    console.log('🚀 Starting interview...')
    setInterviewStarted(true)

    const initialMessage = getInitialMessage()
    
    // Add initial message to chat
    const aiMessage: Message = {
      role: "ai",
      content: initialMessage,
      timestamp: new Date()
    }
    
    setMessages([aiMessage])

    // Play initial message as audio if speaker is enabled
    if (speakerEnabled) {
      try {
        console.log('🔊 Playing initial greeting...')
        setIsAISpeaking(true)
        await playTextToSpeech(initialMessage)
        setIsAISpeaking(false)
        console.log('✅ Initial greeting played')
      } catch (error) {
        console.error('❌ Failed to play initial greeting:', error)
        setIsAISpeaking(false)
      }
    }
  }

  // Update when interview type changes (only before interview starts)
  useEffect(() => {
    if (!interviewStarted && messages.length === 0) {
      // Just reset the state, user will need to click Start Interview again
      console.log('Interview type changed to:', interviewType)
    }
  }, [interviewType, interviewStarted, messages.length])

  const handleSendMessage = async (messageTextOverride?: string) => {
    const messageText = messageTextOverride || currentInput
    
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
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
        
        // Play TTS if speaker is enabled
        if (speakerEnabled && data.message) {
          try {
            setIsAISpeaking(true)
            await playTextToSpeech(data.message)
            setIsAISpeaking(false)
          } catch (error) {
            console.error('❌ TTS playback failed:', error)
            setIsAISpeaking(false)
          }
        }
        
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
      // Stop recording and transcribe
      await stopRecording()
    } else {
      // Start recording
      await startRecording()
    }
  }

  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...')
      
      // Create new audio recorder
      const recorder = new AudioRecorder()
      audioRecorderRef.current = recorder
      
      await recorder.startRecording()
      setIsRecording(true)
      
      console.log('✅ Recording started')
    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      alert('Microphone access is required for voice input. Please grant permission and try again.')
      setIsRecording(false)
    }
  }

  const stopRecording = async () => {
    try {
      console.log('🛑 Stopping recording...')
      
      if (!audioRecorderRef.current) {
        console.error('❌ No active recorder')
        return
      }

      setIsRecording(false)
      setIsLoading(true)

      // Stop recording and get audio blob
      const audioBlob = await audioRecorderRef.current.stopRecording()
      console.log('✅ Recording stopped, blob size:', audioBlob.size, 'bytes')

      // Transcribe audio to text
      console.log('🔄 Transcribing audio...')
      const transcribedText = await transcribeAudio(audioBlob)
      console.log('✅ Transcription:', transcribedText)

      // Send transcribed text as message
      await handleSendMessage(transcribedText)
      
      // Cleanup
      audioRecorderRef.current = null
    } catch (error) {
      console.error('❌ Failed to process recording:', error)
      setIsRecording(false)
      setIsLoading(false)
      alert('Failed to transcribe audio. Please try again.')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup audio recorder if active
      if (audioRecorderRef.current && audioRecorderRef.current.isRecording()) {
        audioRecorderRef.current.stopRecording().catch(console.error)
      }
      // Cleanup Gemini connection
      if (geminiClientRef.current) {
        geminiClientRef.current.disconnect()
      }
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
          {/* Start Interview Button */}
          {!interviewStarted && isConnected && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-6">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <div className="size-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                    <Volume2 className="size-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">
                      {interviewType === 'technical' ? '기술 면접 준비 완료' : '인성 면접 준비 완료'}
                    </h2>
                    <p className="text-muted-foreground text-lg mb-2">
                      {interviewType === 'technical' 
                        ? '기술적 역량과 문제 해결 능력을 평가하는 면접입니다.'
                        : '행동 특성, 팀워크, 문화 적합성을 평가하는 면접입니다.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      음성 안내가 {speakerEnabled ? '켜져' : '꺼져'} 있습니다. 
                      {speakerEnabled && ' 시작하면 AI가 질문을 읽어드립니다.'}
                    </p>
                  </div>
                  
                  {/* Speaker Toggle before starting */}
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm text-muted-foreground">음성 안내:</span>
                    <Button
                      variant={speakerEnabled ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-4 gap-2"
                      onClick={() => setSpeakerEnabled(!speakerEnabled)}
                      title={speakerEnabled ? "음성 안내 끄기" : "음성 안내 켜기"}
                    >
                      {speakerEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                      <span>{speakerEnabled ? "켜짐" : "꺼짐"}</span>
                    </Button>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="gap-2 text-lg px-8 py-6"
                  onClick={handleStartInterview}
                  disabled={isAISpeaking}
                >
                  {isAISpeaking ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      음성 재생 중...
                    </>
                  ) : (
                    <>
                      면접 시작하기
                      <ArrowRight className="size-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

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
          {!interviewComplete && interviewStarted && (
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
                    disabled={isLoading || isRecording}
                  />
                  
                  <div className="flex flex-col gap-2">
                    {/* Mic Button */}
                    <Button
                      size="icon"
                      variant={isRecording ? "destructive" : "outline"}
                      className="flex-shrink-0"
                      onClick={toggleRecording}
                      disabled={isLoading}
                      title={isRecording ? "Stop recording" : "Start voice input"}
                    >
                      {isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                    </Button>
                    
                    {/* Send Button */}
                    <Button
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => handleSendMessage()}
                      disabled={!currentInput.trim() || isLoading || isRecording}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {/* Speaker Toggle */}
                    <Button
                      variant={speakerEnabled ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-3 gap-2"
                      onClick={() => setSpeakerEnabled(!speakerEnabled)}
                      title={speakerEnabled ? "Disable AI voice" : "Enable AI voice"}
                    >
                      {speakerEnabled ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
                      <span className="text-xs">
                        {speakerEnabled ? "Voice ON" : "Voice OFF"}
                      </span>
                    </Button>
                    
                    {isRecording && (
                      <span className="flex items-center gap-2 text-red-500 animate-pulse">
                        <span className="size-2 rounded-full bg-red-500"></span>
                        Recording...
                      </span>
                    )}
                    
                    {isLoading && !isRecording && (
                      <span className="flex items-center gap-2 text-primary">
                        <Loader2 className="size-4 animate-spin" />
                        {isAISpeaking ? 'AI가 답변 중입니다...' : 'AI가 답변을 생성 중입니다...'}
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
