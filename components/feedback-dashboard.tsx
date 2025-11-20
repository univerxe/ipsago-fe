"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Award, Lightbulb, Download, RefreshCw, Home } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FeedbackCategory = {
  name: string
  score: number
  maxScore: number
  feedback: string[]
  strengths: string[]
  improvements: string[]
}

export function FeedbackDashboard({ jobId }: { jobId: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [overallScore, setOverallScore] = useState(0)
  const [categories, setCategories] = useState<FeedbackCategory[]>([])

  useEffect(() => {
    // Simulate feedback generation
    const generateFeedback = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockCategories: FeedbackCategory[] = [
        {
          name: "Communication Skills",
          score: 85,
          maxScore: 100,
          feedback: [
            "Your responses were clear and well-structured",
            "Good use of examples to illustrate your points",
            "Consider adding more specific metrics when discussing achievements"
          ],
          strengths: [
            "Clear articulation of ideas",
            "Good storytelling ability",
            "Professional tone throughout"
          ],
          improvements: [
            "Add more quantifiable results",
            "Practice being more concise in longer answers"
          ]
        },
        {
          name: "Technical Knowledge",
          score: 90,
          maxScore: 100,
          feedback: [
            "Demonstrated strong understanding of core concepts",
            "Excellent problem-solving approach",
            "Good awareness of industry best practices"
          ],
          strengths: [
            "Deep technical expertise",
            "Up-to-date with latest technologies",
            "Strong analytical thinking"
          ],
          improvements: [
            "Could mention more specific frameworks",
            "Discuss scalability considerations more"
          ]
        },
        {
          name: "Cultural Fit",
          score: 78,
          maxScore: 100,
          feedback: [
            "Shows enthusiasm for Korean work culture",
            "Good understanding of team dynamics",
            "Could demonstrate more knowledge about company values"
          ],
          strengths: [
            "Adaptable mindset",
            "Team player attitude",
            "Respectful communication style"
          ],
          improvements: [
            "Research company culture more deeply",
            "Show more awareness of Korean business etiquette",
            "Prepare questions about company values"
          ]
        },
        {
          name: "Problem Solving",
          score: 88,
          maxScore: 100,
          feedback: [
            "Structured approach to tackling challenges",
            "Good use of real-world examples",
            "Shows ability to think critically"
          ],
          strengths: [
            "Logical thinking process",
            "Creative solution finding",
            "Learns from past experiences"
          ],
          improvements: [
            "Consider alternative solutions more",
            "Discuss trade-offs in your decisions"
          ]
        },
        {
          name: "Leadership & Initiative",
          score: 82,
          maxScore: 100,
          feedback: [
            "Demonstrates proactive attitude",
            "Good examples of taking ownership",
            "Shows potential for growth"
          ],
          strengths: [
            "Takes initiative on projects",
            "Mentors junior team members",
            "Drives results"
          ],
          improvements: [
            "Share more leadership examples",
            "Discuss how you handle conflict"
          ]
        }
      ]

      setCategories(mockCategories)
      const avgScore = Math.round(
        mockCategories.reduce((sum, cat) => sum + cat.score, 0) / mockCategories.length
      )
      setOverallScore(avgScore)
      setIsLoading(false)
    }

    generateFeedback()
  }, [jobId])

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: "Excellent", variant: "default" as const, color: "bg-green-100 text-green-700 border-green-300" }
    if (score >= 70) return { label: "Good", variant: "secondary" as const, color: "bg-blue-100 text-blue-700 border-blue-300" }
    if (score >= 60) return { label: "Fair", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-700 border-yellow-300" }
    return { label: "Needs Improvement", variant: "destructive" as const, color: "bg-red-100 text-red-700 border-red-300" }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="IpsaGo Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-xl">IpsaGo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export PDF
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="gap-2">
                <Home className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Analyzing your interview...</p>
                <p className="text-sm text-muted-foreground">Our AI is preparing detailed feedback</p>
              </div>
            </div>
          )}

          {/* Feedback Content */}
          {!isLoading && (
            <>
              {/* Overall Score Card */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="relative size-32">
                        <svg className="size-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                            className="text-primary transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{overallScore}</div>
                            <div className="text-xs text-muted-foreground">/ 100</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <div className="space-y-1">
                        <h1 className="text-3xl font-bold">Interview Performance Report</h1>
                        <p className="text-muted-foreground">
                          Based on your interview responses and overall performance
                        </p>
                      </div>
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Badge className={`${getScoreBadge(overallScore).color} border`}>
                          {getScoreBadge(overallScore).label}
                        </Badge>
                        <Award className="size-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button className="gap-2" asChild>
                        <Link href="/dashboard">
                          <RefreshCw className="size-4" />
                          Practice Again
                        </Link>
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="size-4" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Performance Breakdown</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {categories.map((category, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                            {category.score}
                          </span>
                        </div>
                        <Progress value={category.score} className="h-2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle className="size-4 text-green-600" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {category.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-600 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {category.improvements.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <TrendingUp className="size-4 text-blue-600" />
                              Areas to Improve
                            </h4>
                            <ul className="space-y-1">
                              {category.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Detailed Feedback Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="size-5 text-primary" />
                    Detailed Feedback & Recommendations
                  </CardTitle>
                  <CardDescription>
                    In-depth analysis of your interview performance with actionable tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={categories[0]?.name || ""} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                      {categories.map((category) => (
                        <TabsTrigger key={category.name} value={category.name} className="text-xs">
                          {category.name.split(' ')[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {categories.map((category) => (
                      <TabsContent key={category.name} value={category.name} className="space-y-4 mt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-semibold">{category.name}</span>
                            <Badge className={getScoreBadge(category.score).color}>
                              {category.score}/{category.maxScore}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Overall Feedback:</h4>
                            <ul className="space-y-2">
                              {category.feedback.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg">
                                  <AlertCircle className="size-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-accent" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-card border border-border rounded-lg space-y-2">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="size-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Review Feedback</h4>
                      <p className="text-sm text-muted-foreground">
                        Read through each category and understand your strengths and areas to improve.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-card border border-border rounded-lg space-y-2">
                      <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <RefreshCw className="size-5 text-accent" />
                      </div>
                      <h4 className="font-semibold">Practice More</h4>
                      <p className="text-sm text-muted-foreground">
                        Try another interview to track your improvement and build confidence.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-card border border-border rounded-lg space-y-2">
                      <div className="size-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
                        <Award className="size-5 text-chart-3" />
                      </div>
                      <h4 className="font-semibold">Apply Learning</h4>
                      <p className="text-sm text-muted-foreground">
                        Use these insights in your real interviews to increase your success rate.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button size="lg" className="gap-2" asChild>
                      <Link href="/dashboard">
                        Continue to Dashboard
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
