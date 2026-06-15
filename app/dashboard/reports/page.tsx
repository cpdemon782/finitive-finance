'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

const STAGES = ['New Lead', 'Reviewing', 'Due Diligence', 'Term Sheet', 'Closed', 'Lost']

const stageColors: Record<string, string> = {
  'New Lead': 'bg-blue-100 text-blue-700',
  'Reviewing': 'bg-amber-100 text-amber-700',
  'Due Diligence': 'bg-purple-100 text-purple-700',
  'Term Sheet': 'bg-green-100 text-green-700',
  'Closed': 'bg-emerald-100 text-emerald-700',
  'Lost': 'bg-red-100 text-red-700',
}

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }
      setUser({ ...user, ...profile })
      const [leadsRes, affiliatesRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').eq('role', 'affiliate'),
      ])
      setLeads(leadsRes.data || [])
      setAffiliates(affiliatesRes.data || [])
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
          <p className="text-sm text-[#9a9080]">Loading reports...</p>
        </div>
      </div>
    )
  }

  // Pipeline stats
  const totalPipeline = leads.reduce((sum, l) => sum + (l.deal_size_max || 0), 0)
  const activePipeline = leads.filter(l => !['Closed', 'Lost'].includes(l.stage)).reduce((sum, l) => sum + (l.deal_size_max || 0), 0)
  const closedDeals = leads.filter(l => l.stage === 'Closed')
  const closedValue = closedDeals.reduce((sum, l) => sum + (l.deal_size_max || 0), 0)
  const affiliateLeads = leads.filter(l => l.source === 'affiliate')
  const directLeads = leads.filter(l => l.source === 'direct')
  const conversionRate = leads.length > 0 ? ((closedDeals.length / leads.length) * 100).toFixed(1) : '0'
  const totalCommissions = closedDeals.reduce((sum, l) => sum + ((l.deal_size_max || 0) * 0.02), 0)

  // Stage breakdown
  const stageBreakdown = STAGES.map(stage => ({
    stage,
    count: leads.filter(l => l.stage === stage).length,
    value: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + (l.deal_size_max || 0), 0),
  }))

  const maxValue = Math.max(...stageBreakdown.map(s => s.value))

  // Affiliate performance
  const affiliatePerformance = affiliates.map(a => {
    const affLeads = leads.filter(l => l.submitted_by === a.id)
    const closed = affLeads.filter(l => l.stage === 'Closed')
    const earned = closed.reduce((sum, l) => sum + ((l.deal_size_max || 0) * (a.commission_rate || 0.02)), 0)
    return { ...a, totalLeads: affLeads.length, closedLeads: closed.length, earned }
  }).sort((a, b) => b.totalLeads - a.totalLeads)

  // Top deals
  const topDeals = [...leads]
    .filter(l => l.stage !== 'Lost')
    .sort((a, b) => (b.deal_size_max || 0) - (a.deal_size_max || 0))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">

      {/* Sidebar */}
      <div className="w-52 bg-[#1a1610] flex flex-col flex-shrink-0 fixed h-full">
        <div className="p-4 border-b border-[#c9a84c]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center text-xs font-bold text-[#1a1610]">FF</div>
            <div>
              <div className="text-sm font-semibold text-white">Finitive Finance</div>
              <div className="text-[10px] text-[#c9a84c]/60 font-mono">DEAL PLATFORM</div>
            </div>
          </div>
        </div>
        <nav className="p-2 flex-1">
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MAIN</div>
          <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Dashboard</a>
          <a href="/dashboard/pipeline" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Pipeline</a>
          <a href="/dashboard/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">All Leads</a>
          <a href="/dashboard/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Tasks</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">MANAGEMENT</div>
          <a href="/dashboard/affiliates" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Affiliates</a>
          <a href="/dashboard/team" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Team</a>
          <a href="/dashboard/reports" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Reports</a>
        </nav>
        <div className="p-3 border-t border-[#c9a84c]/20">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer" onClick={handleSignOut}>
            <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610]">
              {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'SN'}
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
            <div className="text-base font-semibold text-[#1a1610]">Reports</div>
            <div className="text-xs text-[#9a9080]">Pipeline analytics · {new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</div>
          </div>
          <button className="px-4 py-2 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee] transition-colors">
            Export →
          </button>
        </div>

        <div className="p-6 overflow-auto">

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-2">TOTAL PIPELINE</div>
              <div className="text-2xl font-semibold text-[#1a1610]">${(totalPipeline/1000000).toFixed(0)}M</div>
              <div className="text-xs text-[#9a9080] mt-1">{leads.length} total deals</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-2">CLOSED VALUE</div>
              <div className="text-2xl font-semibold text-[#18b877]">${(closedValue/1000000).toFixed(0)}M</div>
              <div className="text-xs text-[#9a9080] mt-1">{closedDeals.length} deals closed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-2">CONVERSION RATE</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{conversionRate}%</div>
              <div className="text-xs text-[#9a9080] mt-1">Lead to close</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-2">COMMISSIONS PAID</div>
              <div className="text-2xl font-semibold text-[#c9a84c]">${(totalCommissions/1000000).toFixed(2)}M</div>
              <div className="text-xs text-[#9a9080] mt-1">To affiliates</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* Pipeline by stage */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <div className="text-sm font-semibold text-[#1a1610]">Pipeline by stage</div>
                <div className="text-xs text-[#9a9080] mt-0.5">Deal value and count per stage</div>
              </div>
              <div className="p-5">
                {stageBreakdown.filter(s => s.count > 0).map(({ stage, count, value }) => (
                  <div key={stage} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="w-24 flex-shrink-0 text-xs text-[#5a5245]">{stage}</div>
                    <div className="flex-1 bg-[#f5f3ee] rounded-lg h-6 overflow-hidden">
                      <div
                        className="h-full bg-[#c9a84c]/70 rounded-lg flex items-center px-2 transition-all"
                        style={{ width: maxValue > 0 ? `${(value/maxValue*100)}%` : '0%', minWidth: value > 0 ? '40px' : '0' }}
                      >
                        <span className="text-[9px] font-mono font-semibold text-[#6b4f0a] whitespace-nowrap">
                          ${(value/1000000).toFixed(0)}M
                        </span>
                      </div>
                    </div>
                    <div className="w-6 text-xs text-[#9a9080] font-mono text-right flex-shrink-0">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead sources */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <div className="text-sm font-semibold text-[#1a1610]">Lead sources</div>
                <div className="text-xs text-[#9a9080] mt-0.5">Affiliate vs direct breakdown</div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-center mb-6">
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg viewBox="0 0 120 120" width="120" height="120">
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#f5f3ee" strokeWidth="18"/>
                      {leads.length > 0 && (
                        <>
                          <circle
                            cx="60" cy="60" r="45"
                            fill="none"
                            stroke="#c9a84c"
                            strokeWidth="18"
                            strokeDasharray={`${(affiliateLeads.length/leads.length)*283} 283`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                          />
                          <circle
                            cx="60" cy="60" r="45"
                            fill="none"
                            stroke="#2d7dd2"
                            strokeWidth="18"
                            strokeDasharray={`${(directLeads.length/leads.length)*283} 283`}
                            strokeDashoffset={`-${(affiliateLeads.length/leads.length)*283}`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                          />
                        </>
                      )}
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                      <div className="text-xl font-bold text-[#1a1610]">{leads.length}</div>
                      <div className="text-[9px] text-[#9a9080] font-mono">total</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#c9a84c]"></div>
                        <span className="text-sm text-[#5a5245]">Affiliate</span>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1610] font-mono">{affiliateLeads.length} ({leads.length > 0 ? Math.round(affiliateLeads.length/leads.length*100) : 0}%)</span>
                    </div>
                    <div className="h-1.5 bg-[#f5f3ee] rounded-full overflow-hidden">
                      <div className="h-full bg-[#c9a84c] rounded-full" style={{ width: leads.length > 0 ? `${affiliateLeads.length/leads.length*100}%` : '0%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-sm text-[#5a5245]">Direct</span>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1610] font-mono">{directLeads.length} ({leads.length > 0 ? Math.round(directLeads.length/leads.length*100) : 0}%)</span>
                    </div>
                    <div className="h-1.5 bg-[#f5f3ee] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: leads.length > 0 ? `${directLeads.length/leads.length*100}%` : '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">

            {/* Top deals */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <div className="text-sm font-semibold text-[#1a1610]">Top deals by value</div>
              </div>
              <div className="divide-y divide-black/5">
                {topDeals.map((lead, i) => (
                  <div key={lead.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#f5f3ee] flex items-center justify-center text-xs font-mono text-[#9a9080] flex-shrink-0">
                      {i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1a1610] truncate">{lead.company_name}</div>
                      <div className="text-xs text-[#9a9080]">{lead.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold text-[#c9a84c]">${((lead.deal_size_max||0)/1000000).toFixed(0)}M</div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>{lead.stage}</span>
                    </div>
                  </div>
                ))}
                {topDeals.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-[#9a9080]">No deals yet</div>
                )}
              </div>
            </div>

            {/* Affiliate performance */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <div className="text-sm font-semibold text-[#1a1610]">Affiliate performance</div>
              </div>
              <div className="divide-y divide-black/5">
                {affiliatePerformance.map(affiliate => (
                  <div key={affiliate.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610] flex-shrink-0">
                      {affiliate.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1a1610]">{affiliate.full_name}</div>
                      <div className="text-xs text-[#9a9080]">{affiliate.totalLeads} leads · {affiliate.closedLeads} closed</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold text-[#18b877]">${(affiliate.earned/1000000).toFixed(2)}M</div>
                      <div className="text-[10px] text-[#9a9080]">earned</div>
                    </div>
                  </div>
                ))}
                {affiliatePerformance.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-[#9a9080]">No affiliates yet</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
