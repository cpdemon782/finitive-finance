// ─────────────────────────────────────────────
// Finitive Finance — Centralised Email Templates
// ─────────────────────────────────────────────

const LOGO_URL = 'https://finitivefinance.app/logo.png'
const PLATFORM_URL = 'https://finitivefinance.app'
const SUPPORT_EMAIL = 'info@finitivefinance.com.au'
const INVITER_NAME = 'Simon'

function formatDate(date: Date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Finitive Finance</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td style="background:#1a1610;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="Finitive Finance" style="height:48px;width:auto;object-fit:contain;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px;border-left:1px solid #e8e4db;border-right:1px solid #e8e4db;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0ece0;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border:1px solid #e8e4db;border-top:none;">
              <p style="color:#9a9080;font-size:12px;margin:0 0 6px;">© 2026 Finitive Finance Pty Ltd. All rights reserved.</p>
              <p style="margin:0;">
                <a href="${PLATFORM_URL}/privacy" style="color:#c9a84c;font-size:12px;text-decoration:none;">Privacy Policy</a>
                <span style="color:#d0c8b8;margin:0 8px;">·</span>
                <a href="${PLATFORM_URL}/terms" style="color:#c9a84c;font-size:12px;text-decoration:none;">Terms & Conditions</a>
                <span style="color:#d0c8b8;margin:0 8px;">·</span>
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9a84c;font-size:12px;text-decoration:none;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function ctaButton(text: string, url: string, color = '#c9a84c') {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="display:inline-block;background:${color};color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

function infoCard(rows: { label: string, value: string }[]) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border-radius:10px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        ${rows.map(r => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
            <tr>
              <td style="font-size:11px;color:#9a9080;font-family:monospace;letter-spacing:0.06em;padding-bottom:3px;">${r.label.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#1a1610;font-weight:500;">${r.value}</td>
            </tr>
          </table>
        `).join('')}
      </td></tr>
    </table>
  `
}

function highlightBadge(text: string) {
  return `<span style="display:inline-block;background:#c9a84c;color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">${text}</span>`
}

// ─────────────────────────────────────────────
// 1. NEW LEAD SUBMITTED — to Simon
// ─────────────────────────────────────────────
export function newLeadEmail({
  affiliateName,
  companyName,
  sector,
  dealType,
  dealSizeMax,
  contactName,
  contactEmail,
  contactPhone,
  description,
  notes,
}: {
  affiliateName: string
  companyName: string
  sector: string
  dealType: string
  dealSizeMax: number
  contactName: string
  contactEmail: string
  contactPhone?: string
  description?: string
  notes?: string
}) {
  const content = `
    <p style="color:#9a9080;font-size:13px;margin:0 0 6px;">New referral received</p>
    <h1 style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 4px;">${companyName}</h1>
    <p style="color:#9a9080;font-size:14px;margin:0 0 24px;">Submitted by <strong style="color:#1a1610;">${affiliateName}</strong></p>

    ${infoCard([
      { label: 'Sector', value: sector },
      { label: 'Deal type', value: dealType || '—' },
      { label: 'Est. deal size', value: dealSizeMax ? `$${(dealSizeMax / 1000000).toFixed(0)}M` : '—' },
      { label: 'Est. commission (2%)', value: dealSizeMax ? `$${(dealSizeMax * 0.02 / 1000000).toFixed(2)}M` : '—' },
      { label: 'Primary contact', value: `${contactName} — ${contactEmail}${contactPhone ? ` — ${contactPhone}` : ''}` },
    ])}

    ${description ? `<p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 16px;"><strong style="color:#1a1610;">About the company:</strong><br>${description}</p>` : ''}
    ${notes ? `<p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 24px;"><strong style="color:#1a1610;">Affiliate notes:</strong><br>${notes}</p>` : ''}

    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 8px;">Review this lead in the CRM and assign it to a team member to begin the evaluation process.</p>

    ${ctaButton('View in CRM →', `${PLATFORM_URL}/dashboard/pipeline`)}
  `
  return {
    subject: `New Lead: ${affiliateName} — ${companyName} / ${formatDate()}`,
    html: baseTemplate(content),
  }
}

// ─────────────────────────────────────────────
// 2. STAGE CHANGE — to affiliate
// ─────────────────────────────────────────────
export function stageChangeEmail({
  affiliateName,
  companyName,
  newStage,
  dealSizeMax,
  commissionRate = 0.02,
}: {
  affiliateName: string
  companyName: string
  newStage: string
  dealSizeMax: number
  commissionRate?: number
}) {
  const commission = dealSizeMax * commissionRate
  const isClosed = newStage === 'Closed'
  const isLost = newStage === 'Lost'

  const stageMessages: Record<string, string> = {
    'Reviewing': 'Great news — the Finitive Finance team is actively reviewing your referral. We\'ll keep you updated as things progress.',
    'Due Diligence': 'Your referral has progressed to Due Diligence. Our team is conducting a thorough review of this opportunity.',
    'Term Sheet': 'Excellent progress — a term sheet has been issued for this deal. We\'re getting closer to close.',
    'Closed': `Congratulations! This deal has been successfully closed. Your commission of <strong style="color:#18b877;">$${(commission / 1000000).toFixed(2)}M</strong> is being processed and will be paid within 30 days.`,
    'Lost': 'After thorough review, this opportunity did not meet our current investment criteria. We appreciate your referral and look forward to reviewing future opportunities from you.',
  }

  const message = stageMessages[newStage] || `Your referral has been updated to ${newStage}.`

  const content = `
    <p style="color:#9a9080;font-size:13px;margin:0 0 6px;">Referral update</p>
    <h1 style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 4px;">Hi ${affiliateName},</h1>
    <p style="color:#5a5245;font-size:14px;margin:0 0 24px;">Your referral has been updated.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border-radius:10px;margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-size:18px;font-weight:600;color:#1a1610;margin:0 0 4px;">${companyName}</p>
          <p style="font-size:13px;color:#9a9080;margin:0 0 16px;">Est. deal value: $${(dealSizeMax / 1000000).toFixed(0)}M</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:50%;vertical-align:top;">
                <p style="font-size:11px;color:#9a9080;font-family:monospace;margin:0 0 6px;">NEW STAGE</p>
                ${highlightBadge(newStage)}
              </td>
              ${!isLost ? `
              <td style="width:50%;vertical-align:top;text-align:right;">
                <p style="font-size:11px;color:#9a9080;font-family:monospace;margin:0 0 6px;">${isClosed ? 'COMMISSION EARNED' : 'EST. COMMISSION'}</p>
                <p style="font-size:20px;font-weight:700;color:${isClosed ? '#18b877' : '#c9a84c'};font-family:monospace;margin:0;">$${(commission / 1000000).toFixed(2)}M</p>
              </td>
              ` : ''}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 24px;">${message}</p>

    ${!isLost ? ctaButton('View in partner portal →', `${PLATFORM_URL}/affiliate/leads`) : ''}

    <p style="color:#9a9080;font-size:13px;margin:0;">Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9a84c;">${SUPPORT_EMAIL}</a></p>
  `

  return {
    subject: `Referral Update: ${companyName} has moved to ${newStage}`,
    html: baseTemplate(content),
  }
}

// ─────────────────────────────────────────────
// 3. AFFILIATE APPLICATION — to Simon
// ─────────────────────────────────────────────
export function applicationEmail({
  applicantName,
  applicantEmail,
  companyName,
  phone,
  howHeard,
  bio,
  applicationId,
}: {
  applicantName: string
  applicantEmail: string
  companyName: string
  phone?: string
  howHeard?: string
  bio?: string
  applicationId: string
}) {
  const content = `
    <p style="color:#9a9080;font-size:13px;margin:0 0 6px;">New partner application</p>
    <h1 style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 24px;">New affiliate application received</h1>

    ${infoCard([
      { label: 'Name', value: applicantName },
      { label: 'Company', value: companyName },
      { label: 'Email', value: applicantEmail },
      ...(phone ? [{ label: 'Phone', value: phone }] : []),
      ...(howHeard ? [{ label: 'How they heard', value: howHeard }] : []),
    ])}

    ${bio ? `
      <p style="color:#1a1610;font-size:13px;font-weight:600;margin:0 0 8px;">About the applicant</p>
      <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 24px;padding:16px;background:#f5f3ee;border-radius:8px;border-left:3px solid #c9a84c;">${bio}</p>
    ` : ''}

    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 8px;">Click below to approve this application. This will automatically create their account and send them a welcome email with login instructions.</p>

    ${ctaButton('✓ Approve Application', `${PLATFORM_URL}/api/approve-affiliate?id=${applicationId}`, '#18b877')}

    <p style="text-align:center;margin:0;">
      <a href="${PLATFORM_URL}/dashboard/applications" style="color:#9a9080;font-size:13px;">View all applications in dashboard →</a>
    </p>
  `

  return {
    subject: `New affiliate application — ${applicantName} / ${formatDate()}`,
    html: baseTemplate(content),
  }
}

// ─────────────────────────────────────────────
// 4. WELCOME EMAIL — to new affiliate
// ─────────────────────────────────────────────
export function welcomeEmail({
  affiliateName,
  affiliateEmail,
  commissionRate = 0.02,
  resetLink,
}: {
  affiliateName: string
  affiliateEmail: string
  commissionRate?: number
  resetLink: string
}) {
  const content = `
    <p style="color:#9a9080;font-size:13px;margin:0 0 6px;">Welcome to Finitive Finance</p>
    <h1 style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 16px;">Welcome, ${affiliateName}!</h1>

    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 24px;">Your application to join the Finitive Finance affiliate partner program has been approved. You now have access to your partner portal where you can submit referrals, track your leads, and monitor your commissions.</p>

    ${infoCard([
      { label: 'Your email', value: affiliateEmail },
      { label: 'Commission rate', value: `${(commissionRate * 100).toFixed(1)}% of closed deal value` },
      { label: 'Portal access', value: PLATFORM_URL },
    ])}

    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 8px;">Click below to set your password and access your partner portal. This link expires in 24 hours.</p>

    ${ctaButton('Set password & access portal →', resetLink)}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border-radius:10px;margin:24px 0;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-size:13px;font-weight:600;color:#1a1610;margin:0 0 12px;">Getting started</p>
          <p style="font-size:13px;color:#5a5245;margin:0 0 8px;">1. Set your password using the button above</p>
          <p style="font-size:13px;color:#5a5245;margin:0 0 8px;">2. Log in to your partner portal</p>
          <p style="font-size:13px;color:#5a5245;margin:0 0 8px;">3. Submit your first referral</p>
          <p style="font-size:13px;color:#5a5245;margin:0;">4. Track your leads and commissions in real time</p>
        </td>
      </tr>
    </table>

    <p style="color:#9a9080;font-size:13px;margin:0;">Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9a84c;">${SUPPORT_EMAIL}</a></p>
  `

  return {
    subject: `Welcome to Finitive Finance — Your partner account is ready`,
    html: baseTemplate(content),
  }
}

// ─────────────────────────────────────────────
// 5. SUPPORT MESSAGE — to Simon
// ─────────────────────────────────────────────
export function supportEmail({
  affiliateName,
  affiliateEmail,
  subject,
  message,
}: {
  affiliateName: string
  affiliateEmail: string
  subject: string
  message: string
}) {
  const content = `
    <p style="color:#9a9080;font-size:13px;margin:0 0 6px;">Support request</p>
    <h1 style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 24px;">New support message</h1>

    ${infoCard([
      { label: 'From', value: `${affiliateName} — ${affiliateEmail}` },
      { label: 'Subject', value: subject },
    ])}

    <p style="color:#1a1610;font-size:13px;font-weight:600;margin:0 0 8px;">Message</p>
    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 24px;padding:16px;background:#f5f3ee;border-radius:8px;border-left:3px solid #c9a84c;">${message}</p>

    <p style="color:#9a9080;font-size:13px;margin:0;">Reply directly to this email to respond to ${affiliateName}.</p>
  `

  return {
    subject: `Support: ${affiliateName} — ${subject}`,
    html: baseTemplate(content),
  }
}

// ─────────────────────────────────────────────
// 6. INVITE AFFILIATE — to prospect
// ─────────────────────────────────────────────
export function inviteEmail({
  inviteeName,
  commissionRate = 0.02,
}: {
  inviteeName: string
  commissionRate?: number
}) {
  const content = `
    <p style="color:#9a9080;font-size:13px;margin:0 0 6px;">Partner invitation</p>
    <h1 style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 16px;">${inviteeName}, you've been invited to join Finitive Finance</h1>

    <p style="color:#5a5245;font-size:14px;line-height:1.7;margin:0 0 24px;">Hi ${inviteeName}, you've been personally invited by <strong style="color:#1a1610;">${INVITER_NAME}</strong> at Finitive Finance to join our affiliate partner program.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1610;border-radius:10px;margin:0 0 24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 8px;font-family:monospace;letter-spacing:0.06em;">YOUR COMMISSION RATE</p>
          <p style="font-size:36px;font-weight:700;color:#c9a84c;font-family:monospace;margin:0 0 8px;">${(commissionRate * 100).toFixed(1)}%</p>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0;">of every closed deal you refer</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border-radius:10px;margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-size:13px;font-weight:600;color:#1a1610;margin:0 0 12px;">How it works</p>
          <p style="font-size:13px;color:#5a5245;margin:0 0 8px;">1. Apply for your partner account below</p>
          <p style="font-size:13px;color:#5a5245;margin:0 0 8px;">2. Submit referrals through your partner portal</p>
          <p style="font-size:13px;color:#5a5245;margin:0 0 8px;">3. Track your leads in real time</p>
          <p style="font-size:13px;color:#5a5245;margin:0;">4. Earn ${(commissionRate * 100).toFixed(1)}% when a deal closes</p>
        </td>
      </tr>
    </table>

    ${ctaButton('Apply to become a partner →', `${PLATFORM_URL}/apply`)}

    <p style="color:#9a9080;font-size:13px;margin:0;text-align:center;">Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9a84c;">${SUPPORT_EMAIL}</a></p>
  `

  return {
    subject: `${inviteeName}, you've been invited to join the Finitive Finance affiliate program`,
    html: baseTemplate(content),
  }
}
