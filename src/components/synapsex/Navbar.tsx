"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ScrambleText } from "./ScrambleText";
import { SquashHamburger } from "./SquashHamburger";
import { scrollToSection } from "../../utils/lenis";

const ParrotLogo3D = dynamic(() => import("./ParrotLogo3D"), { ssr: false });

function ScrambleLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="whitespace-nowrap text-base font-normal text-white/85 transition-colors hover:text-white"
    >
      <ScrambleText text={label} isHovered={hovered} />
    </button>
  );
}

export function Navbar({ visible }: { visible: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 sm:px-6"
      style={{ height: 80 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* ── Left group: logo pill + expanding menu pill ── */}
      <div className="hidden items-center gap-2 sm:flex">
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.14)" }}
          whileTap={{ scale: 0.98 }}
          className="glass-void hidden h-12 items-center gap-2.5 rounded-full px-5 md:flex"
          aria-label="SynapseX home"
        >
          <ParrotLogo3D size={28} />
          <span className="text-base font-medium tracking-tight text-white">
            SynapseX
          </span>
        </motion.button>

        {/* Expanding menu pill */}
        <motion.div
          animate={{ width: menuOpen ? 290 : 48 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="glass-void flex h-12 items-center overflow-hidden rounded-full"
        >
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            style={{
              width: menuOpen ? 36 : 48,
              height: menuOpen ? 36 : 48,
              marginLeft: menuOpen ? 6 : 0,
              marginRight: menuOpen ? 4 : 6,
            }}
          >
            <SquashHamburger open={menuOpen} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-7 whitespace-nowrap pr-6"
              >
                <ScrambleLink
                  label="About"
                  onClick={() => scrollToSection(window.innerHeight)}
                />
                <ScrambleLink
                  label="Metrics"
                  onClick={() => scrollToSection(window.innerHeight * 2)}
                />
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Right group: download CTA (desktop) ── */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="iris-sheen hidden h-12 items-center gap-2 rounded-full bg-[#8052ff] px-6 text-white transition-all duration-300 hover:brightness-110 sm:flex"
      >
        <i className="bi bi-apple text-lg leading-none" />
        <DownloadLabel />
      </motion.button>

      {/* ── Mobile row ── */}
      <div className="flex w-full items-center gap-2 sm:hidden">
        <motion.button
          animate={{
            width: menuOpen ? 0 : "auto",
            opacity: menuOpen ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="glass-void flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-3"
          aria-label="SynapseX home"
        >
          <ParrotLogo3D size={22} />
          <span className="text-[13px] font-medium tracking-tight text-white">
            SynapseX
          </span>
        </motion.button>

        <motion.div
          animate={{ width: menuOpen ? "100%" : 40 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="glass-void flex h-9 items-center overflow-hidden rounded-full"
        >
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex shrink-0 items-center justify-center rounded-full text-white"
            style={{ width: 36, height: 36, marginRight: 4 }}
          >
            <SquashHamburger open={menuOpen} mobile />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="flex w-full items-center justify-around gap-4 whitespace-nowrap pr-3"
              >
                <ScrambleLink
                  label="About"
                  onClick={() => scrollToSection(window.innerHeight)}
                />
                <ScrambleLink
                  label="Metrics"
                  onClick={() => scrollToSection(window.innerHeight * 2)}
                />
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>

        {!menuOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#8052ff] px-3.5 text-white"
          >
            <i className="bi bi-apple text-sm leading-none" />
            <DownloadLabel mobile />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function DownloadLabel({ mobile = false }: { mobile?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className={mobile ? "text-[13px]" : "text-[15px]"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ScrambleText text="Download" isHovered={hovered} />
    </span>
  );
}
