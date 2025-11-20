import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              Coming Soon
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              This feature is coming soon!
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We're working hard to bring you this feature. In the meantime, explore our other amazing tools to prepare for your Korean job interviews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/">
                <Home className="size-4" />
                Back to Home
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/onboarding">
                Get Started
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Or explore these features:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/templates">Templates</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/guide">Interview Guides</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/onboarding">AI Interview</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

