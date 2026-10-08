'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { PageLoader } from '@/components/LoadingScreen'
import { ShieldAlert } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const isAdmin = user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    if (isLoaded && (!isSignedIn || !isAdmin)) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, isAdmin, router])

  if (!isLoaded || !isSignedIn || !isAdmin) {
    return <PageLoader />
  }

    <div className="flex min-h-screen bg-black text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pl-20 pt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3 border-b border-indigo-500/20 pb-4">
            <ShieldAlert className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Console</h1>
          </div>
          <nav className="flex space-x-4 border-b border-white/10 mb-8 overflow-x-auto pb-2">
            {[
              { name: 'Overview', href: '/admin' },
              { name: 'Users', href: '/admin/users' },
              { name: 'Battles', href: '/admin/battles' },
              { name: 'Moderation', href: '/admin/moderation' },
              { name: 'Treasury', href: '/admin/treasury' },
              { name: 'Config', href: '/admin/config' },
              { name: 'Audit Logs', href: '/admin/audit-logs' },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className="text-sm font-medium text-slate-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/5 whitespace-nowrap"
              >
                {tab.name}
              </a>
            ))}
          </nav>
          {children}
        </div>
      </main>
    </div>
  )
}
