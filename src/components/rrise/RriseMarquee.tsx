"use client";

import { motion } from "framer-motion";
import { VIDEOS } from "../synapsex/videos";
import { SectionVideo } from "../ui/SectionVideo";

const WORDS = ["Goal Tracking", "Habit Building", "Analytics Dashboard", "Next.js & React"];

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = Array.from({ length: 3 });
  return (
    <div className="overflow-hidden w-full">
      <div className={`marquee-track ${reverse ? "rev" : "fwd"} items-center gap-10 py-1`}>
        {items.map((_, block) => (
          <div key={block} className="flex items-center gap-10 shrink-0">
            {WORDS.map((word, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="marquee-word text-[clamp(40px,7vw,110px)] leading-none whitespace-nowrap">
                  {word}
                </span>
                <span className="marquee-star text-[clamp(18px,3vw,40px)]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RriseMarquee() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      {/* Video #2 backdrop */}
      <SectionVideo
        src={VIDEOS.cinematic}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-x-0 top-0 h-40 mask-fade-top" />
      <div className="absolute inset-x-0 bottom-0 h-40 mask-fade-bottom" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative z-10 flex flex-col gap-4"
      >
        <Row />
        <Row reverse />
      </motion.div>
    </section>
  );
}
