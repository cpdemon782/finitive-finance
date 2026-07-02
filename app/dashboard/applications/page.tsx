'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

export default function ApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }
      setUser({ ...user, ...profile })
      await fetchApplications()
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchApplications() {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    setApplications(data || [])
  }

  async function handleApprove(app: any) {
    setApproving(app.id)
    try {
      const res = await fetch(`/api/approve-affiliate?id=${app.id}`)
      if (res.ok) {
        await fetchApplications()
      }
    } catch (e) {
      console.error('Approval failed:', e)
    }
    setApproving(null)
  }

  async function handleReject(appId: string) {
    setRejecting(appId)
    await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', appId)
    await fetchApplications()
    setRejecting(null)
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
          <p className="text-sm text-[#9a9080]">Loading applications...</p>
        </div>
      </div>
    )
  }

  const filtered = applications.filter(a => filter === 'all' ? true : a.status === filter)
  const pendingCount = applications.filter(a => a.status === 'pending').length

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
          <a href="/dashboard/applications" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">
            Applications
            {pendingCount > 0 && (
              <span className="ml-auto bg-[#c9a84c] text-[#1a1610] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </a>
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
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">Affiliate Applications</div>
            <div className="text-xs text-[#9a9080]">{applications.length} total · {pendingCount} pending review</div>
          </div>
          
            href="/apply"
            target="_blank"
            className="px-4 py-2 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee] transition-colors"
          >
            View apply page →
          </a>
        </div>

        <div className="p-6">

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">PENDING</div>
              <div className="text-2xl font-semibold text-[#c9a84c]">{applications.filter(a => a.status === 'pending').length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">APPROVED</div>
              <div className="text-2xl font-semibold text-[#18b877]">{applications.filter(a => a.status === 'approved').length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="text-[10px] font-mono text-[#9a9080] mb-1">REJECTED</div>
              <div className="text-2xl font-semibold text-[#9a9080]">{applications.filter(a => a.status === 'rejected').length}</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-white rounded-xl border border-black/5 shadow-sm p-1 gap-1 mb-4 w-fit">
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-[#c9a84c] text-white' : 'text-[#9a9080] hover:text-[#1a1610]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Applications list */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#9a9080]">
                No {filter} applications
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map(app => (
                  <div key={app.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center text-sm font-bold text-[#1a1610] flex-shrink-0">
                        {app.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#1a1610]">{app.full_name}</div>
                            <div className="text-xs text-[#9a9080]">{app.company_name} · {app.email}</div>
                            {app.phone && <div className="text-xs text-[#9a9080]">{app.phone}</div>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {app.status}
                            </span>
                            <span className="text-[10px] text-[#9a9080]">
                              {new Date(app.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        {app.how_heard && (
                          <div className="text-xs text-[#9a9080] mt-1">
                            <span className="font-medium">How heard:</span> {app.how_heard}
                          </div>
                        )}
                        {app.bio && (
                          <div className="mt-2 p-3 bg-[#f5f3ee] rounded-lg text-xs text-[#5a5245] leading-relaxed">
                            {app.bio}
                          </div>
                        )}
                        {app.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={approving === app.id}
                              className="px-4 py-1.5 bg-[#18b877] text-white text-xs font-medium rounded-lg hover:bg-[#14a368] disabled:opacity-50 transition-colors"
                            >
                              {approving === app.id ? 'Approving...' : '✓ Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              disabled={rejecting === app.id}
                              className="px-4 py-1.5 bg-[#f5f3ee] text-[#5a5245] text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                            >
                              {rejecting === app.id ? 'Rejecting...' : '✕ Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
