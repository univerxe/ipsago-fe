# Gemini Live Integration Setup

## Overview
The interview practice feature uses **Gemini 2.0 Live API** for real-time voice conversations. This provides:
- **Real-time voice-to-voice interviews** with natural conversation flow
- **Bidirectional streaming** audio (both listen and speak simultaneously)
- **Context-aware responses** based on:
  - Selected job data
  - User profile information
  - Uploaded resume content
- **Multi-phase interviews** (intro, technical, behavioral, closing)

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variable
Create a `.env.local` file in the project root:

```bash
# For Gemini Live (client-side WebSocket connection)
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# For server-side API routes (optional fallback)
GEMINI_API_KEY=your_api_key_here
```

**Important:** The `NEXT_PUBLIC_` prefix makes the key available to the browser for Gemini Live WebSocket connections.

### 3. Features Implemented

#### Gemini Live Client (`lib/gemini-live.ts`)
- **Real-time bidirectional streaming** via WebSocket
- **Voice-to-voice conversation** with natural audio responses
- **Text fallback** for typing instead of speaking
- **Audio playback queue** for smooth AI responses
- **Dynamic phase transitions** during interview
- **Context maintenance** throughout conversation

#### API Endpoints
- **Chat API** (`/api/interview/chat`) - Text-based fallback
- **Feedback API** (`/api/interview/feedback`) - Post-interview analysis

#### Audio Capabilities
- **Input**: Microphone audio streaming (PCM format)
- **Output**: AI voice responses with professional tone
- **Voice**: "Puck" voice (clear, professional, friendly)
- **Sample Rate**: 24kHz PCM audio

### 4. Interview Phases
1. **Intro**: Warm welcome and self-introduction
2. **Technical**: Skills and experience questions
3. **Behavioral**: STAR method questions
4. **Closing**: Q&A and next steps

### 5. Usage Example

```typescript
import { GeminiLiveClient } from '@/lib/gemini-live'

// Initialize Gemini Live
const client = new GeminiLiveClient({
  apiKey: process.env.GEMINI_API_KEY!,
  context: {
    jobTitle: 'Frontend Developer',
    company: 'Kakao',
    jobDescription: '...',
    responsibilities: [...],
    requiredQualifications: [...],
    preferredQualifications: [...],
    skills: ['React', 'TypeScript', 'Next.js'],
    userProfile: {
      name: 'John Doe',
      email: 'john@example.com',
      nationality: 'American',
      skills: 'React, TypeScript',
      experience: '3',
      resumeText: '...'
    }
  },
  phase: 'intro'
})

// Connect and handle messages
await client.connect(
  (text) => console.log('AI said:', text),
  (audio) => console.log('AI audio received')
)

// Send text message
client.sendText('Hello, I am excited for this interview!')

// Send audio (from microphone)
client.sendAudio(audioBuffer)

// Stream real-time audio
client.streamRealtimeAudio(audioChunk)

// Change interview phase
client.updatePhase('technical')

// Disconnect when done
client.disconnect()
```

### 6. Microphone Setup

```typescript
// Get microphone access
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: {
    sampleRate: 24000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true
  } 
})

// Process audio chunks
const audioContext = new AudioContext({ sampleRate: 24000 })
const source = audioContext.createMediaStreamSource(stream)
const processor = audioContext.createScriptProcessor(4096, 1, 1)

processor.onaudioprocess = (e) => {
  const audioData = e.inputBuffer.getChannelData(0)
  client.streamRealtimeAudio(audioData.buffer)
}

source.connect(processor)
processor.connect(audioContext.destination)
```

## Security Notes
- Never commit `.env.local` to git
- API key should be server-side only
- Validate all user inputs before sending to Gemini

