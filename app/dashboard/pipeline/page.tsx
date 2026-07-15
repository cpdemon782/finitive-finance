'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'
import { stageChangeEmail } from '../../../lib/emails'

const STAGES = ['New Lead', 'Progress', 'Outcome', 'Settlement Date', 'Cancelled/Pipeline']

const stageColors: Record<string, string> = {
  'New Lead': 'bg-blue-100 text-blue-700',
  'Progress': 'bg-amber-100 text-amber-700',
  'Outcome': 'bg-purple-100 text-purple-700',
  'Settlement Date': 'bg-green-100 text-green-700',
  'Cancelled/Pipeline': 'bg-red-100 text-red-700',
}

const stageDotColors: Record<string, string> = {
  'New Lead': 'bg-blue-400',
  'Progress': 'bg-amber-400',
  'Outcome': 'bg-purple-400',
  'Settlement Date': 'bg-green-400',
  'Cancelled/Pipeline': 'bg-red-400',
}

export default function PipelinePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'board' | 'table'>('board')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [movingStage, setMovingStage] = useState(false)
  const [emailStatus, setEmailStatus] = useState<string>('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }
      setUser({ ...user, ...profile })
      await fetchLeads()
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
  }

  async function moveStage(leadId: string, newStage: string) {
    setMovingStage(true)
    setEmailStatus('')

    const lead = leads.find(l => l.id === leadId)

    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (!error) {
      await fetchLeads()
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev: any) => ({ ...prev, stage: newStage }))
      }

      // Send email if affiliate lead
      if (lead && lead.source === 'affiliate' && lead.submitted_by) {
        try {
          const { data: affiliateData } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', lead.submitted_by)
            .single()

          if (affiliateData) {
            
const { subject, html } = stageChangeEmail({
  affiliateName: affiliateData.full_name,
  companyName: lead.company_name,
  newStage,
  dealSizeMax: lead.deal_size_max || 0,
  commissionRate: 0.02,
})

const res = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: affiliateData.email,
    subject,
    html,
  })
})

            if (res.ok) {
              setEmailStatus('✓ Affiliate notified by email')
            } else {
              setEmailStatus('Stage updated — email notification failed')
            }
          }
        } catch (emailError) {
          console.error('Email failed:', emailError)
          setEmailStatus('Stage updated — email notification failed')
        }
      }
    }
    setMovingStage(false)

    // Clear email status after 4 seconds
    setTimeout(() => setEmailStatus(''), 4000)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#9a9080]">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">

      {/* Sidebar */}
     <Sidebar user={user} portal="internal" activePage="pipeline" />

      {/* Main */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Topbar */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1">
            <div className="text-base font-semibold text-[#1a1610]">Deal Pipeline</div>
            <div className="text-xs text-[#9a9080]">{leads.filter(l => !['Closed','Lost'].includes(l.stage)).length} active deals</div>
          </div>
          {emailStatus && (
            <div className="text-xs font-medium text-[#18b877] bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              {emailStatus}
            </div>
          )}
          <div className="flex bg-[#f5f3ee] rounded-lg p-1 gap-1 border border-black/5">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'board' ? 'bg-white text-[#1a1610] shadow-sm' : 'text-[#9a9080]'}`}
            >
              Board
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'table' ? 'bg-white text-[#1a1610] shadow-sm' : 'text-[#9a9080]'}`}
            >
              Table
            </button>
          </div>
          <button
            onClick={() => router.push('/dashboard/leads/new')}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + Add Lead
          </button>
        </div>

        {/* Board view */}
        {view === 'board' && (
          <div className="flex gap-3 p-4 overflow-x-auto flex-1">
            {STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage)
              return (
                <div key={stage} className="w-52 flex-shrink-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-1 pb-2">
                    <div className={`w-2 h-2 rounded-full ${stageDotColors[stage]}`}></div>
                    <span className="text-xs font-semibold text-[#5a5245]">{stage}</span>
                    <span className="ml-auto text-xs text-[#9a9080] font-mono bg-white px-2 py-0.5 rounded-full border border-black/5">{stageLeads.length}</span>
                  </div>
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`bg-white rounded-xl p-3 border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${selectedLead?.id === lead.id ? 'border-[#c9a84c] shadow-md' : 'border-black/5 shadow-sm'}`}
                    >
                      <div className="text-sm font-semibold text-[#1a1610] mb-1">{lead.company_name}</div>
                      <div className="text-xs text-[#9a9080] mb-2">{lead.sector}</div>
                      <div className="text-sm font-semibold text-[#c9a84c] font-mono mb-2">
                        ${((lead.deal_size_max || 0) / 1000000).toFixed(0)}M
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lead.source === 'affiliate' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {lead.source}
                        </span>
                        <span className="text-[10px] text-[#9a9080]">
                          {new Date(lead.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed border-black/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-[#9a9080]">No deals</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Table view */}
        {view === 'table' && (
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
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">COMMISSION</th>
                    <th className="text-left text-[10px] font-mono text-[#9a9080] px-5 py-3">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {leads.map(lead => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-[#f5f3ee] cursor-pointer"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-[#1a1610]">{lead.company_name}</td>
                      <td className="px-5 py-3 text-sm text-[#5a5245]">{lead.sector}</td>
                      <td className="px-5 py-3 text-sm font-mono font-semibold text-[#c9a84c]">${((lead.deal_size_max || 0)/1000000).toFixed(0)}M</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>{lead.stage}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lead.source === 'affiliate' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{lead.source}</span>
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-[#18b877]">${((lead.deal_size_max || 0) * 0.02 / 1000000).toFixed(1)}M</td>
                      <td className="px-5 py-3 text-xs text-[#9a9080]">{new Date(lead.created_at).toLocaleDateString('en-AU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedLead && (
        <div className="w-72 bg-white border-l border-black/5 flex flex-col flex-shrink-0 fixed right-0 h-full overflow-y-auto shadow-xl">
          <div className="p-4 border-b border-black/5">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[selectedLead.stage]}`}>
                {selectedLead.stage}
              </span>
              <button onClick={() => setSelectedLead(null)} className="text-[#9a9080] hover:text-[#1a1610] text-lg leading-none">×</button>
            </div>
            <div className="text-base font-semibold text-[#1a1610] mb-1">{selectedLead.company_name}</div>
            <div className="text-xs text-[#9a9080] mb-3">{selectedLead.sector}</div>
            <div className="text-2xl font-bold text-[#c9a84c] font-mono mb-4">
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
                <span className="text-[#9a9080]">Deal type</span>
                <span className="text-[#1a1610] font-medium">{selectedLead.deal_type || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a9080]">Commission (2%)</span>
                <span className="text-[#18b877] font-semibold font-mono">${((selectedLead.deal_size_max || 0) * 0.02 / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a9080]">Contact</span>
                <span className="text-[#1a1610] font-medium">{selectedLead.contact_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a9080]">Email</span>
                <span className="text-[#1a1610] text-xs">{selectedLead.contact_email || '—'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-black/5">
            <div className="text-[10px] font-mono text-[#9a9080] mb-3 tracking-widest">
              MOVE STAGE
              {selectedLead.source === 'affiliate' && (
                <span className="ml-2 text-[#18b877] normal-case">· affiliate will be emailed</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {STAGES.map(stage => (
                <button
                  key={stage}
                  disabled={stage === selectedLead.stage || movingStage}
                  onClick={() => moveStage(selectedLead.id, stage)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-all ${
                    stage === selectedLead.stage
                      ? 'bg-[#c9a84c] text-white cursor-default'
                      : 'bg-[#f5f3ee] text-[#5a5245] hover:bg-[#e8e4db] cursor-pointer disabled:opacity-50'
                  }`}
                >
                  {stage === selectedLead.stage ? '✓ ' : ''}{stage}
                </button>
              ))}
            </div>
          </div>

          {selectedLead.description && (
  <div className="p-4">
    <div className="text-[10px] font-mono text-[#9a9080] mb-2 tracking-widest">NOTES</div>
    <p className="text-sm text-[#5a5245] leading-relaxed">{selectedLead.description}</p>
  </div>
)}

{/* Delete lead */}
<div className="p-4 border-t border-black/5">
  <button
    onClick={async () => {
      if (!confirm(`Delete ${selectedLead.company_name}? This cannot be undone.`)) return
      await supabase.from('leads').delete().eq('id', selectedLead.id)
      setSelectedLead(null)
      await fetchLeads()
    }}
    className="w-full py-2 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
  >
    Delete lead
  </button>
</div>
        </div>
      )}
    </div>
  )
}
