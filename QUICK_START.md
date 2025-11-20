# 🚀 Quick Start - Gemini Integration

## Why is Gemini not connected?

The most common reason is that the **API key is not configured** or the **dev server wasn't restarted** after adding it.

## Fix in 3 Steps:

### 1️⃣ Create `.env.local` file

In your project root (`/Users/universe/Projects/ai-interview-prep/`), create a file named `.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your real API key from Google AI Studio.

### 2️⃣ Get your API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Paste it into `.env.local`

### 3️⃣ Restart Dev Server

**Critical:** Environment variables are loaded at startup, so you MUST restart:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Verify Setup

Visit: http://localhost:3000/setup-check

This page will show you:
- ✅ Is API key configured?
- ✅ Is user profile set?
- ✅ Can jobs be loaded?
- ✅ Is everything working?

## Debug in Browser Console

When you start an interview, open browser console (F12) to see:

```
🔑 API Key check: Found ✅
📄 Job data: Frontend Developer
👤 User profile: John Doe
🚀 Initializing Gemini Live...
✅ Gemini Live connected!
```

If you see:
```
🔑 API Key check: Missing ❌
⚠️ Gemini API key not found - using text-based fallback
```

Then your API key is not properly configured.

## Multiple Connection Methods

The system has **3 fallback layers**:

1. **Gemini Live (WebSocket)** - Real-time voice + text ⭐ Best
2. **Text API** - HTTP requests to `/api/interview/chat` 
3. **Static Fallback** - Generic responses (no AI)

You'll see which one is being used in the console:
- `📤 Sending via Gemini Live WebSocket` ← Using Gemini Live ✅
- `📤 Sending via Text API fallback` ← Using text API
- If neither, it's using static fallback

## Common Issues

### Issue: "API Key check: Missing ❌"
**Solution:** 
1. Check `.env.local` exists in project root
2. Check it has `NEXT_PUBLIC_GEMINI_API_KEY=...`
3. Restart dev server

### Issue: "WebSocket connection failed"
**Solution:**
1. Check API key is valid
2. Check you have internet connection
3. Check firewall/antivirus isn't blocking WebSocket

### Issue: "Job data: undefined"
**Solution:**
1. Check `public/jobs-db.csv` exists
2. Check job ID is valid (0-39)
3. Restart dev server

### Issue: "User profile: Not set"
**Solution:**
1. Go to `/onboarding`
2. Complete the onboarding form
3. This saves profile to localStorage

## Test Flow

1. ✅ Add API key to `.env.local`
2. ✅ Restart dev server
3. ✅ Visit `/setup-check` to verify
4. ✅ Complete `/onboarding` if needed
5. ✅ Go to `/dashboard`
6. ✅ Click "Practice" on any job
7. ✅ Open browser console (F12)
8. ✅ Look for "✅ Gemini Live connected!"
9. ✅ Type a message
10. ✅ See "📤 Sending via Gemini Live WebSocket"
11. ✅ Get AI response!

## Still Not Working?

Check console for errors and share the logs. The detailed logging will help identify the exact issue.

