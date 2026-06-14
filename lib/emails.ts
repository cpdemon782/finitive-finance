export function stageChangeEmail(
  companyName: string,
  newStage: string,
  affiliateName: string,
  dealValue: number,
  commissionValue: number
) {
  return {
    subject: `Update on your referral — ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f5f3ee;font-family:'DM Sans',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                
                <!-- Header -->
                <tr>
                  <td style="background:#1a1610;padding:28px 32px;text-align:center;">
                    <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background:#c9a84c;border-radius:10px;margin-bottom:12px;">
                      <span style="color:#1a1610;font-weight:700;font-size:14px;">FF</span>
                    </div>
                    <div style="color:#ffffff;font-size:18px;font-weight:600;margin-top:8px;">Finitive Finance</div>
                    <div style="color:#c9a84c;font-size:11px;letter-spacing:0.1em;margin-top:4px;">DEAL PLATFORM</div>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <p style="color:#5a5245;font-size:15px;margin:0 0 8px;">Hi ${affiliateName},</p>
                    <p style="color:#1a1610;font-size:22px;font-weight:600;margin:0 0 24px;">Your referral has been updated</p>

                    <!-- Deal card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <div style="font-size:18px;font-weight:600;color:#1a1610;margin-bottom:4px;">${companyName}</div>
                          <div style="font-size:13px;color:#9a9080;margin-bottom:16px;">Deal value: $${(dealValue/1000000).toFixed(0)}M</div>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:50%;">
                                <div style="font-size:11px;color:#9a9080;margin-bottom:4px;">NEW STAGE</div>
                                <div style="display:inline-block;background:#c9a84c;color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">${newStage}</div>
                              </td>
                              <td style="width:50%;text-align:right;">
                                <div style="font-size:11px;color:#9a9080;margin-bottom:4px;">EST. COMMISSION</div>
                                <div style="font-size:20px;font-weight:700;color:#18b877;">$${(commissionValue/1000000).toFixed(1)}M</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#5a5245;font-size:14px;line-height:1.6;margin:0 0 24px;">
                      The Finitive Finance team has reviewed your referral and moved it to the <strong>${newStage}</strong> stage. 
                      Log in to your affiliate portal to track the full progress of this deal.
                    </p>

                    <!-- CTA button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:8px 0 24px;">
                          <a href="https://finitive-finance.vercel.app/affiliate" 
                             style="display:inline-block;background:#c9a84c;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                            View in portal →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#9a9080;font-size:13px;line-height:1.6;margin:0;">
                      If you have any questions, reply to this email or contact us at 
                      <a href="mailto:affiliates@finitivefinance.com" style="color:#c9a84c;">affiliates@finitivefinance.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f5f3ee;padding:20px 32px;text-align:center;border-top:1px solid #e8e4db;">
                    <p style="color:#9a9080;font-size:12px;margin:0;">© 2026 Finitive Finance. All rights reserved.</p>
                    <p style="margin:6px 0 0;">
                      <a href="#" style="color:#c9a84c;font-size:12px;text-decoration:none;">Privacy Policy</a>
                      <span style="color:#d0c8b8;margin:0 8px;">·</span>
                      <a href="#" style="color:#c9a84c;font-size:12px;text-decoration:none;">Terms & Conditions</a>
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
}

export function newLeadEmail(
  companyName: string,
  affiliateName: string,
  sector: string,
  dealValue: number,
  contactName: string,
  contactEmail: string
) {
  return {
    subject: `New lead submitted — ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <tr>
                  <td style="background:#1a1610;padding:28px 32px;text-align:center;">
                    <div style="color:#ffffff;font-size:18px;font-weight:600;">Finitive Finance</div>
                    <div style="color:#c9a84c;font-size:11px;letter-spacing:0.1em;margin-top:4px;">NEW LEAD SUBMITTED</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="color:#1a1610;font-size:20px;font-weight:600;margin:0 0 20px;">New referral from ${affiliateName}</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <div style="font-size:18px;font-weight:600;color:#1a1610;margin-bottom:4px;">${companyName}</div>
                          <div style="font-size:13px;color:#9a9080;margin-bottom:12px;">${sector}</div>
                          <div style="font-size:24px;font-weight:700;color:#c9a84c;margin-bottom:12px;">$${(dealValue/1000000).toFixed(0)}M</div>
                          <div style="font-size:13px;color:#5a5245;"><strong>Contact:</strong> ${contactName} — ${contactEmail}</div>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://finitive-finance.vercel.app/dashboard/pipeline" 
                             style="display:inline-block;background:#c9a84c;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                            View in CRM →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f5f3ee;padding:20px 32px;text-align:center;border-top:1px solid #e8e4db;">
                    <p style="color:#9a9080;font-size:12px;margin:0;">© 2026 Finitive Finance. All rights reserved.</p>
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
}
