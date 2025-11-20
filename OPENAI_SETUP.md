# 🚀 OpenAI Interview Setup - WORKING!

## ✅ What's Implemented:

### **Complete Working Flow:**
1. ✅ User sees job list (AI recommended jobs from CSV)
2. ✅ User clicks "Practice" button on a job card
3. ✅ System loads:
   - That specific job's details (title, company, description, skills, responsibilities)
   - User's uploaded resume (PDF text extracted)
   - User's profile (from onboarding)
4. ✅ Interview starts with AI asking personalized questions
5. ✅ Text-to-text conversation using OpenAI GPT-4

## 🔑 Get Your OpenAI API Key:

### 1. Go to OpenAI Platform
https://platform.openai.com/api-keys

### 2. Sign Up / Log In
- Create account or sign in
- You'll get $5 free credit for testing

### 3. Create API Key
- Click "Create new secret key"
- Give it a name: "Interview Prep"
- Copy the key (starts with `sk-...`)

### 4. Add to `.env`
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

### 5. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🎯 Complete User Flow:

### Step 1: Onboarding (`/onboarding`)
```
1. User fills in:
   - Full name
   - Email
   - Age
   - Nationality
   - Skills (comma separated)
   - Years of experience
   - Target role

2. User uploads PDF resume
   → System extracts text from PDF
   → Saves to localStorage

3. User submits
   → Profile saved
   → Redirects to dashboard
```

### Step 2: Dashboard (`/dashboard`)
```
1. Shows 40 real jobs from jobs-db.csv
2. Each job card shows:
   - Job title
   - Company name
   - Skills required
   - Deadline
   - Role category (Developer/Designer/Business Analyst)
   
3. Two buttons per job:
   - "Practice" → Start interview
   - "Details" → Full job description
```

### Step 3: Interview (`/interview/[jobId]`)
```
1. Click "Practice" on any job
   
2. System automatically loads:
   ✓ Job data (from CSV via /api/jobs/[id])
   ✓ User profile (from localStorage)
   ✓ Resume text (extracted from PDF)

3. AI greets with personalized intro:
   "Hello! I'm interviewing you for [Job Title] at [Company]. 
    I've reviewed your resume and see you have experience in [skills]..."

4. User types response

5. AI asks follow-up questions based on:
   - Job requirements
   - User's resume content
   - Previous answers
   - Experience level

6. Natural conversation continues...
```

## 💬 Example Interview:

**AI:** Hello! I'm interviewing you for Frontend Developer at Kakao. I've reviewed your resume and see you have 3 years of experience with React and TypeScript. Let's start - tell me about a challenging React project you worked on.

**You:** I built a real-time dashboard using React and WebSockets...

**AI:** Interesting! How did you handle state management for real-time data? Did you use Redux or Context API?

**You:** I used Redux Toolkit with RTK Query...

**AI:** Great choice! Can you explain why you chose Redux Toolkit over other state management solutions for this particular project?

...and so on!

## 🔧 Technical Details:

### API Endpoint: `/api/interview/openai-chat`

**Request:**
```json
{
  "jobData": {
    "title": "Frontend Developer",
    "company": "Kakao",
    "description": "...",
    "skills": ["React", "TypeScript"],
    "responsibilities": [...]
  },
  "userProfile": {
    "fullName": "John Doe",
    "experience": "3",
    "skills": "React, TypeScript, Node.js",
    "resumeText": "Full resume text extracted from PDF..."
  },
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "userMessage": "Current user message"
}
```

**Response:**
```json
{
  "message": "AI's response text",
  "timestamp": "2025-11-19T..."
}
```

### Model Used:
- **GPT-4o-mini** (fast, cheap, high quality)
- ~300 tokens per response
- Very cost-effective (~$0.15 per 1M tokens)

### Context Sent to AI:
1. **Job details** (title, company, description, skills, responsibilities)
2. **Resume content** (up to 2000 characters)
3. **User profile** (name, experience, skills, target role)
4. **Conversation history** (all previous messages)
5. **System instructions** (how to conduct the interview)

## ✅ Testing Checklist:

### 1. Onboarding Works
- [ ] Form saves to localStorage
- [ ] PDF upload works
- [ ] Text extracted from PDF
- [ ] Redirects to dashboard

### 2. Dashboard Shows Jobs
- [ ] 40 jobs displayed
- [ ] "Practice" button visible
- [ ] "Details" button works

### 3. Interview Loads Context
- [ ] Job data loaded correctly
- [ ] User profile loaded
- [ ] Resume text available
- [ ] Initial greeting shows

### 4. Conversation Works
- [ ] Can type message
- [ ] Press Enter sends
- [ ] AI responds with relevant question
- [ ] AI references job requirements
- [ ] AI references resume content

## 🐛 Troubleshooting:

### "OpenAI API key not configured"
→ Add `OPENAI_API_KEY` to `.env`
→ Restart server

### "No resume text"
→ Complete onboarding with PDF upload
→ Check console for PDF extraction logs

### "Job not found"
→ Check jobId is valid (0-39)
→ Verify CSV file exists

### "API Error 429"
→ Rate limit exceeded
→ Wait a minute or upgrade plan

## 💰 Cost Estimate:

**Per Interview (8 questions):**
- Input: ~3000 tokens (job + resume + history)
- Output: ~2400 tokens (8 responses × 300 tokens)
- Total: ~5400 tokens
- Cost: **~$0.0008 per interview** (less than a cent!)

**With $5 free credit:**
→ ~6,000 interview practices!

## 🎉 Ready to Use!

1. Get OpenAI API key
2. Add to `.env`
3. Restart server
4. Complete onboarding
5. Click "Practice" on any job
6. Start interviewing!

The AI will conduct realistic, personalized interviews based on the actual job requirements and your real resume content. Good luck! 🚀

