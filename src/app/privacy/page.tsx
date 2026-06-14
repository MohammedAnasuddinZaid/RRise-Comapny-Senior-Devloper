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
              Your privacy matters
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in transparency. This policy explains how we collect, use, and protect your data.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none font-inter text-foreground/85 leading-relaxed">
            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Information We Collect
              </h2>
              <p className="mb-4">
                We collect information you provide directly to us, including when you create an account, use our services, or communicate with us. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name and email address</li>
                <li>Goals, habits, and tasks data</li>
                <li>Usage patterns and analytics</li>
                <li>Payment information (processed securely)</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To deliver and personalize your experience</li>
                <li>To provide AI-powered insights and recommendations</li>
                <li>To send you updates and support communications</li>
                <li>To analyze usage patterns to improve our services</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Data Security
              </h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit and at rest using industry-standard encryption protocols.
              </p>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8 mb-8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Your Rights
              </h2>
              <p className="mb-4 text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl glass border border-white/8">
              <h2
                className="font-clash text-2xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Contact Us
              </h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at rrisewebsite@gmail.com
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
