'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'
import Sidebar from '../../components/Sidebar'
import { newLeadEmail } from '../../../lib/emails'

export default function SubmitLeadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [commissionRate, setCommissionRate] = useState(0.02)

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
      const { data: rateData } = await supabase
        .from('users')
        .select('commission_rate')
        .eq('id', user.id)
        .single()
      if (rateData?.commission_rate) setCommissionRate(rateData.commission_rate)
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

    try {
      const { subject, html } = newLeadEmail({
        affiliateName: user.full_name,
        companyName: form.company_name,
        sector: form.sector,
        dealType: form.deal_type,
        dealSizeMax: form.deal_size_max ? parseFloat(form.deal_size_max) * 1000000 : 0,
        contactName: form.contact_name,
        contactEmail: form.contact_email,
        contactPhone: form.contact_phone,
        description: form.description,
        notes: form.notes,
      })

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'simon@clesandco.com.au',
          subject,
          html,
        })
      })
    } catch (e) {
      console.error('Email notification failed:', e)
    }

    setSubmitted(true)
    setSubmitting(false)
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

      <Sidebar user={user} portal="affiliate" activePage="submit" />

      <div className="ml-52 flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#1a1610]">Submit a Lead</div>
            <div className="text-xs text-[#9a9080]">Refer a company to Finitive Finance</div>
          </div>
          <button onClick={() => router.push('/affiliate/dashboard')} className="px-4 py-2 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee] transition-colors">
            ← Back to dashboard
          </button>
        </div>

        <div className="p-6 max-w-2xl">
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
                <button onClick={() => router.push('/affiliate/dashboard')} className="px-5 py-2.5 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a]">
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
                      <option>Refinance</option>
                      <option>Purchase</option>
                      <option>Land + Construction</option>
                      <option>Land</option>
                      <option>Construction</option>
                      <option>Private Lending</option>
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
                    <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Company description</label>
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
                  <strong className="text-[#1a1610]">Commission reminder:</strong> If Finitive Finance closes a deal with this company you will earn <strong className="text-[#18b877]">{(commissionRate * 100).toFixed(1)}% of the total deal value</strong>. You will receive email updates at each stage change.
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-center text-[#9a9080] mb-4">
                By submitting you agree to our{' '}
                <a href="/terms" className="text-[#c9a84c] hover:underline">Terms & Conditions</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[#c9a84c] hover:underline">Privacy Policy</a>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => router.push('/affiliate/dashboard')} className="px-5 py-3 border border-black/10 text-[#5a5245] text-sm font-medium rounded-lg hover:bg-[#f5f3ee]">
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
