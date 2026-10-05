'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Users, Ban, Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

export default function UsersPage() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  
  const fetchUsers = async () => {
    try {
      const token = await getToken({ skipCache: true })
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) setUsers(json.data.users)
    } catch (e) {
      toast.error('Failed to load users')
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleBan = async (id: string, currentlyBanned: boolean) => {
    try {
      const token = await getToken({ skipCache: true })
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !currentlyBanned })
      })
      toast.success(currentlyBanned ? 'User unbanned' : 'User banned')
      fetchUsers()
    } catch (e) {
      toast.error('Action failed')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-indigo-400" /> User Management</h2>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold">Username</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="px-6 py-4">{u.username || u.email}</td>
                <td className="px-6 py-4">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.isBanned ? <span className="text-red-400 font-semibold">Banned</span> : <span className="text-emerald-400 font-semibold">Active</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleBan(u._id, u.isBanned)} className="text-red-400 hover:text-red-300 p-2">
                     <Ban className="w-5 h-5"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

