"use client";

import { Header } from "../../components/layout/Header";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient glows */}
      <div className="dark:block hidden absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/4 blur-[160px] pointer-events-none" />
      <div className="dark:block hidden absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-secondary/4 blur-[140px] pointer-events-none" />

      <Header />

      <main className="relative z-10 px-6 md:px-12 pt-32 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs font-space text-primary tracking-widest uppercase mb-6">
              Privacy Policy
            </div>
            <h1
              className="font-clash text-5xl md:text-6xl font-semibold text-foreground mb-4 leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Privacy Policy
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Last Updated: July 3, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none font-inter text-foreground/85 leading-relaxed">
            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                1. Introduction
              </h2>
              <p className="mb-4">
                Welcome to RRise ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and related services (collectively, the "Services"). By using our Services, you agree to the collection and use of information in accordance with this policy.
              </p>
              <p className="text-muted-foreground">
                We are committed to protecting your privacy and ensuring the security of your personal information. This policy applies to all users of our Services, regardless of their location.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                2. Information We Collect
              </h2>
              <h3 className="font-semibold text-foreground mb-2">2.1 Personal Information</h3>
              <p className="mb-4 text-muted-foreground">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Account Information:</strong> Name, email address, and other registration details</li>
                <li><strong>Profile Information:</strong> User preferences, goals, habits, and tasks data</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store complete credit card numbers)</li>
                <li><strong>AI Configuration:</strong> API keys for BYOK (Bring Your Own Key) functionality (encrypted and stored securely)</li>
              </ul>

              <h3 className="font-semibold text-foreground mb-2">2.2 Automatically Collected Information</h3>
              <p className="mb-4 text-muted-foreground">
                We automatically collect certain information when you use our Services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>AI Usage Metrics:</strong> Token usage, API calls, and provider-specific statistics</li>
                <li><strong>Cookies and Similar Technologies:</strong> As described in our Cookie Policy</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                3. How We Use Your Information
              </h2>
              <p className="mb-4 text-muted-foreground">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our Services</li>
                <li><strong>Personalization:</strong> To deliver AI-powered insights, recommendations, and personalized experiences</li>
                <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity</li>
                <li><strong>Payment Processing:</strong> To process subscriptions and payments through Stripe</li>
                <li><strong>Communication:</strong> To send you transactional emails, updates, and support communications</li>
                <li><strong>Analytics:</strong> To analyze usage patterns, improve our Services, and develop new features</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and fraudulent activity</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                4. Information Sharing and Disclosure
              </h2>
              <p className="mb-4 text-muted-foreground">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf (e.g., Supabase for database hosting, Stripe for payment processing, AI providers for API services)</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, financing, or acquisition of all or a portion of our business</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users or the public</li>
                <li><strong>With Your Consent:</strong> With your explicit consent for other purposes</li>
              </ul>
              <p className="text-muted-foreground">
                We do not sell your personal information to third parties for their marketing purposes.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                5. Data Security
              </h2>
              <p className="mb-4 text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Encryption:</strong> Data is encrypted in transit using TLS/SSL and at rest using industry-standard encryption</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication mechanisms for our systems</li>
                <li><strong>Secure Storage:</strong> API keys and sensitive data are encrypted using AES-256 encryption</li>
                <li><strong>Regular Audits:</strong> Regular security assessments and penetration testing</li>
                <li><strong>Compliance:</strong> Compliance with GDPR, CCPA, and other applicable data protection laws</li>
              </ul>
              <p className="text-muted-foreground">
                Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                6. Data Retention
              </h2>
              <p className="mb-4 text-muted-foreground">
                We retain your personal information for as long as necessary to provide our Services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after account closure</li>
                <li><strong>Usage Data:</strong> Retained for analytics and service improvement purposes</li>
                <li><strong>Payment Data:</strong> Retained as required for financial record-keeping and compliance</li>
                <li><strong>AI Usage Logs:</strong> Retained for billing, analytics, and abuse prevention</li>
              </ul>
              <p className="text-muted-foreground">
                Upon account deletion, we will delete or anonymize your personal information unless retention is required by law.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                7. Your Rights
              </h2>
              <p className="mb-4 text-muted-foreground">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal exceptions)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing of your personal information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, please contact us at rrisewebsite@gmail.com. We will respond to your request within 30 days.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground">
                Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                9. International Data Transfers
              </h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date. Your continued use of our Services after the effective date of the revised policy constitutes your acceptance of the changes.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                11. California Consumer Privacy Act (CCPA)
              </h2>
              <p className="mb-4 text-muted-foreground">
                If you are a resident of California, you have specific rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li><strong>Right to Know:</strong> Request disclosure of categories of personal information we have collected</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your privacy rights</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these CCPA rights, please contact us at rrisewebsite@gmail.com.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-border">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                12. Contact Us
              </h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> rrisewebsite@gmail.com</li>
                <li><strong>Website:</strong> https://rrise.com</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
