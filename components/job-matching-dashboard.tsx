"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, ArrowRight, Sparkles, Loader2, FileText, Clock } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import Papa from "papaparse"
import type { JobCsvRow, JobPosition } from "@/lib/job-utils"
import { transformRow } from "@/lib/job-utils"

const ROLE_COLORS: Record<string, string> = {
  Developer: "bg-red-500",
  Designer: "bg-emerald-500",
  "Business Analyst": "bg-blue-500",
}

const getRoleColor = (role: string) => ROLE_COLORS[role as keyof typeof ROLE_COLORS] ?? "bg-primary"

export function JobMatchingDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Get user's detected role from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    const detectedRole = userProfile.detectedRole || null
    setUserRole(detectedRole)
    console.log('👤 User role detected:', detectedRole)
  }, [])

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/jobs-db.csv")
        const csvText = await response.text()
        Papa.parse<JobCsvRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let parsedJobs = results.data
              .filter((row) => row.job_title && row.company_name)
              .map((row, index) => transformRow(row, index))
            
            // Filter by user's role if available
            if (userRole) {
              parsedJobs = parsedJobs.filter(job => job.roleCategory === userRole)
              console.log(`🔍 Filtered ${parsedJobs.length} jobs for role: ${userRole}`)
            }
            
            // Take first 18 jobs after filtering
            setJobs(parsedJobs.slice(0, 18))
            setIsLoading(false)
          },
          error: (error) => {
            console.error("Failed to parse job data", error)
            setIsLoading(false)
          },
        })
      } catch (error) {
        console.error("Failed to load job data", error)
        setIsLoading(false)
      }
    }

    if (userRole !== null) {
      fetchJobs()
    }
  }, [userRole])

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
            <Button variant="ghost" size="sm">Profile</Button>
            <Button variant="ghost" size="sm">Settings</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h1 className="text-3xl font-bold">Your AI-Recommended Jobs</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Based on your profile, we've found {jobs.length} positions that match your skills and experience.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium">
                <span className="text-base font-semibold text-primary">{jobs.length}</span>
                <span className="text-muted-foreground">roles found</span>
              </div>
              {userRole && (
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground">
                    <span className={`size-2.5 rounded-full ${getRoleColor(userRole)}`} />
                    {userRole}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="size-12 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Analyzing your profile...</p>
                <p className="text-sm text-muted-foreground">Our AI is finding the best job matches for you</p>
              </div>
            </div>
          )}

          {/* Job Listings */}
          {!isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="h-full border-border/60 bg-card/80 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <CardHeader className="space-y-3 pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold">
                        <span className={`size-2.5 rounded-full ${getRoleColor(job.roleCategory)}`} />
                        {job.roleCategory}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {job.deadline}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                      <CardDescription className="mt-1 text-sm font-semibold text-foreground">
                        {job.company}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 min-h-[3.6rem]">
                      {job.description || "No description provided."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs rounded-full px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <Button size="sm" className="gap-1.5 text-xs" asChild>
                        <Link href={`/interview/${job.id}`}>
                          <Briefcase className="size-3.5" />
                          Practice
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          <FileText className="size-3.5" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results State */}
          {!isLoading && jobs.length === 0 && (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="size-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Briefcase className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No job matches found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any positions matching your profile. Try updating your information.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/onboarding">Update Profile</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
