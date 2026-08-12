"use client";

import dynamic from "next/dynamic";
import { VideoBackdrop } from "./VideoBackdrop";
import { VIDEOS } from "./videos";

const ParrotLogo3D = dynamic(() => import("./ParrotLogo3D"), { ssr: false });

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#000000]">
      <div className="flex min-h-[400px] w-full flex-col overflow-hidden md:flex-row">
        {/* Left — video */}
        <div className="relative h-[300px] w-full overflow-hidden md:h-auto md:w-1/2">
          <VideoBackdrop src={VIDEOS.footer} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 md:bg-gradient-to-r" />
        </div>

        {/* Right — brand & info */}
        <div className="flex w-full flex-col justify-between bg-[#000000] p-8 md:w-1/2 md:p-16">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="parrot-eye-glow">
                <ParrotLogo3D size={40} />
              </div>
              <span className="text-lg font-normal tracking-tight text-white">
                SynapseX
              </span>
            </div>
            <p className="max-w-sm text-[15px] font-light leading-relaxed text-[#bdbdbd]">
              The next evolution of human-machine interaction. Built for those
              who refuse to be limited by biology alone.
            </p>
          </div>
          <div className="mt-12 text-[12px] text-[#9a9a9a]">
            © 2026 SynapseX Labs. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
