import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role key to create users (bypasses RLS)
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

  // Get the application
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

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'

  // Create the Supabase Auth user
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

  // Add to users table
  await supabaseAdmin.from('users').insert({
    id: authUser.user.id,
    email: application.email,
    full_name: application.full_name,
    role: 'affiliate',
    company_name: application.company_name,
    phone: application.phone,
    commission_rate: 0.02,
  })

  // Mark application as approved
  await supabaseAdmin
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', id)

  // Send welcome email to affiliate with password reset link
  const { data: resetData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: application.email,
  })

  const resetLink = resetData?.properties?.action_link || 'https://finitivefinance.app/login'

  // Send welcome email
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://finitivefinance.app'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'simon@clesandco.com.au',
        subject: `Welcome to Finitive Finance — ${application.full_name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1a1610;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
              <div style="color:#c9a84c;font-size:20px;font-weight:700;">Finitive Finance</div>
              <div style="color:#ffffff;font-size:12px;margin-top:4px;opacity:0.6;">AFFILIATE PARTNER WELCOME</div>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e8e4db;border-top:none;">
              <p style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 8px;">Welcome, ${application.full_name}!</p>
              <p style="color:#5a5245;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Your application to join the Finitive Finance affiliate partner program has been approved. You can now log in to your partner portal and start submitting referrals.
              </p>
              <div style="background:#f5f3ee;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <div style="font-size:12px;color:#9a9080;margin-bottom:8px;">YOUR ACCOUNT DETAILS</div>
                <div style="font-size:14px;color:#1a1610;margin-bottom:4px;"><strong>Email:</strong> ${application.email}</div>
                <div style="font-size:14px;color:#1a1610;"><strong>Commission rate:</strong> 2% of closed deal value</div>
              </div>
              <p style="color:#5a5245;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Click below to set your password and access your portal:
              </p>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${resetLink}"
                   style="display:inline-block;background:#c9a84c;color:#fff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  Set password & log in →
                </a>
              </div>
              <p style="color:#9a9080;font-size:12px;line-height:1.6;">
                This link expires in 24 hours. If you have any questions contact us at 
                <a href="mailto:affiliates@finitivefinance.app" style="color:#c9a84c;">affiliates@finitivefinance.app</a>
              </p>
            </div>
            <div style="background:#f5f3ee;padding:16px;border-radius:0 0 12px 12px;text-align:center;border:1px solid #e8e4db;border-top:none;">
              <p style="color:#9a9080;font-size:12px;margin:0;">© 2026 Finitive Finance. All rights reserved.</p>
            </div>
          </div>
        `
      })
    })
  } catch (e) {
    console.error('Welcome email failed:', e)
  }

  // Return success page
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
