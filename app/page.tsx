import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, MessageSquare, Target, CheckCircle } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="IpsaGo Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-xl">IpsaGo</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/onboarding">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-accent"></span>
            </span>
            AI-Powered Interview Practice
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Step into Korean interviews with{" "}
            <span className="text-primary">confidence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Get personalized job recommendations and practice with AI-powered interviews tailored for foreigners entering the Korean job market.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "Developer", color: "bg-red-500" },
              { label: "Designer", color: "bg-emerald-500" },
              { label: "Business Analyst", color: "bg-blue-500" },
            ].map((role) => (
              <div
                key={role.label}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <span className={`size-2.5 rounded-full ${role.color}`}></span>
                {role.label}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/onboarding">
                Start Your Journey
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base">
              Watch Demo
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </Button>
          </div>

          {/* Stats */}
          <div className="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Job Positions</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">5K+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to ace your interview
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform guides you through every step of the Korean job application process
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="gap-3 rounded-full px-6 py-6 text-base font-semibold shadow-[0_15px_40px_rgba(16,185,129,0.25)] bg-gradient-to-r from-emerald-400 to-primary text-white hover:brightness-110 transition-all hover:scale-[1.02]"
                asChild
              >
                <Link href="/templates" className="flex items-center gap-3">
                  <span className="relative flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-70"></span>
                    <span className="relative inline-flex rounded-full size-3 bg-white"></span>
                  </span>
                  View Templates
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Job Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your resume and get AI-recommended job positions that match your skills and experience in the Korean market.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageSquare className="size-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">AI Interview Practice</h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice with realistic AI-powered interviews that simulate actual Korean company interview scenarios.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="size-12 rounded-lg bg-chart-3/20 flex items-center justify-center">
                <Briefcase className="size-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold">Detailed Feedback</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive comprehensive feedback on your performance with actionable insights to improve your interview skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your path to interview success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, effective, and designed for your success
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Upload Your Resume",
                description: "Share your background, skills, and experience. Our AI analyzes your profile to understand your strengths.",
              },
              {
                step: "02",
                title: "Get Job Recommendations",
                description: "Receive 1-5 personalized job position recommendations tailored to your profile and the Korean job market.",
              },
              {
                step: "03",
                title: "Choose & Start Interview",
                description: "Select a position that interests you and start practicing with our AI interviewer in a realistic setting.",
              },
              {
                step: "04",
                title: "Receive Detailed Feedback",
                description: "Get comprehensive analysis of your performance with specific tips to improve your interview skills.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start group">
                <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/onboarding">
                Start Practicing Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Ready to transform your interview skills?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of foreigners who have successfully prepared for Korean job interviews with IpsaGo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/onboarding">
                Get Started Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.jpg"
                  alt="IpsaGo Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-xl">IpsaGo</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering foreigners to succeed in Korean job interviews with AI-powered preparation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 IpsaGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
