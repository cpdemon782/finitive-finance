import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { welcomeEmail } from '../../../lib/emails'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response('Missing application ID', { status: 400 })
  }

  const { data: application, error: appError } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (appError || !application) {
    return new Response('Application not found', { status: 404 })
  }

  if (application.status === 'approved') {
    return new Response(`
      <html>
        <body style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f3ee;margin:0">
          <div style="text-align:center;background:white;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
            <div style="font-size:40px;margin-bottom:16px">✓</div>
            <h2 style="color:#1a1610;margin:0 0 8px">Already approved</h2>
            <p style="color:#9a9080;font-size:14px">${application.full_name} has already been approved.</p>
            <a href="https://finitivefinance.app/dashboard/applications" style="display:inline-block;margin-top:20px;background:#c9a84c;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px">View applications</a>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: application.email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) {
    return new Response(`
      <html>
        <body style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f3ee;margin:0">
          <div style="text-align:center;background:white;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
            <div style="font-size:40px;margin-bottom:16px">⚠️</div>
            <h2 style="color:#1a1610;margin:0 0 8px">Error creating account</h2>
            <p style="color:#9a9080;font-size:14px">${authError.message}</p>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  await supabaseAdmin.from('users').insert({
    id: authUser.user.id,
    email: application.email,
    full_name: application.full_name,
    role: 'affiliate',
    company_name: application.company_name,
    phone: application.phone,
    commission_rate: 0.02,
  })

  await supabaseAdmin
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', id)

  const { data: resetData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: application.email,
  })

  const resetLink = resetData?.properties?.action_link || 'https://finitivefinance.app/login'

  try {
    const { subject, html } = welcomeEmail({
      affiliateName: application.full_name,
      affiliateEmail: application.email,
      commissionRate: 0.02,
      resetLink,
    })

    await fetch('https://finitivefinance.app/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: application.email,
        subject,
        html,
      })
    })
  } catch (e) {
    console.error('Welcome email failed:', e)
  }

  return new Response(`
    <html>
      <head><meta charset="utf-8"><title>Application Approved</title></head>
      <body style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f3ee;margin:0">
        <div style="text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:400px">
          <div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px">✓</div>
          <h2 style="color:#1a1610;margin:0 0 8px;font-size:22px">Application approved!</h2>
          <p style="color:#9a9080;font-size:14px;line-height:1.6;margin:0 0 24px">
            <strong style="color:#1a1610">${application.full_name}</strong> has been approved as an affiliate partner. A welcome email has been sent to <strong style="color:#1a1610">${application.email}</strong> with instructions to set their password.
          </p>
          <a href="https://finitivefinance.app/dashboard/applications" style="display:inline-block;background:#c9a84c;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View all applications →</a>
        </div>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } })
}
