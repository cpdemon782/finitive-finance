'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

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

export default function AffiliateLeadsPage() {
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
          <p className="text-sm text-[#9a9080]">Loading leads...</p>
        </div>
      </div>
    )
  }

  const activeLeads = leads.filter(l => !['Closed', 'Lost'].includes(l.stage))
  const closedLeads = leads.filter(l => l.stage === 'Closed')
  const lostLeads = leads.filter(l => l.stage === 'Lost')

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">

      {/* Sidebar */}
      <Sidebar user={user} portal="affiliate" activePage="leads" />
          </div>
        </div>
        <nav className="p-2 flex-1">
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MY PORTAL</div>
          <a href="/affiliate/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Dashboard</a>
          <a href="/affiliate/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">My Leads</a>
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
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">My Leads</div>
            <div className="text-xs text-[#9a9080]">{leads.length} total · {activeLeads.length} active · {closedLeads.length} closed</div>
          </div>
          <button
            onClick={() => router.push('/affiliate/submit')}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + Submit Lead
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-4">

            {leads.length === 0 ? (
              <div className="bg-white rounded-xl border border-black/5 shadow-sm p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
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
              <>
                {/* Active leads */}
                {activeLeads.length > 0 && (
                  <div className="mb-6">
                    <div className="text-[10px] font-mono text-[#9a9080] tracking-widest mb-3">ACTIVE · {activeLeads.length} LEADS</div>
                    <div className="space-y-3">
                      {activeLeads.map(lead => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                          className={`bg-white rounded-xl border cursor-pointer transition-all shadow-sm ${selectedLead?.id === lead.id ? 'border-[#c9a84c]' : 'border-black/5 hover:border-[#c9a84c]/40'}`}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="text-sm font-semibold text-[#1a1610]">{lead.company_name}</div>
                                <div className="text-xs text-[#9a9080] mt-0.5">{lead.sector} · {lead.deal_type}</div>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>
                                {lead.stage}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#9a9080]">
                                Submitted {new Date(lead.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-xs font-mono font-semibold text-[#18b877]">
                                Est. commission: ${((lead.deal_size_max || 0) * 0.02 / 1000000).toFixed(2)}M
                              </span>
                            </div>
                          </div>
                          {selectedLead?.id === lead.id && (
                            <div className="px-4 pb-4">
                              <div className="p-3 bg-[#f5f3ee] rounded-lg border-l-2 border-[#c9a84c]">
                                <div className="text-[10px] font-mono text-[#9a9080] mb-1">TEAM NOTE</div>
                                <div className="text-xs text-[#5a5245] leading-relaxed">
                                  {lead.notes || stageNotes[lead.stage]}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Closed leads */}
                {closedLeads.length > 0 && (
                  <div className="mb-6">
                    <div className="text-[10px] font-mono text-[#9a9080] tracking-widest mb-3">CLOSED · {closedLeads.length} LEADS</div>
                    <div className="space-y-3">
                      {closedLeads.map(lead => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                          className={`bg-white rounded-xl border cursor-pointer transition-all shadow-sm ${selectedLead?.id === lead.id ? 'border-[#c9a84c]' : 'border-black/5 hover:border-[#c9a84c]/40'}`}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="text-sm font-semibold text-[#1a1610]">{lead.company_name}</div>
                                <div className="text-xs text-[#9a9080] mt-0.5">{lead.sector} · {lead.deal_type}</div>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>
                                {lead.stage}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#9a9080]">
                                {new Date(lead.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-xs font-mono font-semibold text-[#18b877]">
                                Commission: ${((lead.deal_size_max || 0) * 0.02 / 1000000).toFixed(2)}M ✓
                              </span>
                            </div>
                          </div>
                          {selectedLead?.id === lead.id && (
                            <div className="px-4 pb-4">
                              <div className="p-3 bg-[#f5f3ee] rounded-lg border-l-2 border-emerald-400">
                                <div className="text-[10px] font-mono text-[#9a9080] mb-1">TEAM NOTE</div>
                                <div className="text-xs text-[#5a5245] leading-relaxed">
                                  {lead.notes || stageNotes[lead.stage]}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not progressed */}
                {lostLeads.length > 0 && (
                  <div className="mb-6">
                    <div className="text-[10px] font-mono text-[#9a9080] tracking-widest mb-3">NOT PROGRESSED · {lostLeads.length} LEADS</div>
                    <div className="space-y-3 opacity-60">
                      {lostLeads.map(lead => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                          className="bg-white rounded-xl border border-black/5 cursor-pointer transition-all shadow-sm hover:border-black/10"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="text-sm font-semibold text-[#1a1610]">{lead.company_name}</div>
                                <div className="text-xs text-[#9a9080] mt-0.5">{lead.sector}</div>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>
                                Not progressed
                              </span>
                            </div>
                          </div>
                          {selectedLead?.id === lead.id && (
                            <div className="px-4 pb-4">
                              <div className="p-3 bg-[#f5f3ee] rounded-lg border-l-2 border-red-300">
                                <div className="text-[10px] font-mono text-[#9a9080] mb-1">TEAM NOTE</div>
                                <div className="text-xs text-[#5a5245] leading-relaxed">
                                  {lead.notes || stageNotes['Lost']}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
