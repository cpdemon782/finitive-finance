'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
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

      if (profile.role === 'affiliate') {
        router.push('/affiliate')
      } else {
        router.push('/dashboard')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-[#9a9080]">Loading...</p>
      </div>
    </div>
  )
}
