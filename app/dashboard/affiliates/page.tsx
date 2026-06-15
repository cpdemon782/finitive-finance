'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

export default function AffiliatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null)
  const [editingRate, setEditingRate] = useState(false)
  const [newRate, setNewRate] = useState('')
  const [savingRate, setSavingRate] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }
      setUser({ ...user, ...profile })
      await fetchData()
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchData() {
    const [affiliatesRes, leadsRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'affiliate'),
      supabase.from('leads').select('*').eq('source', 'affiliate'),
    ])
    setAffiliates(affiliatesRes.data || [])
    setLeads(leadsRes.data || [])
  }

  function getAffiliateLeads(affiliateId: string) {
    return leads.filter(l => l.submitted_by === affiliateId)
  }

  function getAffiliateStats(affiliateId: string) {
    const affLeads = getAffiliateLeads(affiliateId)
    const rate = affiliates.find(a => a.id === affiliateId)?.commission_rate || 0.02
    const closed = affLeads.filter(l => l.stage === 'Closed')
    const active = affLeads.filter(l => !['Closed', 'Lost'].includes(l.stage))
    const earned = closed.reduce((sum, l) => sum + ((l.deal_size_max || 0) * rate), 0)
    const pending = active.reduce((sum, l) => sum + ((l.deal_size_max || 0) * rate), 0)
    return { total: affLeads.length, closed: closed.length, active: active.length, earned, pending }
  }

  async function saveCommissionRate() {
    if (!selectedAffiliate || !newRate) return
    setSavingRate(true)
    const rate = parseFloat(newRate) / 100
    await supabase.from('users').update({ commission_rate: rate }).eq('id', selectedAffiliate.id)
    setAffiliates(prev => prev.map(a => a.id === selectedAffiliate.id ? { ...a, commission_rate: rate } : a))
    setSelectedAffiliate((prev: any) => ({ ...prev, commission_rate: rate }))
    setEditingRate(false)
    setSavingRate(false)
  }

  async function sendInvite() {
    if (!inviteEmail || !inviteName) return
    setInviting(true)
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'simon@clesandco.com.au',
          subject: `Affiliate invitation — ${inviteName}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
              <div style="background:#1a1610;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <div style="color:#c9a84c;font-size:20px;font-weight:700;">Finitive Finance</div>
                <div style="color:#ffffff;font-size:12px;margin-top:4px;opacity:0.6;">AFFILIATE INVITATION</div>
              </div>
              <div style="background:#ffffff;padding:32px;border:1px solid #e8e4db;border-top:none;">
                <p style="color:#1a1610;font-size:18px;font-weight:600;margin:0 0 16px;">You've been invited to join Finitive Finance as an Affiliate Partner</p>
                <p style="color:#5a5245;font-size:14px;line-height:1.6;margin:0 0 24px;">Hi ${inviteName}, you have been invited by the Finitive Finance team to join our affiliate partner program. As an affiliate partner you can submit referrals and earn 2% of the total closed deal value.</p>
                <div style="text-align:center;margin-bottom:24px;">
                  <a href="https://finitive-finance.vercel.app/login"
                     style="display:inline-block;background:#c9a84c;color:#fff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                    Accept invitation →
                  </a>
                </div>
                <p style="color:#9a9080;font-size:13px;">Questions? Contact us at <a href="mailto:affiliates@finitivefinance.com.au" style="color:#c9a84c;">affiliates@finitivefinance.com.au</a></p>
              </div>
              <div style="background:#f5f3ee;padding:16px;border-radius:0 0 12px 12px;text-align:center;border:1px solid #e8e4db;border-top:none;">
                <p style="color:#9a9080;font-size:12px;margin:0;">© 2026 Finitive Finance. All rights reserved.</p>
              </div>
            </div>
          `
        })
      })
      setInviteSuccess(true)
      setInviteEmail('')
      setInviteName('')
    } catch (e) {
      console.error('Invite failed:', e)
    }
    setInviting(false)
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
          <p className="text-sm text-[#9a9080]">Loading affiliates...</p>
        </div>
      </div>
    )
  }

  const totalLeads = leads.length
  const totalEarned = affiliates.reduce((sum, a) => {
    const stats = getAffiliateStats(a.id)
    return sum + stats.earned
  }, 0)

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
          <a href="/dashboard/affiliates" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Affiliates</a>
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
            <div className="text-base font-semibold text-[#1a1610]">Affiliates</div>
            <div className="text-xs text-[#9a9080]">{affiliates.length} partners · {totalLeads} leads submitted</div>
          </div>
          <button
            onClick={() => { setShowInvite(true); setInviteSuccess(false) }}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + Invite Affiliate
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Affiliate list */}
          <div className="flex-1 overflow-auto p-4">

            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                <div className="text-[10px] font-mono text-[#9a9080] mb-1">TOTAL PARTNERS</div>
                <div className="text-2xl font-semibold text-[#1a1610]">{affiliates.length}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                <div className="text-[10px] font-mono text-[#9a9080] mb-1">LEADS SUBMITTED</div>
                <div className="text-2xl font-semibold text-[#1a1610]">{totalLeads}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                <div className="text-[10px] font-mono text-[#9a9080] mb-1">COMMISSIONS PAID</div>
                <div className="text-2xl font-semibold text-[#18b877]">${(totalEarned/1000000).toFixed(2)}M</div>
              </div>
            </div>

            {/* Affiliate cards */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-black/5 bg-[#f5f3ee]">
                <div className="grid grid-cols-6 gap-4 text-[10px] font-mono text-[#9a9080]">
                  <div className="col-span-2">AFFILIATE</div>
                  <div>LEADS</div>
                  <div>COMMISSION RATE</div>
                  <div>EARNED</div>
                  <div>PENDING</div>
                </div>
              </div>
              {affiliates.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[#9a9080]">
                  No affiliates yet — invite your first partner
                </div>
              ) : (
                affiliates.map(affiliate => {
                  const stats = getAffiliateStats(affiliate.id)
                  const isSelected = selectedAffiliate?.id === affiliate.id
                  return (
                    <div
                      key={affiliate.id}
                      onClick={() => {
                        setSelectedAffiliate(isSelected ? null : affiliate)
                        setEditingRate(false)
                        setNewRate(((affiliate.commission_rate || 0.02) * 100).toString())
                      }}
                      className={`px-5 py-4 border-b border-black/5 last:border-0 cursor-pointer transition-all ${isSelected ? 'bg-[#faf8f3]' : 'hover:bg-[#f5f3ee]'}`}
                    >
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-sm font-bold text-[#1a1610] flex-shrink-0">
                            {affiliate.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1a1610]">{affiliate.full_name}</div>
                            <div className="text-xs text-[#9a9080]">{affiliate.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-[#1a1610] font-medium">{stats.total}</div>
                        <div>
                          <span className="text-sm font-mono font-semibold text-[#c9a84c]">
                            {((affiliate.commission_rate || 0.02) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm font-mono text-[#18b877] font-semibold">
                          ${(stats.earned/1000000).toFixed(2)}M
                        </div>
                        <div className="text-sm font-mono text-[#c9a84c]">
                          ${(stats.pending/1000000).toFixed(2)}M
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selectedAffiliate && (
            <div className="w-72 bg-white border-l border-black/5 flex flex-col flex-shrink-0 overflow-y-auto shadow-xl">
              <div className="p-4 border-b border-black/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#c9a84c] flex items-center justify-center text-lg font-bold text-[#1a1610]">
                    {selectedAffiliate.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <button onClick={() => setSelectedAffiliate(null)} className="text-[#9a9080] hover:text-[#1a1610] text-lg">×</button>
                </div>
                <div className="text-base font-semibold text-[#1a1610]">{selectedAffiliate.full_name}</div>
                <div className="text-xs text-[#9a9080] mt-0.5">{selectedAffiliate.email}</div>
              </div>

              {/* Stats */}
              <div className="p-4 border-b border-black/5">
                <div className="text-[10px] font-mono text-[#9a9080] mb-3 tracking-widest">PERFORMANCE</div>
                {(() => {
                  const stats = getAffiliateStats(selectedAffiliate.id)
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#9a9080]">Total leads</span>
                        <span className="text-[#1a1610] font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9080]">Active</span>
                        <span className="text-[#1a1610] font-medium">{stats.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9080]">Closed</span>
                        <span className="text-[#1a1610] font-medium">{stats.closed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9080]">Total earned</span>
                        <span className="text-[#18b877] font-semibold font-mono">${(stats.earned/1000000).toFixed(2)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9080]">Pending</span>
                        <span className="text-[#c9a84c] font-semibold font-mono">${(stats.pending/1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Commission rate */}
              <div className="p-4 border-b border-black/5">
                <div className="text-[10px] font-mono text-[#9a9080] mb-3 tracking-widest">COMMISSION RATE</div>
                {editingRate ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newRate}
                        onChange={e => setNewRate(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#c9a84c] bg-white text-[#1a1610] focus:outline-none font-mono"
                        autoFocus
                      />
                      <span className="text-sm text-[#5a5245] font-mono">%</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRate(false)}
                        className="flex-1 py-1.5 text-xs border border-black/10 rounded-lg text-[#5a5245] hover:bg-[#f5f3ee]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveCommissionRate}
                        disabled={savingRate}
                        className="flex-1 py-1.5 text-xs bg-[#c9a84c] text-white rounded-lg hover:bg-[#a8863a] disabled:opacity-50"
                      >
                        {savingRate ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono text-[#c9a84c]">
                      {((selectedAffiliate.commission_rate || 0.02) * 100).toFixed(1)}%
                    </span>
                    <button
                      onClick={() => setEditingRate(true)}
                      className="text-xs text-[#c9a84c] hover:text-[#a8863a] border border-[#c9a84c]/30 px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/5"
                    >
                      Edit rate
                    </button>
                  </div>
                )}
              </div>

              {/* Their leads */}
              <div className="p-4">
                <div className="text-[10px] font-mono text-[#9a9080] mb-3 tracking-widest">THEIR LEADS</div>
                {getAffiliateLeads(selectedAffiliate.id).length === 0 ? (
                  <div className="text-xs text-[#9a9080]">No leads submitted yet</div>
                ) : (
                  <div className="space-y-2">
                    {getAffiliateLeads(selectedAffiliate.id).map(lead => (
                      <div key={lead.id} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                        <div>
                          <div className="text-xs font-medium text-[#1a1610]">{lead.company_name}</div>
                          <div className="text-[10px] text-[#9a9080]">${((lead.deal_size_max||0)/1000000).toFixed(0)}M</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          lead.stage === 'Closed' ? 'bg-emerald-100 text-emerald-700' :
                          lead.stage === 'Lost' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{lead.stage}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invite panel */}
          {showInvite && (
            <div className="w-72 bg-white border-l border-black/5 flex flex-col flex-shrink-0 shadow-xl">
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#1a1610]">Invite Affiliate</div>
                <button onClick={() => { setShowInvite(false); setInviteSuccess(false) }} className="text-[#9a9080] hover:text-[#1a1610] text-lg">×</button>
              </div>
              <div className="p-4">
                {inviteSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">✓</div>
                    <div className="text-sm font-semibold text-[#1a1610] mb-2">Invitation sent!</div>
                    <div className="text-xs text-[#9a9080] mb-4">An invitation email has been sent to {inviteEmail}</div>
                    <button
                      onClick={() => { setInviteSuccess(false); setInviteEmail(''); setInviteName('') }}
                      className="text-xs text-[#c9a84c] hover:text-[#a8863a]"
                    >
                      Send another invite
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-xs text-[#9a9080] leading-relaxed mb-2">
                      Enter the affiliate's details below. They will receive an email invitation to join the Finitive Finance partner portal.
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Full name *</label>
                      <input
                        type="text"
                        value={inviteName}
                        onChange={e => setInviteName(e.target.value)}
                        placeholder="e.g. Rachel Lee"
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Email address *</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="rachel@leeadvisors.com"
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="bg-[#f5f3ee] rounded-lg p-3 text-xs text-[#5a5245] leading-relaxed">
                      <strong className="text-[#1a1610]">Note:</strong> After sending the invite, you'll need to manually create their account in Supabase Auth and add them to the users table with role <span className="font-mono bg-white px-1 rounded">affiliate</span>.
                    </div>
                    <button
                      onClick={sendInvite}
                      disabled={inviting || !inviteEmail || !inviteName}
                      className="w-full py-2.5 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] disabled:opacity-50 transition-colors"
                    >
                      {inviting ? 'Sending...' : 'Send invitation →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
