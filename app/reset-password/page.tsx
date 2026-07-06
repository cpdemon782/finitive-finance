'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the token in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (!password || !confirm) {
      setError('Please fill in both fields.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/affiliate/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf9f5] via-[#f0ece0] to-[#e8e0cc]">
      <div className="w-full max-w-md px-5">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Finitive Finance"
            style={{ height: '80px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
          />
          <h1 className="text-2xl font-semibold text-[#1a1610] tracking-tight mt-4">Set your password</h1>
          <p className="text-sm text-[#9a9080] mt-1">Choose a secure password for your partner account</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#c9a84c]/10">
          {!ready ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#9a9080]">Verifying your link...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                />
              </div>
              {error && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                  {error}
                </div>
              )}
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-3 bg-[#c9a84c] hover:bg-[#a8863a] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#c9a84c]/20 transition-all disabled:opacity-60"
              >
                {loading ? 'Setting password...' : 'Set password & log in →'}
              </button>
            </>
          )}
        </div>
        <p className="text-center text-xs text-[#c0b8a8] mt-6">© 2026 Finitive Finance. All rights reserved.</p>
      </div>
    </div>
  )
}
