"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

function ParrotFace({ glowing, blinking }: { glowing: boolean; blinking: boolean }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Glow rings on hover */}
      {glowing && (
        <>
          <circle cx="60" cy="60" r="56" stroke="url(#glowRing)" strokeWidth="2" opacity="0.6"
            style={{ animation: "pulseRing 1.5s ease-out infinite" }} />
          <circle cx="60" cy="60" r="50" stroke="url(#glowRing2)" strokeWidth="1" opacity="0.3"
            style={{ animation: "pulseRing 2s ease-out infinite 0.5s" }} />
        </>
      )}
      {/* Body */}
      <circle cx="60" cy="60" r="48" fill="url(#bodyGrad)" />
      <ellipse cx="60" cy="55" rx="38" ry="40" fill="url(#featherGrad)" opacity="0.6" />
      <ellipse cx="60" cy="72" rx="22" ry="20" fill="url(#chestGrad)" />
      {/* Wings */}
      <path d="M18 55 Q10 40 22 28 Q30 50 25 65 Z" fill="url(#wingGrad)" opacity="0.85" />
      <path d="M102 55 Q110 40 98 28 Q90 50 95 65 Z" fill="url(#wingGrad)" opacity="0.85" />
      {/* Crest */}
      <path d="M48 20 Q52 8 60 5 Q68 8 72 20 Q64 15 60 14 Q56 15 48 20Z" fill="url(#crestGrad)" />
      <path d="M53 22 Q55 12 60 10 Q65 12 67 22 Q63 17 60 17 Q57 17 53 22Z" fill="var(--primary)" opacity="0.7" />
      {/* Face */}
      <ellipse cx="60" cy="60" rx="26" ry="24" fill="url(#faceGrad)" />
      {/* Eye sockets */}
      <ellipse cx="45" cy="52" rx="9" ry="10" fill="#0a1020" />
      <ellipse cx="75" cy="52" rx="9" ry="10" fill="#0a1020" />
      <ellipse cx="45" cy="52" rx="7" ry="8" fill="white" opacity="0.95" />
      <ellipse cx="75" cy="52" rx="7" ry="8" fill="white" opacity="0.95" />
      {/* Pupils */}
      {!blinking ? (
        <>
          <ellipse cx="46" cy="53" rx="4" ry="4.5" fill={glowing ? "url(#pupilGlow)" : "#111827"}
            style={glowing ? { filter: "drop-shadow(0 0 8px var(--secondary)) drop-shadow(0 0 16px var(--primary))" } : {}} />
          <ellipse cx="76" cy="53" rx="4" ry="4.5" fill={glowing ? "url(#pupilGlow)" : "#111827"}
            style={glowing ? { filter: "drop-shadow(0 0 8px var(--secondary)) drop-shadow(0 0 16px var(--primary))" } : {}} />
          <circle cx="48" cy="51" r="1.5" fill="white" opacity="0.9" />
          <circle cx="78" cy="51" r="1.5" fill="white" opacity="0.9" />
          {/* Neon eye rings on hover */}
          {glowing && (
            <>
              <ellipse cx="45" cy="52" rx="8" ry="9" stroke="url(#eyeRing)" strokeWidth="1.5" fill="none" opacity="0.9" />
              <ellipse cx="75" cy="52" rx="8" ry="9" stroke="url(#eyeRing)" strokeWidth="1.5" fill="none" opacity="0.9" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M38 52 Q45 48 52 52" stroke="#1a2a3a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 52 Q75 48 82 52" stroke="#1a2a3a" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {/* Beak */}
      <path d="M54 65 Q60 58 66 65 Q63 72 60 73 Q57 72 54 65Z" fill="url(#beakGrad)" />
      <path d="M54 65 Q60 62 66 65" stroke="#e8a020" strokeWidth="1" opacity="0.5" />
      {/* Cheeks */}
      <circle cx="36" cy="62" r="7" fill="url(#cheekGrad)" opacity="0.5" />
      <circle cx="84" cy="62" r="7" fill="url(#cheekGrad)" opacity="0.5" />
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a4d2e" />
          <stop offset="60%" stopColor="#0d3320" />
          <stop offset="100%" stopColor="#051a10" />
        </radialGradient>
        <radialGradient id="featherGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#00ff87" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="chestGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#c8f5d0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a0e6b0" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00cc6a" />
          <stop offset="100%" stopColor="#005c30" />
        </linearGradient>
        <linearGradient id="crestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#00ff87" />
        </linearGradient>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#2d6e46" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1a4d2e" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="pupilGlow" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="60%" stopColor="#0077aa" />
          <stop offset="100%" stopColor="#003344" />
        </radialGradient>
        <linearGradient id="beakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0c040" />
          <stop offset="100%" stopColor="#d4820a" />
        </linearGradient>
        <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6b9d" />
          <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glowRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff87" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
        <linearGradient id="glowRing2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#00ff87" />
        </linearGradient>
        <linearGradient id="eyeRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff87" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ParrotMascotChat() {
  const [glowing, setGlowing] = useState(false);
  const [blinking, setBlinking] = useState(false);

  /* Blink loop */
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      setTimeout(blink, Math.random() * 4000 + 2000);
    };
    const t = setTimeout(blink, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10">
      <Link href="/app" className="group">
        <motion.div
          className="relative cursor-pointer select-none"
          style={{ animation: "parrotFloat 4s ease-in-out infinite" }}
          onHoverStart={() => setGlowing(true)}
          onHoverEnd={() => setGlowing(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          {/* Ambient glow disc */}
          <motion.div
            className="absolute inset-[-16px] rounded-full pointer-events-none"
            animate={
              glowing
                ? {
                    background: [
                      "radial-gradient(circle, rgba(0,255,135,0.25) 0%, transparent 70%)",
                      "radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 70%)",
                      "radial-gradient(circle, rgba(0,255,135,0.25) 0%, transparent 70%)",
                    ],
                  }
                : { background: "radial-gradient(circle, rgba(0,255,135,0.06) 0%, transparent 70%)" }
            }
            transition={{ duration: 1.8, repeat: Infinity }}
          />

          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/30 pointer-events-none"
            animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-secondary/20 pointer-events-none"
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
          />

          {/* Parrot */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl">
            <ParrotFace glowing={glowing} blinking={blinking} />
          </div>
        </motion.div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-10 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary shadow-[0_4px_30px_rgba(0,255,135,0.3)] group-hover:shadow-[0_8px_50px_rgba(0,255,135,0.5)] transition-all duration-300"
          >
            <span
              className="font-clash font-bold text-sm text-[#020408]"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Start Your Journey
            </span>
            <svg className="w-4 h-4 text-[#020408]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
          <p className="font-inter text-xs text-muted-foreground mt-2 tracking-wide">
            hover to meet alex 🦜
          </p>
        </motion.div>
      </Link>
    </div>
  );
}
