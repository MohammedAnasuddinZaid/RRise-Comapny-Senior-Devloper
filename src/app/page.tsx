"use client";

import Link from "next/link";
import { Button } from "../components/ui/Button";
import { LottieAnimation } from "../components/ui/LottieAnimation";
import greenParrot from "../../public/lottie/green_parrot.json";
import { motion } from "framer-motion";
import { Sparkles, Zap, RefreshCw } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-foreground relative overflow-hidden font-lora">
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/3 rounded-full blur-[130px] pointer-events-none" />

      <header className="flex items-center justify-between p-6 md:px-12 backdrop-blur-xl bg-black/30 border-b border-white/5 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <img 
            src="/images/RRISE NEW LOGO.png" 
            alt="RRise Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-all duration-300">Features</a>
          <a href="#method" className="hover:text-primary transition-all duration-300">Method</a>
          <a href="#pricing" className="hover:text-primary transition-all duration-300">Pricing</a>
        </nav>
        <div>
          <Link href="/app">
            <Button variant="glass" className="hidden md:flex border-white/5 hover:border-primary/30">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Green Parrot Welcome Mascot */}
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="relative w-28 h-28 mx-auto mb-4 drop-shadow-[0_0_25px_rgba(34,197,94,0.2)]"
          >
            <LottieAnimation animationData={greenParrot} loop={true} className="w-full h-full" />
            <div className="absolute -bottom-2 -right-2 bg-primary/20 border border-primary/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-sans text-primary font-bold uppercase tracking-wider">
              Mascot v2
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              The Productivity Operating System
            </div>
            
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.08] pb-1">
              Master your life.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                Elevate your potential.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              A premium, emotionally engaging personal development workspace. Track habits, monitor spending, level up your mascot, and build unbreakable streaks.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/app" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-[0_0_40px_rgba(194,159,109,0.25)] hover:shadow-[0_0_60px_rgba(194,159,109,0.45)] transition-all duration-500 rounded-2xl h-14 px-10 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <a href="#tour" className="w-full sm:w-auto">
              <Button size="lg" variant="glass" className="w-full sm:w-auto h-14 px-10 text-lg border-white/10 hover:border-primary/20 rounded-2xl">
                Take the Tour
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Premium Preview Cards Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-28 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
          id="tour"
        >
          <div className="relative group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl transition-all duration-500 text-left space-y-4">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
            <Sparkles className="w-8 h-8 text-primary" />
            <h3 className="font-playfair text-xl font-bold">Smart Command Center</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Start with a conversational entry point inspired by ChatGPT to outline your goals, template your day, and generate personalized layouts.
            </p>
          </div>

          <div className="relative group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl transition-all duration-500 text-left space-y-4">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
            <RefreshCw className="w-8 h-8 text-primary" />
            <h3 className="font-playfair text-xl font-bold">The Evolving Mascot</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Your personal accountability companion. Watch your companion grow, react, and level up as you complete habits and secure daily streaks.
            </p>
          </div>

          <div className="relative group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl transition-all duration-500 text-left space-y-4">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
            <Zap className="w-8 h-8 text-primary" />
            <h3 className="font-playfair text-xl font-bold">Premium OS Dashboard</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              A high-fidelity cockpit to monitor habits, log tasks, track daily mood and reflections, analyze spending, and review weekly recaps.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
