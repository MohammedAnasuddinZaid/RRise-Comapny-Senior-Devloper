"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function CinematicLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Blocks uncovering animation */}
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 h-full w-full">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-[#050505] border border-border"
                initial={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                style={{ originY: Math.random() > 0.5 ? 0 : 1 }}
                transition={{
                  duration: 0.6,
                  delay: Math.random() * 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </div>

          {/* Cinematic Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 1.1, opacity: 0, filter: "blur(20px)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <h1 className="font-monument text-3xl md:text-5xl text-foreground tracking-[0.2em] uppercase">
                RRise
              </h1>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
