'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

export default function TeamPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
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
      const [teamRes, leadsRes] = await Promise.all([
        supabase.from('users').select('*').in('role', ['internal', 'admin']),
        supabase.from('leads').select('*').not('stage', 'in', '("Closed","Lost")'),
      ])
      setTeam(teamRes.data || [])
      setLeads(leadsRes.data || [])
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
          <p className="text-sm text-[#9a9080]">Loading team...</p>
        </div>
      </div>
    )
  }

  const avatarColors = ['#c9a84c', '#2d7dd2', '#18b877', '#7c6af7', '#e09600', '#e03e3e']

  function getMemberLeads(memberId: string) {
    return leads.filter(l => l.assigned_to === memberId)
  }

  function getInitials(name: string) {
    return name?.split(' ').map((n: string) => n[0]).join('') || '?'
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
          <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Dashboard</a>
          <a href="/dashboard/pipeline" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Pipeline</a>
          <a href="/dashboard/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">All Leads</a>
          <a href="/dashboard/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Tasks</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">MANAGEMENT</div>
          <a href="/dashboard/affiliates" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Affiliates</a>
          <a href="/dashboard/team" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Team</a>
          <a href="/dashboard/reports" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Reports</a>
        </nav>
        <div className="p-3 border-t border-[#c9a84c]/20">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer" onClick={handleSignOut}>
            <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610]">
              {getInitials(user?.full_name)}
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
            <div className="text-base font-semibold text-[#1a1610]">Team</div>
            <div className="text-xs text-[#9a9080]">{team.length} members · Finitive Finance</div>
          </div>
        </div>

        <div className="p-6">

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">TEAM MEMBERS</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{team.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">ACTIVE DEALS</div>
              <div className="text-2xl font-semibold text-[#1a1610]">{leads.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">AVG DEALS / MEMBER</div>
              <div className="text-2xl font-semibold text-[#1a1610]">
                {team.length > 0 ? (leads.length / team.length).toFixed(1) : '0'}
              </div>
            </div>
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-2 gap-4">
            {team.map((member, i) => {
              const memberLeads = getMemberLeads(member.id)
              const capacity = Math.min(Math.round((memberLeads.length / 8) * 100), 100)
              const color = avatarColors[i % avatarColors.length]
              return (
                <div key={member.id} className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: color }}
                    >
                      {getInitials(member.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1a1610]">{member.full_name}</div>
                      <div className="text-xs text-[#9a9080] mt-0.5 capitalize">{member.role}</div>
                      <div className="text-xs text-[#9a9080] mt-0.5">{member.email}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-[#1a1610]">{memberLeads.length}</div>
                      <div className="text-[10px] text-[#9a9080]">active deals</div>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-[#9a9080]">CAPACITY</span>
                      <span className="text-[10px] font-mono text-[#9a9080]">{capacity}%</span>
                    </div>
                    <div className="h-1.5 bg-[#f5f3ee] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${capacity}%`,
                          background: capacity > 80 ? '#e03e3e' : capacity > 60 ? '#c9a84c' : '#18b877'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Their deals */}
                  {memberLeads.length > 0 && (
                    <div className="space-y-1.5">
                      {memberLeads.slice(0, 3).map(lead => (
                        <div key={lead.id} className="flex items-center justify-between py-1 px-2.5 bg-[#f5f3ee] rounded-lg">
                          <span className="text-xs text-[#1a1610] font-medium truncate">{lead.company_name}</span>
                          <span className="text-[10px] text-[#9a9080] font-mono ml-2 flex-shrink-0">${((lead.deal_size_max||0)/1000000).toFixed(0)}M</span>
                        </div>
                      ))}
                      {memberLeads.length > 3 && (
                        <div className="text-[10px] text-[#9a9080] text-center pt-1">
                          +{memberLeads.length - 3} more deals
                        </div>
                      )}
                    </div>
                  )}

                  {memberLeads.length === 0 && (
                    <div className="text-xs text-[#9a9080] text-center py-2">No active deals</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
