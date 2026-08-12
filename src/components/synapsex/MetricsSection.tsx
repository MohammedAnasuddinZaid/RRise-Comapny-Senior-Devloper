"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { VideoBackdrop } from "./VideoBackdrop";
import { VIDEOS } from "./videos";

const METRICS = [
  { value: "2.4ms", label: "Synaptic Latency" },
  { value: "99.7%", label: "Signal Accuracy" },
  { value: "140B", label: "Neural Parameters" },
];

function TiltValue({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 18, ry: px * 24 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ transformPerspective: 800 }}
      className="inline-block will-change-transform"
    >
      {children}
    </motion.div>
  );
}

export function MetricsSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <VideoBackdrop src={VIDEOS.metrics} />
      <div className="mask-fade-top absolute inset-x-0 top-0 z-10 h-[180px]" />
      <div className="mask-fade-bottom absolute inset-x-0 bottom-0 z-10 h-[180px]" />

      <div className="relative z-20 max-w-6xl px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2 }}
          className="eyebrow-saffron mb-20"
        >
          Performance Metrics
        </motion.div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="flex flex-col items-center"
            >
              <TiltValue>
                <div className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-0.04em] text-white">
                  {m.value}
                </div>
              </TiltValue>
              <div className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
