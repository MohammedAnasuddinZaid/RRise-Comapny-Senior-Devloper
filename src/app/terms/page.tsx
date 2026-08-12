"use client";

import { RrisePageShell } from "../../components/rrise/RrisePageShell";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <RrisePageShell>
      <main className="relative z-10 px-6 md:px-12 pt-32 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs text-primary tracking-widest uppercase mb-6" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>
              Terms & Conditions
            </div>
            <h1
              className="rrise-title rrise-title-shadow text-[clamp(40px,8vw,96px)] text-white mb-4 leading-tight"
            >
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-body), "Inter", sans-serif' }}>
              Last Updated: July 3, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none text-foreground/85 leading-relaxed" style={{ fontFamily: 'var(--font-body), "Inter", sans-serif' }}>
            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 text-muted-foreground">
                By accessing or using RRise ("we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, please do not use our Services.
              </p>
              <p className="text-muted-foreground">
                These Terms constitute a legally binding agreement between you and RRise. By creating an account or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                2. Account Registration and Security
              </h2>
              <h3 className="font-semibold text-foreground mb-2">2.1 Account Creation</h3>
              <p className="mb-4 text-muted-foreground">
                To use certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              <h3 className="font-semibold text-foreground mb-2">2.2 Account Security</h3>
              <p className="mb-4 text-muted-foreground">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your information is accurate and up to date</li>
              </ul>
              <p className="text-muted-foreground">
                You agree not to share your account credentials with any third party. You are responsible for all activities that occur under your account, whether or not you authorized those activities.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                3. Service Description and Usage
              </h2>
              <h3 className="font-semibold text-foreground mb-2">3.1 Service Description</h3>
              <p className="mb-4 text-muted-foreground">
                RRise provides a personal development platform with AI-powered features, habit tracking, task management, and goal setting tools. Our Services are offered on a subscription basis with different plan tiers (Free, Pro, Ultra).
              </p>
              <h3 className="font-semibold text-foreground mb-2">3.2 Permitted Use</h3>
              <p className="mb-4 text-muted-foreground">
                You agree to use RRise for lawful purposes only. You may use our Services to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Track personal habits and goals</li>
                <li>Manage tasks and projects</li>
                <li>Receive AI-powered insights and recommendations</li>
                <li>Use BYOK (Bring Your Own Key) functionality with your own AI API keys</li>
              </ul>
              <h3 className="font-semibold text-foreground mb-2">3.3 Prohibited Uses</h3>
              <p className="mb-4 text-muted-foreground">
                You must not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use the service to transmit harmful code, viruses, or malware</li>
                <li>Reverse engineer, decompile, or attempt to extract source code from our Services</li>
                <li>Use AI features to generate harmful, illegal, or inappropriate content</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                4. Subscription Plans and Payments
              </h2>
              <h3 className="font-semibold text-foreground mb-2">4.1 Subscription Tiers</h3>
              <p className="mb-4 text-muted-foreground">
                We offer the following subscription plans:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Free Plan:</strong> Basic features with limited AI access</li>
                <li><strong>Pro Plan ($20/month):</strong> Enhanced features with increased AI usage limits</li>
                <li><strong>Ultra Plan ($40/month):</strong> Premium features with unlimited AI access and priority support</li>
              </ul>
              <h3 className="font-semibold text-foreground mb-2">4.2 Payment Terms</h3>
              <p className="mb-4 text-muted-foreground">
                For paid subscriptions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Fees are charged on a recurring monthly basis</li>
                <li>Payments are processed securely through Stripe</li>
                <li>You authorize us to charge your chosen payment method for the subscription fee</li>
                <li>Subscription fees are non-refundable except as required by law</li>
              </ul>
              <h3 className="font-semibold text-foreground mb-2">4.3 Cancellation</h3>
              <p className="text-muted-foreground">
                You may cancel your subscription at any time through your account settings or by contacting us. Cancellation will take effect at the end of the current billing period. You will not receive a refund for any portion of the subscription fee already paid.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                5. AI Services and BYOK
              </h2>
              <h3 className="font-semibold text-foreground mb-2">5.1 AI Services</h3>
              <p className="mb-4 text-muted-foreground">
                Our AI-powered features are provided "as is" and may not always be accurate. You should not rely solely on AI-generated advice for important decisions. We are not responsible for any actions taken based on AI recommendations.
              </p>
              <h3 className="font-semibold text-foreground mb-2">5.2 BYOK (Bring Your Own Key)</h3>
              <p className="mb-4 text-muted-foreground">
                If you choose to use BYOK functionality:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>You are responsible for the security of your API keys</li>
                <li>Your API keys are encrypted and stored securely</li>
                <li>You agree to the terms of service of the AI provider whose API you use</li>
                <li>We are not responsible for charges incurred through your AI provider</li>
                <li>Usage of your API keys is subject to your provider's rate limits and terms</li>
              </ul>
              <h3 className="font-semibold text-foreground mb-2">5.3 Usage Limits</h3>
              <p className="text-muted-foreground">
                Pro and Ultra plans have token usage limits. Exceeding these limits may result in reduced service or additional charges. We reserve the right to modify usage limits with reasonable notice.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                6. Intellectual Property Rights
              </h2>
              <p className="mb-4 text-muted-foreground">
                All content, features, and functionality of RRise are owned by us and protected by international copyright, trademark, and other intellectual property laws. This includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Software, code, and algorithms</li>
                <li>Text, graphics, logos, and designs</li>
                <li>User interface and user experience</li>
                <li>Trade secrets and proprietary information</li>
              </ul>
              <p className="text-muted-foreground">
                You may not reproduce, modify, distribute, or create derivative works of our content without prior written consent. You retain ownership of any content you create using our Services, but grant us a license to use, store, and process such content to provide our Services.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                7. User Content
              </h2>
              <p className="mb-4 text-muted-foreground">
                You retain ownership of any content you create, upload, or submit to our Services ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your User Content solely for the purpose of providing our Services.
              </p>
              <p className="text-muted-foreground">
                You represent and warrant that you have the right to submit User Content and that it does not violate any third-party rights or applicable laws. We reserve the right to remove any User Content that violates these Terms.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                8. Privacy and Data Protection
              </h2>
              <p className="text-muted-foreground">
                Your use of our Services is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using our Services, you consent to our collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                9. Termination and Suspension
              </h2>
              <h3 className="font-semibold text-foreground mb-2">9.1 Termination by You</h3>
              <p className="mb-4 text-muted-foreground">
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your right to use the Services will immediately cease.
              </p>
              <h3 className="font-semibold text-foreground mb-2">9.2 Termination by Us</h3>
              <p className="mb-4 text-muted-foreground">
                We reserve the right to suspend or terminate your account at any time for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Violation of these Terms</li>
                <li>Suspicious or fraudulent activity</li>
                <li>Extended period of inactivity</li>
                <li>Non-payment of subscription fees</li>
              </ul>
              <p className="text-muted-foreground">
                Upon termination, we may delete your account and all associated data, except as required by law.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                10. Disclaimers and Warranties
              </h2>
              <p className="mb-4 text-muted-foreground">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Accuracy, reliability, or availability of the Services</li>
                <li>Freedom from viruses or other harmful components</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                11. Limitation of Liability
              </h2>
              <p className="mb-4 text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RRISE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Loss of data, profits, or business opportunities</li>
                <li>Damage to your device or software</li>
                <li>Errors or inaccuracies in AI-generated content</li>
              </ul>
              <p className="text-muted-foreground">
                Our total liability is limited to the amount you paid for the Services in the preceding 12 months. Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability, so these limitations may not apply to you.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                12. Indemnification
              </h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless RRise and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Services, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                13. Governing Law and Dispute Resolution
              </h2>
              <p className="mb-4 text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground">
                Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive your right to a trial by jury and to participate in class action lawsuits.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                14. Modifications to Terms
              </h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of the Services after the effective date constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border">
              <h2
                className="text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-heading), "Clash Display", sans-serif' }}
              >
                15. Contact Us
              </h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> rrisewebsite@gmail.com</li>
                <li><strong>Website:</strong> https://rrise.com</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
    </RrisePageShell>
  );
}
