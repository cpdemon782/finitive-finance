'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { applicationEmail } from '../../lib/emails'

export default function ApplyPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: '',
    how_heard: '',
    bio: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit() {
    if (!form.full_name || !form.email || !form.company_name) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('applications')
      .insert({
        full_name: form.full_name,
        email: form.email,
        company_name: form.company_name,
        phone: form.phone,
        how_heard: form.how_heard,
        bio: form.bio,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    try {
      const { subject, html } = applicationEmail({
        applicantName: form.full_name,
        applicantEmail: form.email,
        companyName: form.company_name,
        phone: form.phone,
        howHeard: form.how_heard,
        bio: form.bio,
        applicationId: data.id,
      })

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@finitivefinance.com.au',
          subject,
          html,
        })
      })
    } catch (e) {
      console.error('Email failed:', e)
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f5] via-[#f0ece0] to-[#e8e0cc] flex items-center justify-center py-12 px-5">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1a1610] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-[#c9a84c] font-bold text-sm">FF</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1610]">Become a Partner</h1>
          <p className="text-sm text-[#9a9080] mt-2 max-w-sm mx-auto leading-relaxed">
            Join the Finitive Finance affiliate network and earn commissions by referring investment opportunities.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-[#c9a84c]/10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <div className="text-xl font-semibold text-[#1a1610] mb-2">Application submitted!</div>
            <div className="text-sm text-[#9a9080] mb-6 leading-relaxed max-w-xs mx-auto">
              Thank you for your interest in the Finitive Finance partner program. Our team will review your application and be in touch within 1–2 business days.
            </div>
            <a href="/login" className="text-sm text-[#c9a84c] hover:text-[#a8863a]">← Back to login</a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#c9a84c]/10">

            <div className="bg-gradient-to-r from-[#1a1610] to-[#2a2418] rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c9a84c]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#c9a84c] text-lg">💰</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Earn 0.2% commission</div>
                <div className="text-xs text-white/50 mt-0.5">On every deal you refer that closes</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Full name *</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Smith" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Email address *</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="john@company.com" type="email" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Company name *</label>
                  <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Acme Advisory" className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Phone number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61..." className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">How did you hear about us?</label>
                <select name="how_heard" value={form.how_heard} onChange={handleChange} className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all">
                  <option value="">Select...</option>
                  <option>Referral from existing partner</option>
                  <option>LinkedIn</option>
                  <option>Google search</option>
                  <option>Industry event</option>
                  <option>Direct outreach from Finitive Finance</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5a5245] mb-1.5">Tell us about yourself</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Your background, network, and why you'd be a great partner..." rows={4} className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all resize-none" />
              </div>

              {error && (
                <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-[#c9a84c] hover:bg-[#a8863a] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#c9a84c]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit application →'}
              </button>

              <div className="text-xs text-center text-[#9a9080]">
                By applying you agree to our{' '}
                <a href="/terms" className="text-[#c9a84c] hover:underline">Terms & Conditions</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[#c9a84c] hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#c0b8a8] mt-6">
          Already have an account? <a href="/login" className="text-[#c9a84c] hover:text-[#a8863a]">Sign in →</a>
        </p>

      </div>
    </div>
  )
}
