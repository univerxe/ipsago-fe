import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Aurora from '@/components/Aurora'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const lexend = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IpsaGo - Step into Korean interviews with confidence',
  description: 'AI-powered Korean interview preparation platform for foreigners. Get personalized job recommendations and practice with AI interviews.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${lexend.className} font-sans antialiased relative`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Aurora colorStops={['#10B981', '#EC4899', '#A855F7']} blend={0.45} amplitude={1.25} speed={0.12} />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
