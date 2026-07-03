'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole } from '../../../lib/supabase'
import Sidebar from '../../components/Sidebar'

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

      <Sidebar user={user} portal="internal" activePage="team" />

      <div className="ml-52 flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">Team</div>
            <div className="text-xs text-[#9a9080]">{team.length} members · Finitive Finance</div>
          </div>
        </div>

        <div className="p-6">

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
