'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

export default function SubmitLeadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    company_name: '',
    sector: '',
    deal_type: '',
    deal_size_min: '',
    deal_size_max: '',
    website: '',
    description: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit() {
    if (!form.company_name || !form.sector || !form.contact_name || !form.contact_email) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        company_name: form.company_name,
        sector: form.sector,
        deal_type: form.deal_type,
        deal_size_min: form.deal_size_min ? parseFloat(form.deal_size_min) * 1000000 : null,
        deal_size_max: form.deal_size_max ? parseFloat(form.deal_size_max) * 1000000 : null,
        website: form.website,
        description: form.description,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        notes: form.notes,
        stage: 'New Lead',
        source: 'affiliate',
        submitted_by: user.id,
      })

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    // Notify internal team by email
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'simon@clesandco.com.au',
          subject: `New lead submitted — ${form.company_name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
              <div style="background:#1a1610;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <div style="color:#c9a84c;font-size:20px;font-weight:700;">Finitive Finance</div>
                <div style="color:#ffffff;font-size:12px;margin-top:4px;opacity:0.6;">NEW LEAD SUBMITTED</div>
              </div>
              <div style="background:#ffffff;padding:32px;border:1px solid #e8e4db;border-top:none;">
                <p style="color:#1a1610;font-size:20px;font-weight:600;margin:0 0 20px;">New referral from ${user.full_name}</p>
                <div style="background:#f5f3ee;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                  <div style="font-size:18px;font-weight:600;color:#1a1610;margin-bottom:4px;">${form.company_name}</div>
                  <div style="font-size:13px;color:#9a9080;margin-bottom:8px;">${form.sector} · ${form.deal_type}</div>
                  <div style="font-size:22px;font-weight:700;color:#c9a84c;margin-bottom:12px;">$${form.deal_size_max}M</div>
                  <div style="font-size:13px;color:#5a5245;margin-bottom:4px;"><strong>Contact:</strong> ${form.contact_name}</div>
                  <div style="font-size:13px;color:#5a5245;margin-bottom:4px;"><strong>Email:</strong> ${form.contact_email}</div>
                  ${form.contact_phone ? `<div style="font-size:13px;color:#5a5245;"><strong>Phone:</strong> ${form.contact_phone}</div>` : ''}
                </div>
                ${form.description ? `<div style="margin-bottom:16px;"><strong style="font-size:12px;color:#9a9080;">DESCRIPTION</strong><p style="font-size:14px;color:#5a5245;line-height:1.6;margin:6px 0 0;">${form.description}</p></div>` : ''}
                ${form.notes ? `<div style="margin-bottom:24px;"><strong style="font-size:12px;color:#9a9080;">AFFILIATE NOTES</strong><p style="font-size:14px;color:#5a5245;line-height:1.6;margin:6px 0 0;">${form.notes}</p></div>` : ''}
                <div style="text-align:center;">
                  <a href="https://finitive-finance.vercel.app/dashboard/pipeline"
                     style="display:inline-block;background:#c9a84c;color:#fff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                    View in CRM →
                  </a>
                </div>
              </div>
              <div style="background:#f5f3ee;padding:16px;border-radius:0 0 12px 12px;text-align:center;border:1px solid #e8e4db;border-top:none;">
                <p style="color:#9a9080;font-size:12px;margin:0;">© 2026 Finitive Finance. All rights reserved.</p>
              </div>
            </div>
          `
        })
      })
    } catch (e) {
      // Don't block submission if email fails
      console.error('Email notification failed:', e)
    }

    setSubmitted(true)
    setSubmitting(false)
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
          <a href="/affiliate/submit" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Submit Lead</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">FINANCIALS</div>
          <a href="/affiliate/commissions" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Commissions</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">ACCOUNT</div>
          <a href="/affiliate/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">My Profile</a>
          <a href="/affiliate/support" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Support</a>
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

        {/* Topbar */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">Submit a Lead</div>
            <div className="text-xs text-[#9a9080]">Refer a company to Finitive Finance</div>
          </div>
          <button
            onClick={() => router.push('/affiliate/dashboard')}
            className="px-4 py-2 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee] transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>

        <div className="p-6 max-w-2xl">

          {/* Success state */}
          {submitted ? (
            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <div className="text-xl font-semibold text-[#1a1610] mb-2">Lead submitted!</div>
              <div className="text-sm text-[#9a9080] mb-6 max-w-xs mx-auto leading-relaxed">
                The Finitive Finance team has been notified and will review your referral within 2–3 business days. You'll receive email updates at each stage.
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setSubmitted(false); setForm({ company_name: '', sector: '', deal_type: '', deal_size_min: '', deal_size_max: '', website: '', description: '', contact_name: '', contact_email: '', contact_phone: '', notes: '' }) }}
                  className="px-5 py-2.5 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee]"
                >
                  Submit another
                </button>
                <button
                  onClick={() => router.push('/affiliate/dashboard')}
                  className="px-5 py-2.5 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a]"
                >
                  View my leads →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Company details */}
              <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-black/5">
                  <div className="text-sm font-semibold text-[#1a1610]">Company details</div>
                  <div className="text-xs text-[#9a9080] mt-0.5">Tell us about the opportunity</div>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Company name *</label>
                    <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="e.g. Acme Corp" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Industry / sector *</label>
                    <select name="sector" value={form.sector} onChange={handleChange} className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all">
                      <option value="">Select sector...</option>
                      <option>Technology</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>Clean Energy</option>
                      <option>Manufacturing</option>
                      <option>Agriculture</option>
                      <option>Real Estate</option>
                      <option>Fintech</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Deal type</label>
                    <select name="deal_type" value={form.deal_type} onChange={handleChange} className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all">
                      <option value="">Select type...</option>
                      <option>Buyout</option>
                      <option>Growth equity</option>
                      <option>Venture</option>
                      <option>Real estate</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Est. deal size min ($M)</label>
                    <input name="deal_size_min" value={form.deal_size_min} onChange={handleChange} placeholder="e.g. 20" type="number" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Est. deal size max ($M)</label>
                    <input name="deal_size_max" value={form.deal_size_max} onChange={handleChange} placeholder="e.g. 50" type="number" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Company website</label>
                    <input name="website" value={form.website} onChange={handleChange} placeholder="https://" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Company description *</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief overview of the business and why it's a strong opportunity..." rows={3} className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all resize-none" />
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-black/5">
                  <div className="text-sm font-semibold text-[#1a1610]">Primary contact</div>
                  <div className="text-xs text-[#9a9080] mt-0.5">Who should we reach out to?</div>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Contact name *</label>
                    <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Full name" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Email address *</label>
                    <input name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="contact@company.com" type="email" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Phone number</label>
                    <input name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="+61..." className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Additional notes */}
              <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-black/5">
                  <div className="text-sm font-semibold text-[#1a1610]">Additional notes</div>
                  <div className="text-xs text-[#9a9080] mt-0.5">Optional context for our team</div>
                </div>
                <div className="p-5">
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Background, urgency, or anything that helps our team..." rows={3} className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all resize-none" />
                </div>
              </div>

              {/* Commission reminder */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 flex gap-3">
                <span className="text-green-500 text-lg flex-shrink-0">ℹ</span>
                <div className="text-sm text-[#5a5245] leading-relaxed">
                  <strong className="text-[#1a1610]">Commission reminder:</strong> If Finitive Finance closes a deal with this company you will earn <strong className="text-[#18b877]">2% of the total deal value</strong>. You will receive email updates at each stage change.
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-center text-[#9a9080] mb-4">
                By submitting you agree to our{' '}
                <a href="#" className="text-[#c9a84c] hover:underline">Terms & Conditions</a>
                {' '}and{' '}
                <a href="#" className="text-[#c9a84c] hover:underline">Privacy Policy</a>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/affiliate/dashboard')}
                  className="px-5 py-3 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#c9a84c] text-white text-sm font-semibold rounded-lg hover:bg-[#a8863a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Lead →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
