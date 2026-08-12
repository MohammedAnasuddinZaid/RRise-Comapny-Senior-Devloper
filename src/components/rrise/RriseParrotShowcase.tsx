"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { VIDEOS } from "../synapsex/videos";
import { SectionVideo } from "../ui/SectionVideo";

const RriseParrot = dynamic(() => import("./RriseParrot"), { ssr: false });

const TIERS = [
  { img: "/mascots/parrot/level-1-closed.webp", hover: "/mascots/parrot/level-1-open.webp", label: "01" },
  { img: "/mascots/parrot/level-2-closed.webp", hover: "/mascots/parrot/level-2-open.webp", label: "02" },
  { img: "/mascots/parrot/level-3-closed.webp", hover: "/mascots/parrot/level-3-open.webp", label: "03" },
  { img: "/mascots/parrot/level-4-closed.webp", hover: "/mascots/parrot/level-4-open.webp", label: "04" },
];

function TierChip({ tier, index }: { tier: (typeof TIERS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      style={{ perspective: 700 }}
      className="tier-chip group relative"
    >
      <div className="border-beam p-3 group-hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 0.8}s` }}>
        <div className="relative overflow-hidden rounded-2xl bg-black/60">
          <img
            src={tier.img}
            alt={`Evolution tier ${tier.label}`}
            className="w-full aspect-square object-cover transition-opacity duration-300 group-hover:opacity-0"
            loading="lazy"
          />
          <img
            src={tier.hover}
            alt={`Evolution tier ${tier.label} evolved`}
            className="absolute inset-0 w-full aspect-square object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            loading="lazy"
          />
          <div
            className="absolute bottom-2 left-2 rounded-full px-3 py-1 text-[10px] tracking-[0.3em] font-mono-space text-white/80"
            style={{ background: "rgba(128,82,255,0.35)", border: "1px solid rgba(128,82,255,0.5)", backdropFilter: "blur(6px)" }}
          >
            TIER {tier.label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function RriseParrotShowcase() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      {/* Video #4 backdrop */}
      <SectionVideo
        src={VIDEOS.adaptive}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-x-0 top-0 h-40 mask-fade-top" />
      <div className="absolute inset-x-0 bottom-0 h-40 mask-fade-bottom" />
      <div className="grain-overlay" />
      <div className="scanline" />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* 3D parrot stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative flex items-center justify-center scale-[0.72] sm:scale-90 lg:scale-100"
          >
            {/* Glow + rings */}
            <div className="absolute w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(128,82,255,0.35) 0%, transparent 70%)", filter: "blur(20px)" }} />
            <div className="pulse-ring absolute w-[300px] h-[300px] rounded-full border" style={{ borderColor: "rgba(128,82,255,0.35)" }} />
            <div className="pulse-ring absolute w-[300px] h-[300px] rounded-full border" style={{ borderColor: "rgba(255,184,41,0.3)", animationDelay: "-1.3s" }} />
            <div className="orbit-ring absolute w-[380px] h-[380px] rounded-full border border-dashed" style={{ borderColor: "rgba(255,184,41,0.25)" }} />
            <RriseParrot size={380} followCursor />

            {/* Floating badges */}
            <div className="pill-glass absolute -top-2 left-2 rounded-full px-4 py-2 text-[10px] tracking-[0.24em] text-white/70 font-mono-space uppercase void-float">
              Cursor Glide Active
            </div>
            <div className="pill-glass absolute bottom-6 right-0 rounded-full px-4 py-2 text-[10px] tracking-[0.24em] text-white/70 font-mono-space uppercase void-float" style={{ animationDelay: "-3s" }}>
              Follows Your Cursor
            </div>
          </motion.div>

          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
              className="eyebrow-saffron mb-6"
            >
              Mascot Evolution
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
              className="rrise-title rrise-title-shadow text-[clamp(34px,6vw,72px)] text-white mb-8"
            >
              Your parrot companion grows as you do , visible proof that
              your consistency is paying off.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1], delay: 0.25 }}
              className="text-[13px] sm:text-[15px] leading-relaxed text-white/55 font-mono-space max-w-xl mb-10"
            >
              Four evolution tiers. The longer your streak, the more powerful and
              vibrant your companion becomes.
            </motion.p>

            {/* Tier chips */}
            <div className="grid grid-cols-4 gap-3 sm:gap-5 max-w-xl">
              {TIERS.map((tier, i) => (
                <TierChip key={tier.label} tier={tier} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
