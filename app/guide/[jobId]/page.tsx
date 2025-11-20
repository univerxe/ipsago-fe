"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from "lucide-react"
import type { JobPosition } from "@/lib/job-utils"

type GuideData = {
  jobOverview: string
  companyInsight: string
  keyCompetencies: string[]
  preparationTimeline: Array<{
    phase: string
    focus: string
    actions: string[]
  }>
  practiceQuestions: Array<{
    question: string
    whyItMatters: string
    howToAnswer: string
  }>
  bonusTips: string[]
}

export default function GuideDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobPosition | null>(null)
  const [guide, setGuide] = useState<GuideData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const jobRes = await fetch(`/api/jobs/${jobId}`)
        if (!jobRes.ok) {
          throw new Error("채용 공고를 불러오지 못했습니다.")
        }
        const jobData = await jobRes.json()
        setJob(jobData)

        const guideRes = await fetch("/api/interview/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })

        if (!guideRes.ok) {
          const err = await guideRes.json()
          throw new Error(err?.error || "가이드를 생성하지 못했습니다.")
        }

        const guideData = await guideRes.json()
        setGuide(guideData.guide)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "가이드를 생성하지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuide()
  }, [jobId])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="IpsaGo Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-xl">IpsaGo</span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2 rounded-full">
            <ArrowLeft className="size-4" />
            돌아가기
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 md:px-12 lg:px-16 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1 text-sm font-semibold">
              <BookOpen className="size-4" />
              맞춤형 인터뷰 가이드
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              {job ? `${job.company} · ${job.title}` : "면접 준비 가이드"}
            </h1>
            <p className="text-muted-foreground">
              직무 요구사항을 분석해 생성된 준비 전략, 타임라인, 예상 질문을 한눈에 확인하세요.
            </p>
          </div>
          {job && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {job.roleCategory}
              </Badge>
              {job.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="rounded-full">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <Card className="border-dashed border-primary/30">
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p>맞춤형 가이드를 생성하고 있어요...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-6 text-center text-red-600 dark:text-red-400 text-sm">{error}</CardContent>
          </Card>
        )}

        {!isLoading && !error && guide && (
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">포지션 요약</h2>
                  <p className="text-muted-foreground leading-relaxed">{guide.jobOverview}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">기업 인사이트</h3>
                  <p className="text-muted-foreground leading-relaxed">{guide.companyInsight}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {guide.keyCompetencies.map((item) => (
                    <Badge key={item} className="rounded-full bg-white/80 dark:bg-white/10 border border-primary/30 text-primary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">준비 타임라인</CardTitle>
                  <CardDescription>면접 전까지 단계별 실행 계획을 따라가 보세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {guide.preparationTimeline.map((step, idx) => (
                    <div key={idx} className="rounded-2xl border border-border/70 p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="text-primary">{step.phase}</span>
                        <span className="text-muted-foreground">{step.focus}</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {step.actions.map((action, actionIdx) => (
                          <li key={actionIdx} className="flex gap-2">
                            <span>•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">예상 질문 & 답변 전략</CardTitle>
                  <CardDescription>실제 면접을 대비해 STAR 구조로 연습하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guide.practiceQuestions.map((qa, idx) => (
                    <div key={idx} className="rounded-2xl border border-border/70 p-4 space-y-2">
                      <p className="font-semibold">{qa.question}</p>
                      <p className="text-xs uppercase tracking-wide text-primary">
                        왜 중요한가: <span className="normal-case text-muted-foreground">{qa.whyItMatters}</span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{qa.howToAnswer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">AI 피드백 팁</CardTitle>
                <CardDescription>면접 직전까지 기억해야 할 하이라이트</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {guide.bonusTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-border/70 p-4">
                    <CheckCircle2 className="size-5 text-primary mt-1" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && !guide && !error && (
          <Card className="border-dashed border-primary/20">
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-base text-muted-foreground">가이드 데이터를 표시할 수 없습니다. 다시 시도해주세요.</p>
              <Button onClick={() => router.refresh()} className="gap-2">
                다시 생성
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

