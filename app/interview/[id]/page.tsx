import { InterviewInterface } from "@/components/interview-interface"

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InterviewInterface jobId={id} />
}
