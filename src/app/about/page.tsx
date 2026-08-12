"use client";

import { motion } from "framer-motion";
import { RrisePageShell } from "../../components/rrise/RrisePageShell";

const SOCIALS = [
  { name: "LinkedIn", href: "#linkedin" },
  { name: "Instagram", href: "#instagram" },
  { name: "Pinterest", href: "#pinterest" },
  { name: "Twitter / X", href: "#twitter" },
  { name: "YouTube", href: "https://www.youtube.com/@rrise.rev21" },
];

const VALUES = [
  { num: "01", title: "Relentless Consistency", desc: "The gap between dreaming and doing is just showing up every day." },
  { num: "02", title: "Self-Awareness First", desc: "You can't improve what you don't understand. RRise helps you see yourself clearly." },
  { num: "03", title: "Built with Honesty", desc: "No bloat. No hype. Just tools that genuinely make your life better." },
];

export default function AboutPage() {
  return (
    <RrisePageShell>
      <main className="relative z-10 px-6 md:px-12 pt-32 pb-32 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 mt-12 border-b border-border pb-12"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono-space text-white/45 tracking-[0.25em] uppercase mb-8">
            <span className="eyebrow-dot"></span> The Story
          </div>
          <h1 className="rrise-title rrise-title-shadow text-[clamp(48px,12vw,160px)] text-white">
            Built by someone
            <br />
            <span className="saffron-gradient-text italic font-mono-space text-[clamp(30px,7vw,90px)] tracking-normal">who gets it.</span>
          </h1>
        </motion.div>

        {/* Founder section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative p-8 md:p-16 border border-border bg-surface backdrop-blur-md mb-32"
        >
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <div className="w-24 h-24 bg-primary text-black flex items-center justify-center text-4xl mb-6" style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>
                  R
                </div>
                <h3 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>Revathy Rajeswaran</h3>
                <p className="text-xs tracking-widest uppercase text-foreground/50 mb-8" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>Founder · Sydney, Australia</p>
                <div className="h-px w-full bg-white/10 mb-8"></div>
                <p className="text-2xl text-primary italic leading-tight" style={{ fontFamily: 'var(--font-body), "Clash Display", sans-serif' }}>
                  "the goal was never to be productive. the goal is to become the person who doesn't need to be reminded."
                </p>
              </div>
            </div>

            <div className="lg:w-2/3 space-y-8 text-lg text-foreground/70 leading-relaxed" style={{ fontFamily: 'var(--font-body), "Inter", sans-serif' }}>
              <p>
                built by <span className="text-foreground font-semibold">revathy rajeswaran</span>, a high school student from australia who became obsessed with solving the gap between knowing what to do and actually doing it.
              </p>
              <p>
                i'd read every book, watch every video, make every plan, and still wake up three weeks later having done nothing. the advice existed. the apps existed. but nothing made me <span className="text-primary">actually follow through.</span>
              </p>
              <p>
                so i built rrise. not for a business pitch. not for a portfolio. because i genuinely needed it, and i figured if i needed it this badly, maybe you do too.
              </p>
              <p>
                this isn't some random ai startup. it's a product built from frustration, late nights, and a stubborn belief that the right system can change everything.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-5xl text-foreground mb-16 border-b border-border pb-8" style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>Values.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className={`p-10 border-b md:border-b-0 md:border-r border-border transition-colors ${i === VALUES.length - 1 ? 'md:border-r-0' : ''}`}
              >
                <div className="text-primary text-sm tracking-widest mb-8" style={{ fontFamily: 'var(--font-heading), "Space Grotesk", sans-serif' }}>{v.num}</div>
                <h3 className="text-xl mb-4" style={{ fontFamily: 'var(--font-heading), "Monument Extended", sans-serif' }}>{v.title}</h3>
                <p className="text-foreground/60 leading-relaxed" style={{ fontFamily: 'var(--font-body), "Inter", sans-serif' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="border-t border-border pt-16"
        >
          <h2 className="font-monument text-3xl md:text-4xl text-foreground mb-12">Connect.</h2>
          <div className="flex flex-wrap gap-4">
            {SOCIALS.map((s, i) => (
              <a
                key={s.name}
                href={s.href}
                className="px-8 py-4 border border-border text-foreground font-space text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        </motion.div>
      </main>
    </RrisePageShell>
  );
}
