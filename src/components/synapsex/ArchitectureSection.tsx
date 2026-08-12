"use client";

import { motion } from "framer-motion";

const LAYERS = [
  { num: "Layer 1", name: "Capture" },
  { num: "Layer 2", name: "Process" },
  { num: "Layer 3", name: "Interface" },
];

export function ArchitectureSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#000000] px-6 py-32">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.0 }}
          className="text-center"
        >
          <div className="eyebrow-saffron mb-8">Architecture</div>
          <h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            Three layers. Zero friction.
          </h2>
          <p className="mx-auto max-w-xl text-[15px] font-light leading-relaxed text-[#bdbdbd] sm:text-[17px]">
            Sensor layer captures raw bioelectric signals. Processing layer
            isolates intent. Interface layer delivers structured output to any
            connected system.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-20 flex flex-col items-center gap-4 [perspective:1000px]"
        >
          {LAYERS.map((l) => (
            <div
              key={l.num}
              className="glass-void layer-3d flex h-[72px] w-full max-w-md items-center justify-between rounded-lg px-6"
            >
              <span className="text-[12px] uppercase tracking-[0.15em] text-[#9a9a9a]">
                {l.num}
              </span>
              <span className="text-[16px] font-normal text-white sm:text-[18px]">
                {l.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
