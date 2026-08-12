"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const SESSION_KEY = "rrise-install-seen";

/**
 * PWA install card. On Android/Chrome/Edge/desktop it uses the
 * `beforeinstallprompt` event to trigger a native install dialog. On iOS
 * (which has no install prompt event) it shows step-by-step "Add to Home
 * Screen" instructions. Appears once per session, hidden once installed.
 * Shares install state with the header InstallButton via usePWAInstall.
 */
export function InstallPrompt() {
  const { platform, installed, canInstall, install } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (installed) return;

    const t = setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      let seen = false;
      try {
        seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        /* private mode — ignore */
      }
      if (!seen) setShow(true);
    }, 2600);

    return () => clearTimeout(t);
  }, [installed]);

  const dismiss = () => {
    setShow(false);
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleInstall = async () => {
    setBusy(true);
    try {
      const outcome = await install();
      if (outcome === "accepted" || outcome === "dismissed") {
        // Prompt was shown (native dialog) — hide the card either way.
        setShow(false);
        if (outcome === "dismissed") dismiss();
      }
    } finally {
      setBusy(false);
    }
  };

  const canInstallDirectly = canInstall && !installed;
  const showCard = show && !installed;

  return (
    <AnimatePresence>
      {showCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-[999] flex justify-center px-3 sm:px-6 pointer-events-none"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          role="dialog"
          aria-modal="false"
          aria-label="Install RRise"
        >
          <motion.div
            initial={{ y: 48, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 48, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="pointer-events-auto relative w-full max-w-md rounded-2xl border p-5 backdrop-blur-2xl mb-3 sm:mb-6"
            style={{
              background: "rgba(8,8,14,0.94)",
              borderColor: "rgba(128,82,255,0.35)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(128,82,255,0.18)",
            }}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 pr-8">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(128,82,255,0.35), rgba(255,184,41,0.2))",
                  border: "1px solid rgba(128,82,255,0.4)",
                }}
              >
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-mono-space text-sm uppercase tracking-[0.14em] text-white">
                  Install RRise
                </h3>
                <p className="mt-1 font-mono-space text-xs leading-relaxed text-white/50">
                  {platform === "ios"
                    ? "Add RRise to your Home Screen for the full app experience."
                    : "Install the app on your device — works offline, opens fullscreen."}
                </p>
              </div>
            </div>

            {canInstallDirectly ? (
              <div className="mt-5 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInstall}
                  disabled={busy}
                  className="pill-iris flex h-12 flex-1 items-center justify-center gap-2 font-mono-space text-sm uppercase tracking-[0.12em]"
                >
                  <Download className="h-4 w-4" />
                  {busy ? "Installing…" : "Install App"}
                </motion.button>
                <button
                  onClick={dismiss}
                  className="flex h-12 flex-1 items-center justify-center rounded-full border border-white/10 font-mono-space text-sm uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Not now
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-2.5">
                {[
                  { step: "1", text: "Tap the Share button in your browser" },
                  { step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: "3", text: 'Tap "Add" — RRise is now installed' },
                ].map((s) => (
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
                <button
                  onClick={dismiss}
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-white/10 font-mono-space text-xs uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Got it
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
