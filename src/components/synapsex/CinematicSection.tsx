"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { VideoBackdrop } from "./VideoBackdrop";
import { VIDEOS } from "./videos";

export function CinematicSection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yScale = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 32,
    mass: 1.8,
  });
  const translateY = useTransform(yScale, [0, 1], [60, -120]);
  const opacity = useTransform(yScale, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`perspective(1000px) rotateX(24deg) translateY(${translateY}px) translateZ(15px)`;

  return (
    <section
      ref={ref}
      className="relative h-screen h-[100dvh] overflow-hidden"
    >
      <VideoBackdrop src={VIDEOS.cinematic} />
      <div className="mask-fade-top absolute inset-x-0 top-0 z-10 h-[180px]" />
      <div className="mask-fade-bottom absolute inset-x-0 bottom-0 z-10 h-[180px]" />

      <div className="relative z-20 flex h-full items-center justify-center px-6 sm:px-12">
        <motion.p
          style={{ transform, opacity }}
          className="max-w-5xl select-none text-center text-[22px] font-normal leading-[1.35] tracking-[-0.02em] text-white sm:text-[30px] md:text-[36px] lg:text-[42px]"
        >
          A neural-AI interface built on the architecture of the human nervous
          system. SynapseX translates synaptic activity into computational
          intelligence. Every signal becomes measurable, structured, and
          visible. It continuously reconstructs internal state as a dynamic
          neural map. Biological noise is filtered into actionable cognitive
          patterns.
        </motion.p>
      </div>
    </section>
  );
}
