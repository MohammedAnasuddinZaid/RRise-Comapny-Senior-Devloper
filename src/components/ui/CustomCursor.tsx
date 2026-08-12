"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor. Uses motion values + springs instead of React state on every
 * `mousemove` so moving the mouse never triggers a re-render (keeps scrolling
 * and animations smooth on slower machines).
 */
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 600, damping: 35, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 600, damping: 35, mass: 0.4 });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.style.cursor === "pointer" ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [x, y]);

  // Return null on server or if touch device (usually no mouse)
  if (typeof window === "undefined" || "ontouchstart" in window || navigator.maxTouchPoints > 0) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translate: "-50% -50%",
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? "rgba(128, 82, 255, 0.2)" : "transparent",
      }}
      transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
    >
      <motion.div
        className="w-1.5 h-1.5 bg-primary rounded-full"
        animate={{ scale: isHovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
