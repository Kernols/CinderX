'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function AdminBattles() {
  const { getToken } = useAuth()
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBattles = async () => {
    try {
      const token = await getToken({ skipCache: true })
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/battles?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) setBattles(json.data.battles)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBattles()
  }, [getToken])

  const handleAction = async (matchId: string, action: 'cancel' | 'finalize' | 'refund') => {
    if (!confirm(`Are you sure you want to ${action} this battle?`)) return
    try {
      const token = await getToken({ skipCache: true })
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/battles/${matchId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) {
        alert(`Battle ${action} successful`)
        fetchBattles()
      } else {
        alert(`Failed: ${json.message}`)
      }
    } catch (e) {
      console.error(e)
      alert('Action failed')
    }
  }

  if (loading) return <div>Loading battles...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Match ID</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Entry Fee</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {battles.map((b: any) => (
              <tr key={b._id} className="hover:bg-white/5">
                <td className="px-6 py-4">{b.matchId}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                    b.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    b.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4">{b.entryFee || 0} USDC</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleAction(b.matchId, 'cancel')} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30">Cancel</button>
                  <button onClick={() => handleAction(b.matchId, 'finalize')} className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded hover:bg-indigo-500/30">Finalize</button>
                  <button onClick={() => handleAction(b.matchId, 'refund')} className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/30">Refund</button>
                </td>
              </tr>
            ))}
            {battles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No battles found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
