'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole } from '../../lib/supabase'

export default function AffiliatePage() {
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role !== 'affiliate') { router.push('/dashboard'); return }
      router.push('/affiliate/dashboard')
    }
    check()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-[#9a9080]">Loading...</p>
      </div>
    </div>
  )
}
