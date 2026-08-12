"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { RrisePageShell } from "../../components/rrise/RrisePageShell";
import Link from "next/link";

const DEFAULT_PRICES = { pro: "20", ultra: "40" };

function usePricingSettings() {
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          const settings = data.settings || [];
          const priceMap = { ...DEFAULT_PRICES };
          settings.forEach((setting: any) => {
            if (setting.key === 'stripe_pro_price') priceMap.pro = setting.value;
            if (setting.key === 'stripe_ultra_price') priceMap.ultra = setting.value;
          });
          setPrices(priceMap);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  return { prices, loading };
}

const PLAN_DEFS = [
  {
    id: "free",
    name: "RRise Free",
    price: "$0",
    period: "forever",
    tagline: "Everything you need to start",
    features: ["goals", "habits", "tasks", "dashboards", "streaks", "mascot", "Free & BYOK chat usage"],
    accent: "text-foreground",
  },
  {
    id: "pro",
    name: "RRise Pro",
    price: "$20",
    period: "per month",
    tagline: "For those serious about growth",
    badge: "Most Popular",
    features: ["Discord community", "monthly ai insights", "Experts recommendations", "Human generated plans", "advanced analytics", "better support"],
    accent: "text-primary",
  },
  {
    id: "ultra",
    name: "RRise Ultra",
    price: "$40",
    period: "per month",
    tagline: "The full system, plus human touch",
    features: ["everything in pro", "human accountability", "accountability check-ins", "personalised feedback", "future community access"],
    accent: "text-foreground",
  },
];

export default function PricingPage() {
  const { prices, loading } = usePricingSettings();

  function getCtaHref(planId: string): string {
    if (planId === "free") return "/app/dashboard";
    return "/checkout?plan=" + planId;
  }

  function getPriceOverride(planId: string): string | undefined {
    if (planId === "pro") return prices.pro;
    if (planId === "ultra") return prices.ultra;
    return undefined;
  }

  return (
    <RrisePageShell>
      <main className="relative z-10 px-6 md:px-12 pt-32 pb-32 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 mt-12 border-b border-border pb-12"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono-space text-white/45 tracking-[0.25em] uppercase mb-8">
            <span className="eyebrow-dot"></span> Simple Pricing
          </div>
          <h1 className="rrise-title rrise-title-shadow text-[clamp(48px,12vw,160px)] text-white">
            Choose your
            <br />
            <span className="saffron-gradient-text italic font-mono-space text-[clamp(30px,7vw,90px)] tracking-normal">Level.</span>
          </h1>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border mb-32">
          {PLAN_DEFS.map((plan, i) => {
            const displayPrice = getPriceOverride(plan.id) ? `$${getPriceOverride(plan.id)}` : plan.price;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`p-10 border-b md:border-b-0 md:border-r border-border bg-surface backdrop-blur-md transition-colors hover:bg-surface-hover flex flex-col ${i === PLAN_DEFS.length - 1 ? 'md:border-r-0' : ''}`}
              >
                {plan.badge && (
                  <div className="text-primary text-xs tracking-widest uppercase mb-4 border border-primary/20 px-3 py-1 inline-block self-start" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>
                    {plan.badge}
                  </div>
                )}
                {!plan.badge && <div className="h-[28px] mb-4"></div>}
                
                <h3 className="text-2xl uppercase tracking-widest text-foreground/50 mb-4" style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>{plan.name}</h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-5xl ${plan.accent}`} style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>{displayPrice}</span>
                </div>
                <span className="text-sm tracking-widest uppercase text-foreground/40 mb-8" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>{plan.period}</span>
                
                <p className="text-foreground/60 mb-8" style={{ fontFamily: 'var(--font-body), "Inter", sans-serif' }}>{plan.tagline}</p>

                <div className="h-px w-full bg-border mb-8"></div>

                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-sm tracking-widest uppercase text-foreground/80" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link href={getCtaHref(plan.id)} className={`block text-center w-full px-8 py-4 text-sm tracking-widest uppercase transition-colors ${plan.id === 'pro' ? 'bg-primary text-black hover:bg-white' : 'border border-border text-foreground hover:bg-white hover:text-black'}`} style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>
                  Select {plan.name}
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="border-t border-border pt-16 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl text-foreground mb-12" style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>Common Questions.</h2>
          <div className="space-y-0 border border-border">
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
                q: "What does 'human accountability' mean in Ultra?",
                a: "You get real check-ins from a human accountability partner — not just an AI. Someone who reviews your progress and gives personalised feedback.",
              },
              {
                q: "Is there a free trial for Pro or Ultra?",
                a: "The Free plan is available forever. Pro and Ultra plans include a 14-day money-back guarantee.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className={`p-8 bg-surface backdrop-blur-md border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors`}
              >
                <h3 className="text-lg text-foreground mb-4 tracking-widest uppercase" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>
                  {faq.q}
                </h3>
                <p className="text-foreground/60 leading-relaxed" style={{ fontFamily: 'var(--font-body), "Inter", sans-serif' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </RrisePageShell>
  );
}
