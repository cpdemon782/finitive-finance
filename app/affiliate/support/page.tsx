'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

export default function SupportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    message: '',
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role !== 'affiliate') { router.push('/dashboard'); return }
      setUser({ ...user, ...profile })
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSend() {
    if (!form.subject || !form.message) return
    setSending(true)
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'simon@clesandco.com.au',
          subject: `Affiliate support request — ${form.subject}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
              <div style="background:#1a1610;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <div style="color:#c9a84c;font-size:20px;font-weight:700;">Finitive Finance</div>
                <div style="color:#ffffff;font-size:12px;margin-top:4px;opacity:0.6;">AFFILIATE SUPPORT REQUEST</div>
              </div>
              <div style="background:#ffffff;padding:32px;border:1px solid #e8e4db;border-top:none;">
                <p style="color:#1a1610;font-size:18px;font-weight:600;margin:0 0 16px;">Support request from ${user.full_name}</p>
                <div style="background:#f5f3ee;border-radius:8px;padding:16px;margin-bottom:16px;">
                  <p style="font-size:12px;color:#9a9080;margin:0 0 4px;">FROM</p>
                  <p style="font-size:14px;color:#1a1610;margin:0;">${user.full_name} — ${user.email}</p>
                </div>
                <div style="background:#f5f3ee;border-radius:8px;padding:16px;margin-bottom:16px;">
                  <p style="font-size:12px;color:#9a9080;margin:0 0 4px;">SUBJECT</p>
                  <p style="font-size:14px;color:#1a1610;margin:0;">${form.subject}</p>
                </div>
                <div style="background:#f5f3ee;border-radius:8px;padding:16px;">
                  <p style="font-size:12px;color:#9a9080;margin:0 0 4px;">MESSAGE</p>
                  <p style="font-size:14px;color:#1a1610;margin:0;line-height:1.6;">${form.message}</p>
                </div>
              </div>
              <div style="background:#f5f3ee;padding:16px;border-radius:0 0 12px 12px;text-align:center;border:1px solid #e8e4db;border-top:none;">
                <p style="color:#9a9080;font-size:12px;margin:0;">© 2026 Finitive Finance. All rights reserved.</p>
              </div>
            </div>
          `
        })
      })
      setSent(true)
      setForm({ subject: '', message: '' })
    } catch (e) {
      console.error('Failed to send:', e)
    }
    setSending(false)
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
          <p className="text-sm text-[#9a9080]">Loading...</p>
        </div>
      </div>
    )
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
              <div className="text-[10px] text-[#c9a84c]/60 font-mono">AFFILIATE PORTAL</div>
            </div>
          </div>
        </div>
        <nav className="p-2 flex-1">
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MY PORTAL</div>
          <a href="/affiliate/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Dashboard</a>
          <a href="/affiliate/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">My Leads</a>
          <a href="/affiliate/submit" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Submit Lead</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">FINANCIALS</div>
          <a href="/affiliate/commissions" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Commissions</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">ACCOUNT</div>
          <a href="/affiliate/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">My Profile</a>
          <a href="/affiliate/support" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Support</a>
        </nav>
        <div className="p-3 border-t border-[#c9a84c]/20">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer" onClick={handleSignOut}>
            <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610]">
              {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'MT'}
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
        <div className="bg-white border-b border-black/5 px-6 py-3">
          <div className="text-base font-semibold text-[#1a1610]">Support</div>
          <div className="text-xs text-[#9a9080]">Get help from the Finitive Finance team</div>
        </div>

        <div className="p-6 max-w-2xl">

          {/* Contact cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c9a84c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✉️</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1a1610]">Email us</div>
                <a href="mailto:affiliates@finitivefinance.app" className="text-xs text-[#c9a84c] hover:text-[#a8863a]">
                  affiliates@finitivefinance.app
                </a>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#18b877]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⏱️</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1a1610]">Response time</div>
                <div className="text-xs text-[#9a9080]">Within 1 business day</div>
              </div>
            </div>
          </div>

          {/* Message form */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-sm font-semibold text-[#1a1610]">Send a message</div>
              <div className="text-xs text-[#9a9080] mt-0.5">We'll get back to you within 1 business day</div>
            </div>
            <div className="p-5">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="text-sm font-semibold text-[#1a1610] mb-1">Message sent!</div>
                  <div className="text-xs text-[#9a9080] mb-4">We'll get back to you within 1 business day.</div>
                  <button
                    onClick={() => setSent(false)}
                    className="text-xs text-[#c9a84c] hover:text-[#a8863a]"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Subject</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Question about my commission"
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="How can we help you?"
                      rows={5}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={sending || !form.subject || !form.message}
                    className="w-full py-2.5 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] disabled:opacity-50 transition-colors"
                  >
                    {sending ? 'Sending...' : 'Send message →'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-sm font-semibold text-[#1a1610]">Frequently asked questions</div>
            </div>
            <div className="divide-y divide-black/5">
              {[
                {
                  q: 'When do I get paid my commission?',
                  a: 'Commission payments are processed within 30 days of a deal closing. You will receive an email notification when your payment is being processed.'
                },
                {
                  q: 'How is my commission calculated?',
                  a: 'Your commission is calculated as a percentage of the total closed deal value. Your individual rate is shown on your profile page and commissions page.'
                },
                {
                  q: 'Can I submit multiple leads?',
                  a: 'Yes — you can submit as many referrals as you like. Each lead is evaluated independently by the Finitive Finance team.'
                },
                {
                  q: 'How long does it take to hear back on a lead?',
                  a: 'Our team typically reviews new leads within 2–3 business days. You will receive email updates at each stage change.'
                },
                {
                  q: 'What happens if a lead doesn\'t progress?',
                  a: 'If a lead does not meet our current investment criteria, you will be notified by email with a brief explanation. No commission is payable on leads that do not close.'
                },
              ].map((faq, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="text-sm font-medium text-[#1a1610] mb-1">{faq.q}</div>
                  <div className="text-xs text-[#9a9080] leading-relaxed">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
