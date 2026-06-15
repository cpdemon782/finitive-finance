'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

const stageColors: Record<string, string> = {
  'New Lead': 'bg-blue-100 text-blue-700',
  'Reviewing': 'bg-amber-100 text-amber-700',
  'Due Diligence': 'bg-purple-100 text-purple-700',
  'Term Sheet': 'bg-green-100 text-green-700',
  'Closed': 'bg-emerald-100 text-emerald-700',
  'Lost': 'bg-red-100 text-red-700',
}

export default function CommissionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role !== 'affiliate') { router.push('/dashboard'); return }
      setUser({ ...user, ...profile })
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#9a9080]">Loading commissions...</p>
        </div>
      </div>
    )
  }

  const closedLeads = leads.filter(l => l.stage === 'Closed')
  const activeLeads = leads.filter(l => !['Closed', 'Lost'].includes(l.stage))
  const lostLeads = leads.filter(l => l.stage === 'Lost')
  const totalEarned = closedLeads.reduce((sum, l) => sum + ((l.deal_size_max || 0) * 0.02), 0)
  const totalPending = activeLeads.reduce((sum, l) => sum + ((l.deal_size_max || 0) * 0.02), 0)

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">

      {/* Sidebar */}
      <div className="w-52 bg-[#1a1610] flex flex-col flex-shrink-0 fixed h-full">
        <div className="p-4 border-b border-[#c9a84c]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center text-xs font-bold text-[#1a1610]">FF</div>
            <div>
              <div className="text-sm font-semibold text-white">Finitive Finance</div>
              <div className="text-[10px] text-[#c9a84c]/60 font-mono">AFFILIATE PORTAL</div>
            </div>
          </div>
        </div>
        <nav className="p-2 flex-1">
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MY PORTAL</div>
          <a href="/affiliate/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Dashboard</a>
          <a href="/affiliate/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">My Leads</a>
          <a href="/affiliate/submit" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Submit Lead</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">FINANCIALS</div>
          <a href="/affiliate/commissions" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Commissions</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">ACCOUNT</div>
          <a href="/affiliate/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">My Profile</a>
          <a href="/affiliate/support" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Support</a>
        </nav>
        <div className="p-3 border-t border-[#c9a84c]/20">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer" onClick={handleSignOut}>
            <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610]">
              {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'MT'}
            </div>
            <div>
              <div className="text-xs font-medium text-white">{user?.full_name}</div>
              <div className="text-[10px] text-white/40">Sign out</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">Commissions</div>
            <div className="text-xs text-[#9a9080]">Earnings from Finitive Finance referrals</div>
          </div>
        </div>

        <div className="p-6">

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#1a1610] to-[#2a2418] rounded-xl p-5 text-white">
              <div className="text-[10px] font-mono text-[#c9a84c]/60 mb-1">TOTAL EARNED</div>
              <div className="text-3xl font-bold text-[#c9a84c] font-mono mb-1">
                ${(totalEarned / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-white/40">{closedLeads.length} deal{closedLeads.length !== 1 ? 's' : ''} closed · 2% rate</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">PENDING PIPELINE</div>
              <div className="text-3xl font-bold text-[#c9a84c] font-mono mb-1">
                ${(totalPending / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-[#9a9080]">{activeLeads.length} active deal{activeLeads.length !== 1 ? 's' : ''} in progress</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">COMMISSION RATE</div>
              <div className="text-3xl font-bold text-[#1a1610] font-mono mb-1">2%</div>
              <div className="text-xs text-[#9a9080]">Of total closed deal value</div>
            </div>
          </div>

          {/* Commission breakdown table */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-sm font-semibold text-[#1a1610]">Commission breakdown</div>
              <div className="text-xs text-[#9a9080] mt-0.5">All referrals and their commission status</div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f3ee]">
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">COMPANY</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">DEAL SIZE</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">COMMISSION (2%)</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">STAGE</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">STATUS</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#9a9080]">
                      No leads submitted yet
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => {
                    const commission = (lead.deal_size_max || 0) * 0.02
                    const isEarned = lead.stage === 'Closed'
                    const isLost = lead.stage === 'Lost'
                    return (
                      <tr key={lead.id} className="hover:bg-[#f5f3ee]">
                        <td className="px-5 py-3">
                          <div className="text-sm font-semibold text-[#1a1610]">{lead.company_name}</div>
                          <div className="text-xs text-[#9a9080]">{lead.sector}</div>
                        </td>
                        <td className="px-5 py-3 text-sm font-mono font-semibold text-[#1a1610]">
                          ${((lead.deal_size_max || 0)/1000000).toFixed(0)}M
                        </td>
                        <td className="px-5 py-3 text-sm font-mono font-semibold">
                          <span className={isLost ? 'text-[#9a9080] line-through' : isEarned ? 'text-[#18b877]' : 'text-[#c9a84c]'}>
                            {isLost ? '—' : `$${(commission/1000000).toFixed(2)}M`}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>
                            {lead.stage}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isEarned ? 'bg-emerald-100 text-emerald-700' :
                            isLost ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {isEarned ? 'Earned' : isLost ? 'Not progressed' : 'Pending close'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#9a9080]">
                          {new Date(lead.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
              <div className="text-sm font-semibold text-[#1a1610]">Payment details</div>
              <button className="text-xs text-[#c9a84c] hover:text-[#a8863a]">Edit →</button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-[#9a9080] mb-1">Payment method</div>
                  <div className="font-medium text-[#1a1610]">Bank transfer (BSB/Account)</div>
                </div>
                <div>
                  <div className="text-xs text-[#9a9080] mb-1">Account name</div>
                  <div className="font-medium text-[#1a1610]">{user?.full_name}</div>
                </div>
                <div>
                  <div className="text-xs text-[#9a9080] mb-1">BSB</div>
                  <div className="font-medium text-[#1a1610] font-mono">Not set</div>
                </div>
                <div>
                  <div className="text-xs text-[#9a9080] mb-1">Account number</div>
                  <div className="font-medium text-[#1a1610] font-mono">Not set</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#f5f3ee] rounded-lg border border-black/5">
                <div className="text-xs text-[#5a5245] leading-relaxed">
                  <strong className="text-[#1a1610]">Commission payments</strong> are processed within 30 days of a deal closing. Contact <a href="mailto:affiliates@finitivefinance.com.au" className="text-[#c9a84c]">affiliates@finitivefinance.com.au</a> for payment queries.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
