'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ModerationPage() {
  const { getToken } = useAuth()
  const [reports, setReports] = useState<any[]>([])
  
  const fetchReports = async () => {
    try {
      const token = await getToken({ skipCache: true })
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/reports?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) setReports(json.data.reports)
    } catch (e) {
      toast.error('Failed to load reports')
    }
  }

  useEffect(() => { fetchReports() }, [])

  const handleResolve = async (id: string, status: 'REVIEWED' | 'DISMISSED') => {
    try {
      const token = await getToken({ skipCache: true })
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      toast.success(`Report ${status.toLowerCase()} successfully`)
      fetchReports()
    } catch (e) {
      toast.error('Action failed')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="text-indigo-400" /> Moderation Queue</h2>
      {reports.length === 0 ? (
         <div className="p-8 text-center text-white/50 bg-black/40 rounded-xl border border-white/10">No pending reports!</div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r, idx) => (
            <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/10 flex justify-between items-center">
               <div>
                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-bold mr-3">{r.targetType}</span>
                  <span className="text-white font-medium">{r.reason}</span>
                  <div className="text-white/40 text-sm mt-1">Target ID: {r.targetId}</div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleResolve(r._id, 'REVIEWED')} className="bg-emerald-500/20 text-emerald-400 p-2 rounded hover:bg-emerald-500/30 transition-colors"><CheckCircle2 className="w-5 h-5"/></button>
                 <button onClick={() => handleResolve(r._id, 'DISMISSED')} className="bg-slate-500/20 text-slate-400 p-2 rounded hover:bg-slate-500/30 transition-colors"><XCircle className="w-5 h-5"/></button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

