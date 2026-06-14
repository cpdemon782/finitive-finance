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

const stageNotes: Record<string, string> = {
  'New Lead': 'Your referral has been received and is being reviewed by our team.',
  'Reviewing': 'Our team is actively reviewing the financial details of this opportunity.',
  'Due Diligence': 'This deal has progressed to due diligence. Our team is conducting a thorough review.',
  'Term Sheet': 'Excellent progress — a term sheet has been issued for this deal.',
  'Closed': 'This deal has been successfully closed. Your commission is being processed.',
  'Lost': 'After thorough review, this opportunity did not meet our current investment criteria. Thank you for the referral.',
}

export default function AffiliateDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role !== 'affiliate') { router.push('/dashboard'); return }

      setUser({ ...user, ...profile })

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })

      setLeads(leadsData || [])
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
          <p className="text-sm text-[#9a9080]">Loading portal...</p>
        </div>
      </div>
    )
  }

  const activeLeads = leads.filter(l => !['Closed', 'Lost'].includes(l.stage))
  const closedLeads = leads.filter(l => l.stage === 'Closed')
  const totalEarned = closedLeads.reduce((sum, l) => sum + ((l.deal_size_max || 0) * 0.02), 0)
  const pendingCommission = activeLeads.reduce((sum, l) => sum + ((l.deal_size_max || 0) * 0.02), 0)

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
          <a href="/affiliate/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Dashboard</a>
          <a href="/affiliate/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">My Leads</a>
          <a href="/affiliate/submit" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Submit Lead</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">FINANCIALS</div>
          <a href="/affiliate/commissions" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Commissions</a>
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
            <div className="text-base font-semibold text-[#1a1610]">Welcome back, {user?.full_name?.split(' ')[0]}</div>
            <div className="text-xs text-[#9a9080]">{new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Finitive Finance Affiliate Portal</div>
          </div>
          <button
            onClick={() => router.push('/affiliate/submit')}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + Submit Lead
          </button>
        </div>

        <div className="p-6">

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">LEADS SUBMITTED</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{leads.length}</div>
              <div className="text-xs text-[#9a9080] mt-1">Total referrals</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">IN PROGRESS</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{activeLeads.length}</div>
              <div className="text-xs text-[#9a9080] mt-1">Active in pipeline</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">TOTAL EARNED</div>
              <div className="text-2xl font-semibold text-[#18b877]">${(totalEarned / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-[#9a9080] mt-1">{closedLeads.length} deals closed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">PENDING COMMISSION</div>
              <div className="text-2xl font-semibold text-[#c9a84c]">${(pendingCommission / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-[#9a9080] mt-1">If all active deals close</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* My leads */}
            <div className="col-span-2 bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#1a1610]">My leads</div>
                <a href="/affiliate/submit" className="text-xs text-[#c9a84c] hover:text-[#a8863a]">+ Submit new →</a>
              </div>
              {leads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <div className="text-sm font-medium text-[#1a1610] mb-1">No leads yet</div>
                  <div className="text-xs text-[#9a9080] mb-4">Submit your first referral to get started</div>
                  <button
                    onClick={() => router.push('/affiliate/submit')}
                    className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a]"
                  >
                    Submit a lead
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {leads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                      className={`px-5 py-4 cursor-pointer transition-all ${selectedLead?.id === lead.id ? 'bg-[#f5f3ee]' : 'hover:bg-[#f5f3ee]'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-[#1a1610]">{lead.company_name}</div>
                          <div className="text-xs text-[#9a9080]">{lead.sector} · ${((lead.deal_size_max || 0)/1000000).toFixed(0)}M</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>
                          {lead.stage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#9a9080]">
                          Submitted {new Date(lead.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs font-mono font-semibold text-[#18b877]">
                          Est. commission: ${((lead.deal_size_max || 0) * 0.02 / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      {/* Team note */}
                      {selectedLead?.id === lead.id && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-[#c9a84c]/20 border-l-2 border-l-[#c9a84c]">
                          <div className="text-[10px] font-mono text-[#9a9080] mb-1">TEAM NOTE</div>
                          <div className="text-xs text-[#5a5245] leading-relaxed">
                            {lead.notes || stageNotes[lead.stage]}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">

              {/* Commission summary */}
              <div className="bg-gradient-to-br from-[#1a1610] to-[#2a2418] rounded-xl p-5 text-white">
                <div className="text-[10px] font-mono text-[#c9a84c]/60 mb-1">TOTAL COMMISSION EARNED</div>
                <div className="text-3xl font-bold text-[#c9a84c] font-mono mb-1">${(totalEarned / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-white/50 mb-4">2% of closed deal value</div>
                <button
                  onClick={() => router.push('/affiliate/commissions')}
                  className="w-full py-2 border border-[#c9a84c]/30 rounded-lg text-xs font-medium text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                >
                  View breakdown →
                </button>
              </div>

              {/* Submit CTA */}
              <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
                <div className="text-sm font-semibold text-[#1a1610] mb-2">Know a company that needs capital?</div>
                <div className="text-xs text-[#9a9080] mb-4 leading-relaxed">Submit a referral and earn 2% of the closed deal value. We'll keep you updated at every stage.</div>
                <button
                  onClick={() => router.push('/affiliate/submit')}
                  className="w-full py-2.5 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
                >
                  + Submit a lead
                </button>
              </div>

              {/* Latest updates */}
              <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5">
                  <div className="text-sm font-semibold text-[#1a1610]">Latest updates</div>
                </div>
                <div className="divide-y divide-black/5">
                  {leads.slice(0, 3).map(lead => (
                    <div key={lead.id} className="px-4 py-3">
                      <div className="text-xs font-medium text-[#1a1610] mb-0.5">{lead.company_name}</div>
                      <div className="text-xs text-[#9a9080]">{stageNotes[lead.stage]?.substring(0, 60)}...</div>
                      <div className="text-[10px] text-[#c9a84c] mt-1 font-mono">{lead.stage}</div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-[#9a9080]">No updates yet</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
