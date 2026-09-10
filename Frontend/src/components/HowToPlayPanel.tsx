'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Lightbulb, Swords, Trophy, Wallet, Vote, X } from 'lucide-react'

const DISMISSED_KEY = 'cinderx_how_to_play_dismissed'

interface Tip {
  icon: React.ElementType
  iconColor: string
  title: string
  description: string
}

const tips: Tip[] = [
  {
    icon: Swords,
    iconColor: 'text-orange-400',
    title: 'Create or Join a Battle',
    description:
      'Go to Battles → Create a new battle with a topic and entry fee, or join an existing open battle.',
  },
  {
    icon: Wallet,
    iconColor: 'text-amber-400',
    title: 'Entry Fee & Pot',
    description:
      'Both players pay an entry fee in XLM. The winner takes the pot (minus a small platform fee).',
  },
  {
    icon: Vote,
    iconColor: 'text-violet-400',
    title: 'Vote & Predict',
    description:
      "Spectators can vote for their favourite roast and predict the winner to earn bonus XLM if they're right.",
  },
  {
    icon: Trophy,
    iconColor: 'text-cyan-400',
    title: 'Earn XP & Climb',
    description:
      'Wins give you 100 XP, losses still give 10 XP. Vote to earn 5 XP. Climb the leaderboard and unlock badges!',
  },
]

export function HowToPlayPanel() {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY)
      if (!stored) {
        setDismissed(false)
      }
    } catch {
      // ignore
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // ignore
    }
  }

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
        className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 shadow-[0_4px_32px_rgba(180,138,53,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15">
              <Lightbulb className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">New to CinderX? Quick start guide</p>
              <p className="text-xs text-slate-500">4 tips to get you battle-ready</p>
            </div>
            <div className="ml-2 text-slate-500">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          <button
            onClick={dismiss}
            className="ml-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Expandable tips */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden"
            >
              <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-4">
                {tips.map((tip) => {
                  const Icon = tip.icon
                  return (
                    <div
                      key={tip.title}
                      className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
                    >
                      <Icon className={`h-4 w-4 ${tip.iconColor}`} />
                      <p className="mt-2 text-xs font-semibold text-white">{tip.title}</p>
                      <p className="mt-1.5 text-xs leading-5 text-slate-400">{tip.description}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
