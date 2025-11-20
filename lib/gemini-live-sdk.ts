import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai'
import { InterviewContext } from './gemini'

export interface GeminiLiveSDKConfig {
  apiKey: string
  context: InterviewContext
  phase: 'intro' | 'technical' | 'behavioral' | 'closing'
}

export class GeminiLiveSDK {
  private apiKey: string
  private context: InterviewContext
  private phase: 'intro' | 'technical' | 'behavioral' | 'closing'
  private session: Session | null = null
  private responseQueue: LiveServerMessage[] = []
  private audioParts: string[] = []
  private onTextCallback: ((text: string) => void) | null = null
  private onAudioCallback: ((audio: ArrayBuffer) => void) | null = null

  constructor(config: GeminiLiveSDKConfig) {
    this.apiKey = config.apiKey
    this.context = config.context
    this.phase = config.phase
  }

  async connect(
    onText: (text: string) => void,
    onAudio: (audio: ArrayBuffer) => void
  ): Promise<void> {
    this.onTextCallback = onText
    this.onAudioCallback = onAudio

    console.log('🚀 Connecting to Gemini Live using official SDK...')

    const ai = new GoogleGenAI({
      apiKey: this.apiKey,
    })

    const model = 'models/gemini-2.0-flash-exp'

    const systemInstruction = this.createSystemInstruction()

    const config = {
      responseModalities: [Modality.AUDIO, Modality.TEXT],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Puck', // Professional voice
          },
        },
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    }

    return new Promise((resolve, reject) => {
      ai.live
        .connect({
          model,
          callbacks: {
            onopen: () => {
              console.log('✅ Connected to Gemini Live!')
              resolve()
            },
            onmessage: (message: LiveServerMessage) => {
              this.handleMessage(message)
            },
            onerror: (e: ErrorEvent) => {
              console.error('❌ Gemini Live error:', e.message)
              reject(new Error(e.message))
            },
            onclose: (e: CloseEvent) => {
              console.log('🔌 Disconnected:', e.reason)
            },
          },
          config,
        })
        .then((sess) => {
          this.session = sess
        })
        .catch(reject)
    })
  }

  private handleMessage(message: LiveServerMessage) {
    // Handle server content (AI responses)
    if (message.serverContent?.modelTurn?.parts) {
      const parts = message.serverContent.modelTurn.parts

      for (const part of parts) {
        // Text response
        if (part.text) {
          console.log('📝 Text response:', part.text.substring(0, 100) + '...')
          if (this.onTextCallback) {
            this.onTextCallback(part.text)
          }
        }

        // Audio response (inline PCM data)
        if (part.inlineData) {
          console.log('🔊 Audio response received')
          this.audioParts.push(part.inlineData.data ?? '')

          // Convert to WAV and play
          const buffer = this.convertToWav(
            this.audioParts,
            part.inlineData.mimeType ?? ''
          )

          if (this.onAudioCallback) {
            this.onAudioCallback(buffer.buffer as ArrayBuffer)
          }
        }
      }
    }

    // Handle setup complete
    if (message.setupComplete) {
      console.log('✅ Setup complete, ready for conversation!')
    }
  }

  sendText(text: string) {
    if (!this.session) {
      console.error('❌ Session not connected')
      return
    }

    console.log('📤 Sending text:', text.substring(0, 50) + '...')

    try {
      this.session.sendClientContent({
        turns: [text],
        turnComplete: true,
      })
      console.log('✅ Text sent successfully')
    } catch (error) {
      console.error('❌ Error sending text:', error)
      throw error
    }
  }

  sendAudio(audioData: ArrayBuffer) {
    if (!this.session) {
      console.error('❌ Session not connected')
      return
    }

    console.log('📤 Sending audio chunk')

    // Convert ArrayBuffer to base64
    const base64Audio = this.arrayBufferToBase64(audioData)

    this.session.sendClientContent({
      turns: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'audio/pcm',
                data: base64Audio,
              },
            },
          ],
        },
      ],
      turnComplete: true,
    })
  }

  updatePhase(newPhase: 'intro' | 'technical' | 'behavioral' | 'closing') {
    this.phase = newPhase
    console.log(`📋 Interview phase updated to: ${newPhase}`)
  }

  disconnect() {
    if (this.session) {
      this.session.close()
      this.session = null
    }
    this.audioParts = []
    console.log('🔌 Disconnected from Gemini Live')
  }

  isConnected(): boolean {
    return this.session !== null
  }

  private createSystemInstruction(): string {
    const skills = Array.isArray(this.context.skills)
      ? this.context.skills.join(', ')
      : 'General skills'
    const responsibilities =
      Array.isArray(this.context.responsibilities) &&
      this.context.responsibilities.length > 0
        ? this.context.responsibilities.slice(0, 3).join('; ')
        : 'Various responsibilities'

    return `You are an expert Korean HR interviewer conducting an interview in English for a ${this.context.jobTitle || 'position'} at ${this.context.company || 'the company'}.

**Job Details:**
- Position: ${this.context.jobTitle || 'Not specified'}
- Company: ${this.context.company || 'Not specified'}
- Key Skills: ${skills}
- Responsibilities: ${responsibilities}

**Candidate Profile:**
- Name: ${this.context.userProfile?.name || 'Candidate'}
- Nationality: ${this.context.userProfile?.nationality || 'Not specified'}
- Experience: ${this.context.userProfile?.experience || '0'} years
- Skills: ${this.context.userProfile?.skills || 'Not specified'}
${this.context.userProfile?.resumeText ? `\n**Resume Content:**\n${this.context.userProfile.resumeText.substring(0, 1000)}` : ''}

**Interview Phase:** ${this.phase.toUpperCase()}

**Communication Style:**
- Be professional yet warm and encouraging
- Speak clearly and at a moderate pace
- Ask ONE question at a time
- Keep responses concise (2-3 sentences)
- Show active listening
- Be supportive for foreign candidates

**Phase Guidelines:**
${this.getPhaseGuidelines()}

Remember: Help them prepare for Korean job market interviews with supportive professionalism.`
  }

  private getPhaseGuidelines(): string {
    switch (this.phase) {
      case 'intro':
        return `- Welcome warmly\n- Ask for self-introduction\n- Build comfort\n- Transition naturally`
      case 'technical':
        return `- Ask about specific technical skills\n- Probe into projects\n- Ask problem-solving questions\n- Assess knowledge depth`
      case 'behavioral':
        return `- Use STAR method questions\n- Ask about teamwork and challenges\n- Explore cultural fit\n- Understand motivations`
      case 'closing':
        return `- Ask if they have questions\n- Discuss next steps\n- Thank sincerely\n- End encouragingly`
      default:
        return ''
    }
  }

  // Audio conversion utilities
  private convertToWav(rawData: string[], mimeType: string): Buffer {
    const options = this.parseMimeType(mimeType)
    const dataLength = rawData.reduce((a, b) => a + b.length, 0)
    const wavHeader = this.createWavHeader(dataLength, options)
    const buffer = Buffer.concat(
      rawData.map((data) => Buffer.from(data, 'base64'))
    )

    return Buffer.concat([wavHeader, buffer])
  }

  private parseMimeType(mimeType: string) {
    const [fileType, ...params] = mimeType.split(';').map((s) => s.trim())
    const [_, format] = fileType.split('/')

    const options: {
      numChannels: number
      bitsPerSample: number
      sampleRate?: number
    } = {
      numChannels: 1,
      bitsPerSample: 16,
    }

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10)
      if (!isNaN(bits)) {
        options.bitsPerSample = bits
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map((s) => s.trim())
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10)
      }
    }

    return options as { numChannels: number; bitsPerSample: number; sampleRate: number }
  }

  private createWavHeader(
    dataLength: number,
    options: { numChannels: number; sampleRate: number; bitsPerSample: number }
  ): Buffer {
    const { numChannels, sampleRate, bitsPerSample } = options

    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8
    const blockAlign = (numChannels * bitsPerSample) / 8
    const buffer = Buffer.alloc(44)

    buffer.write('RIFF', 0) // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4) // ChunkSize
    buffer.write('WAVE', 8) // Format
    buffer.write('fmt ', 12) // Subchunk1ID
    buffer.writeUInt32LE(16, 16) // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20) // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22) // NumChannels
    buffer.writeUInt32LE(sampleRate, 24) // SampleRate
    buffer.writeUInt32LE(byteRate, 28) // ByteRate
    buffer.writeUInt16LE(blockAlign, 32) // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34) // BitsPerSample
    buffer.write('data', 36) // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40) // Subchunk2Size

    return buffer
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
}

