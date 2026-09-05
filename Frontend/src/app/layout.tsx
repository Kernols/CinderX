import type { Metadata, Viewport } from 'next'
import { Jura, Share_Tech_Mono, Syncopate } from 'next/font/google'
import { ClerkProvider } from '@/components/ClerkProvider'
import { Navbar } from '@/components/Navbar'
import AppBackground from '@/components/AppBackgroundWrapper'
import { ToastProvider } from '@/components/ToastProvider'
import { WelcomeTour } from '@/components/WelcomeTour'
import './globals.css'

const jura = Jura({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const syncopate = Syncopate({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-orbitron',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-space',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CinderX – Ignite. Battle. Conquer.',
  description: 'A next-gen gamified roast battle platform on Stellar. Join battles, vote, predict winners, and earn XLM rewards.',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${jura.variable} ${syncopate.variable} ${shareTechMono.variable}`} data-scroll-behavior="smooth">
      <body className="font-inter antialiased">
        <ClerkProvider>
          <AppBackground />
          <div className="relative z-10">
            <Navbar />
            {children}
          </div>
          <WelcomeTour />
          <ToastProvider />
        </ClerkProvider>
      </body>
    </html>
  )
}
