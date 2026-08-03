"use client";

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-none font-space uppercase tracking-widest text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-black hover:bg-white": variant === "default",
            "border border-border bg-transparent text-foreground hover:bg-white hover:text-black": variant === "outline",
            "hover:bg-white/10 text-foreground": variant === "ghost",
            "bg-background border border-border backdrop-blur-md hover:bg-white hover:text-black text-foreground": variant === "glass",
            "h-12 px-8 py-3": size === "default",
            "h-10 px-6 text-xs": size === "sm",
            "h-16 px-12 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
