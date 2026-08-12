"use client";

import { useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ScrambleIn } from "../synapsex/ScrambleText";
import { VIDEOS } from "../synapsex/videos";
import { AuthModal } from "../auth/AuthModal";

const ParticleField = dynamic(() => import("../synapsex/ParticleField"), { ssr: false });

const ease: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

const STATS = [
  { value: "10K+", label: "USERS" },
  { value: "TOP 10", label: "PRODUCT OF DAY" },
  { value: "Since 2026", label: "SHIPPING NON-STOP" },
];

export function RriseHero({ entranceComplete }: { entranceComplete: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastX = useRef<number | null>(null);
  const seeking = useRef(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 3D parallax on the giant type
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 80, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 80, damping: 16 });

  const rafPending = useRef(false);
  const pendingDx = useRef(0);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);

    const video = videoRef.current;
    if (!video || !video.duration || seeking.current) return;
    if (lastX.current === null) {
      lastX.current = e.clientX;
      return;
    }
    pendingDx.current += e.clientX - lastX.current;
    lastX.current = e.clientX;

    // Throttle the expensive currentTime seeks to one per animation frame.
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        const v = videoRef.current;
        if (!v || !v.duration || Math.abs(pendingDx.current) < 1) {
          pendingDx.current = 0;
          return;
        }
        const next = v.currentTime + pendingDx.current * 0.012;
        pendingDx.current = 0;
        seeking.current = true;
        v.currentTime = Math.max(0, Math.min(v.duration - 0.05, next));
      });
    }
  };

  const handleSeeked = () => {
    seeking.current = false;
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative h-screen h-[100dvh] select-none overflow-hidden"
    >
      {/* Mouse-scrubbed hero video */}
      <video
        ref={videoRef}
        src={VIDEOS.hero}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
      />

      {/* Void + aurora overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      <div className="aurora-blob" style={{ width: 520, height: 520, background: "#8052ff", top: "-12%", left: "-8%" }} />
      <div className="aurora-blob" style={{ width: 420, height: 420, background: "#ffb829", bottom: "-10%", right: "-6%", animationDelay: "-8s" }} />

      {/* Dot grid */}
      <div className="dot-grid absolute inset-0" />

      {/* 3D particle constellation */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-4 pt-20 pb-6 sm:px-6 sm:pt-24 sm:pb-8 md:px-10">
        {/* Eyebrow row */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="flex items-center justify-between border-b pb-4"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-4">
            <span className="eyebrow-item">
              <span className="eyebrow-dot" /> Available Q3 &apos;26
            </span>
            <span className="eyebrow-item hidden md:flex">
              <span className="eyebrow-dot" style={{ background: "#ffb829", boxShadow: "0 0 12px #ffb829" }} />
              Personal Development Studio — Est. 2026
            </span>
          </div>
          <span className="eyebrow-item hidden sm:flex">Scroll / Wheel</span>
        </motion.div>

        {/* Giant type with 3D parallax */}
        <div className="flex-1" />
        <motion.div style={{ perspective: 900 }}>
          <motion.h1
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            className="rrise-title rrise-title-shadow relative"
          >
            <motion.span
              className="block text-[clamp(72px,20vw,320px)] iris-gradient-text"
              initial={{ opacity: 0, y: 60, rotateX: 40 }}
              animate={entranceComplete ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 1.1, ease, delay: 0.15 }}
              style={{ transformOrigin: "bottom" }}
            >
              <ScrambleIn text="RRise" triggered={entranceComplete} delay={150} />
            </motion.span>
            <motion.span
              className="block text-[clamp(34px,8vw,110px)] font-mono-space italic font-light tracking-[-0.02em] text-transparent"
              style={{
                backgroundImage: "linear-gradient(120deg,#ffffff 20%,#ffd47a 70%,#ffb829 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                transform: "translateZ(60px)",
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease, delay: 0.5 }}
            >
              Studio.
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Subtext + CTAs */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease, delay: 0.75 }}
            className="text-[13px] sm:text-[15px] leading-relaxed text-white/65 max-w-md font-mono-space"
          >
            We build personal development hubs, clean goal trackers, and visual
            analytics that actually stand out. <span className="text-[#b9a2ff]">Built for doers</span>,
            zero corporate fluff.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease, delay: 0.9 }}
            className="flex gap-4 md:justify-end flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAuthModalOpen(true)}
              className="pill-iris iris-sheen px-8 h-12 text-sm uppercase tracking-[0.14em] font-mono-space"
            >
              Start for free →
            </motion.button>
            <Link
              href="/features"
              className="pill-glass px-8 h-12 inline-flex items-center text-sm uppercase tracking-[0.14em] text-white/85 font-mono-space rounded-full"
            >
              Features
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entranceComplete ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.15 }}
          className="mt-14 pb-4 flex flex-wrap gap-x-16 gap-y-6 border-t pt-8"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="stat-flip" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              <div className="rrise-title text-[clamp(28px,5vw,56px)] text-white">{stat.value}</div>
              <div className="mt-2 text-[10px] tracking-[0.3em] text-white/40 font-mono-space uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entranceComplete ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.7 }}
          className="mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/35"
        >
          <span className="relative block h-10 w-px overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="scroll-hint-dot absolute left-0 top-0 h-4 w-px" style={{ background: "#8052ff" }} />
          </span>
          Scroll
        </motion.div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  );
}
