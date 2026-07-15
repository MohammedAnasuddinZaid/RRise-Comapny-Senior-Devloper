"use client";

import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, BarChart3, RefreshCw } from "lucide-react";
import { AuthModal } from "../components/auth/AuthModal";

function TypingWordmark({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + text[idx]);
        setIdx((i) => i + 1);
      }, isMobile ? 80 : 120); // Faster typing on mobile
      return () => clearTimeout(t);
    }
  }, [idx, text, isMobile]);

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
    icon: <Target className="w-8 h-8" />,
    title: "Goal Tracking",
    description: "Set ambitious goals and break them down into actionable steps with smart progress tracking.",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analytics Dashboard",
    description: "Visualize your growth with beautiful charts and insights that keep you motivated.",
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: "Habit Building",
    description: "Build lasting habits with streaks, reminders, and personalized coaching.",
  },
];

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Premium animated background */}
      <GradientBackground />

      <Header />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-28 pb-24 text-center">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.6 : 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-enhanced border border-primary/20 text-xs font-space text-primary tracking-widest uppercase">
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: isMobile ? 4 : 3, repeat: Infinity, ease: "easeInOut" }}
              />
              Now in Early Access , Join the waitlist
            </div>
          </motion.div>

          {/* Hero wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.8 : 1.2, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-10"
          >
            <h1
              className="font-monument text-5xl md:text-7xl lg:text-9xl tracking-widest leading-none gradient-text"
              style={{ fontFamily: "'Monument Extended', sans-serif", letterSpacing: "0.08em" }}
            >
              <TypingWordmark text="RRise" />
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.8 : 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-8"
          >
            <h2
              className="font-clash text-xl md:text-3xl lg:text-5xl text-foreground/90 font-light tracking-wide"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Rise. Build. Become.
            </h2>
          </motion.div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.8 : 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-inter text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-16"
          >
            The premium personal development workspace that bridges the gap between knowing what to do , and actually doing it.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.8 : 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16 md:mb-24"
          >
            <AnimatedButton 
              variant="primary" 
              size="lg" 
              onClick={() => setIsAuthModalOpen(true)}
            >
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
            transition={{ duration: isMobile ? 1 : 1.5, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="perspective-container"
          >
            <GlassCard className="p-6 md:p-10 lg:p-16 layered-card float-animation">
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <motion.div
                  className="w-20 h-20 md:w-28 md:h-36 lg:w-36 lg:h-36 relative"
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <img
                    src="/images/Logo.webp"
                    alt="RRise Logo"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl opacity-50" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-clash text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Your Personal Growth Hub
                  </h3>
                  <p className="font-inter text-sm md:text-base muted-foreground max-w-md leading-relaxed">
                    Track goals, build habits, and visualize your progress , all in one beautiful, intuitive workspace.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-20 md:mt-40 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: isMobile ? 0.6 : 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-12 md:mb-20"
          >
            <h2 className="font-clash text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Everything you need to grow
            </h2>
            <p className="font-inter text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powerful tools designed to help you achieve your personal development goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: isMobile ? 0.6 : 1, delay: isMobile ? 0 : index * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <GlassCard className="p-6 md:p-10 h-full layered-card">
                  <div className="mb-6 text-primary">{feature.icon}</div>
                  <h3 className="font-clash text-lg md:text-xl font-semibold text-foreground mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="font-inter text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
