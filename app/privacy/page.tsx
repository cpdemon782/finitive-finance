export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <a href="/login" className="text-sm text-[#c9a84c] hover:text-[#a8863a] mb-8 inline-block">← Back to login</a>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#1a1610] rounded-lg flex items-center justify-center text-xs font-bold text-[#c9a84c]">FF</div>
            <span className="text-sm font-medium text-[#5a5245]">Finitive Finance</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#1a1610] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#9a9080]">Last updated: 1 July 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-8 text-[#5a5245] leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">1. Introduction</h2>
            <p>Finitive Finance Pty Ltd ("Finitive Finance", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our deal management platform at finitivefinance.app (the "Platform").</p>
            <p className="mt-3">By accessing or using the Platform, you agree to the collection and use of information in accordance with this Policy. If you do not agree, please do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-[#1a1610]">Account information:</strong> Name, email address, company name, phone number, and role when you register or are invited to the Platform.</li>
              <li><strong className="text-[#1a1610]">Lead and deal information:</strong> Company details, deal sizes, contact information, and notes submitted through the Platform.</li>
              <li><strong className="text-[#1a1610]">Usage data:</strong> Information about how you interact with the Platform, including pages visited and actions taken.</li>
              <li><strong className="text-[#1a1610]">Communication data:</strong> Messages and correspondence sent through the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Provide, operate, and maintain the Platform</li>
              <li>Process and manage deal referrals and commissions</li>
              <li>Send transactional emails including lead status updates and commission notifications</li>
              <li>Communicate with you about your account and activity on the Platform</li>
              <li>Improve and optimise the Platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">4. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-[#1a1610]">Service providers:</strong> We use trusted third-party services including Supabase (database), Resend (email delivery), and Vercel (hosting) to operate the Platform. These providers are bound by confidentiality obligations.</li>
              <li><strong className="text-[#1a1610]">Internal team:</strong> Affiliate lead submissions are shared with the Finitive Finance internal deal team for evaluation purposes.</li>
              <li><strong className="text-[#1a1610]">Legal requirements:</strong> We may disclose your information if required by law or in response to valid legal processes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Encryption in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication via Supabase Auth with JWT tokens</li>
              <li>Role-based access control ensuring users only access data relevant to their role</li>
              <li>Regular security reviews</li>
            </ul>
            <p className="mt-3">While we take reasonable precautions, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">6. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide services. If you wish to have your account and data deleted, please contact us at the details below and we will process your request within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">7. Email Communications</h2>
            <p>By using the Platform, you consent to receiving transactional email notifications including lead status updates, stage change notifications, and commission confirmations. These communications are necessary for the operation of the Platform and cannot be individually opted out of while your account remains active.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">8. Your Rights</h2>
            <p>Under the Australian Privacy Act 1988 and applicable privacy laws, you have the right to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:privacy@finitivefinance.app" className="text-[#c9a84c] hover:text-[#a8863a]">privacy@finitivefinance.app</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">9. Cookies</h2>
            <p>The Platform uses essential cookies and local storage to maintain your login session. We do not use tracking or advertising cookies. By using the Platform you consent to our use of essential cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of any material changes via email. Continued use of the Platform after changes constitutes acceptance of the updated Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">11. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="mt-3 p-4 bg-white rounded-xl border border-black/5">
              <p className="font-medium text-[#1a1610]">Finitive Finance Pty Ltd</p>
              <p className="mt-1">Email: <a href="mailto:privacy@finitivefinance.app" className="text-[#c9a84c]">privacy@finitivefinance.app</a></p>
              <p>Website: <a href="https://finitivefinance.app" className="text-[#c9a84c]">finitivefinance.app</a></p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
          <p className="text-xs text-[#9a9080]">© 2026 Finitive Finance. All rights reserved.</p>
          <a href="/terms" className="text-xs text-[#c9a84c] hover:text-[#a8863a]">Terms & Conditions →</a>
        </div>

      </div>
    </div>
  )
}
