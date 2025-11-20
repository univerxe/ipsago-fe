"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Loader2, Sparkles, ShieldCheck, Target, Clock } from "lucide-react"
import type { JobPosition } from "@/lib/job-utils"

export default function InterviewGuidePage() {
  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true)
        const response = await fetch("/api/jobs?limit=12")
        const data = await response.json()
        setJobs(data?.jobs ?? [])
      } catch (err) {
        console.error(err)
        setError("채용 공고를 불러오지 못했어요. 새로고침 해주세요.")
      } finally {
        setJobsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="IpsaGo Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-xl">IpsaGo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/templates">Templates</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/onboarding">AI Interview</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 md:px-12 lg:px-16 py-12 space-y-12">
        <section className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-primary/10 text-primary border border-primary/20 text-sm font-semibold">
            <Sparkles className="size-4" />
            Interview Prep Copilot
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            3분 만에 완성하는 맞춤형{" "}
            <span className="text-primary">면접 준비 가이드</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            채용 공고를 선택하면 OpenAI가 직무에 딱 맞는 준비 전략, 예상 질문, 체크리스트를 즉시 만들어 드립니다.
            <br className="hidden md:block" />
            외국인 지원자도 한국 면접을 자신 있게 준비할 수 있도록 돕는 코칭 플로우입니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              직무 맞춤형 체크리스트
            </span>
            <span className="inline-flex items-center gap-2">
              <Target className="size-4 text-primary" />
              예상 질문 & 답변 가이드
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              실전 준비 타임라인
            </span>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">채용 공고 선택</h2>
            <p className="text-muted-foreground">
              준비하고 싶은 포지션을 선택하면 새로운 페이지에서 맞춤형 인터뷰 가이드를 확인할 수 있습니다.
            </p>
          </div>

          {jobsLoading ? (
            <Card className="border-dashed border-primary/30">
              <CardContent className="py-16 flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                채용 공고를 불러오는 중입니다...
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="h-full border-2 transition-all cursor-pointer border-border/70 hover:border-primary/40 hover:shadow-lg"
                  onClick={() => router.push(`/guide/${job.id}`)}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="rounded-full">
                        {job.roleCategory}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{job.deadline || "채용시 마감"}</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                    <CardDescription className="text-sm">{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={(event) => {
                        event.stopPropagation()
                        router.push(`/guide/${job.id}`)
                      }}
                    >
                      이 포지션 준비하기
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="py-4 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
            </Card>
          )}
        </section>

        <section className="border border-border rounded-3xl p-10 text-center space-y-4 bg-card/60">
          <Sparkles className="size-6 mx-auto text-primary" />
          <h3 className="text-2xl font-semibold">포지션을 선택하면 맞춤형 가이드 페이지로 이동합니다.</h3>
          <p className="text-muted-foreground">
            각 포지션 카드 또는 버튼을 클릭하면 `/guide/포지션ID` 경로에서 상세한 인터뷰 가이드를 확인할 수 있습니다.
          </p>
        </section>
      </main>
    </div>
  )
}

