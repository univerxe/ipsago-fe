import { InterviewContext } from './gemini'

export interface GeminiLiveConfig {
  apiKey: string
  context: InterviewContext
  phase: 'intro' | 'technical' | 'behavioral' | 'closing'
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null
  private apiKey: string
  private context: InterviewContext
  private phase: 'intro' | 'technical' | 'behavioral' | 'closing'
  private audioContext: AudioContext | null = null
  private audioQueue: Float32Array[] = []
  private isPlaying = false

  constructor(config: GeminiLiveConfig) {
    this.apiKey = config.apiKey
    this.context = config.context
    this.phase = config.phase
  }

  async connect(onMessage: (text: string) => void, onAudio: (audio: ArrayBuffer) => void) {
    const model = 'models/gemini-2.0-flash-exp'
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`

    console.log('🔌 Attempting WebSocket connection to Gemini Live...')
    console.log('🔗 URL:', url.substring(0, 80) + '...')

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(url)
        
        // Initialize audio context for playback
        if (typeof window !== 'undefined' && !this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.error('❌ WebSocket connection timeout')
            this.ws.close()
            reject(new Error('Connection timeout'))
          }
        }, 10000) // 10 second timeout

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log('✅ Connected to Gemini Live WebSocket!')
          this.sendSetup()
          resolve()
        }

        this.ws.onmessage = async (event) => {
          try {
            const response = JSON.parse(event.data)
            console.log('📨 Received message:', response)
            
            // Handle server content (AI responses)
            if (response.serverContent) {
              const parts = response.serverContent.modelTurn?.parts || []
              
              for (const part of parts) {
                // Text response
                if (part.text) {
                  console.log('📝 Text response:', part.text.substring(0, 100) + '...')
                  onMessage(part.text)
                }
                
                // Audio response (inline PCM data)
                if (part.inlineData?.data) {
                  console.log('🔊 Audio response received')
                  const audioData = this.base64ToArrayBuffer(part.inlineData.data)
                  onAudio(audioData)
                  await this.playAudio(audioData)
                }
              }
            }

            // Handle setup complete
            if (response.setupComplete) {
              console.log('✅ Setup complete, ready for conversation!')
            }

            // Handle errors from server
            if (response.error) {
              console.error('❌ Server error:', response.error)
            }
          } catch (error) {
            console.error('❌ Error processing message:', error)
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error('❌ WebSocket error:', error)
          console.error('This might be due to:')
          console.error('  1. Invalid API key')
          console.error('  2. Network/firewall blocking WebSocket')
          console.error('  3. API not enabled for Gemini 2.0')
          reject(error)
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log('🔌 Disconnected from Gemini Live')
          console.log('Close code:', event.code, 'Reason:', event.reason || 'No reason provided')
          
          if (event.code !== 1000) { // 1000 = normal closure
            console.warn('⚠️ Abnormal closure, code:', event.code)
          }
        }
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  private sendSetup() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const systemInstruction = this.createSystemInstruction()

    const setupMessage = {
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['AUDIO', 'TEXT'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck' // Professional, friendly voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      }
    }

    this.ws.send(JSON.stringify(setupMessage))
  }

  private createSystemInstruction(): string {
    return `You are an expert Korean HR interviewer conducting an interview in English for a ${this.context.jobTitle} position at ${this.context.company}.

**Job Details:**
- Position: ${this.context.jobTitle}
- Company: ${this.context.company}
- Key Skills: ${this.context.skills.join(', ')}
- Responsibilities: ${this.context.responsibilities.slice(0, 3).join('; ')}

**Candidate Profile:**
- Name: ${this.context.userProfile.name}
- Nationality: ${this.context.userProfile.nationality || 'Not specified'}
- Experience: ${this.context.userProfile.experience} years
- Skills: ${this.context.userProfile.skills}
${this.context.userProfile.resumeText ? `- Resume: ${this.context.userProfile.resumeText.substring(0, 400)}` : ''}

**Interview Phase:** ${this.phase.toUpperCase()}

**Communication Style:**
- Be professional yet warm and encouraging
- Speak clearly and at a moderate pace (consider English may not be their first language)
- Ask ONE question at a time and wait for response
- Keep your responses concise (2-3 sentences)
- Show active listening by acknowledging their answers
- If they struggle, offer gentle encouragement

**Phase Guidelines:**
${this.getPhaseGuidelines()}

Remember: You're helping a foreigner prepare for the Korean job market. Be supportive while maintaining interview professionalism.`
  }

  private getPhaseGuidelines(): string {
    switch (this.phase) {
      case 'intro':
        return `- Welcome them warmly and introduce yourself
- Ask them to tell you about themselves
- Make them feel comfortable
- Listen actively and transition naturally`
      
      case 'technical':
        return `- Ask about specific technical skills from their background
- Probe into relevant projects and experiences
- Ask how they would approach real problems
- Assess depth of knowledge naturally`
      
      case 'behavioral':
        return `- Use STAR method questions (Situation, Task, Action, Result)
- Ask about teamwork, challenges overcome, leadership
- Explore how they handle different situations
- Understand their motivations and work style`
      
      case 'closing':
        return `- Ask if they have questions about the role or company
- Discuss interview process and next steps
- Thank them sincerely for their time
- End on an encouraging note`
      
      default:
        return ''
    }
  }

  // Send text message
  sendText(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return
    }

    const message = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      }
    }

    this.ws.send(JSON.stringify(message))
  }

  // Send audio (from microphone)
  sendAudio(audioData: ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return
    }

    const base64Audio = this.arrayBufferToBase64(audioData)

    const message = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{
            inlineData: {
              mimeType: 'audio/pcm',
              data: base64Audio
            }
          }]
        }],
        turnComplete: true
      }
    }

    this.ws.send(JSON.stringify(message))
  }

  // Realtime audio streaming
  streamRealtimeAudio(audioChunk: ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const base64Audio = this.arrayBufferToBase64(audioChunk)

    const message = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm',
          data: base64Audio
        }]
      }
    }

    this.ws.send(JSON.stringify(message))
  }

  // Play received audio
  private async playAudio(audioData: ArrayBuffer) {
    if (!this.audioContext) return

    try {
      // Convert PCM to AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0))
      this.audioQueue.push(new Float32Array(audioBuffer.getChannelData(0)))

      if (!this.isPlaying) {
        this.processAudioQueue()
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  private async processAudioQueue() {
    if (!this.audioContext || this.audioQueue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const audioData = this.audioQueue.shift()!
    
    const audioBuffer = this.audioContext.createBuffer(1, audioData.length, 24000) // 24kHz
    audioBuffer.getChannelData(0).set(audioData)

    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)
    
    source.onended = () => {
      this.processAudioQueue()
    }

    source.start()
  }

  updatePhase(newPhase: 'intro' | 'technical' | 'behavioral' | 'closing') {
    this.phase = newPhase
    // Send a system message to update context
    this.sendText(`[System: Moving to ${newPhase} phase]`)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.audioQueue = []
  }

  // Utility functions
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

