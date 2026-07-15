"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className, hover = true, glow = true, ...props }: GlassCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      className={cn(
        "relative rounded-3xl overflow-hidden",
        "bg-white/[0.03] backdrop-blur-2xl",
        "border border-white/[0.08]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        hover && "hover:shadow-[0_16px_64px_rgba(0,229,255,0.12)] hover:border-white/[0.12]",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: isMobile ? 0.5 : 0.8, ease: "easeOut" }}
      whileHover={hover ? {
        y: -6,
        scale: 1.01,
        transition: { duration: 0.4, ease: "easeOut" }
      } : undefined}
      {...props}
    >
      {/* Grain texture overlay - hidden on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      )}
      
      {/* Soft inner highlight */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
      
      {/* Edge lighting */}
      <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] pointer-events-none" />
      
      {/* Subtle shimmer effect - hidden on mobile for performance */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      )}
      
      {/* Inner glow */}
      {glow && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.02] pointer-events-none" />
      )}
      
      {children}
    </motion.div>
  );
}
