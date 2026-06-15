"use client";

import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Cloud-like gradient formations */}
      <div className="absolute inset-0">
        {/* Primary cloud formation */}
        <motion.div
          className="absolute top-[-15%] left-[-5%] w-[70%] h-[50%] rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-[150px]"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Secondary cloud formation */}
        <motion.div
          className="absolute top-[5%] right-[-10%] w-[55%] h-[45%] rounded-full bg-gradient-to-bl from-secondary/12 via-secondary/4 to-transparent blur-[130px]"
          animate={{
            x: [0, -60, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        
        {/* Tertiary cloud formation */}
        <motion.div
          className="absolute bottom-[-10%] left-[20%] w-[45%] h-[40%] rounded-full bg-gradient-to-tr from-primary/10 via-primary/3 to-transparent blur-[110px]"
          animate={{
            x: [0, 40, 0],
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
        
        {/* Atmospheric fog layer */}
        <motion.div
          className="absolute top-[30%] left-[40%] w-[35%] h-[30%] rounded-full bg-gradient-to-r from-secondary/8 to-primary/6 blur-[90px]"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Soft floating orbs */}
      <motion.div
        className="absolute top-[25%] left-[10%] w-40 h-40 rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-3xl"
        animate={{
          y: [0, -40, 0],
          x: [0, 25, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[45%] right-[15%] w-32 h-32 rounded-full bg-gradient-to-br from-secondary/8 to-transparent blur-3xl"
        animate={{
          y: [0, 35, 0],
          x: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
      <motion.div
        className="absolute bottom-[35%] left-[30%] w-48 h-48 rounded-full bg-gradient-to-br from-primary/6 to-transparent blur-4xl"
        animate={{
          y: [0, -25, 0],
          x: [0, 35, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* Premium grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
      }} />

      {/* Subtle floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0, 0.6, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
