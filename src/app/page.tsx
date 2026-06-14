"use client";

import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { ParrotMascotChat } from "../components/mascot/ParrotMascotChat";
import { useState, useEffect } from "react";
import Link from "next/link";

function Particle({ x, delay, duration }: { x: number; delay: number; duration: number }) {
  const isBlue = Math.random() > 0.5;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        background: isBlue ? "#00e5ff" : "#00ff87",
      }}
      initial={{ y: "105vh", opacity: 0 }}
      animate={{ y: "-5vh", opacity: [0, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

function TypingWordmark({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + text[idx]);
        setIdx((i) => i + 1);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [idx, text]);

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 align-middle"
        />
      )}
    </span>
  );
}

export default function HomePage() {
  const [particles, setParticles] = useState<{ x: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: Math.random() * 5 + 5,
      }))
    );
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Particles — dark only */}
      <div className="dark:block hidden absolute inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* Ambient glows — dark only */}
      <div className="dark:block hidden absolute top-[-15%] left-[20%] w-[700px] h-[700px] rounded-full bg-primary/5 blur-[160px] pointer-events-none" />
      <div className="dark:block hidden absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[140px] pointer-events-none" />
      <div className="dark:block hidden absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />

      <Header />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs font-space text-primary tracking-widest uppercase">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Now in Early Access — Join the waitlist
          </div>
        </motion.div>

        {/* Hero wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <h1
            className="font-monument text-6xl md:text-8xl lg:text-9xl tracking-widest leading-none gradient-text"
            style={{ fontFamily: "'Monument Extended', sans-serif", letterSpacing: "0.08em" }}
          >
            <TypingWordmark text="RRise" />
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-4"
        >
          <h2
            className="font-clash text-xl md:text-2xl lg:text-3xl text-foreground/80 font-light tracking-wide"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Rise. Build. Become.
          </h2>
        </motion.div>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-inter text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-14"
        >
          The premium personal development workspace that bridges the gap between knowing what to do — and actually doing it.
        </motion.p>

        {/* Parrot mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9, type: "spring" }}
          className="mb-16"
        >
          <ParrotMascotChat />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/app">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative px-8 py-4 rounded-2xl font-clash font-semibold text-base overflow-hidden group"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-0 group-hover:opacity-70 transition-opacity" />
              <span className="relative z-10 text-[#020408] font-bold">Start for free</span>
            </motion.button>
          </Link>

          <Link href="/features">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-4 rounded-2xl font-clash font-medium text-base glass border border-white/10 hover:border-primary/30 text-foreground/80 hover:text-foreground transition-all"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              See how it works →
            </motion.button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
