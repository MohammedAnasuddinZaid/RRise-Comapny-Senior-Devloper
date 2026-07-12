"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MascotProps {
  level: number;
  className?: string;
}

export function Mascot({ level, className }: MascotProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Blinking logic
  useEffect(() => {
    const blink = () => {
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 150); // Keep eyes closed for 150ms
      
      // Schedule next blink randomly between 2s and 6s
      const nextBlink = Math.random() * 4000 + 2000;
      setTimeout(blink, nextBlink);
    };
    
    const timeout = setTimeout(blink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Ensure we don't request levels beyond 4
  const currentLevel = Math.min(Math.max(level, 1), 4);
  const imageSrc = `/mascots/parrot/level-${currentLevel}-${isOpen ? 'open' : 'closed'}.webp`;

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -10, 0], // Floating up and down
        scale: [1, 1.02, 1], // Breathing
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img 
          src={imageSrc} 
          alt={`Mascot Level ${currentLevel}`}
          className="w-full h-full object-contain drop-shadow-2xl max-h-48"
        />
      </div>
    </motion.div>
  );
}
