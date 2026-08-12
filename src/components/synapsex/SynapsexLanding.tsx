"use client";

import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { CinematicSection } from "./CinematicSection";
import { MetricsSection } from "./MetricsSection";
import { AdaptiveSection } from "./AdaptiveSection";
import { ArchitectureSection } from "./ArchitectureSection";
import { Footer } from "./Footer";
import { useLenis } from "../../utils/lenis";

export function SynapsexLanding() {
  useLenis();
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    document.body.classList.add("synapsex-body");
    const t = setTimeout(() => setEntranceComplete(true), 800);
    return () => {
      document.body.classList.remove("synapsex-body");
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#000000] text-white selection:bg-[#8052ff] selection:text-white"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      <Navbar visible={entranceComplete} />
      <main>
        <Hero entranceComplete={entranceComplete} />
        <CinematicSection />
        <MetricsSection />
        <AdaptiveSection />
        <ArchitectureSection />
      </main>
      <Footer />
    </div>
  );
}
