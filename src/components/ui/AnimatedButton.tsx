"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function AnimatedButton({ 
  children, 
  variant = "primary", 
  size = "md", 
  className,
  href,
  disabled,
  onClick,
}: AnimatedButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-full font-semibold transition-all duration-300";
  
  const sizeClasses = {
    sm: "px-6 py-2.5 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-primary to-secondary text-[#020408] shadow-lg shadow-primary/25 hover:shadow-primary/40",
    secondary: "glass border border-white/20 text-foreground hover:border-primary/40 hover:bg-white/10",
    glass: "glass border border-white/10 text-foreground/80 hover:text-foreground hover:border-white/20 hover:bg-white/5",
  };
  
  const ButtonContent = (
    <>
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Glow effect for primary variant */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-0"
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </>
  );
  
  const buttonClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabled && "opacity-50 cursor-not-allowed",
    className
  );
  
  if (href) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
      >
        {ButtonContent}
      </motion.a>
    );
  }
  
  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
    >
      {ButtonContent}
    </motion.button>
  );
}
