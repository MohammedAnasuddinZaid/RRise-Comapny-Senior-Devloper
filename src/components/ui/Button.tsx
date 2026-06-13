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
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
            "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 text-foreground": variant === "glass",
            "h-10 px-6 py-2": size === "default",
            "h-8 rounded-md px-4 text-sm": size === "sm",
            "h-12 rounded-lg px-8 text-lg font-playfair": size === "lg",
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
