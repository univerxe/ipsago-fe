import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function JobNotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center space-y-6">
      <h1 className="text-3xl font-bold">Job not found</h1>
      <p className="text-muted-foreground">We couldn&apos;t find the position you were looking for.</p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}

