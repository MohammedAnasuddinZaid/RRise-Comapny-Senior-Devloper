"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { VideoBackdrop } from "./VideoBackdrop";
import { VIDEOS } from "./videos";

const AdaptiveNodes = dynamic(() => import("./AdaptiveNodes"), { ssr: false });

const ITEMS = [
  {
    title: "Cortical Mapping",
    desc: "Real-time spatial reconstruction of active neural regions.",
  },
  {
    title: "Signal Isolation",
    desc: "Separates cognitive intent from biological noise.",
  },
  {
    title: "State Prediction",
    desc: "Anticipates cognitive transitions before they occur.",
  },
  {
    title: "Loop Feedback",
    desc: "Closed-loop adjustment based on outcome correlation.",
  },
];

export function AdaptiveSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden px-8 py-12 sm:px-12 sm:py-16 md:px-16">
      <VideoBackdrop src={VIDEOS.adaptive} />
      <div className="mask-fade-top absolute inset-x-0 top-0 z-10 h-[180px]" />
      <div className="mask-fade-bottom absolute inset-x-0 bottom-0 z-10 h-[180px]" />

      {/* 3D wireframe nodes overlay */}
      <div className="absolute inset-0 z-10">
        <AdaptiveNodes />
      </div>

      {/* Top layout */}
      <div className="relative z-20 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0 }}
          className="text-[clamp(36px,8vw,72px)] font-light leading-[0.95] tracking-[-0.03em] text-white"
        >
          Adaptive
          <br />
          Intelligence
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="max-w-xs text-[13px] font-light leading-relaxed text-[#bdbdbd] sm:text-[15px] md:pt-2 md:text-right"
        >
          The system learns your neural baseline within 72 hours. From there,
          every cognitive state is mapped, predicted, and optimized in real
          time.
        </motion.p>
      </div>

      <div className="flex-1" />

      {/* Bottom interactive grid */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, delay: 0.3 }}
        className="relative z-20 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6"
      >
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
          >
            <div className="mb-2 text-[14px] font-normal text-white sm:text-[16px]">
              {item.title}
            </div>
            <div className="text-[12px] leading-relaxed text-white/40 sm:text-[14px]">
              {item.desc}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
