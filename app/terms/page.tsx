export default function TermsPage() {
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
          <h1 className="text-3xl font-semibold text-[#1a1610] mb-2">Terms & Conditions</h1>
          <p className="text-sm text-[#9a9080]">Last updated: 1 July 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-8 text-[#5a5245] leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Finitive Finance deal management platform at finitivefinance.app (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.</p>
            <p className="mt-3">These Terms constitute a legally binding agreement between you and Finitive Finance Pty Ltd ("Finitive Finance", "we", "us", or "our").</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">2. Platform Access</h2>
            <p>Access to the Platform is by invitation only. Finitive Finance reserves the right to grant or revoke access at its sole discretion. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
            <p className="mt-3">You agree to notify Finitive Finance immediately of any unauthorised use of your account at <a href="mailto:support@finitivefinance.app" className="text-[#c9a84c]">support@finitivefinance.app</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">3. Affiliate Referral Programme</h2>
            <p>Registered affiliate partners may submit referrals through the Platform subject to the following terms:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Affiliates may submit referrals for companies seeking capital investment.</li>
              <li>A commission of the agreed percentage of the total closed deal value will be payable upon successful completion of a transaction introduced by the affiliate.</li>
              <li>The default commission rate is 2% of the total closed deal value unless otherwise agreed in writing.</li>
              <li>Commission rates may be individually negotiated and set by Finitive Finance for each affiliate partner.</li>
              <li>Commissions are payable only on deals that are successfully closed by Finitive Finance.</li>
              <li>Leads that do not progress to close are not eligible for commission.</li>
              <li>Finitive Finance retains sole discretion over all investment decisions.</li>
              <li>Commission payments will be processed within 30 days of a deal closing, subject to receipt of valid payment details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">4. Lead Submission</h2>
            <p>By submitting a lead through the Platform, you represent and warrant that:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>You have obtained appropriate consent from the referred party to share their information with Finitive Finance.</li>
              <li>The information provided is accurate and complete to the best of your knowledge.</li>
              <li>You have not submitted the same lead to any competing investment firm without disclosure.</li>
              <li>You have a legitimate business relationship with or knowledge of the referred company.</li>
            </ul>
            <p className="mt-3">Submission of fraudulent, inaccurate, or misleading leads may result in immediate termination of your affiliate status and forfeiture of any pending commissions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">5. Confidentiality</h2>
            <p>All deal information, pipeline data, commission structures, internal communications, and any other information shared through the Platform is strictly confidential. You agree to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Not disclose any confidential information to third parties without prior written consent from Finitive Finance.</li>
              <li>Use confidential information solely for the purpose of your engagement with Finitive Finance.</li>
              <li>Maintain appropriate security measures to protect confidential information.</li>
              <li>Promptly notify Finitive Finance of any actual or suspected breach of confidentiality.</li>
            </ul>
            <p className="mt-3">This confidentiality obligation survives termination of your access to the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">6. Acceptable Use</h2>
            <p>You agree to use the Platform only for its intended purposes and in compliance with all applicable laws. You must not:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Platform</li>
              <li>Interfere with or disrupt the Platform or its servers</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Share your login credentials with any third party</li>
              <li>Scrape, copy, or extract data from the Platform without authorisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">7. Intellectual Property</h2>
            <p>The Platform and all its content, features, and functionality are owned by Finitive Finance and are protected by Australian and international intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">8. Disclaimer of Warranties</h2>
            <p>The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. Finitive Finance does not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, Finitive Finance shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or these Terms, even if we have been advised of the possibility of such damages.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">10. Termination</h2>
            <p>Finitive Finance may terminate or suspend your access to the Platform at any time, with or without cause, with or without notice. Upon termination, your right to use the Platform will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including confidentiality, intellectual property, and limitation of liability.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">11. Governing Law</h2>
            <p>These Terms are governed by the laws of New South Wales, Australia. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of New South Wales, Australia.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">12. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify registered users of material changes via email. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1610] mb-3">13. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <div className="mt-3 p-4 bg-white rounded-xl border border-black/5">
              <p className="font-medium text-[#1a1610]">Finitive Finance Pty Ltd</p>
              <p className="mt-1">Email: <a href="mailto:legal@finitivefinance.app" className="text-[#c9a84c]">legal@finitivefinance.app</a></p>
              <p>Website: <a href="https://finitivefinance.app" className="text-[#c9a84c]">finitivefinance.app</a></p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
          <p className="text-xs text-[#9a9080]">© 2026 Finitive Finance. All rights reserved.</p>
          <a href="/privacy" className="text-xs text-[#c9a84c] hover:text-[#a8863a]">Privacy Policy →</a>
        </div>

      </div>
    </div>
  )
}
