"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { RrisePageShell } from "../../components/rrise/RrisePageShell";
import { LottieAnimation } from "../../components/ui/LottieAnimation";
import manWithRobot from "../../../public/lottie/ManWithRobotDoingWork.json";
import manManagingFinances from "../../../public/lottie/ManMangingFinances.json";

const FEATURES = [
  {
    icon: "01",
    title: "Goals & Habits",
    desc: "Set meaningful goals and build habits that actually stick , with daily streaks and accountability loops.",
    back: "Track completion rates, streak history, and see your improvement curve over time with rich, beautiful charts.",
    accentClass: "text-primary",
    borderHover: "hover:border-primary/30",
  },
  {
    icon: "02",
    title: "Alex: AI Companion",
    desc: "Your always-on AI coach that helps you reflect, plan, and push through when motivation fades.",
    back: "Alex uses your personal data to give tailored insights, spot patterns, and suggest exactly when to push harder.",
    accentClass: "text-foreground",
    borderHover: "hover:border-border",
  },
  {
    icon: "03",
    title: "Smart Analytics",
    desc: "Beautiful dashboards that show you exactly where your time, energy, and money are going.",
    back: "Weekly and monthly breakdowns with AI-powered pattern detection. Know yourself better than ever before.",
    accentClass: "text-primary",
    borderHover: "hover:border-primary/30",
  },
  {
    icon: "04",
    title: "Finance Tracking",
    desc: "Monitor spending, set budgets, and receive AI-powered insights to build financial discipline.",
    back: "Link categories, set limits, and watch Alex flag patterns that are silently draining your future.",
    accentClass: "text-foreground",
    borderHover: "hover:border-border",
  },
  {
    icon: "05",
    title: "Streaks",
    desc: "Streaks make consistency addictive. Build unbreakable habits with visual progress tracking.",
    back: "Visual streak counters, recovery mechanics, and a mascot that evolves as you level up.",
    accentClass: "text-primary",
    borderHover: "hover:border-primary/30",
  },
  {
    icon: "06",
    title: "Mascot Evolution",
    desc: "Your parrot companion grows as you do , visible proof that your consistency is paying off.",
    back: "Four evolution tiers. The longer your streak, the more powerful and vibrant your companion becomes.",
    accentClass: "text-foreground",
    borderHover: "hover:border-border",
  },
];

function FeatureFlipCard({
  icon, title, desc, back, accentClass, borderHover, index,
}: (typeof FEATURES)[0] & { index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ perspective: "1200px", height: "300px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
      className="cursor-pointer relative"
    >
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
        {/* FRONT */}
        <div
          className={`absolute inset-0 bg-surface backdrop-blur-md border border-border ${borderHover} transition-all duration-300 p-8 flex flex-col justify-between`}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div>
            <div className="font-space text-xs tracking-widest text-foreground/50 mb-6">{icon}</div>
            <h3 className="font-monument text-xl md:text-2xl text-foreground mb-4 leading-tight">{title}</h3>
            <p className="font-inter text-sm text-foreground/60 leading-relaxed">{desc}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <p className="text-[10px] font-space uppercase tracking-widest text-foreground/40">
              Flip for details
            </p>
          </div>
        </div>

        {/* BACK */}
        <div
          className={`absolute inset-0 bg-primary/10 backdrop-blur-md border border-primary/20 p-8 flex flex-col justify-center`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative z-10">
            <div className="font-monument text-4xl mb-4 text-primary opacity-50">{icon}</div>
            <p className="font-inter text-sm text-foreground/90 leading-relaxed">{back}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturesPage() {
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
            <span className="eyebrow-dot"></span> Features Overview
          </div>
          <h1 className="rrise-title rrise-title-shadow text-[clamp(48px,12vw,160px)] text-white">
            Unstoppable
            <br />
            <span className="saffron-gradient-text italic font-mono-space text-[clamp(30px,7vw,90px)] tracking-normal">System.</span>
          </h1>
        </motion.div>

        {/* Grid of features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {FEATURES.map((f, i) => (
            <FeatureFlipCard key={f.title} {...f} index={i} />
          ))}
        </div>

        {/* Blocks */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-12 p-8 md:p-16 bg-surface backdrop-blur-md border border-border hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex-1 text-left space-y-6">
              <div className="text-xs font-space text-primary uppercase tracking-widest border border-primary/20 px-4 py-2 inline-block">
                Core System
              </div>
              <h2 className="font-monument text-3xl md:text-5xl text-foreground leading-tight">
                Your Growth <br/> Operating System
              </h2>
              <p className="font-inter text-foreground/60 leading-relaxed text-lg">
                RRise isn't just another productivity app. It's a comprehensive operating system for personal growth. AI-powered habit tracking, intelligent finance management, and an evolving mascot companion.
              </p>
              <ul className="space-y-4 mt-8">
                {["Daily habit loops", "AI weekly reviews", "Goal decomposition", "Personalised push"].map(item => (
                  <li key={item} className="flex items-center gap-4 text-sm font-space tracking-widest uppercase text-foreground/80">
                    <span className="w-1.5 h-1.5 bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 border border-border bg-surface">
              <LottieAnimation animationData={manWithRobot} loop={true} className="w-full max-w-sm h-auto opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row-reverse items-center gap-12 p-8 md:p-16 bg-surface backdrop-blur-md border border-border hover:border-border transition-all duration-300"
          >
            <div className="flex-1 text-left space-y-6">
              <div className="text-xs font-space text-foreground uppercase tracking-widest border border-border px-4 py-2 inline-block">
                Finance Module
              </div>
              <h2 className="font-monument text-3xl md:text-5xl text-foreground leading-tight">
                Smart Finance. <br/> Real Results.
              </h2>
              <p className="font-inter text-foreground/60 leading-relaxed text-lg">
                Take control of your finances with RRise's intelligent tracking system. Monitor spending, set budgets, and receive personalised insights, watch your financial health improve alongside your personal growth.
              </p>
              <ul className="space-y-4 mt-8">
                {["Category breakdowns", "AI alerts on overspending", "Budget goal setting", "Financial health score"].map(item => (
                  <li key={item} className="flex items-center gap-4 text-sm font-space tracking-widest uppercase text-foreground/80">
                    <span className="w-1.5 h-1.5 bg-white" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 border border-border bg-surface">
              <LottieAnimation animationData={manManagingFinances} loop={true} className="w-full max-w-sm h-auto opacity-80" />
            </div>
          </motion.div>
        </div>
      </main>
    </RrisePageShell>
  );
}
