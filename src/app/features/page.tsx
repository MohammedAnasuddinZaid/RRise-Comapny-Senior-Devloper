"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Header } from "../../components/layout/Header";
import { LottieAnimation } from "../../components/ui/LottieAnimation";
import manWithRobot from "../../../public/lottie/ManWithRobotDoingWork.json";
import manManagingFinances from "../../../public/lottie/ManMangingFinances.json";

const FEATURES = [
  {
    icon: "target",
    title: "Goals & Habits",
    desc: "Set meaningful goals and build habits that actually stick — with daily streaks and accountability loops.",
    back: "Track completion rates, streak history, and see your improvement curve over time with rich, beautiful charts.",
    accentClass: "text-primary",
    borderHover: "hover:border-primary/30",
    glowColor: "rgba(0,255,135,0.18)",
  },
  {
    icon: "bot",
    title: "Alex — AI Companion",
    desc: "Your always-on AI coach that helps you reflect, plan, and push through when motivation fades.",
    back: "Alex uses your personal data to give tailored insights, spot patterns, and suggest exactly when to push harder.",
    accentClass: "text-secondary",
    borderHover: "hover:border-secondary/30",
    glowColor: "rgba(0,229,255,0.18)",
  },
  {
    icon: "chart",
    title: "Smart Analytics",
    desc: "Beautiful dashboards that show you exactly where your time, energy, and money are going.",
    back: "Weekly and monthly breakdowns with AI-powered pattern detection. Know yourself better than ever before.",
    accentClass: "text-primary",
    borderHover: "hover:border-primary/30",
    glowColor: "rgba(0,255,135,0.14)",
  },
  {
    icon: "wallet",
    title: "Finance Tracking",
    desc: "Monitor spending, set budgets, and receive AI-powered insights to build financial discipline.",
    back: "Link categories, set limits, and watch Alex flag patterns that are silently draining your future.",
    accentClass: "text-secondary",
    borderHover: "hover:border-secondary/30",
    glowColor: "rgba(0,229,255,0.14)",
  },
  {
    icon: "flame",
    title: "Streaks & Daily Loop",
    desc: "The Daily Loop keeps your routine non-negotiable. Streaks make consistency addictive.",
    back: "Visual streak counters, recovery mechanics, and a mascot that evolves as you level up.",
    accentClass: "text-primary",
    borderHover: "hover:border-primary/30",
    glowColor: "rgba(0,255,135,0.12)",
  },
  {
    icon: "sparkles",
    title: "Mascot Evolution",
    desc: "Your parrot companion grows as you do — visible proof that your consistency is paying off.",
    back: "Four evolution tiers. The longer your streak, the more powerful and vibrant your companion becomes.",
    accentClass: "text-secondary",
    borderHover: "hover:border-secondary/30",
    glowColor: "rgba(0,229,255,0.12)",
  },
];

function FeatureFlipCard({
  icon, title, desc, back, accentClass, borderHover, glowColor, index,
}: (typeof FEATURES)[0] & { index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ perspective: "1200px", height: "260px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
      className="cursor-pointer relative"
    >
      {/* The rotating inner container */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* ── FRONT ─────────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 glass border border-border ${borderHover} transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: flipped ? `0 20px 60px ${glowColor}` : `0 4px 20px rgba(0,0,0,0.2)`,
          }}
        >
          <div>
            <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{title.charAt(0)}</span>
            </div>
            <h3
              className={`font-clash text-lg font-semibold text-foreground mb-2`}
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              {title}
            </h3>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            <div className="w-1 h-1 rounded-full bg-primary/50" />
            <div className="w-1 h-1 rounded-full bg-primary/30" />
            <p className={`text-[10px] font-space uppercase tracking-widest ${accentClass} opacity-60`}>
              flip for more
            </p>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 glass border border-primary/20 rounded-3xl p-6 flex flex-col justify-center`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: `0 20px 60px ${glowColor}`,
          }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 rounded-3xl opacity-40 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 40%, ${glowColor} 0%, transparent 70%)`,
            }}
          />
          <div className="relative z-10">
            <span className="text-3xl mb-4 block">{icon}</span>
            <p className="font-inter text-sm text-foreground/90 leading-relaxed">{back}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient — dark only */}
      <div className="dark:block hidden absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/4 blur-[180px] pointer-events-none" />
      <div className="dark:block hidden absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-secondary/4 blur-[140px] pointer-events-none" />

      <Header />

      <main className="relative z-10 px-6 md:px-12 pt-32 pb-24 max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/20 text-xs font-space text-secondary tracking-widest uppercase mb-6">
            Everything you need
          </div>
          <h1
            className="font-clash text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Built to make you{" "}
            <span className="gradient-text">unstoppable</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-inter text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-20"
        >
          Every feature in RRise is designed around one obsession: helping you bridge the gap between knowing and doing.
        </motion.p>

        {/* Hint label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs font-space text-muted-foreground/60 uppercase tracking-widest mb-8"
        >
          hover or tap cards to flip them
        </motion.p>

        {/* Flip Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
          {FEATURES.map((f, i) => (
            <FeatureFlipCard key={f.title} {...f} index={i} />
          ))}
        </div>

        {/* Deep dive blocks */}
        <div className="space-y-8">
          {/* Block 1 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-12 p-8 md:p-12 rounded-3xl glass border border-border hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex-1 text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs font-space text-primary uppercase tracking-widest">Core System</span>
              </div>
              <h2 className="font-clash text-3xl md:text-4xl font-semibold text-foreground"
                style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Your Personal Operating System for Growth
              </h2>
              <p className="font-inter text-muted-foreground leading-relaxed">
                RRise isn't just another productivity app — it's a comprehensive operating system for personal growth. AI-powered habit tracking, intelligent finance management, and an evolving mascot companion.
              </p>
              <ul className="space-y-2">
                {["Daily habit loops with streak protection", "AI-generated weekly reviews", "Goal decomposition engine", "Personalised push at exactly the right moment"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-inter text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LottieAnimation animationData={manWithRobot} loop={true} className="w-full max-w-sm h-auto" />
            </div>
          </motion.div>

          {/* Block 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row-reverse items-center gap-12 p-8 md:p-12 rounded-3xl glass border border-border hover:border-secondary/20 transition-all duration-300"
          >
            <div className="flex-1 text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                <span className="text-xs font-space text-secondary uppercase tracking-widest">Finance Module</span>
              </div>
              <h2 className="font-clash text-3xl md:text-4xl font-semibold text-foreground"
                style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Smart Finance. Real Results.
              </h2>
              <p className="font-inter text-muted-foreground leading-relaxed">
                Take control of your finances with RRise's intelligent tracking system. Monitor spending, set budgets, and receive personalised insights — watch your financial health improve alongside your personal growth.
              </p>
              <ul className="space-y-2">
                {["Category-based spending breakdowns", "AI alerts on overspending patterns", "Budget goal setting with progress tracking", "Monthly financial health score"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-inter text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LottieAnimation animationData={manManagingFinances} loop={true} className="w-full max-w-sm h-auto" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
