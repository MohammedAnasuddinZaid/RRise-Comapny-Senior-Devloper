"use client";

import { useEffect, type ReactNode } from "react";
import { Header } from "../layout/Header";
import { RriseFooter } from "./RriseFooter";
import { useLenis } from "../../utils/lenis";

/**
 * Shared chrome for every RRise marketing page so all pages share the same
 * Dala-void aesthetic as the home page: pure-black canvas, aurora blobs,
 * dot grid, film grain, Lenis smooth scroll and the branded header/footer.
 */
export function RrisePageShell({ children }: { children: ReactNode }) {
  useLenis();

  useEffect(() => {
    document.body.classList.add("rrise-body");
    return () => {
      document.body.classList.remove("rrise-body");
    };
  }, []);

  return (
    <div className="rrise-page relative min-h-screen bg-[#000000] text-white overflow-hidden">
      {/* Ambient aurora blobs */}
      <div className="aurora-blob" style={{ width: 560, height: 560, background: "#8052ff", top: "-12%", left: "-8%" }} />
      <div className="aurora-blob" style={{ width: 460, height: 460, background: "#ffb829", bottom: "-12%", right: "-6%", animationDelay: "-8s" }} />
      <div className="aurora-blob" style={{ width: 420, height: 420, background: "#8052ff", top: "38%", right: "16%", animationDelay: "-14s", opacity: 0.13 }} />

      {/* Dot grid + grain */}
      <div className="dot-grid absolute inset-0" />
      <div className="grain-overlay absolute inset-0" />

      <Header />
      {children}
      <RriseFooter />
    </div>
  );
}
