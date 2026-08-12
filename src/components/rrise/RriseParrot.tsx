"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";

/**
 * RRise mascot — renders the official company parrot logo as a lightweight
 * image that glides buttery-smooth toward the cursor.
 *
 * Two modes:
 * - Default (`followCursor={false}`): local glide — when the pointer moves
 *   over the parrot it eases toward the cursor, then floats back to rest.
 * - `followCursor`: global glide — the parrot gently trails the cursor
 *   anywhere on the viewport (used on the showcase "Cursor Glide" stage).
 *
 * Both are spring-smoothed so there's zero jitter, and pointer events are
 * used so it also reacts to touch on phones/tablets.
 */
export default function RriseParrot({
  size = 160,
  className,
  interactive = true,
  followCursor = false,
}: {
  size?: number;
  className?: string;
  interactive?: boolean;
  followCursor?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Whole-logo glide follows the cursor — a soft, heavy-damped spring keeps it
  // buttery smooth with no micro-jitter, and it eases gently back to rest.
  const tx = useSpring(mx, { stiffness: 45, damping: 16, mass: 0.6, restDelta: 0.001, restSpeed: 0.001 });
  const ty = useSpring(my, { stiffness: 45, damping: 16, mass: 0.6, restDelta: 0.001, restSpeed: 0.001 });

  useEffect(() => {
    if (!followCursor || !interactive) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const travel = size * 0.3;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.5)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.5)));
      mx.set(dx * travel);
      my.set(dy * travel);
    };

    const reset = () => {
      mx.set(0);
      my.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", reset, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, [followCursor, interactive, size, mx, my]);

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || followCursor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const travel = size * 0.16;
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2 * travel);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2 * travel);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={className}
      style={{
        width: size,
        height: size,
        pointerEvents: interactive ? "auto" : "none",
      }}
      aria-hidden
    >
      <div className="float-animation h-full w-full">
        <motion.div style={{ x: tx, y: ty }} className="parrot-eye-glow relative h-full w-full">
          <img
            src="/images/rrise-parrot-logo.png"
            alt="RRise parrot"
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}
