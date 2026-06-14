"use client";

import Link from "next/link";
import { Button } from "../components/ui/Button";
import { LottieAnimation } from "../components/ui/LottieAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { audioManager } from "../lib/audioManager";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

// Lottie imports
import manWithRobot from "../../public/lottie/ManWithRobotDoingWork.json";
import manManagingFinances from "../../public/lottie/ManMangingFinances.json";
import happyParrot from "../../public/lottie/happy_parrot_with_blue_hat.json";

function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

function BeamButton({ children, className, onClick, ...props }: any) {
  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-primary/40 blur-2xl rounded-2xl"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-2xl"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
      <Button
        className={`relative z-10 bg-gradient-to-r from-primary/80 to-primary/60 hover:from-primary hover:to-primary/80 backdrop-blur-xl border border-primary/30 ${className}`}
        onClick={() => {
          audioManager.play('click');
          if (onClick) onClick();
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

function Particle({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-primary rounded-full"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        opacity: 0,
      }}
      animate={{
        y: -10,
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        left: `${Math.random() * 100}%`,
      }}
    />
  );
}

function GlassmorphicBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.15)] transition-all duration-500 ${className}`}
      whileHover={{ y: -5 }}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function TestimonialCard({ name, text, role }: { name: string; text: string; role: string }) {
  return (
    <motion.div
      className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl border border-white/10 cursor-pointer"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        rotateY: 5,
        rotateX: 5,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(34,197,94,0.2)",
      }}
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <p className="text-lg text-foreground/90 font-light leading-relaxed mb-6 italic">"{text}"</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">{name[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [particles, setParticles] = useState<number[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      text: "Rise completely transformed how I approach my daily goals. The mascot evolution feature keeps me motivated every single day.",
      role: "Product Designer"
    },
    {
      name: "Marcus Johnson",
      text: "The finance tracking alone is worth it. I've saved more in 3 months than I did all last year. The AI insights are incredible.",
      role: "Entrepreneur"
    },
    {
      name: "Emily Rodriguez",
      text: "I've tried every productivity app out there. Rise is the only one that actually made me stick to my habits. Game changer!",
      role: "Software Engineer"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const particleCount = 50;
    setParticles(Array.from({ length: particleCount }, (_, i) => i));
  }, []);

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-[#030303]' : 'bg-white'} text-foreground relative overflow-hidden font-lora`}>
      {/* Dynamic Background with Green Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((i) => (
          <Particle key={i} delay={i * 0.1} />
        ))}
      </div>

      {/* Premium Ambient Background Glows */}
      <div className={`absolute top-[-20%] left-[30%] w-[600px] h-[600px] ${theme === 'dark' ? 'bg-primary/5' : 'bg-primary/10'} rounded-full blur-[150px] pointer-events-none`} />
      <div className={`absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] ${theme === 'dark' ? 'bg-primary/3' : 'bg-primary/5'} rounded-full blur-[130px] pointer-events-none`} />

      <header className={`flex items-center justify-between p-6 md:px-12 backdrop-blur-xl ${theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-white/70 border-green-500/20'} border-b fixed top-0 w-full z-40`}>
        <div className="flex items-center gap-3">
          <img 
            src="/images/RRISE NEW LOGO.png" 
            alt="RRise Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-all duration-300">Features</a>
          <a href="#testimonials" className="hover:text-primary transition-all duration-300">Testimonials</a>
          <a href="#pricing" className="hover:text-primary transition-all duration-300">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              audioManager.play('click');
              toggleTheme();
            }}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-primary/30' : 'bg-green-500/10 border-green-500/30 hover:border-green-500'} transition-all duration-300`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
          <Link href="/app">
            <Button variant="glass" className={`hidden md:flex ${theme === 'dark' ? 'border-white/5 hover:border-primary/30' : 'border-green-500/30 hover:border-green-500'}`}>Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.08] pb-1">
              <TypingText text="RRISE" className="font-cursive" />
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
            <Link href="/app" className="w-full sm:w-auto" onClick={() => audioManager.play('parrot_one_word')}>
              <BeamButton size="lg" className="w-full sm:w-auto shadow-[0_0_40px_rgba(194,159,109,0.25)] hover:shadow-[0_0_60px_rgba(194,159,109,0.45)] transition-all duration-500 rounded-2xl h-14 px-10 text-lg">
                Start Your Journey
              </BeamButton>
            </Link>
            <a href="#tour" className="w-full sm:w-auto">
              <BeamButton size="lg" variant="glass" className="w-full sm:w-auto h-14 px-10 text-lg border-white/10 hover:border-primary/20 rounded-2xl">
                Take the Tour
              </BeamButton>
            </a>
          </motion.div>
        </div>

        {/* Glassmorphic Feature Sections */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-28 w-full max-w-6xl space-y-8 px-4"
          id="features"
        >
          {/* Why Choose Rise Section */}
          <GlassmorphicBox className="flex flex-col md:flex-row items-center gap-12 p-8 md:p-12">
            <div className="flex-1 text-left space-y-6">
              <h3 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">Why Choose Rise Operating System?</h3>
              <p className="text-muted-foreground font-light leading-relaxed text-lg">
                Rise is not just another productivity app—it's a comprehensive operating system for personal growth. With AI-powered habit tracking, intelligent finance management, and an evolving mascot companion, Rise transforms your daily routines into engaging progress journeys. Experience the future of personal development.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LottieAnimation animationData={manWithRobot} loop={true} className="w-full max-w-md h-auto" />
            </div>
          </GlassmorphicBox>

          {/* Finance Section */}
          <GlassmorphicBox className="flex flex-col md:flex-row-reverse items-center gap-12 p-8 md:p-12">
            <div className="flex-1 text-left space-y-6">
              <h3 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">Smart Finance Management</h3>
              <p className="text-muted-foreground font-light leading-relaxed text-lg">
                Take control of your finances with Rise's intelligent tracking system. Monitor spending, set budgets, and receive personalized insights—all at an affordable price point. Choose from flexible tier plans that fit your needs and watch your financial health improve alongside your personal growth.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LottieAnimation animationData={manManagingFinances} loop={true} className="w-full max-w-md h-auto" />
            </div>
          </GlassmorphicBox>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-28 w-full max-w-4xl px-4"
          id="testimonials"
        >
          <h2 className="font-playfair text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="relative">
            <button
              onClick={() => {
                audioManager.play('click');
                prevTestimonial();
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <AnimatePresence mode="wait">
              <TestimonialCard
                key={currentTestimonial}
                name={testimonials[currentTestimonial].name}
                text={testimonials[currentTestimonial].text}
                role={testimonials[currentTestimonial].role}
              />
            </AnimatePresence>
            
            <button
              onClick={() => {
                audioManager.play('click');
                nextTestimonial();
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  audioManager.play('click');
                  setCurrentTestimonial(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-primary w-6' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-28 w-full max-w-6xl px-4"
          id="pricing"
        >
          <h2 className="font-playfair text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <GlassmorphicBox className="text-left space-y-6">
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
              <BeamButton className="w-full" variant="glass">
                Get Started Free
              </BeamButton>
            </GlassmorphicBox>

            {/* Individual Premium Plan */}
            <GlassmorphicBox className="text-left space-y-6 border-primary/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="relative">
                <LottieAnimation animationData={happyParrot} loop={true} className="w-20 h-20 mx-auto mb-4" />
              </div>
              <div>
                <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">Individual Premium</h3>
                <p className="text-4xl font-bold text-primary">$20<span className="text-lg text-muted-foreground font-normal">/month</span></p>
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
              <BeamButton className="w-full">
                Upgrade to Premium
              </BeamButton>
            </GlassmorphicBox>

            {/* Third Tier Plan */}
            <GlassmorphicBox className="text-left space-y-6">
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
              <BeamButton className="w-full" variant="glass">
                Contact Sales
              </BeamButton>
            </GlassmorphicBox>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
