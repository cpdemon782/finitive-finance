'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('internal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }

    const userProfile = await getUserRole(data.user.id)

    if (!userProfile) {
      setError('Account not set up correctly. Please contact your administrator.')
      setLoading(false)
      return
    }

    if (userProfile.role === 'affiliate') {
      router.push('/affiliate')
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf9f5] via-[#f0ece0] to-[#e8e0cc]">
      <div className="w-full max-w-md px-5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1610] rounded-2xl mb-4 shadow-lg">
            <span className="text-[#c9a84c] font-bold text-xl tracking-tight">FF</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1610] tracking-tight">Finitive Finance</h1>
          <p className="text-sm text-[#9a9080] mt-1">Deal Platform</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#c9a84c]/10">
          <div className="flex bg-[#f5f3ee] rounded-lg p-1 gap-1 mb-6 border border-black/5">
            <button
              onClick={() => { setRole('internal'); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'internal'
                  ? 'bg-white text-[#1a1610] shadow-sm'
                  : 'text-[#9a9080] hover:text-[#5a5245]'
              }`}
            >
              Internal Team
            </button>
            <button
              onClick={() => { setRole('affiliate'); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'affiliate'
                  ? 'bg-white text-[#1a1610] shadow-sm'
                  : 'text-[#9a9080] hover:text-[#5a5245]'
              }`}
            >
              Affiliate Partner
            </button>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#1a1610]">
              {role === 'internal' ? 'Welcome back' : 'Affiliate sign in'}
            </h2>
            <p className="text-sm text-[#9a9080] mt-1">
              {role === 'internal'
                ? 'Sign in to the Finitive Finance deal platform'
                : 'Access your Finitive Finance partner portal'}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder={role === 'internal' ? 'you@finitivefinance.com' : 'you@yourcompany.com'}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
            />
          </div>
          <div className="text-right mb-5">
            <button className="text-xs text-[#c9a84c] hover:text-[#a8863a] transition-colors">
              Forgot password?
            </button>
          </div>
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#c9a84c] hover:bg-[#a8863a] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#c9a84c]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[#b0a898]">
            <a href="#" className="hover:text-[#c9a84c] transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-[#c9a84c] transition-colors">Terms & Conditions</a>
          </div>
        </div>
        <p className="text-center text-xs text-[#c0b8a8] mt-6">
          © 2026 Finitive Finance. All rights reserved.
        </p>
      </div>
    </div>
  )
}
