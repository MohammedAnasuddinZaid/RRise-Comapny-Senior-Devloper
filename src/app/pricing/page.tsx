"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Header } from "../../components/layout/Header";
import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "rrise free",
    price: "$0",
    period: "forever",
    tagline: "Everything you need to start",
    color: "from-white/[0.06] to-white/[0.02]",
    border: "border-white/8",
    glow: "rgba(0,255,135,0.05)",
    hoverGlow: "rgba(0,255,135,0.15)",
    badge: null,
    ctaLabel: "Get started free",
    ctaVariant: "glass" as const,
    features: [
      "goals",
      "habits",
      "tasks",
      "dashboards",
      "streaks",
      "mascot",
      "limited alex usage",
    ],
    accentColor: "text-primary",
    dotColor: "bg-primary",
  },
  {
    id: "pro",
    name: "rrise pro",
    price: "$20",
    period: "per month",
    tagline: "For those serious about growth",
    color: "from-primary/15 to-secondary/10",
    border: "border-primary/30",
    glow: "rgba(0,255,135,0.12)",
    hoverGlow: "rgba(0,255,135,0.28)",
    badge: "Most Popular",
    ctaLabel: "Start pro",
    ctaVariant: "gradient" as const,
    features: [
      "unlimited alex",
      "ai insights",
      "ai recommendations",
      "ai generated plans",
      "advanced analytics",
      "deeper personalisation",
    ],
    accentColor: "text-primary",
    dotColor: "bg-primary",
  },
  {
    id: "elite",
    name: "rrise elite",
    price: "$49",
    period: "per month",
    tagline: "The full system, plus human touch",
    color: "from-secondary/15 to-primary/10",
    border: "border-secondary/30",
    glow: "rgba(0,229,255,0.10)",
    hoverGlow: "rgba(0,229,255,0.25)",
    badge: "Most Complete",
    ctaLabel: "Go elite",
    ctaVariant: "gradient-blue" as const,
    features: [
      "everything in pro",
      "human accountability",
      "accountability check-ins",
      "personalised feedback",
      "future community access",
    ],
    accentColor: "text-secondary",
    dotColor: "bg-secondary",
  },
];

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof PLANS)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flip-card h-auto min-h-[520px]"
    >
      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`relative p-8 rounded-3xl bg-gradient-to-br ${plan.color} border ${plan.border} backdrop-blur-xl h-full flex flex-col transition-all duration-500`}
        style={{
          boxShadow: hovered
            ? `0 24px 80px ${plan.hoverGlow}`
            : `0 8px 40px ${plan.glow}`,
        }}
      >
        {/* Hover shimmer */}
        {hovered && (
          <motion.div
            className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </motion.div>
        )}

        {/* Badge */}
        {plan.badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#020408] ${
                plan.id === "pro"
                  ? "bg-gradient-to-r from-primary to-secondary"
                  : "bg-gradient-to-r from-secondary to-primary"
              }`}
            >
              {plan.badge}
            </div>
          </div>
        )}

        {/* Plan name */}
        <div className="mb-6 mt-2">
          <p
            className="font-monument text-xs tracking-widest text-muted-foreground uppercase mb-3"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            {plan.name}
          </p>
          <div className="flex items-baseline gap-1 mb-1">
            <span
              className={`font-space text-5xl font-bold ${plan.accentColor}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {plan.price}
            </span>
            <span className="font-inter text-sm text-muted-foreground">/{plan.period}</span>
          </div>
          <p className="font-inter text-sm text-muted-foreground">{plan.tagline}</p>
        </div>

        {/* Divider */}
        <div
          className={`h-px w-full mb-6 ${
            plan.id === "elite"
              ? "bg-gradient-to-r from-transparent via-secondary/40 to-transparent"
              : "bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          }`}
        />

        {/* Features */}
        <ul className="space-y-3 flex-1 mb-8">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full ${plan.dotColor} bg-opacity-20 border ${
                  plan.id === "elite" ? "border-secondary/40" : "border-primary/40"
                } flex items-center justify-center flex-shrink-0`}
              >
                <Check
                  className={`w-3 h-3 ${plan.accentColor}`}
                  strokeWidth={3}
                />
              </div>
              <span className="font-inter text-sm text-foreground/80 capitalize">{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href={`/checkout?plan=${plan.id}`}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3.5 rounded-xl font-clash font-semibold text-sm transition-all duration-300 ${
              plan.ctaVariant === "glass"
                ? "glass border border-white/10 hover:border-primary/30 text-foreground"
                : plan.ctaVariant === "gradient"
                ? "bg-gradient-to-r from-primary to-secondary text-[#020408]"
                : "bg-gradient-to-r from-secondary to-primary text-[#020408]"
            }`}
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {plan.ctaLabel}
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient */}
      <div className="dark:block hidden absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/5 blur-[200px] pointer-events-none" />
      <div className="dark:block hidden absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-secondary/4 blur-[160px] pointer-events-none" />

      <Header />

      <main className="relative z-10 px-6 md:px-12 pt-32 pb-24 max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs font-space text-primary tracking-widest uppercase mb-6">
            Simple pricing
          </div>
          <h1
            className="font-clash text-5xl md:text-6xl font-semibold text-foreground mb-4 leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Choose your level
          </h1>
          <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, scale as you grow. No surprise charges, no lock-in.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start mb-20">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto"
        >
          <h2
            className="font-clash text-3xl font-semibold text-center text-foreground mb-10"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Common questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes — upgrade or downgrade at any time. Changes take effect immediately.",
              },
              {
                q: "What is Alex?",
                a: "Alex is your AI companion inside RRise. Think of it as a coach that knows your patterns and pushes you at exactly the right moment.",
              },
              {
                q: "What does 'human accountability' mean in Elite?",
                a: "You get real check-ins from a human accountability partner — not just an AI. Someone who reviews your progress and gives personalised feedback.",
              },
              {
                q: "Is there a free trial for Pro or Elite?",
                a: "The Free plan is available forever. Pro and Elite plans include a 14-day money-back guarantee.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass border border-white/8 hover:border-primary/15 transition-all duration-300"
              >
                <h3
                  className="font-clash text-sm font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  {faq.q}
                </h3>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
