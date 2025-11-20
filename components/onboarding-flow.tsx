"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, ArrowRight, ArrowLeft, Loader2, FileText, X } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import DecryptedText from "./DecryptedText"

type Step = "basic-info" | "resume-upload" | "preferences"

const ROLE_KEYWORDS: Record<"Developer" | "Designer" | "Business Analyst", string[]> = {
  Developer: [
    "javascript",
    "typescript",
    "node",
    "react",
    "java",
    "python",
    "frontend",
    "backend",
    "full stack",
    "api",
    "mobile",
  ],
  Designer: ["design", "figma", "ui", "ux", "user experience", "adobe", "photoshop", "illustrator", "wireframe", "prototype", "branding"],
  "Business Analyst": ["analysis", "analytics", "sql", "excel", "tableau", "power bi", "stakeholder", "business", "requirements", "dashboard", "insights"],
}

const FALLBACK_ROLES: Array<keyof typeof ROLE_KEYWORDS> = ["Developer", "Designer", "Business Analyst"]

function detectRoleFromSkills(skills: string) {
  if (!skills?.trim()) return ""
  const normalized = skills.toLowerCase()
  const scores = Object.entries(ROLE_KEYWORDS).map(([role, keywords]) => {
    const score = keywords.reduce((acc, keyword) => (normalized.includes(keyword) ? acc + 1 : acc), 0)
    return { role, score }
  })
  const best = scores.sort((a, b) => b.score - a.score)[0]
  return best && best.score > 0 ? best.role : ""
}

export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("basic-info")
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumePreview, setResumePreview] = useState<string | null>(null)
  const [developerConfirmation, setDeveloperConfirmation] = useState<"yes" | "no" | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    nationality: "",
    skills: "",
    experience: "",
    targetRole: "",
  })

  const detectedRole = useMemo(() => detectRoleFromSkills(formData.skills), [formData.skills])
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    // Stop animation if we detected a role
    if (detectedRole) return

    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % FALLBACK_ROLES.length)
    }, 1400)

    return () => clearInterval(interval)
  }, [detectedRole])

  const displayedRole = detectedRole || FALLBACK_ROLES[roleIndex]

  const steps: { id: Step; title: string; progress: number }[] = [
    { id: "basic-info", title: "Basic Information", progress: 33 },
    { id: "resume-upload", title: "Resume & Experience", progress: 66 },
    { id: "preferences", title: "Job Preferences", progress: 100 },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Build resume text from form data
      // Note: User types their skills directly, which is more accurate than PDF parsing
      const resumeText = `
📄 RESUME

Name: ${formData.fullName}
Email: ${formData.email}
Age: ${formData.age || 'Not specified'}
Nationality: ${formData.nationality}

💼 PROFESSIONAL SUMMARY
Years of Experience: ${formData.experience} years
Target Role: ${formData.targetRole || 'Not specified'}
Detected Role: ${detectedRole || 'Not specified'}

🛠️ SKILLS
${formData.skills}

${resumeFile ? `\n📎 Resume File: ${resumeFile.name}` : ''}

📝 NOTES
- Skills entered by candidate for accuracy
- Role detected from skills: ${detectedRole || 'Not detected'}
- Candidate confirmed role: ${developerConfirmation === 'yes' ? 'Yes' : developerConfirmation === 'no' ? 'No' : 'Not answered'}
      `.trim()
      
      console.log('✅ Resume profile created from form data')
      console.log('📄 Resume preview:', resumeText.substring(0, 200) + '...')
      
      // Save complete user profile to localStorage
      const userProfile = {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age,
        nationality: formData.nationality,
        skills: formData.skills,
        experience: formData.experience,
        targetRole: formData.targetRole,
        resumeText: resumeText,
        resumeFileName: resumeFile?.name || null,
        detectedRole: detectedRole,
        roleConfirmed: developerConfirmation === 'yes',
        createdAt: new Date().toISOString()
      }
      
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
      console.log('✅ User profile saved to localStorage:', userProfile)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      setIsLoading(false)
      router.push("/dashboard")
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      setIsLoading(false)
      alert('Failed to save profile. Please try again.')
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      const url = URL.createObjectURL(file)
      setResumePreview(url)
    }
  }

  const handleRemoveFile = () => {
    if (resumePreview) {
      URL.revokeObjectURL(resumePreview)
    }
    setResumeFile(null)
    setResumePreview(null)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="IpsaGo Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">Welcome to IpsaGo</h1>
              <p className="text-sm text-muted-foreground">Let's set up your profile</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{steps[currentStepIndex].title}</span>
            <span className="text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <Progress value={steps[currentStepIndex].progress} className="h-2" />
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex].title}</CardTitle>
            <CardDescription>
              {currentStep === "basic-info" && "Tell us about yourself"}
              {currentStep === "resume-upload" && "Share your experience and skills"}
              {currentStep === "preferences" && "What kind of position are you looking for?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === "basic-info" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min={16}
                    max={80}
                    placeholder="27"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    placeholder="e.g., American, Chinese, Vietnamese"
                    value={formData.nationality}
                    onChange={(e) => updateFormData("nationality", e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === "resume-upload" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Resume / CV (PDF) *</Label>
                  {!resumeFile ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                      <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="size-8 text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium">Upload your resume</p>
                          <p className="text-sm text-muted-foreground">
                            Click to browse or drag and drop your PDF file
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF only, max 10MB
                          </p>
                        </div>
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <div className="size-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{resumeFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="flex-shrink-0"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      {resumePreview && (
                        <div className="border rounded-lg overflow-hidden bg-muted">
                          <div className="p-3 bg-card border-b flex items-center justify-between">
                            <p className="text-sm font-medium">Preview</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resumePreview, '_blank')}
                            >
                              Open Full View
                            </Button>
                          </div>
                          <div className="h-[400px]">
                            <iframe
                              src={resumePreview}
                              className="w-full h-full"
                              title="Resume Preview"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills *</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., JavaScript, React, Project Management, Korean (Intermediate)"
                    value={formData.skills}
                    onChange={(e) => updateFormData("skills", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple skills with commas
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Role detected</p>
                      <p className="text-xs text-muted-foreground">
                        {detectedRole ? "Identified from your key skills." : "Add a few skills to help us detect your role."}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full border border-primary/40 text-primary">
                      {detectedRole || "Pending"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex flex-wrap items-center gap-2">
                      <span>Are you a</span>
                      <DecryptedText
                        key={displayedRole}
                        text={`${displayedRole}?`}
                        animateOn="view"
                        sequential
                        speed={28}
                        maxIterations={14}
                        revealDirection="center"
                        className="font-semibold text-primary"
                        encryptedClassName="opacity-40"
                      />
                    </p>
                    <div className="flex gap-2">
                      {(["yes", "no"] as const).map((option) => (
                        <Button
                          key={option}
                          type="button"
                          size="sm"
                          variant={developerConfirmation === option ? "default" : "outline"}
                          onClick={() => setDeveloperConfirmation(option)}
                        >
                          {option === "yes" ? "Yes" : "No"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="3"
                    value={formData.experience}
                    onChange={(e) => updateFormData("experience", e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === "preferences" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Job Role *</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Software Engineer, Marketing Manager, Data Analyst"
                    value={formData.targetRole}
                    onChange={(e) => updateFormData("targetRole", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry Preferences</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Technology", "Finance", "Healthcare", "Education", "E-commerce", "Entertainment"].map((industry) => (
                      <Button
                        key={industry}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        {industry}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText className="size-4" />
                    Summary
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Name: {formData.fullName || "Not provided"}</li>
                    <li>• Email: {formData.email || "Not provided"}</li>
                    <li>• Age: {formData.age || "Not provided"}</li>
                    <li>• Nationality: {formData.nationality || "Not provided"}</li>
                    <li>• Resume: {resumeFile?.name || "Not uploaded"}</li>
                    <li>• Experience: {formData.experience || "0"} years</li>
                    <li>• Target Role: {formData.targetRole || "Not specified"}</li>
                    <li>• Role detected: {detectedRole || "Not enough skill data"}</li>
                    <li>
                      • Role confirmation: {developerConfirmation ? (developerConfirmation === "yes" ? "Yes" : "No") : "Not answered"}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStepIndex === steps.length - 1 ? (
              "Complete Setup"
            ) : (
              <>
                Next
                <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
