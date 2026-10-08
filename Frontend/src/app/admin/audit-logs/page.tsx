'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function AdminAuditLogs() {
  const { getToken } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken({ skipCache: true })
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/audit-logs?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (json.success) setLogs(json.data.logs)
      } finally {
        setLoading(false)
      }
    })()
  }, [getToken])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Audit Logs</h2>
      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {logs.map((log: any) => (
              <tr key={log._id} className="hover:bg-white/5">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{log.adminId?.email || log.adminId?.username || log.adminId}</td>
                <td className="px-4 py-3"><span className="text-indigo-400 font-mono text-xs">{log.action}</span></td>
                <td className="px-4 py-3 font-mono text-xs text-white/50">{log.targetId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
