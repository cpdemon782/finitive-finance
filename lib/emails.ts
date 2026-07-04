// ─────────────────────────────────────────────
// Finitive Finance — Centralised Email Templates
// ─────────────────────────────────────────────

const LOGO_URL = 'https://finitivefinance.app/logo.jpeg'
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
// ───────────────────────────────
