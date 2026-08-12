"use client";

import { motion } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 300, damping: 20 };

export function SquashHamburger({
  open,
  mobile = false,
}: {
  open: boolean;
  mobile?: boolean;
}) {
  const w = mobile ? 15 : 18;
  const h = mobile ? 10 : 12;
  const barH = mobile ? 1.2 : 1.5;
  const midY = (h - barH) / 2;

  return (
    <div style={{ width: w, height: h, position: "relative" }} className="pointer-events-none">
      <motion.span
        className="absolute left-0 top-0 block w-full bg-white"
        style={{ height: barH, borderRadius: 999 }}
        animate={open ? { rotate: 45, y: midY } : { rotate: 0, y: 0 }}
        transition={spring}
      />
      <motion.span
        className="absolute left-0 block w-full bg-white"
        style={{ height: barH, top: midY, borderRadius: 999 }}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={spring}
      />
      <motion.span
        className="absolute bottom-0 left-0 block w-full bg-white"
        style={{ height: barH, borderRadius: 999 }}
        animate={open ? { rotate: -45, y: -midY } : { rotate: 0, y: 0 }}
        transition={spring}
      />
    </div>
  );
}
