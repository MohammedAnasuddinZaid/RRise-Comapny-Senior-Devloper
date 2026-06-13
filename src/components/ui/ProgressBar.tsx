"use client";

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-white/10",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn("h-full bg-primary", indicatorClassName)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
