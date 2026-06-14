'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../lib/supabase'

export default function AffiliatePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const profile = await getUserRole(user.id)

      if (!profile) {
        router.push('/login')
        return
      }

      if (profile.role === 'internal' || profile.role === 'admin') {
        router.push('/dashboard')
        return
      }

      setUser({ ...user, ...profile })
      setLoading(false)
    }

    checkAuth()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#9a9080]">Loading portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#18b877]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#1a1610] mb-2">
          Welcome, {user?.full_name || user?.email}
        </h1>
        <p className="text-sm text-[#9a9080] mb-2">
          Role: <span className="font-medium text-[#18b877] capitalize">{user?.role}</span>
        </p>
        <p className="text-sm text-[#9a9080] mb-8">
          Authentication working ✓ — Affiliate portal coming next
        </p>
        <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-left mb-6">
          <p className="text-xs font-medium text-[#9a9080] font-mono mb-3">SESSION INFO</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9a9080]">Email</span>
              <span className="text-[#1a1610] font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9a9080]">Role</span>
              <span className="text-[#1a1610] font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9a9080]">Name</span>
              <span className="text-[#1a1610] font-medium">{user?.full_name || '—'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-6 py-2.5 bg-[#1a1610] text-white text-sm font-medium rounded-lg hover:bg-[#2a2418] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
