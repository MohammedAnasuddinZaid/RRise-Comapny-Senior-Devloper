"use client";

import { motion } from "framer-motion";
import { Header } from "../../components/layout/Header";

/* Social links — replace hrefs when ready */
const SOCIALS = [
  {
    name: "LinkedIn",
    href: "#linkedin",
    color: "from-[#0077b5]/30 to-[#0077b5]/10",
    border: "border-[#0077b5]/30",
    glow: "rgba(0,119,181,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#instagram",
    color: "from-[#e1306c]/30 to-[#833ab4]/10",
    border: "border-[#e1306c]/30",
    glow: "rgba(225,48,108,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "#pinterest",
    color: "from-[#e60023]/30 to-[#e60023]/10",
    border: "border-[#e60023]/30",
    glow: "rgba(230,0,35,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    href: "#twitter",
    color: "from-white/15 to-white/5",
    border: "border-white/20",
    glow: "rgba(255,255,255,0.2)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567 5.95-5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#youtube",
    color: "from-[#ff0000]/30 to-[#ff0000]/10",
    border: "border-[#ff0000]/30",
    glow: "rgba(255,0,0,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const VALUES = [
  { icon: "flame", title: "Relentless Consistency", desc: "The gap between dreaming and doing is just showing up every day." },
  { icon: "brain", title: "Self-Awareness First", desc: "You can't improve what you don't understand. RRise helps you see yourself clearly." },
  { icon: "shield", title: "Built with Honesty", desc: "No bloat. No hype. Just tools that genuinely make your life better." },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient glows */}
      <div className="dark:block hidden absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/4 blur-[160px] pointer-events-none" />
      <div className="dark:block hidden absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-secondary/4 blur-[140px] pointer-events-none" />

      <Header />

      <main className="relative z-10 px-6 md:px-12 pt-32 pb-24 max-w-5xl mx-auto">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs font-space text-primary tracking-widest uppercase mb-8">
            The founder
          </div>
          <h1
            className="font-clash text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Built by someone who{" "}
            <span className="gradient-text">actually gets it</span>
          </h1>
        </motion.div>

        {/* Founder card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative p-8 md:p-12 rounded-3xl glass border border-primary/15 mb-16"
          style={{ boxShadow: "0 12px 80px rgba(0,255,135,0.08), 0 0 160px rgba(0,229,255,0.04)" }}
        >
          {/* Decorative quote mark */}
          <div
            className="absolute top-6 left-8 text-8xl font-monument text-primary/10 leading-none select-none pointer-events-none"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            "
          </div>

          <div className="relative z-10 space-y-8">
            {/* Avatar placeholder ring */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-[#020408] font-clash"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  R
                </div>
                <motion.div
                  className="absolute inset-[-4px] rounded-full border border-primary/40"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <p
                  className="font-clash text-lg font-semibold text-foreground"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Revathy Rajeswaran
                </p>
                <p className="font-inter text-sm text-muted-foreground">Founder · Sydney, Australia</p>
              </div>
            </div>

            {/* The story */}
            <div className="space-y-5 font-inter text-base md:text-lg text-foreground/85 leading-relaxed">
              <p>
                built by{" "}
                <span className="text-primary font-semibold">revathy rajeswaran</span>, a high school student from australia who became obsessed with solving the gap between knowing what to do and actually doing it.
              </p>
              <p>
                i'd read every book, watch every video, make every plan — and still wake up three weeks later having done nothing. the advice existed. the apps existed. but nothing made me{" "}
                <span className="text-secondary italic">actually follow through.</span>
              </p>
              <p>
                so i built rrise. not for a business pitch. not for a portfolio. because i genuinely needed it — and i figured if i needed it this badly, maybe you do too.
              </p>
              <p>
                this isn't some random ai startup. it's a product built from frustration, late nights, and a stubborn belief that the right system can change everything.
              </p>
            </div>

            {/* Closing quote */}
            <p className="font-clash text-xl text-primary/80 italic border-l-2 border-primary/30 pl-5"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              "the goal was never to be productive. the goal is to become the person who doesn't need to be reminded."
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <h2
            className="font-clash text-3xl font-semibold text-center text-foreground mb-10"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            What RRise stands for
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="p-6 rounded-2xl glass border border-white/8 text-center group transition-all duration-300 hover:border-primary/20"
                style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.2)" }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{v.title.charAt(0)}</span>
                </div>
                <h3
                  className="font-clash text-lg font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  {v.title}
                </h3>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2
            className="font-clash text-2xl font-semibold text-foreground mb-3"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Follow the journey
          </h2>
          <p className="font-inter text-sm text-muted-foreground mb-10">
            Building in public — come along for the ride.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {SOCIALS.map((s, i) => (
              <motion.a
                key={s.name}
                href={s.href}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.12, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br ${s.color} ${s.border} border backdrop-blur-xl group transition-all duration-300`}
                style={{ boxShadow: `0 4px 20px ${s.glow}00` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${s.glow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${s.glow}00`;
                }}
              >
                <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                  {s.icon}
                </span>
                <span className="font-inter text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                  {s.name}
                </span>
              </motion.a>
            ))}
          </div>
          <p className="font-inter text-xs text-muted-foreground/50 mt-6">
            Links coming soon — updating shortly.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
