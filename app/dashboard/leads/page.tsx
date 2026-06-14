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

export default function AllLeadsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [selectedLead, setSelectedLead] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }
      setUser({ ...user, ...profile })
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      setLeads(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    let results = leads
    if (search) {
      results = results.filter(l =>
        l.company_name.toLowerCase().includes(search.toLowerCase()) ||
        l.sector?.toLowerCase().includes(search.toLowerCase()) ||
        l.contact_name?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (stageFilter !== 'All') {
      results = results.filter(l => l.stage === stageFilter)
    }
    if (sourceFilter !== 'All') {
      results = results.filter(l => l.source === sourceFilter)
    }
    setFiltered(results)
  }, [search, stageFilter, sourceFilter, leads])

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

  const totalValue = filtered.reduce((sum, l) => sum + (l.deal_size_max || 0), 0)

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
          <a href="/dashboard/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">All Leads</a>
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

      {/* Main */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-base font-semibold text-[#1a1610]">All Leads</div>
            <div className="text-xs text-[#9a9080]">{filtered.length} of {leads.length} leads · ${(totalValue/1000000).toFixed(0)}M filtered value</div>
          </div>
          <button
            onClick={() => router.push('/dashboard/leads/new')}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + Add Lead
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by company, sector, contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
          />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] transition-all"
          >
            <option value="All">All stages</option>
            <option>New Lead</option>
            <option>Reviewing</option>
            <option>Due Diligence</option>
            <option>Term Sheet</option>
            <option>Closed</option>
            <option>Lost</option>
          </select>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] transition-all"
          >
            <option value="All">All sources</option>
            <option value="affiliate">Affiliate</option>
            <option value="direct">Direct</option>
          </select>
          {(search || stageFilter !== 'All' || sourceFilter !== 'All') && (
            <button
              onClick={() => { setSearch(''); setStageFilter('All'); setSourceFilter('All') }}
              className="px-3 py-2 text-sm text-[#9a9080] hover:text-[#1a1610] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Table */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f5f3ee]">
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">COMPANY</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">SECTOR</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">DEAL SIZE</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">STAGE</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">SOURCE</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">CONTACT</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">COMMISSION</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-[#9a9080]">
                        No leads match your filters
                      </td>
                    </tr>
                  ) : (
                    filtered.map(lead => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                        className={`cursor-pointer transition-all ${selectedLead?.id === lead.id ? 'bg-[#faf8f3]' : 'hover:bg-[#f5f3ee]'}`}
                      >
                        <td className="px-5 py-3">
                          <div className="text-sm font-semibold text-[#1a1610]">{lead.company_name}</div>
                          <div className="text-xs text-[#9a9080]">{lead.deal_type}</div>
                        </td>
                        <td className="px-5 py-3 text-sm text-[#5a5245]">{lead.sector}</td>
                        <td className="px-5 py-3 text-sm font-mono font-semibold text-[#c9a84c]">
                          ${((lead.deal_size_max || 0)/1000000).toFixed(0)}M
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>
                            {lead.stage}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lead.source === 'affiliate' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-[#1a1610]">{lead.contact_name || '—'}</div>
                          <div className="text-xs text-[#9a9080]">{lead.contact_email || ''}</div>
                        </td>
                        <td className="px-5 py-3 text-sm font-mono text-[#18b877]">
                          ${((lead.deal_size_max || 0) * 0.02 / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-5 py-3 text-xs text-[#9a9080]">
                          {new Date(lead.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          {selectedLead && (
            <div className="w-72 bg-white border-l border-black/5 flex flex-col flex-shrink-0 overflow-y-auto shadow-xl">
              <div className="p-4 border-b border-black/5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[selectedLead.stage]}`}>
                    {selectedLead.stage}
                  </span>
                  <button onClick={() => setSelectedLead(null)} className="text-[#9a9080] hover:text-[#1a1610] text-lg leading-none">×</button>
                </div>
                <div className="text-base font-semibold text-[#1a1610] mb-1">{selectedLead.company_name}</div>
                <div className="text-xs text-[#9a9080] mb-2">{selectedLead.sector} · {selectedLead.deal_type}</div>
                <div className="text-2xl font-bold text-[#c9a84c] font-mono">
                  ${((selectedLead.deal_size_max || 0)/1000000).toFixed(0)}M
                </div>
              </div>

              <div className="p-4 border-b border-black/5">
                <div className="text-[10px] font-mono text-[#9a9080] mb-3 tracking-widest">DEAL INFO</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9a9080]">Source</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedLead.source === 'affiliate' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{selectedLead.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9a9080]">Commission</span>
                    <span className="text-[#18b877] font-semibold font-mono">${((selectedLead.deal_size_max || 0) * 0.02 / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9a9080]">Submitted</span>
                    <span className="text-[#1a1610] font-medium">{new Date(selectedLead.created_at).toLocaleDateString('en-AU')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-black/5">
                <div className="text-[10px] font-mono text-[#9a9080] mb-3 tracking-widest">CONTACT</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9a9080]">Name</span>
                    <span className="text-[#1a1610] font-medium">{selectedLead.contact_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9a9080]">Email</span>
                    <span className="text-[#1a1610] text-xs">{selectedLead.contact_email || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9a9080]">Phone</span>
                    <span className="text-[#1a1610] text-xs">{selectedLead.contact_phone || '—'}</span>
                  </div>
                  {selectedLead.website && (
                    <div className="flex justify-between">
                      <span className="text-[#9a9080]">Website</span>
                      <a href={selectedLead.website} target="_blank" className="text-[#c9a84c] text-xs hover:underline">{selectedLead.website}</a>
                    </div>
                  )}
                </div>
              </div>

              {selectedLead.description && (
                <div className="p-4 border-b border-black/5">
                  <div className="text-[10px] font-mono text-[#9a9080] mb-2 tracking-widest">DESCRIPTION</div>
                  <p className="text-sm text-[#5a5245] leading-relaxed">{selectedLead.description}</p>
                </div>
              )}

              {selectedLead.notes && (
                <div className="p-4">
                  <div className="text-[10px] font-mono text-[#9a9080] mb-2 tracking-widest">NOTES</div>
                  <p className="text-sm text-[#5a5245] leading-relaxed">{selectedLead.notes}</p>
                </div>
              )}

              <div className="p-4 mt-auto border-t border-black/5">
                <button
                  onClick={() => router.push('/dashboard/pipeline')}
                  className="w-full py-2.5 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
                >
                  View in pipeline →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
