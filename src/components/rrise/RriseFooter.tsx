"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { VIDEOS } from "../synapsex/videos";
import { SectionVideo } from "../ui/SectionVideo";

const RriseParrot = dynamic(() => import("./RriseParrot"), { ssr: false });

const FOOTER_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Connect" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function RriseFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#000000]">
      <div className="flex flex-col md:flex-row min-h-[400px] w-full">
        {/* Left — video #5 */}
        <div className="relative w-full md:w-1/2 h-[300px] md:h-auto overflow-hidden">
          <SectionVideo
            src={VIDEOS.footer}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 to-black/10" />
        </div>

        {/* Right — brand & info */}
        <div className="relative w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between bg-[#000000]">
          <div className="flex items-center gap-4 mb-8">
            <RriseParrot size={52} />
            <span
              className="text-xl tracking-[0.18em] uppercase font-mono-space"
              style={{ fontFamily: '"Space Mono", monospace', fontWeight: 400 }}
            >
              RRise
            </span>
          </div>

          <p
            className="text-[13px] sm:text-[15px] leading-relaxed font-mono-space max-w-sm my-6"
            style={{ color: "#bdbdbd", fontWeight: 200 }}
          >
            We build personal development hubs, clean goal trackers, and visual
            analytics that actually stand out. Built for doers, zero corporate fluff.
          </p>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 mb-10">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-link text-[11px] tracking-[0.24em] uppercase font-mono-space"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            className="text-[12px] font-mono-space mt-8"
            style={{ color: "#9a9a9a" }}
          >
            (c) 2026 RRise. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
