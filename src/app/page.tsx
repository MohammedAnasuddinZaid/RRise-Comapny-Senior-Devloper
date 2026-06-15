"use client";

import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { useState, useEffect } from "react";
import Link from "next/link";

function TypingWordmark({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + text[idx]);
        setIdx((i) => i + 1);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [idx, text]);

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 align-middle"
        />
      )}
    </span>
  );
}

const FEATURES = [
  {
    icon: "🎯",
    title: "Goal Tracking",
    description: "Set ambitious goals and break them down into actionable steps with smart progress tracking.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    description: "Visualize your growth with beautiful charts and insights that keep you motivated.",
  },
  {
    icon: "🔄",
    title: "Habit Building",
    description: "Build lasting habits with streaks, reminders, and personalized coaching.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Premium animated background */}
      <GradientBackground />

      <Header />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-28 pb-16 text-center">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-enhanced border border-primary/20 text-xs font-space text-primary tracking-widest uppercase">
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Now in Early Access , Join the waitlist
            </div>
          </motion.div>

          {/* Hero wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <h1
              className="font-monument text-7xl md:text-9xl lg:text-[10rem] tracking-widest leading-none gradient-text"
              style={{ fontFamily: "'Monument Extended', sans-serif", letterSpacing: "0.08em" }}
            >
              <TypingWordmark text="RRise" />
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <h2
              className="font-clash text-2xl md:text-4xl lg:text-5xl text-foreground/90 font-light tracking-wide"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Rise. Build. Become.
            </h2>
          </motion.div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-inter text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
          >
            The premium personal development workspace that bridges the gap between knowing what to do , and actually doing it.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <AnimatedButton variant="primary" size="lg" href="/app">
              Start for free
            </AnimatedButton>
            <AnimatedButton variant="secondary" size="lg" href="/features">
              See how it works →
            </AnimatedButton>
          </motion.div>

          {/* Hero Mockup Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.9, type: "spring" }}
            className="perspective-container"
          >
            <GlassCard className="p-8 md:p-12 layered-card float-animation">
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  className="w-24 h-24 md:w-32 md:h-32 relative"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="/images/Logo.png"
                    alt="RRise Logo"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl opacity-50" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-clash text-2xl md:text-3xl font-semibold text-foreground mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Your Personal Growth Hub
                  </h3>
                  <p className="font-inter text-muted-foreground max-w-md">
                    Track goals, build habits, and visualize your progress , all in one beautiful, intuitive workspace.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-clash text-4xl md:text-5xl font-semibold text-foreground mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Everything you need to grow
            </h2>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you achieve your personal development goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <GlassCard className="p-8 h-full layered-card">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-clash text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="font-inter text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mt-32 px-4 text-center"
        >
          <GlassCard className="p-12 md:p-16 layered-card">
            <h2 className="font-clash text-3xl md:text-4xl font-semibold text-foreground mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Ready to start your journey?
            </h2>
            <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of users who are already transforming their lives with RRise.
            </p>
            <AnimatedButton variant="primary" size="lg" href="/app">
              Get started for free
            </AnimatedButton>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
