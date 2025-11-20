import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, NotebookPen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { loadJobById } from '@/lib/jobs-data'

export const dynamic = 'force-dynamic'

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const job = await loadJobById(id)

  if (!job) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
          </Button>
          <Badge variant="outline" className="gap-1 text-xs">
            <NotebookPen className="size-3.5" />
            Real job data
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge>{job.roleCategory}</Badge>
            <span className="text-sm text-muted-foreground">ID #{job.id}</span>
          </div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-lg text-muted-foreground">{job.company}</p>
        </div>

        {job.description && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {job.responsibilities.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Responsibilities</h3>
            <ul className="space-y-2 text-muted-foreground">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.required.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Required Qualifications</h3>
            <ul className="space-y-2 text-muted-foreground">
              {job.required.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.preferred.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Preferred Qualifications</h3>
            <ul className="space-y-2 text-muted-foreground">
              {job.preferred.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.skills.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 rounded-full">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-3">
          <Button className="gap-2" asChild>
            <Link href={`/interview/${job.id}`}>
              <Briefcase className="size-4" />
              Practice this interview
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Find more roles</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

