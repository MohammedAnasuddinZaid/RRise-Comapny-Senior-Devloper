"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const SESSION_KEY = "rrise-install-seen";

/**
 * PWA install card. A single "Install App" tap triggers the native install
 * dialog directly on Android/Chrome/Edge/desktop. On iOS (which has no
 * install prompt event) it shows a single-line hint instead of a multi-step
 * card. Appears once per session, hidden once installed.
 */
export function InstallPrompt() {
  const { platform, installed, canInstall, install } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [installing, setInstalling] = useState(false);
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
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome === "accepted") {
        setShow(false);
      } else if (outcome === "dismissed") {
        dismiss();
      } else if (outcome === "unavailable" && platform !== "ios") {
        setShow(false);
      }
    } finally {
      setBusy(false);
      setInstalling(false);
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
                  {canInstallDirectly
                    ? "One tap installs the app on your device — fullscreen and offline."
                    : "Installs like a real app — fullscreen and offline."}
                </p>
              </div>
            </div>

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

            {installing && (
              <p className="mt-3 text-center font-mono-space text-[11px] text-white/45">
                Starting install…
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}