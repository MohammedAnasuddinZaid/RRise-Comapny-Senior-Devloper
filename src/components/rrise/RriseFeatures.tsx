"use client";

import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { VIDEOS } from "../synapsex/videos";
import { SectionVideo } from "../ui/SectionVideo";

const FEATURES = [
  {
    num: "01",
    title: "Goal Tracking",
    stack: "PRODUCTIVITY / HABITS",
    description:
      "Set ambitious goals and break them down into actionable steps with smart progress tracking.",
  },
  {
    num: "02",
    title: "Analytics Dashboard",
    stack: "DATA / CHARTS",
    description:
      "Visualize your growth with beautiful charts and insights that keep you motivated.",
  },
  {
    num: "03",
    title: "Habit Building",
    stack: "AI / COACHING",
    description:
      "Build lasting habits with streaks, reminders, and personalized coaching.",
  },
];

function TiltRow({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [4.5, -4.5]), { stiffness: 120, damping: 18 });
  const rotY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 120, damping: 18 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 46, rotateX: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1], delay: index * 0.12 }}
      style={{ perspective: 1000 }}
      className="relative"
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="feature-row"
      >
        <motion.div
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10 py-12 md:py-16"
        >
          {/* Ghost number */}
          <div
            className="text-ghost rrise-title pointer-events-none absolute right-0 -top-6 text-[clamp(90px,18vw,220px)] opacity-60 select-none"
            style={{ transform: "translateZ(20px)" }}
          >
            {feature.num}
          </div>

          <div
            className="rrise-title text-lg text-[#b9a2ff] shrink-0 md:w-20 font-mono-space uppercase tracking-widest"
            style={{ transform: "translateZ(40px)" }}
          >
            {feature.num}
          </div>

          <div className="flex-1 relative">
            <h3
              className="rrise-title text-[clamp(30px,5.5vw,64px)] text-white transition-colors duration-300"
              style={{ transform: "translateZ(50px)" }}
            >
              {feature.title}
            </h3>
            <div
              className="mt-3 text-[11px] tracking-[0.24em] uppercase text-white/35 font-mono-space"
              style={{ transform: "translateZ(30px)" }}
            >
              {feature.stack}
            </div>
          </div>

          <div
            className="md:w-1/3 text-[13px] sm:text-[15px] leading-relaxed text-white/60 font-mono-space"
            style={{ transform: "translateZ(45px)" }}
          >
            {feature.description}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function RriseFeatures() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      {/* Video #3 backdrop */}
      <SectionVideo
        src={VIDEOS.metrics}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/78" />
      <div className="absolute inset-x-0 top-0 h-40 mask-fade-top" />
      <div className="absolute inset-x-0 bottom-0 h-40 mask-fade-bottom" />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
          className="rrise-title rrise-title-shadow text-[clamp(48px,9vw,120px)] text-white mb-10 md:mb-16"
        >
          Features<span className="saffron-glow-text">.</span>
        </motion.h2>

        <div className="flex flex-col">
          {FEATURES.map((feature, i) => (
            <TiltRow key={feature.num} feature={feature} index={i} />
          ))}
          <div className="w-full border-t" style={{ borderColor: "rgba(255,255,255,0.09)" }} />
        </div>
      </div>
    </section>
  );
}
