"use client";

import { useRef, type MouseEvent } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ScrambleIn } from "./ScrambleText";
import { VIDEOS } from "./videos";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

const ease: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

export function Hero({ entranceComplete }: { entranceComplete: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastX = useRef<number | null>(null);
  const seeking = useRef(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration || seeking.current) return;
    if (lastX.current === null) {
      lastX.current = e.clientX;
      return;
    }
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    if (Math.abs(dx) < 1) return;
    const next = video.currentTime + dx * 0.012;
    seeking.current = true;
    video.currentTime = Math.max(0, Math.min(video.duration - 0.05, next));
  };

  const handleSeeked = () => {
    seeking.current = false;
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative h-screen h-[100dvh] select-none overflow-hidden"
    >
      {/* Mouse-scrubbed hero video (NOT autoplay) */}
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

      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0" />

      {/* 3D particle constellation */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Anton SC background watermark */}
      <div className="synapsex-watermark pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="translate-y-[50px] text-[clamp(120px,30vw,521px)] leading-none">
          TRANSCENDENCE
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-8">
        <div className="flex-1" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[clamp(40px,10vw,100px)] font-light leading-[0.95] tracking-[-0.03em] text-white">
              <span className="block">
                <ScrambleIn text="Brain" triggered={entranceComplete} delay={200} />
              </span>
              <span className="block">
                <ScrambleIn text="And Body" triggered={entranceComplete} delay={500} />
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
              className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-[15px]"
            >
              Built at the intersection of neuroscience and artificial
              intelligence. SynapseX continuously maps neural pathways, cognitive
              load, and physiological states into a single adaptive intelligence
              layer.
            </motion.p>
          </div>
          <h1 className="text-left text-[clamp(40px,10vw,100px)] font-light leading-[0.95] tracking-[-0.03em] text-white md:text-right">
            <span className="block">
              <ScrambleIn text="One" triggered={entranceComplete} delay={700} />
            </span>
            <span className="block">
              <ScrambleIn text="Network" triggered={entranceComplete} delay={1000} />
            </span>
          </h1>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entranceComplete ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/35"
        >
          <span className="relative block h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-[#8052ff]"
              animate={{ y: [0, 40] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />
          </span>
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
