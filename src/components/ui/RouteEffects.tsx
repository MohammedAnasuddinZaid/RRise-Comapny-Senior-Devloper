"use client";

import { usePathname } from "next/navigation";
import { CinematicLoader } from "./CinematicLoader";
import { CustomCursor } from "./CustomCursor";

/**
 * RRise global chrome (branded loader + cursor) is hidden on the SynapseX
 * landing page so the pure-black Dala experience stays clean.
 */
export function RouteEffects() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <>
      <CinematicLoader />
      <CustomCursor />
    </>
  );
}
