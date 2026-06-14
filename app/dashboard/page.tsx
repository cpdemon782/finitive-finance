'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../lib/supabase'

export default function DashboardPage() {
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
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }

      setUser({ ...user, ...profile })

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
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
          <p className="text-sm text-[#9a9080]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalPipeline = leads.reduce((sum, l) => sum + (l.deal_size_max || 0), 0)
  const activeLeads = leads.filter(l => !['Closed','Lost'].includes(l.stage)).length
  const affiliateLeads = leads.filter(l => l.source === 'affiliate').length
  const closedLeads = leads.filter(l => l.stage === 'Closed').length

  const stageOrder = ['New Lead', 'Reviewing', 'Due Diligence', 'Term Sheet', 'Closed', 'Lost']
  const stageColors: Record<string, string> = {
    'New Lead': 'bg-blue-100 text-blue-700',
    'Reviewing': 'bg-amber-100 text-amber-700',
    'Due Diligence': 'bg-purple-100 text-purple-700',
    'Term Sheet': 'bg-green-100 text-green-700',
    'Closed': 'bg-emerald-100 text-emerald-700',
    'Lost': 'bg-red-100 text-red-700',
  }

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
          <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Dashboard</a>
          <a href="/dashboard/pipeline" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Pipeline</a>
          <a href="/dashboard/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">All Leads</a>
          <a href="/dashboard/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Tasks</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">MANAGEMENT</div>
          <a href="/dashboard/affiliates" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Affiliates</a>
          <a href="/dashboard/team" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Team</a>
          <a href="/dashboard/reports" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Reports</a>
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

      {/* Main content */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">Good morning, {user?.full_name?.split(' ')[0]}</div>
            <div className="text-xs text-[#9a9080]">{new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Finitive Finance</div>
          </div>
          <button
            onClick={() => router.push('/dashboard/leads/new')}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + New Lead
          </button>
        </div>

        <div className="p-6">

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">TOTAL PIPELINE</div>
              <div className="text-2xl font-semibold text-[#1a1610]">${(totalPipeline / 1000000).toFixed(0)}M</div>
              <div className="text-xs text-[#18b877] mt-1">{leads.length} total deals</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">ACTIVE LEADS</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{activeLeads}</div>
              <div className="text-xs text-[#9a9080] mt-1">In pipeline</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">AFFILIATE LEADS</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{affiliateLeads}</div>
              <div className="text-xs text-[#9a9080] mt-1">{leads.length > 0 ? Math.round(affiliateLeads/leads.length*100) : 0}% of pipeline</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-xs text-[#9a9080] font-mono mb-2">DEALS CLOSED</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{closedLeads}</div>
              <div className="text-xs text-[#9a9080] mt-1">This period</div>
            </div>
          </div>

          {/* Pipeline by stage */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#1a1610]">Pipeline by stage</div>
                <a href="/dashboard/pipeline" className="text-xs text-[#c9a84c] hover:text-[#a8863a]">Full pipeline →</a>
              </div>
              <div className="p-5">
                {['New Lead','Reviewing','Due Diligence','Term Sheet','Closed'].map(stage => {
                  const stageLeads = leads.filter(l => l.stage === stage)
                  const stageValue = stageLeads.reduce((sum, l) => sum + (l.deal_size_max || 0), 0)
                  const maxValue = Math.max(...['New Lead','Reviewing','Due Diligence','Term Sheet','Closed'].map(s =>
                    leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.deal_size_max || 0), 0)
                  ))
                  const pct = maxValue > 0 ? (stageValue / maxValue * 100) : 0
                  return (
                    <div key={stage} className="flex items-center gap-3 mb-3">
                      <div className="text-xs text-[#5a5245] w-24 flex-shrink-0">{stage}</div>
                      <div className="flex-1 bg-[#f5f3ee] rounded h-5 overflow-hidden">
                        <div
                          className="h-full bg-[#c9a84c]/70 rounded flex items-center px-2 text-[9px] font-mono font-semibold text-[#6b4f0a] transition-all"
                          style={{ width: `${pct}%`, minWidth: stageValue > 0 ? '40px' : '0' }}
                        >
                          {stageValue > 0 ? `$${(stageValue/1000000).toFixed(0)}M` : ''}
                        </div>
                      </div>
                      <div className="text-xs text-[#9a9080] font-mono w-8 text-right">{stageLeads.length}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <div className="text-sm font-semibold text-[#1a1610]">Recent leads</div>
              </div>
              <div className="divide-y divide-black/5">
                {leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="px-5 py-3 hover:bg-[#f5f3ee] cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[#1a1610]">{lead.company_name}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.stage}
                      </span>
                    </div>
                    <div className="text-xs text-[#9a9080] mt-0.5">{lead.sector} · ${((lead.deal_size_max || 0)/1000000).toFixed(0)}M</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent leads table */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
              <div className="text-sm font-semibold text-[#1a1610]">All leads</div>
              <a href="/dashboard/leads" className="text-xs text-[#c9a84c] hover:text-[#a8863a]">View all →</a>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f3ee]">
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-2">COMPANY</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-2">SECTOR</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-2">DEAL SIZE</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-2">STAGE</th>
                  <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-2">SOURCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#f5f3ee] cursor-pointer">
                    <td className="px-5 py-3 text-sm font-medium text-[#1a1610]">{lead.company_name}</td>
                    <td className="px-5 py-3 text-sm text-[#5a5245]">{lead.sector}</td>
                    <td className="px-5 py-3 text-sm font-mono text-[#c9a84c] font-semibold">${((lead.deal_size_max || 0)/1000000).toFixed(0)}M</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lead.source === 'affiliate' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {lead.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
