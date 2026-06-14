"use client";

import { Header } from "../../components/layout/Header";
import { motion } from "framer-motion";

export default function TermsPage() {
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
              Terms & Conditions
            </div>
            <h1
              className="font-clash text-5xl md:text-6xl font-semibold text-foreground mb-4 leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Terms of Service
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              By using RRise, you agree to these terms. Please read them carefully.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none font-inter text-foreground/85 leading-relaxed">
            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By accessing or using RRise, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Account Responsibilities
              </h2>
              <p className="mb-4 text-muted-foreground">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your information is accurate and up to date</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Service Usage
              </h2>
              <p className="mb-4 text-muted-foreground">
                You agree to use RRise for lawful purposes only. You must not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use the service to transmit harmful code or malware</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Subscription & Payments
              </h2>
              <p className="mb-4 text-muted-foreground">
                For paid subscriptions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fees are charged on a recurring basis as specified</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are handled on a case-by-case basis</li>
                <li>We reserve the right to modify pricing with notice</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Intellectual Property
              </h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of RRise are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, modify, or distribute our content without prior written consent.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                RRise shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid for the service in the preceding 12 months.
              </p>
            </section>
          </div>

          <p className="font-inter text-sm text-muted-foreground text-center mt-12">
            Last updated: June 2026
          </p>
        </motion.div>
      </main>
    </div>
  );
}
