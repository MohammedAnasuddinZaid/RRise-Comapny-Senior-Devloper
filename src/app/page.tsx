"use client";

import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { GradientBackground } from "../components/ui/GradientBackground";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, BarChart3, RefreshCw } from "lucide-react";
import { AuthModal } from "../components/auth/AuthModal";

// Scrolling Marquee Component
const Marquee = () => {
  return (
    <div className="relative flex overflow-hidden bg-primary text-primary-foreground py-3 border-y border-primary/20 rotate-[-1deg] w-[110%] -ml-[5%] shadow-xl z-20">
      <motion.div
        className="flex whitespace-nowrap gap-10 font-monument text-sm md:text-base tracking-widest uppercase items-center"
        animate={{ x: [0, -1036] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        {/* Repeat content for infinite scroll effect */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-10">
            <span>Goal Tracking</span>
            <span>✦</span>
            <span>Habit Building</span>
            <span>✦</span>
            <span>Analytics Dashboard</span>
            <span>✦</span>
            <span>Next.js & React</span>
            <span>✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const FEATURES = [
  {
    num: "01",
    title: "Goal Tracking",
    description: "Set ambitious goals and break them down into actionable steps with smart progress tracking.",
    stack: "PRODUCTIVITY / HABITS"
  },
  {
    num: "02",
    title: "Analytics Dashboard",
    description: "Visualize your growth with beautiful charts and insights that keep you motivated.",
    stack: "DATA / CHARTS"
  },
  {
    num: "03",
    title: "Habit Building",
    description: "Build lasting habits with streaks, reminders, and personalized coaching.",
    stack: "AI / COACHING"
  },
];

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* 3D Particle Sphere Background */}
      <GradientBackground />

      <Header />

      <main className="relative z-10 w-full min-h-screen">
        
        {/* Hero Section */}
        <div className="flex flex-col justify-center min-h-[90vh] px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto w-full pt-32 relative">
            
            {/* Top labels */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="flex justify-between items-end border-b border-border pb-6 mb-8 uppercase text-xs tracking-widest text-foreground/50 font-space"
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> AVAILABLE Q3 '26</span>
                <span className="hidden md:inline">PERSONAL DEVELOPMENT STUDIO — EST. 2026</span>
              </div>
              <div className="hidden md:block">SCROLL / WHEEL</div>
            </motion.div>

            {/* Giant Typograhpy */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative z-10"
            >
              <h1 className="font-monument text-[12vw] md:text-[10vw] leading-[0.85] tracking-tighter uppercase">
                RRise
                <br />
                <span className="text-foreground/40 italic font-clash font-light text-[10vw] md:text-[8vw] tracking-normal">Studio.</span>
              </h1>
            </motion.div>

            {/* Subtext and CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-end"
            >
              <p className="font-inter text-lg md:text-xl text-foreground/70 max-w-md leading-relaxed">
                We build personal development hubs, clean goal trackers, and visual analytics that actually stand out. <span className="bg-white/10 px-1">Built for doers</span>, zero corporate fluff.
              </p>
              <div className="flex gap-4 md:justify-end">
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-white text-black font-space px-8 py-4 text-sm tracking-widest uppercase hover:bg-primary hover:text-black transition-colors"
                >
                  Start for free →
                </button>
                <Link href="/features" className="border border-border text-foreground font-space px-8 py-4 text-sm tracking-widest uppercase hover:bg-white/10 transition-colors">
                  Features
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-24 pb-12 flex flex-wrap gap-16 border-b border-border"
            >
              <div>
                <div className="font-monument text-4xl mb-2">10K+</div>
                <div className="text-foreground/40 font-space text-xs tracking-widest">USERS</div>
              </div>
              <div>
                <div className="font-monument text-4xl mb-2">TOP 10</div>
                <div className="text-foreground/40 font-space text-xs tracking-widest">PRODUCT OF DAY</div>
              </div>
              <div>
                <div className="font-monument text-4xl mb-2">Since 2026</div>
                <div className="text-foreground/40 font-space text-xs tracking-widest">SHIPPING NON-STOP</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee Break */}
        <div className="py-20">
          <Marquee />
        </div>

        {/* Features List Section (AceZen style works list) */}
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-24 pb-32">
          <h2 className="font-monument text-5xl md:text-7xl mb-16 tracking-tight">Features.</h2>
          
          <div className="flex flex-col">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative border-t border-border py-12 md:py-16 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center gap-8 cursor-pointer"
              >
                <div className="text-primary font-space text-sm tracking-widest md:w-16 shrink-0">{feature.num}</div>
                <div className="flex-1">
                  <h3 className="font-monument text-3xl md:text-5xl mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <div className="text-foreground/50 font-space text-xs tracking-widest uppercase">{feature.stack}</div>
                </div>
                <div className="md:w-1/3 text-foreground/60 font-inter leading-relaxed">
                  {feature.description}
                </div>
                
                {/* Hover circle indicator */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-primary/30 items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-border w-full"></div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
