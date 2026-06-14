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
          <a href="/affiliate/submit"
