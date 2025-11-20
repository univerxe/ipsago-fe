"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  Lightbulb,
} from "lucide-react"

type TemplateCategory = "self-intro" | "motivation" | "all"

interface Template {
  id: string
  category: "self-intro" | "motivation"
  title: string
  description: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  structure: string[]
  tips: string[]
  example?: string
}

const templates: Template[] = [
  {
    id: "self-intro-basic",
    category: "self-intro",
    title: "기본 1분 자기소개",
    description: "면접에서 가장 기본이 되는 1분 자기소개 템플릿입니다. 인사, 핵심 역량, 경험, 포부를 자연스럽게 연결합니다.",
    duration: "40-50초",
    difficulty: "Beginner",
    tags: ["1분 자기소개", "기본 구성", "신입"],
    structure: [
      "인사 + 이름 + 지원 직무",
      "핵심 역량 + 경험 사례 1개",
      "지원 동기 + 직무 연결",
      "입사 후 포부",
      "마무리 인사",
    ],
    tips: [
      "40~50초 내외로 준비하세요",
      "미사여구보다 구체적인 언어를 사용하세요",
      "경험 1개만 깊이 있게 풀어보세요",
      "자연스러운 태도와 표정이 중요합니다",
    ],
  },
  {
    id: "self-intro-developer",
    category: "self-intro",
    title: "개발자 자기소개",
    description: "기술 역량과 프로젝트 경험을 효과적으로 어필하는 개발자 맞춤형 자기소개 템플릿입니다.",
    duration: "45-50초",
    difficulty: "Intermediate",
    tags: ["개발자", "기술 역량", "프로젝트"],
    structure: [
      "인사 + 개발 직무 지원",
      "주요 기술 스택 + 프로젝트 경험",
      "문제 해결 사례 (성과 중심)",
      "기술적 성장 목표",
      "마무리",
    ],
    tips: [
      "기술 용어는 정확하게 사용하세요",
      "정량적 성과를 포함하세요 (예: 성능 30% 개선)",
      "팀 협업 경험을 강조하세요",
      "최신 기술 트렌드에 대한 관심을 보여주세요",
    ],
    example:
      "안녕하십니까. 프론트엔드 개발 직무에 지원한 OOO입니다. React와 TypeScript를 활용한 3년의 개발 경험이 있으며, 최근 프로젝트에서 컴포넌트 재사용성을 높여 개발 시간을 40% 단축시켰습니다. 사용자 경험 개선에 집중하며, UI 개선 후 사용자 이탈률을 30% 줄인 경험이 있습니다. 입사 후에는 성능 최적화와 접근성을 고려한 프론트엔드 개발자로 성장하겠습니다. 감사합니다.",
  },
  {
    id: "self-intro-designer",
    category: "self-intro",
    title: "디자이너 자기소개",
    description: "창의성과 사용자 중심 디자인 철학을 보여주는 디자이너 특화 자기소개 템플릿입니다.",
    duration: "45-50초",
    difficulty: "Intermediate",
    tags: ["디자이너", "UI/UX", "포트폴리오"],
    structure: [
      "인사 + 디자인 직무 지원",
      "디자인 철학 + 대표 프로젝트",
      "사용자 경험 개선 사례",
      "디자인 트렌드 학습 의지",
      "마무리",
    ],
    tips: [
      "디자인 프로세스를 간단히 언급하세요",
      "사용자 피드백이나 성과를 구체적으로 말하세요",
      "협업 경험을 자연스럽게 녹여내세요",
      "회사의 디자인 방향성과 연결하세요",
    ],
  },
  {
    id: "self-intro-career",
    category: "self-intro",
    title: "경력직 자기소개",
    description: "경력과 전문성을 효과적으로 전달하는 경력직 맞춤 자기소개 템플릿입니다.",
    duration: "50-60초",
    difficulty: "Advanced",
    tags: ["경력직", "전문성", "리더십"],
    structure: [
      "인사 + 경력 요약",
      "주요 성과 2개 (정량적)",
      "전문 역량 + 차별점",
      "회사 기여 방안",
      "마무리",
    ],
    tips: [
      "경력 연차는 간단히만 언급하세요",
      "가장 임팩트 있는 성과 중심으로 구성하세요",
      "지원 회사의 니즈와 연결하세요",
      "리더십이나 멘토링 경험을 포함하세요",
    ],
  },
  {
    id: "motivation-basic",
    category: "motivation",
    title: "기본 지원 동기",
    description: "회사에 대한 관심과 직무 적합성을 논리적으로 전달하는 기본 지원 동기 템플릿입니다.",
    duration: "1-2분",
    difficulty: "Beginner",
    tags: ["지원 동기", "회사 관심", "직무 적합성"],
    structure: [
      "회사/직무에 관심을 갖게 된 계기",
      "본인의 역량이 직무와 맞는 이유",
      "회사의 비전/가치관 공감 포인트",
      "입사 후 기여 방안",
      "마무리 (열정 표현)",
    ],
    tips: [
      "단순한 칭찬보다 구체적인 관심사를 말하세요",
      "회사의 최근 뉴스나 프로젝트를 언급하세요",
      "본인의 경험과 회사의 니즈를 연결하세요",
      "진정성 있게 표현하세요",
    ],
  },
  {
    id: "motivation-startup",
    category: "motivation",
    title: "스타트업 지원 동기",
    description: "스타트업의 문화와 비전에 공감하고 성장 마인드를 보여주는 지원 동기 템플릿입니다.",
    duration: "1-2분",
    difficulty: "Intermediate",
    tags: ["스타트업", "빠른 성장", "도전"],
    structure: [
      "스타트업에 관심을 갖게 된 계기",
      "회사의 제품/서비스에 대한 이해",
      "빠른 성장 환경에서의 경험",
      "문제 해결 능력 + 적극성",
      "함께 성장하고 싶은 의지",
    ],
    tips: [
      "스타트업 환경의 장점을 이해하고 있음을 보여주세요",
      "주도적인 업무 경험을 강조하세요",
      "멀티태스킹 능력을 어필하세요",
      "회사의 비전에 진심으로 공감하세요",
    ],
  },
  {
    id: "motivation-tech",
    category: "motivation",
    title: "IT/기술 기업 지원 동기",
    description: "기술에 대한 열정과 회사의 기술력에 대한 이해를 보여주는 지원 동기 템플릿입니다.",
    duration: "1-2분",
    difficulty: "Intermediate",
    tags: ["IT 기업", "기술 열정", "혁신"],
    structure: [
      "회사의 기술/제품에 관심을 갖게 된 계기",
      "본인의 기술 역량 + 관련 프로젝트",
      "회사의 기술 스택/문화 공감",
      "기술적 기여 방안",
      "지속적인 학습 의지",
    ],
    tips: [
      "회사의 기술 블로그나 오픈소스를 언급하세요",
      "최신 기술 트렌드에 대한 관심을 보여주세요",
      "실제 사용해본 제품에 대한 피드백을 제시하세요",
      "기술적 성장에 대한 명확한 목표를 말하세요",
    ],
  },
  {
    id: "motivation-culture",
    category: "motivation",
    title: "기업 문화 중심 지원 동기",
    description: "회사의 문화와 가치관에 대한 깊은 공감을 전달하는 지원 동기 템플릿입니다.",
    duration: "1-2분",
    difficulty: "Advanced",
    tags: ["기업 문화", "가치관", "팀워크"],
    structure: [
      "회사 문화를 알게 된 계기",
      "본인의 가치관과 회사 문화의 일치점",
      "협업/소통 경험 사례",
      "문화적 기여 방안",
      "장기적 성장 비전",
    ],
    tips: [
      "회사의 핵심 가치를 정확히 이해하세요",
      "실제 경험한 협업 사례를 구체적으로 말하세요",
      "회사의 복지나 제도를 언급하되 중심이 되지 않게 하세요",
      "장기적으로 함께 성장하고 싶은 마음을 전달하세요",
    ],
  },
]

const difficultyColors: Record<Template["difficulty"], string> = {
  Beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediate: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Advanced: "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

function InterviewTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((t) => t.category === selectedCategory)

  const selfIntroCount = templates.filter((t) => t.category === "self-intro").length
  const motivationCount = templates.filter((t) => t.category === "motivation").length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="IpsaGo Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-xl">IpsaGo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">Jobs</Link>
            </Button>
            <Button variant="ghost" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h1 className="text-3xl font-bold">면접 준비 템플릿</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              AI 기반 면접 연습을 시작하기 전에, 검증된 템플릿으로 답변을 준비하세요.
              <br />
              자기소개와 지원동기 템플릿이 당신의 면접을 성공으로 이끌어 드립니다.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium">
                <span className="text-base font-semibold text-primary">{templates.length}</span>
                <span className="text-muted-foreground">템플릿</span>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium">
                <FileText className="size-4 text-primary" />
                <span className="text-muted-foreground">무료 제공</span>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-green-500" />
                <span className="text-muted-foreground">검증된 구조</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="gap-2"
            >
              <BookOpen className="size-4" />
              전체 템플릿
              <Badge variant="secondary" className="ml-1">
                {templates.length}
              </Badge>
            </Button>
            <Button
              variant={selectedCategory === "self-intro" ? "default" : "outline"}
              onClick={() => setSelectedCategory("self-intro")}
              className="gap-2"
            >
              자기소개
              <Badge variant="secondary" className="ml-1">
                {selfIntroCount}
              </Badge>
            </Button>
            <Button
              variant={selectedCategory === "motivation" ? "default" : "outline"}
              onClick={() => setSelectedCategory("motivation")}
              className="gap-2"
            >
              지원 동기
              <Badge variant="secondary" className="ml-1">
                {motivationCount}
              </Badge>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="h-full border-border/60 bg-card/80 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge className={`text-xs rounded-full px-3 py-1 ${difficultyColors[template.difficulty]}`}>
                      {template.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {template.duration}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg leading-tight">{template.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">{template.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs rounded-full px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Lightbulb className="size-4 text-amber-500" />
                      핵심 구조
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {template.structure.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                      {template.structure.length > 3 && (
                        <li className="text-primary text-xs">+{template.structure.length - 3} more...</li>
                      )}
                    </ul>
                  </div>

                  <Button className="w-full gap-2" variant="outline">
                    템플릿 보기
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">템플릿으로 준비하고, AI로 연습하세요</h2>
                <p className="text-muted-foreground">
                  완성된 답변을 준비했다면, 이제 실전처럼 연습할 시간입니다.
                  <br />
                  AI 면접관과 함께 실제 면접을 시뮬레이션하고 피드백을 받아보세요.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/jobs">
                    <Sparkles className="size-4" />
                    AI 면접 시작하기
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/guide">면접 가이드 보기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{selectedTemplate.title}</CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">답변 구조</h3>
                <ol className="space-y-2">
                  {selectedTemplate.structure.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-muted-foreground pt-0.5">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">핵심 팁</h3>
                <ul className="space-y-2">
                  {selectedTemplate.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-5 flex-shrink-0 text-green-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedTemplate.example && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">예시 답변</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed text-muted-foreground">{selectedTemplate.example}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 gap-2" asChild>
                  <Link href="/jobs">
                    <Sparkles className="size-4" />
                    이 템플릿으로 연습하기
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  닫기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function TemplatesPage() {
  return <InterviewTemplates />
}

