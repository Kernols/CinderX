
'use client'
import { Trophy, Swords } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
export default function TournamentsPage() {
  return (
    <div className="flex min-h-screen bg-black text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pl-20 pt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3 border-b border-[#B88A35]/20 pb-4">
            <Trophy className="h-8 w-8 text-[#B88A35]" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Tournaments</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass p-6 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Swords size={120} /></div>
               <h3 className="text-xl font-bold text-white mb-2">Alpha Season Genesis</h3>
               <p className="text-sm text-white/60 mb-6">A 16-player bracket single-elimination roast tournament.</p>
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-xs uppercase tracking-wider text-[#B88A35] font-semibold">Prize Pool</p>
                   <p className="text-2xl font-bold text-white">500 USDC</p>
                 </div>
                 <button className="bg-[#B88A35] text-black px-4 py-2 font-bold rounded-lg hover:bg-amber-400">Join Bracket</button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
