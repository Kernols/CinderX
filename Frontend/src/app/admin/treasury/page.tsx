'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Wallet, Server, Shield } from 'lucide-react'

export default function AdminTreasury() {
  const { getToken } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken({ skipCache: true })
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/treasury`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (json.success) setData(json.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [getToken])

  if (loading) return <div>Loading treasury...</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-indigo-400 w-6 h-6" />
            <h3 className="text-lg font-medium text-white">Contract Address</h3>
          </div>
          <p className="text-sm font-mono text-slate-300 break-all">{data?.contractId || 'Not configured'}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-indigo-400 w-6 h-6" />
            <h3 className="text-lg font-medium text-white">Escrow / Multisig</h3>
          </div>
          <p className="text-sm font-mono text-slate-300 break-all">{data?.escrowPublic || 'Not configured'}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="text-indigo-400 w-6 h-6" />
            <h3 className="text-lg font-medium text-white">Network</h3>
          </div>
          <p className="text-sm text-slate-300 capitalize">{data?.network || 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}
