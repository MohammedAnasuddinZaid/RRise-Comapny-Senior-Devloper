"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LottieAnimation } from "../../components/ui/LottieAnimation";
import { Button } from "../../components/ui/Button";
import creditCardLock from "../../../public/lottie/credit_card_lock.json";
import happyParrot from "../../../public/lottie/happy_parrot_with_blue_hat.json";
import { audioManager } from "../../lib/audioManager";
import Link from "next/link";

export default function PricingPage() {
  const [showLockAnimation, setShowLockAnimation] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLockAnimation(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handlePlanSelect = (planId: string) => {
    audioManager.play('click');
    setSelectedPlan(planId);
  };

  const handleSubscribe = (planId: string) => {
    audioManager.play('click');
    // TODO: Connect to Stripe
    console.log(`Subscribe to plan: ${planId}`);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-foreground relative overflow-hidden">
      {/* Lock Animation Overlay */}
      <AnimatePresence>
        {showLockAnimation && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#030303] z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <LottieAnimation animationData={creditCardLock} loop={false} className="w-64 h-64 mx-auto" />
              <p className="text-primary font-semibold mt-4 animate-pulse">Loading secure pricing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/3 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between p-6 md:px-12 backdrop-blur-xl bg-black/30 border-b border-white/5 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <img 
            src="/images/RRISE NEW LOGO.png" 
            alt="RRise Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-all duration-300">Home</Link>
          <Link href="/#features" className="hover:text-primary transition-all duration-300">Features</Link>
          <Link href="/#testimonials" className="hover:text-primary transition-all duration-300">Testimonials</Link>
        </nav>
        <div>
          <Link href="/app">
            <Button variant="glass" className="hidden md:flex border-white/5 hover:border-primary/30">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h1 className="font-playfair text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Unlock the full potential of Rise with our flexible pricing plans. Start free and upgrade as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16 w-full max-w-6xl px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div
              className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.15)] transition-all duration-500 text-left space-y-6"
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">Free Plan</h3>
                  <p className="text-4xl font-bold text-primary">$0<span className="text-lg text-muted-foreground font-normal">/forever</span></p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Template-based limited AI use
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Bring your own key system
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Mascot streak management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Management reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Daily tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Finance tracking
                  </li>
                </ul>
                <Button
                  variant="glass"
                  className="w-full border-white/10 hover:border-primary/20"
                  onClick={() => handleSubscribe('free')}
                >
                  Get Started Free
                </Button>
              </div>
            </motion.div>

            {/* Individual Premium Plan */}
            <motion.div
              className="relative p-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.25)] transition-all duration-500 text-left space-y-6"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-20">
                Most Popular
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent opacity-50 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 pt-4">
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">Individual Premium</h3>
                  <p className="text-4xl font-bold text-primary">$20<span className="text-lg text-muted-foreground font-normal">/month</span></p>
                </div>
                <div className="flex justify-center mt-4">
                  <LottieAnimation animationData={happyParrot} loop={false} className="w-20 h-20" />
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Everything in Free plan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    1M AI tokens per month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Custom templates
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('premium')}
                >
                  Upgrade to Premium
                </Button>
              </div>
            </motion.div>

            {/* Team Pro Plan */}
            <motion.div
              className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.15)] transition-all duration-500 text-left space-y-6"
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">Team Pro</h3>
                  <p className="text-4xl font-bold text-primary">$49<span className="text-lg text-muted-foreground font-normal">/month</span></p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Everything in Premium
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Unlimited AI credits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Admin dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    API access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Custom integrations
                  </li>
                </ul>
                <Button
                  variant="glass"
                  className="w-full border-white/10 hover:border-primary/20"
                  onClick={() => handleSubscribe('team')}
                >
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 w-full max-w-3xl px-4"
        >
          <h2 className="font-playfair text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <h3 className="font-semibold text-foreground mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <h3 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <h3 className="font-semibold text-foreground mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">The Free plan is available forever. Premium plans include a 14-day money-back guarantee.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
