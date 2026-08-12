"use client";

import { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import { RriseHero } from "./RriseHero";
import { RriseMarquee } from "./RriseMarquee";
import { RriseFeatures } from "./RriseFeatures";
import { RriseParrotShowcase } from "./RriseParrotShowcase";
import { RriseFooter } from "./RriseFooter";
import { useLenis } from "../../utils/lenis";

export function RriseLanding() {
  useLenis();
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    document.body.classList.add("rrise-body");
    const t = setTimeout(() => setEntranceComplete(true), 800);
    return () => {
      document.body.classList.remove("rrise-body");
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white" style={{ fontFamily: '"Space Mono", monospace' }}>
      <Header />
      <main>
        <RriseHero entranceComplete={entranceComplete} />
        <RriseMarquee />
        <RriseFeatures />
        <RriseParrotShowcase />
      </main>
      <RriseFooter />
    </div>
  );
}
