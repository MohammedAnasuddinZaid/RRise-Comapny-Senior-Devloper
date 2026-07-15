"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function GradientBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Cloud-like gradient formations - simplified for mobile */}
      <div className="absolute inset-0">
        {/* Primary cloud formation */}
        <motion.div
          className="absolute top-[-15%] left-[-5%] w-[70%] h-[50%] rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-[150px]"
          animate={{
            x: isMobile ? [0, 20, 0] : [0, 80, 0],
            y: isMobile ? [0, -15, 0] : [0, -40, 0],
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.7, 0.6],
          }}
          transition={{
            duration: isMobile ? 30 : 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Secondary cloud formation */}
        <motion.div
          className="absolute top-[5%] right-[-10%] w-[55%] h-[45%] rounded-full bg-gradient-to-bl from-secondary/12 via-secondary/4 to-transparent blur-[130px]"
          animate={{
            x: isMobile ? [0, -20, 0] : [0, -60, 0],
            y: isMobile ? [0, 20, 0] : [0, 50, 0],
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.6, 0.5],
          }}
          transition={{
            duration: isMobile ? 28 : 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        
        {/* Tertiary cloud formation - hidden on mobile */}
        {!isMobile && (
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
        )}
        
        {/* Atmospheric fog layer - hidden on mobile */}
        {!isMobile && (
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
        )}
      </div>

      {/* Soft floating orbs - reduced on mobile */}
      <motion.div
        className="absolute top-[25%] left-[10%] w-40 h-40 rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-3xl"
        animate={{
          y: [0, isMobile ? -20 : -40, 0],
          x: [0, isMobile ? 10 : 25, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: isMobile ? 15 : 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {!isMobile && (
        <>
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
        </>
      )}

      {/* Premium grain texture overlay - hidden on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
        }} />
      )}

      {/* Subtle floating particles - reduced on mobile */}
      <div className="absolute inset-0">
        {[...Array(isMobile ? 5 : 15)].map((_, i) => {
          // Use seeded random to prevent hydration mismatch
          const seed = i * 12345;
          const random = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
          };
          
          return (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
              style={{
                left: `${random(seed) * 100}%`,
                top: `${random(seed + 1) * 100}%`,
              }}
              animate={{
                y: [0, isMobile ? -60 : -120, 0],
                opacity: [0, 0.6, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: isMobile ? 15 : 12 + random(seed + 2) * 8,
                repeat: Infinity,
                delay: random(seed + 3) * 6,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
