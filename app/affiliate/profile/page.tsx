'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role !== 'affiliate') { router.push('/dashboard'); return }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({ ...user, ...data })
      setForm({
        full_name: data?.full_name || '',
        email: data?.email || user.email || '',
        phone: data?.phone || '',
        company_name: data?.company_name || '',
      })
      setLoading(false)
    }
    init()
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('users')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        company_name: form.company_name,
      })
      .eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
          <p className="text-sm text-[#9a9080]">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">

      {/* Sidebar */}
      <Sidebar user={user} portal="affiliate" activePage="profile" />

      {/* Main */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">My Profile</div>
            <div className="text-xs text-[#9a9080]">Manage your account details</div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-[#18b877] font-medium">✓ Changes saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <div className="p-6 max-w-2xl">

          {/* Avatar */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5 mb-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8863a] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </div>
            <div>
              <div className="text-base font-semibold text-[#1a1610]">{user?.full_name}</div>
              <div className="text-sm text-[#9a9080]">{user?.email}</div>
              <div className="text-xs text-[#c9a84c] mt-1 font-medium">Affiliate Partner</div>
            </div>
          </div>

          {/* Personal details */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-sm font-semibold text-[#1a1610]">Personal details</div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Full name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Email address</label>
                <input
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#9a9080] cursor-not-allowed"
                />
                <p className="text-[10px] text-[#9a9080] mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Phone number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+61..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Company name</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="Your company..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Commission info */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-sm font-semibold text-[#1a1610]">Commission details</div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between py-2 border-b border-black/5">
                <span className="text-sm text-[#9a9080]">Commission rate</span>
                <span className="text-sm font-semibold text-[#c9a84c] font-mono">
                  {((user?.commission_rate || 0.02) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-black/5">
                <span className="text-sm text-[#9a9080]">Payment method</span>
                <span className="text-sm font-medium text-[#1a1610]">Bank transfer</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#9a9080]">Member since</span>
                <span className="text-sm font-medium text-[#1a1610]">
                  {new Date(user?.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-[#9a9080] mt-3">To update your commission rate or payment details, contact <a href="mailto:affiliates@finitivefinance.app" className="text-[#c9a84c]">affiliates@finitivefinance.app</a></p>
            </div>
          </div>

          {/* Legal links */}
          <div className="flex gap-4 text-xs text-[#9a9080]">
            <a href="/privacy" className="hover:text-[#c9a84c]">Privacy Policy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-[#c9a84c]">Terms & Conditions</a>
          </div>

        </div>
      </div>
    </div>
  )
}
