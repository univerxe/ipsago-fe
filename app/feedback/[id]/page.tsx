import { FeedbackDashboard } from "@/components/feedback-dashboard"

export default function FeedbackPage({ params }: { params: { id: string } }) {
  return <FeedbackDashboard jobId={params.id} />
}
