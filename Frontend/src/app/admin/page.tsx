'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { apiRoutes } from '@/lib/api' // Will need to add admin api routes
import { Users, Swords, Activity, Coins, ShieldCheck } from 'lucide-react'
import { StatCard } from '@/components/StatCard'

export default function AdminOverview() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState({ totalUsers: 0, activeBattles: 0, totalBattles: 0, feesEarned: 0 })
  
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken({ skipCache: true })
        if (!token) return
        // Minimal fetch directly for now
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (json.success) setStats(json.data)
      } catch (e) {
        console.error('Failed to load admin stats:', e)
      }
    })()
  }, [getToken])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers.toString()} icon={Users} />
        <StatCard label="Active Battles" value={stats.activeBattles.toString()} icon={Activity} />
        <StatCard label="Total Battles" value={stats.totalBattles.toString()} icon={Swords} />
        <StatCard label="Platform Fees (USDC)" value={stats.feesEarned.toFixed(2)} icon={Coins} />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-400" /> Action Required</h3>
           <p className="text-sm text-white/60">No pending moderation reports.</p>
        </div>
      </div>
    </div>
  )
}
