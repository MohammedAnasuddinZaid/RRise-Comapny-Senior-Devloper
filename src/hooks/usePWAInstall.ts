"use client";

/**
 * usePWAInstall — shared PWA install state used by the header Install button
 * and the bottom-sheet InstallPrompt so they stay in sync.
 *
 * - Captures the `beforeinstallprompt` event (Chrome/Edge/desktop) so we can
 *   trigger the native install dialog on demand.
 * - Detects iOS, where no prompt event exists and the only install path is
 *   "Add to Home Screen" (we surface the manual steps to the UI instead).
 */

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type PWAInstallPlatform = "ios" | "android" | "other";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function detectPlatform(): PWAInstallPlatform {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent;
  const touchPoints = window.navigator.maxTouchPoints;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && touchPoints > 1) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export function usePWAInstall() {
  const [platform, setPlatform] = useState<PWAInstallPlatform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // These browser-only checks must run in an effect (not during render) so
    // the server-rendered markup and the client hydration stay identical.
    if (isStandalone()) {
      setInstalled(true); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    setPlatform(detectPlatform());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async (): Promise<InstallOutcome> => {
    if (!deferredPrompt) return "unavailable";
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      return choice.outcome;
    } catch {
      setDeferredPrompt(null);
      return "unavailable";
    }
  };

  return {
    platform,
    installed,
    /** True when a native install prompt is available (non-iOS). */
    canInstall: deferredPrompt != null,
    install,
  };
}
