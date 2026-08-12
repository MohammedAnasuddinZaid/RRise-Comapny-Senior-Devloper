"use client";

/**
 * InstallButton — "Install RRise" pill used in the header (next to Sign In)
 * and the mobile menu. On Chrome/Edge/desktop it fires the native browser
 * install dialog via `beforeinstallprompt`. On iOS (no prompt event exists)
 * it opens a small popover with the "Add to Home Screen" steps.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const IOS_STEPS = [
  { step: "1", text: "Tap the Share button in your browser" },
  { step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
  { step: "3", text: 'Tap "Add" — RRise is now installed' },
];

export function InstallButton({
  className = "",
  label = "Install",
  showLabel = true,
}: {
  className?: string;
  label?: string;
  showLabel?: boolean;
}) {
  const { platform, installed, canInstall, install } = usePWAInstall();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (installed) return null;

  const isIos = platform === "ios";
  const showInstructions = isIos || !canInstall;

  const handleClick = async () => {
    if (showInstructions) {
      setOpen((o) => !o);
      return;
    }
    setBusy(true);
    try {
      await install();
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
        aria-haspopup={showInstructions ? "dialog" : undefined}
        aria-expanded={showInstructions ? open : undefined}
        className={`pill-glass items-center justify-center gap-2 rounded-full font-mono-space text-[13px] uppercase tracking-[0.12em] text-white/85 transition-colors hover:text-white ${className}`}
        title={showInstructions ? "How to install RRise on this device" : "Install RRise"}
      >
        <Download className="h-4 w-4" />
        {showLabel && <span>{busy ? "Installing…" : label}</span>}
      </motion.button>

      {/* Instructions popover — shown on iOS and when no native prompt exists */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border p-5 backdrop-blur-2xl"
              style={{
                background: "rgba(8,8,14,0.96)",
                borderColor: "rgba(128,82,255,0.35)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(128,82,255,0.18)",
              }}
              role="dialog"
              aria-label="Install RRise instructions"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(128,82,255,0.35), rgba(255,184,41,0.2))",
                    border: "1px solid rgba(128,82,255,0.4)",
                  }}
                >
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono-space text-xs uppercase tracking-[0.14em] text-white">
                    Add to Home Screen
                  </h3>
                  <p className="mt-0.5 font-mono-space text-[11px] leading-relaxed text-white/50">
                    Installs RRise like a real app — fullscreen, works offline.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {IOS_STEPS.map((s) => (
                  <div key={s.step} className="flex items-center gap-3 font-mono-space text-xs text-white/70">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
                      style={{ background: "rgba(128,82,255,0.25)", border: "1px solid rgba(128,82,255,0.45)", color: "#fff" }}
                    >
                      {s.step}
                    </span>
                    {s.text}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-white/10 font-mono-space text-xs uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
