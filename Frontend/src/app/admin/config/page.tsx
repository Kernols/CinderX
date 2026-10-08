'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function AdminConfig() {
  const { getToken } = useAuth()
  const [config, setConfig] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken({ skipCache: true })
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/config`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (json.success) setConfig(json.data.configs)
      } finally {
        setLoading(false)
      }
    })()
  }, [getToken])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Platform Configuration</h2>
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
         {config.length === 0 ? <p className="text-white/50">No config keys found.</p> : (
           <ul className="space-y-3">
             {config.map((c: any) => (
               <li key={c.key} className="flex justify-between items-center bg-white/5 p-3 rounded">
                  <span className="font-medium text-slate-300">{c.key}</span>
                  <span className="text-indigo-400 font-mono">{c.value}</span>
               </li>
             ))}
           </ul>
         )}
      </div>
    </div>
  )
}
