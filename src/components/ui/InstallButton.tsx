"use client";

/**
 * InstallButton — "Download / Install RRise" pill used in the header and the
 * mobile menu. A single click starts the install directly:
 *  - Chrome / Edge / Android / desktop: fires the native install dialog via
 *    `beforeinstallprompt` → one tap and the app is on the device.
 *  - iOS Safari has no install prompt event at all (browser restriction), so
 *    when the native flow is impossible we show a tiny auto-hiding hint —
 *    never a big instruction card.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, Check } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function InstallButton({
  className = "",
  label = "Download",
  showLabel = true,
}: {
  className?: string;
  label?: string;
  showLabel?: boolean;
}) {
  const { platform, installed, install } = usePWAInstall();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<"ios" | "unavailable" | null>(null);

  if (installed) return null;

  const isIos = platform === "ios";

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setHint(null);
    try {
      const outcome = await install();
      if (outcome === "accepted") {
        // App installed — component returns null shortly after.
      } else if (outcome === "unavailable") {
        setHint(isIos ? "ios" : "unavailable");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        className={`pill-glass items-center justify-center gap-2 rounded-full font-mono-space text-[13px] uppercase tracking-[0.12em] text-white/85 transition-colors hover:text-white ${className}`}
        title="Download and install RRise on this device"
        aria-label="Download RRise app"
      >
        <Download className="h-4 w-4" />
        {showLabel && <span>{busy ? "Installing…" : label}</span>}
      </motion.button>

      {/* Tiny auto-hiding hint — only when the browser forbids native install */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-[70] mt-3 flex max-w-[280px] items-center gap-2.5 rounded-2xl border px-3.5 py-3"
            style={{
              background: "rgba(8,8,14,0.97)",
              borderColor: "rgba(128,82,255,0.4)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 30px rgba(128,82,255,0.18)",
              backdropFilter: "blur(20px)",
            }}
            onAnimationComplete={() => {
              if (hint) setTimeout(() => setHint(null), 3500);
            }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(128,82,255,0.35), rgba(255,184,41,0.2))",
                border: "1px solid rgba(128,82,255,0.4)",
              }}
            >
              {isIos ? <Share className="h-4 w-4 text-white" /> : <Check className="h-4 w-4 text-white" />}
            </div>
            <p className="font-mono-space text-[11px] leading-relaxed text-white/85">
              {isIos
                ? "This browser doesn't allow one-tap install. Use Safari, tap Share, then Add to Home Screen."
                : "Your browser blocked the install dialog. Tap the install icon in the address bar to install RRise."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}