'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Wallet, Swords, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'

const TOUR_KEY = 'cinderx_welcome_tour_dismissed'

interface TourStep {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  highlight: string
}

const tourSteps: TourStep[] = [
  {
    icon: Flame,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15 border-orange-500/30',
    title: 'Welcome to CinderX 🔥',
    description:
      'CinderX is a next-gen roast battle platform built on Stellar. Compete in live roast battles, earn XLM rewards, and climb the leaderboard.',
    highlight: 'The arena is live. Are you ready to ignite?',
  },
  {
    icon: Wallet,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15 border-violet-500/30',
    title: 'Your Stellar Wallet',
    description:
      "New here? We'll create a managed Stellar wallet for you — no crypto experience needed. Already have Freighter? Connect it directly instead.",
    highlight: 'One wallet path, zero friction.',
  },
  {
    icon: Swords,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30',
    title: 'How Battles Work',
    description:
      'Create or join a battle with an entry fee in XLM. Submit your roast, let the crowd vote, and spectators can even predict the winner. The best roaster wins the pot!',
    highlight: 'Roast. Vote. Earn. It\'s that simple.',
  },
]

export function WelcomeTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Small delay so the tour doesn't flash on first render
    const timer = setTimeout(() => {
      try {
        const dismissed = localStorage.getItem(TOUR_KEY)
        if (!dismissed) {
          setVisible(true)
        }
      } catch {
        // localStorage may be unavailable
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(TOUR_KEY, '1')
    } catch {
      // ignore
    }
  }

  const next = () => {
    if (step < tourSteps.length - 1) {
      setStep((s) => s + 1)
    } else {
      dismiss()
    }
  }

  const prev = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const current = tourSteps[step]
  const Icon = current.icon
  const isLast = step === tourSteps.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-x-4 top-1/2 z-[160] mx-auto max-w-lg -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-900/98 p-7 shadow-[0_32px_96px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:p-8"
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-violet-300">
              <Sparkles className="h-3 w-3" />
              New to CinderX
            </div>

            {/* Icon */}
            <div
              className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${current.iconBg}`}
            >
              <Icon className={`h-7 w-7 ${current.iconColor}`} />
            </div>

            {/* Content */}
            <h2 className="font-orbitron text-xl font-bold text-white sm:text-2xl">
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">{current.description}</p>

            {/* Highlight box */}
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/80">
              {current.highlight}
            </div>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-between">
              {/* Step dots */}
              <div className="flex gap-1.5">
                {tourSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === step ? 'w-6 bg-white' : 'w-2 bg-white/25'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 rounded-xl bg-[#B88A35] px-5 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-[#D1A24A]"
                >
                  {isLast ? 'Enter Arena' : 'Next'}
                  {!isLast && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
