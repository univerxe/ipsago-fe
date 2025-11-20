"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function SetupCheckPage() {
  const [checks, setChecks] = useState<Array<{
    name: string
    status: 'success' | 'error' | 'warning'
    message: string
  }>>([])

  useEffect(() => {
    const runChecks = async () => {
      const results = []

      // Check 1: API Key
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      results.push({
        name: 'Gemini API Key (NEXT_PUBLIC_GEMINI_API_KEY)',
        status: apiKey ? 'success' : 'error',
        message: apiKey 
          ? `Found ✅ (${apiKey.substring(0, 10)}...)`
          : 'Missing ❌ - Add to .env.local'
      })

      // Check 2: User Profile
      const userProfile = localStorage.getItem('userProfile')
      results.push({
        name: 'User Profile (localStorage)',
        status: userProfile ? 'success' : 'warning',
        message: userProfile 
          ? `Found ✅ (${JSON.parse(userProfile).fullName || 'No name'})`
          : 'Not set ⚠️ - Complete onboarding'
      })

      // Check 3: Jobs CSV
      try {
        const jobsResponse = await fetch('/api/jobs/0')
        results.push({
          name: 'Jobs API',
          status: jobsResponse.ok ? 'success' : 'error',
          message: jobsResponse.ok 
            ? 'Working ✅'
            : `Failed ❌ (${jobsResponse.status})`
        })
      } catch (error) {
        results.push({
          name: 'Jobs API',
          status: 'error',
          message: `Error ❌: ${error}`
        })
      }

      // Check 4: Interview Context
      const interviewContext = sessionStorage.getItem('interviewContext')
      results.push({
        name: 'Interview Context (sessionStorage)',
        status: interviewContext ? 'success' : 'warning',
        message: interviewContext 
          ? 'Found ✅'
          : 'Not set ⚠️ - Start an interview'
      })

      setChecks(results)
    }

    runChecks()
  }, [])

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="size-5 text-green-500" />
      case 'error':
        return <XCircle className="size-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="size-5 text-yellow-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Setup Check</h1>
          <p className="text-muted-foreground">
            Verify your Gemini Live integration is configured correctly
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Check the status of all required components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checks.length === 0 ? (
              <p className="text-muted-foreground">Running checks...</p>
            ) : (
              checks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getIcon(check.status)}
                  <div className="flex-1">
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                  <Badge variant={
                    check.status === 'success' ? 'default' : 
                    check.status === 'error' ? 'destructive' : 
                    'secondary'
                  }>
                    {check.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Create .env.local file</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`# In project root: /Users/universe/Projects/ai-interview-prep/.env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Get API Key</h3>
              <p className="text-sm text-muted-foreground">
                Visit{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google AI Studio
                </a>
                {' '}to create your API key
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Restart Development Server</h3>
              <pre className="bg-muted p-3 rounded text-sm">
npm run dev
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">4. Complete Onboarding</h3>
              <p className="text-sm text-muted-foreground">
                Go to <code>/onboarding</code> and complete your profile
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">Browser Console Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Open browser console (F12 → Console tab) when starting an interview to see:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>🔑 API Key check: Found ✅ / Missing ❌</li>
              <li>📄 Job data loading status</li>
              <li>👤 User profile status</li>
              <li>🚀 Gemini Live connection status</li>
              <li>📤 Message sending method (WebSocket/API/Fallback)</li>
              <li>🤖 AI responses received</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

