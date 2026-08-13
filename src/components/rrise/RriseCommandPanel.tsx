"use client";

/**
 * RRISE COMMAND CENTER
 * A terminal-style command panel pinned to the bottom-left of every page.
 *
 * - Launcher pill (bottom-left) carries the RRise parrot mark + "RRISE" + ">_".
 * - Opens a retro terminal that answers questions about the website from a
 *   bundled knowledge base (no external calls). Ask anything in plain English
 *   or use slash commands.
 * - Closable via the header X, the `exit`/`close`/`quit` commands, or Esc.
 *
 * Knowledge base lives in this file so the whole website's info is self-
 * contained, offline-friendly, and instantly searchable.
 */

import { useEffect, useRef, useState, type KeyboardEvent, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SquareTerminal, ChevronRight } from "lucide-react";

type Tone = "boot" | "cmd" | "info" | "accent" | "success" | "error" | "muted" | "divider";

interface Line {
  text: string;
  tone: Tone;
}

interface KBEntry {
  id: string;
  title: string;
  keywords: Array<[string, number]>; // [keyword, weight]
  answer: string[];
}

/* ─── Knowledge base: everything about the RRise website ───────────────── */
const KB: KBEntry[] = [
  {
    id: "identity",
    title: "What is RRise?",
    keywords: [
      ["what is rrise", 3],
      ["what is r rise", 3],
      ["what is this", 2],
      ["about rrise", 2],
      ["about the website", 2],
      ["who are you", 2],
      ["what does rrise do", 2],
      ["what does rrise", 2],
      ["company", 1.5],
      ["website", 1],
      ["product", 1.5],
      ["rrise", 1],
    ],
    answer: [
      "RRise is a premium personal development workspace.",
      "Tagline: Rise. Build. Become.",
      "",
      "It's a Growth Operating System that combines goals,",
      "habits, tasks, finance tracking, analytics and an AI",
      "companion (Alex) to bridge the gap between knowing",
      "what to do and actually doing it.",
      "",
      "Founded 2026 · Sydney, Australia · Built for doers,",
      "zero corporate fluff.",
    ],
  },
  {
    id: "founder",
    title: "Who built RRise?",
    keywords: [
      ["who built rrise", 3],
      ["who made rrise", 3],
      ["who created rrise", 3],
      ["founder", 2.5],
      ["who started", 2],
      ["who runs", 2],
      ["revathy", 3],
      ["rajeswaran", 3],
      ["ceo", 2],
      ["creator", 2],
      ["high schooler", 2.5],
      ["made this", 1.5],
    ],
    answer: [
      "RRise was built by Revathy Rajeswaran,",
      "a high school student from Sydney, Australia.",
      "",
      "She built it out of real frustration — after reading every",
      "book and making every plan, she still wasn't following",
      "through. So she built the system she needed.",
      "",
      "Quote: \"the goal was never to be productive. the goal is",
      "to become the person who doesn't need to be reminded.\"",
    ],
  },
  {
    id: "features",
    title: "RRise features",
    keywords: [
      ["features", 2.5],
      ["what can i do", 2],
      ["goal tracking", 2.5],
      ["habit tracking", 2.5],
      ["analytics", 2],
      ["streaks", 2],
      ["mascot", 1.5],
      ["finance", 2],
      ["spending", 2],
      ["money", 1.5],
      ["tasks", 1.5],
      ["tracking", 1.5],
      ["dashboards", 2],
      ["charts", 1.5],
      ["budget", 2],
    ],
    answer: [
      "Core RRise features:",
      "",
      "  01  Goal Tracking — break big goals into steps",
      "  02  Analytics Dashboard — visualize your growth",
      "  03  Habit Building — streaks, reminders, coaching",
      "  04  Finance Tracking — budgets & spending insights",
      "  05  Streaks — make consistency addictive",
      "  06  Mascot Evolution — your parrot levels up as you do",
      "  07  Alex — your always-on AI companion",
    ],
  },
  {
    id: "pricing",
    title: "Pricing & plans",
    keywords: [
      ["pricing", 3],
      ["how much", 3],
      ["price", 2],
      ["cost", 2.5],
      ["plans", 2.5],
      ["plan", 1.5],
      ["subscription", 2.5],
      ["free", 2],
      ["pro", 1.5],
      ["ultra", 1.5],
      ["pay", 2],
      ["buy", 1.5],
      ["upgrade", 2],
      ["monthly", 1.5],
      ["tiers", 2.5],
    ],
    answer: [
      "RRise pricing (per month):",
      "",
      "  FREE   $0  forever — goals, habits, tasks, dashboards,",
      "               streaks, mascot, free + BYOK chat usage",
      "  PRO    $20 — Discord community, monthly AI insights,",
      "               expert recommendations, human plans,",
      "               advanced analytics, better support",
      "  ULTRA  $40 — everything in Pro + human accountability,",
      "               check-ins, personalised feedback, community",
      "",
      "Sign in → /pricing to upgrade, or type 'pricing'.",
    ],
  },
  {
    id: "install",
    title: "Installing the app",
    keywords: [
      ["install", 3],
      ["install rrise", 3],
      ["download", 2.5],
      ["download the app", 2.5],
      ["app", 1.5],
      ["pwa", 3],
      ["add to home screen", 3],
      ["offline", 2],
      ["install app", 3],
      ["can i install", 3],
      ["mobile", 1.5],
      ["phone", 1.5],
      ["desktop", 1.5],
    ],
    answer: [
      "Yes — RRise is a PWA, so it installs like a native app.",
      "",
      "  Android / Chrome / Edge / Desktop:",
      "    Hit the Install button in the header (or the prompt",
      "    that slides up) → native install dialog → Install.",
      "",
      "  iPhone / iPad (no prompt event exists):",
      "    Tap Share → 'Add to Home Screen' → Add.",
      "",
      "Installed app opens fullscreen, works offline, and shows",
      "the parrot icon on your home screen.",
    ],
  },
  {
    id: "ai",
    title: "Alex — AI modes",
    keywords: [
      ["alex", 3],
      ["ai", 2],
      ["ai companion", 3],
      ["chatbot", 2],
      ["chat", 1.5],
      ["byok", 3],
      ["api key", 2],
      ["openai", 1.5],
      ["gemini", 1.5],
      ["claude", 1.5],
      ["anthropic", 2],
      ["openrouter", 2],
      ["groq", 2],
      ["artificial intelligence", 2.5],
      ["coach", 2],
      ["assistant", 1.5],
    ],
    answer: [
      "Alex is RRise's always-on AI companion.",
      "",
      "Three modes:",
      "  FREE  — template-based coaching, no key needed",
      "  BYOK  — bring your own key: OpenAI, Gemini,",
      "          Anthropic, Groq or OpenRouter",
      "  PRO   — hosted AI (coming soon)",
      "",
      "Crisis detection runs first — if you mention self-harm,",
      "Alex shares crisis resources (988, Crisis Text Line).",
    ],
  },
  {
    id: "contact",
    title: "Contact & socials",
    keywords: [
      ["contact", 3],
      ["email", 3],
      ["rrisewebsite@gmail.com", 3],
      ["reach", 2],
      ["message", 1.5],
      ["connect", 2],
      ["support", 2],
      ["get in touch", 3],
      ["phone", 2],
      ["social", 2],
      ["instagram", 2],
      ["youtube", 2],
      ["linkedin", 2],
      ["twitter", 2],
      ["pinterest", 2],
    ],
    answer: [
      "Ways to reach RRise:",
      "",
      "  Email     rrisewebsite@gmail.com",
      "  Response  usually within 24 hours",
      "  Based in  Sydney, Australia",
      "",
      "Socials: LinkedIn, Instagram, Pinterest, Twitter/X,",
      "and YouTube (@rrise.rev21).",
      "",
      "The Connect page opens LinkedIn messaging to send",
      "your message directly to the founder.",
    ],
  },
  {
    id: "pages",
    title: "Website pages",
    keywords: [
      ["pages", 2.5],
      ["navigation", 2.5],
      ["menu", 2],
      ["links", 2],
      ["sections", 2.5],
      ["where is", 1.5],
      ["page", 1.5],
      ["routes", 2.5],
      ["directory", 2.5],
    ],
    answer: [
      "RRise website pages:",
      "",
      "  /            Home",
      "  /features    Features",
      "  /about       About & founder",
      "  /pricing     Plans & pricing",
      "  /contact     Connect",
      "  /privacy     Privacy policy",
      "  /terms       Terms",
      "",
      "Signed-in app: /app/dashboard, /app/habits,",
      "/app/tasks, /app/spending, /app/chat,",
      "/app/history, /app/settings.",
    ],
  },
  {
    id: "stack",
    title: "Tech stack",
    keywords: [
      ["tech", 3],
      ["stack", 3],
      ["technology", 3],
      ["built with", 2.5],
      ["framework", 2],
      ["nextjs", 3],
      ["next.js", 3],
      ["react", 2],
      ["supabase", 3],
      ["stripe", 3],
      ["database", 2.5],
      ["backend", 2],
      ["tailwind", 2],
      ["three.js", 2],
      ["framer", 2],
      ["hosting", 2],
      ["how is it built", 2],
    ],
    answer: [
      "RRise is built on:",
      "",
      "  Frontend  Next.js 16 (App Router), React 19,",
      "            Tailwind CSS v4, Framer Motion, Three.js,",
      "            Lenis smooth scroll",
      "  Backend   Supabase (PostgreSQL + Auth + RLS)",
      "  Payments  Stripe Checkout + webhooks",
      "  AI        Alex via Free templates / BYOK keys",
      "  PWA       Service worker + manifest → installable",
    ],
  },
  {
    id: "privacy",
    title: "Privacy & security",
    keywords: [
      ["privacy", 3],
      ["security", 3],
      ["secure", 2.5],
      ["safe", 2],
      ["data", 2],
      ["encryption", 3],
      ["policy", 2],
      ["terms", 2],
      ["your data", 2.5],
      ["private", 2],
    ],
    answer: [
      "Security & privacy at RRise:",
      "",
      "  - Auth handled by Supabase (Google OAuth / email)",
      "  - Row Level Security gates every table",
      "  - Admin APIs protected by admin-only checks",
      "  - BYOK API keys encrypted at rest server-side",
      "  - Crisis messages handled with care, not moderation",
      "",
      "Full details: /privacy and /terms pages.",
    ],
  },
  {
    id: "mascot",
    title: "The parrot mascot",
    keywords: [
      ["mascot", 3],
      ["parrot", 3],
      ["bird", 2.5],
      ["companion", 1.5],
      ["evolution", 2.5],
      ["evolves", 2.5],
      ["egg", 2],
      ["levels", 2],
      ["tier", 2],
      ["grow", 1.5],
    ],
    answer: [
      "RRise's mascot is a parrot — the company symbol.",
      "",
      "It evolves as you complete habits & tasks:",
      "",
      "  0-20%    Egg",
      "  21-40%   Baby",
      "  41-60%   Young",
      "  61-80%   Adult",
      "  81-100%  Elder",
      "",
      "The longer your streak, the more powerful and vibrant",
      "your parrot becomes. Progress updates instantly.",
    ],
  },
  {
    id: "crisis",
    title: "Crisis support",
    keywords: [
      ["crisis", 3],
      ["suicide", 3],
      ["self harm", 3],
      ["self-harm", 3],
      ["hurt myself", 3],
      ["kill myself", 3],
      ["want to die", 3],
      ["988", 3],
      ["emergency", 2.5],
      ["helpline", 2.5],
      ["help line", 2.5],
      ["crisis line", 3],
      ["end my life", 3],
    ],
    answer: [
      "You matter. Please reach out — free, confidential, 24/7:",
      "",
      "  National Suicide Prevention Lifeline:  988",
      "  Crisis Text Line: text HOME to 741741",
      "  International:  https://findahelpline.com",
      "",
      "Alex detects these moments first and shares these",
      "resources before anything else. You are not alone.",
    ],
  },
  {
    id: "start",
    title: "Getting started",
    keywords: [
      ["sign up", 3],
      ["signup", 3],
      ["sign in", 3],
      ["login", 3],
      ["start for free", 3],
      ["how do i start", 3],
      ["register", 2],
      ["account", 2],
      ["google", 1.5],
      ["auth", 2],
      ["get started", 2.5],
      ["begin", 1.5],
      ["create account", 2.5],
      ["make an account", 2.5],
    ],
    answer: [
      "Getting started is quick:",
      "",
      "  1. Click 'Start for free' or 'Sign In' in the header",
      "  2. Log in with Google or email/password (Supabase auth)",
      "  3. Land in the app → /app/dashboard",
      "  4. Set a goal, add a habit, and watch your parrot grow",
      "",
      "Free forever plan. Upgrade anytime on /pricing.",
    ],
  },
  {
    id: "dashboard",
    title: "Inside the app",
    keywords: [
      ["dashboard", 3],
      ["workspace", 2.5],
      ["where do i track", 2.5],
      ["track", 1.5],
      ["app", 1.5],
      ["inside", 1.5],
      ["screen", 1.5],
      ["after login", 2.5],
    ],
    answer: [
      "Once signed in, you get a full workspace:",
      "",
      "  /app/dashboard  overview & progress",
      "  /app/habits     habit tracking & streaks",
      "  /app/tasks      daily tasks",
      "  /app/spending   finance tracking",
      "  /app/chat       talk to Alex (AI)",
      "  /app/history    past activity",
      "  /app/settings   profile & API keys",
    ],
  },
];

/* ─── Help text ────────────────────────────────────────────────────────── */
const HELP_LINES: Line[] = [
  { text: "RRISE COMMAND CENTER — available commands:", tone: "accent" },
  { text: "  help        show this help", tone: "info" },
  { text: "  about       what RRise is + who built it", tone: "info" },
  { text: "  features    list of features", tone: "info" },
  { text: "  pricing     plans & cost", tone: "info" },
  { text: "  install     how to install the app (PWA)", tone: "info" },
  { text: "  ai          Alex AI modes & BYOK", tone: "info" },
  { text: "  contact     email / socials", tone: "info" },
  { text: "  pages       site navigation", tone: "info" },
  { text: "  stack       tech stack", tone: "info" },
  { text: "  mascot      the parrot evolution", tone: "info" },
  { text: "  crisis      crisis support resources", tone: "info" },
  { text: "  clear       clear the screen", tone: "info" },
  { text: "  exit        close the command center", tone: "info" },
  { text: "", tone: "divider" },
  { text: "Or just ask a question in plain English, e.g.", tone: "muted" },
  { text: "  \"how much does rrise cost?\"", tone: "muted" },
  { text: "  \"who made this website?\"", tone: "muted" },
  { text: "  \"can i install the app?\"", tone: "muted" },
];

const SUGGESTIONS = [
  "What is RRise?",
  "How much does it cost?",
  "Can I install the app?",
  "Who built this?",
  "What features are there?",
  "Contact email",
];

const BOOT_LINES: Line[] = [
  { text: "RRISE COMMAND CENTER v1.0 — rise.build.become.", tone: "boot" },
  { text: "System online. Knowledge base loaded.", tone: "boot" },
  { text: "Ask me anything about the website, or type 'help'.", tone: "muted" },
  { text: "", tone: "divider" },
];

const COMMANDS: Record<string, string[]> = {
  about: ["identity", "founder"],
  who: ["identity", "founder"],
  features: ["features"],
  pricing: ["pricing"],
  plans: ["pricing"],
  install: ["install"],
  download: ["install"],
  ai: ["ai"],
  alex: ["ai"],
  contact: ["contact"],
  email: ["contact"],
  pages: ["pages"],
  nav: ["pages"],
  stack: ["stack"],
  tech: ["stack"],
  mascot: ["mascot"],
  parrot: ["mascot"],
  security: ["privacy"],
  privacy: ["privacy"],
  crisis: ["crisis"],
  help: ["help"],
  start: ["start"],
  signup: ["start"],
  signin: ["start"],
  login: ["start"],
  dashboard: ["dashboard"],
};

function matchEntry(query: string): KBEntry | null {
  const q = ` ${query.toLowerCase()} `;
  let best: KBEntry | null = null;
  let bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const [keyword, weight] of entry.keywords) {
      if (q.includes(keyword)) score += keyword.length * weight;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore >= 6 ? best : null;
}

function entryLines(entry: KBEntry, query: string): Line[] {
  const lines: Line[] = [
    { text: `> ${query}`, tone: "cmd" },
    { text: `» ${entry.title}`, tone: "accent" },
    { text: "", tone: "divider" },
    ...entry.answer.map((t) => ({ text: t, tone: "info" as Tone })),
  ];
  return lines;
}

function unknownLines(query: string): Line[] {
  return [
    { text: `> ${query}`, tone: "cmd" },
    { text: "No direct answer found in the knowledge base.", tone: "error" },
    { text: "Try one of these instead:", tone: "muted" },
    { text: "  help · about · features · pricing · install · ai", tone: "info" },
    { text: "  contact · pages · stack · mascot · crisis", tone: "info" },
  ];
}

export function RriseCommandPanel() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (!bootedRef.current) {
      bootedRef.current = true;
      setLines(BOOT_LINES);
    }
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  const appendLines = (next: Line[]) => {
    setLines((prev) => [...prev, ...next]);
  };

  const handleSubmit = (raw?: string) => {
    const query = (raw ?? input).trim();
    if (!query) return;
    setInput("");
    setHint("");

    const lower = query.toLowerCase();

    if (lower === "clear") {
      setLines([]);
      return;
    }
    if (lower === "help" || lower === "/help") {
      appendLines([{ text: `> ${query}`, tone: "cmd" }, ...HELP_LINES]);
      return;
    }
    if (lower === "exit" || lower === "close" || lower === "quit" || lower === "/exit") {
      appendLines([
        { text: `> ${query}`, tone: "cmd" },
        { text: "Shutting down. See you soon — rise, build, become.", tone: "boot" },
      ]);
      setTimeout(() => setOpen(false), 450);
      return;
    }

    // Slash-style commands
    const cmdKey = lower.replace(/^\/+/, "").split(/\s+/)[0];
    if (COMMANDS[cmdKey]) {
      const entries = COMMANDS[cmdKey]
        .map((id) => KB.find((e) => e.id === id))
        .filter(Boolean) as KBEntry[];
      const combined: Line[] = [{ text: `> ${query}`, tone: "cmd" }];
      entries.forEach((entry, i) => {
        if (i > 0) combined.push({ text: "", tone: "divider" });
        combined.push({ text: `» ${entry.title}`, tone: "accent" });
        combined.push({ text: "", tone: "divider" });
        entry.answer.forEach((t) => combined.push({ text: t, tone: "info" }));
      });
      appendLines(combined);
      return;
    }

    const entry = matchEntry(lower);
    if (entry) {
      appendLines(entryLines(entry, query));
      return;
    }
    appendLines(unknownLines(query));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      if (input) setInput("");
      else setOpen(false);
    }
  };

  return (
    <>
      {/* Floating launcher — bottom-left */}
      <motion.button
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 left-4 z-[1000] flex items-center gap-2.5 rounded-full border px-3.5 py-2 sm:px-4 sm:py-2.5"
        style={{
          background: "rgba(8,8,14,0.92)",
          borderColor: open ? "rgba(128,82,255,0.7)" : "rgba(128,82,255,0.35)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 30px rgba(128,82,255,0.22)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
        aria-label="Toggle RRise command center"
        aria-expanded={open}
      >
        <img
          src="/images/rrise-parrot-logo.png"
          alt=""
          className="h-6 w-6 object-contain sm:h-7 sm:w-7"
          draggable={false}
        />
        <span
          className="font-mono-space text-[12px] sm:text-[13px] uppercase tracking-[0.18em] text-white"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          RRise
        </span>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #8052ff, #ffb829)",
            boxShadow: "0 0 14px rgba(128,82,255,0.7)",
          }}
        >
          <SquareTerminal className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
        </span>
      </motion.button>

      {/* Terminal panel */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[999] hidden sm:block" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed bottom-20 left-4 z-[1000] w-[calc(100vw-2rem)] max-w-[440px] overflow-hidden rounded-2xl border"
              style={{
                background: "rgba(6,6,10,0.97)",
                borderColor: "rgba(128,82,255,0.4)",
                boxShadow: "0 32px 90px rgba(0,0,0,0.85), 0 0 60px rgba(128,82,255,0.16)",
                backdropFilter: "blur(26px)",
                WebkitBackdropFilter: "blur(26px)",
              }}
              role="dialog"
              aria-modal="false"
              aria-label="RRise command center"
            >
              {/* Scanline sweep */}
              <div className="cmd-scan pointer-events-none absolute inset-0 z-20" />

              {/* Title bar */}
              <div
                className="relative flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
                </div>
                <div className="flex items-center gap-2 font-mono-space text-[11px] uppercase tracking-[0.22em] text-white/70">
                  <span className="eyebrow-dot" />
                  RRise — Command Center
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close command center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Output */}
              <div
                ref={scrollRef}
                className="cmd-body relative h-[300px] overflow-y-auto px-4 py-4 sm:h-[340px]"
                style={{ fontFamily: '"Space Mono", monospace' }}
              >
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className="whitespace-pre-wrap text-[12px] leading-relaxed"
                    style={toneStyle(line.tone)}
                  >
                    {line.text || "\u00A0"}
                  </div>
                ))}

                {/* Suggestion chips */}
                {lines.length === 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSubmit(s)}
                        className="rounded-full border px-3 py-1.5 text-[11px] transition-colors"
                        style={{
                          borderColor: "rgba(128,82,255,0.35)",
                          background: "rgba(128,82,255,0.08)",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input row */}
              <div
                className="relative flex items-center gap-2 border-t px-4 py-3"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <span
                  className="font-mono-space text-[12px]"
                  style={{ color: "#ffb829", fontWeight: 700 }}
                >
                  C:\RRISE&gt;
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hint || "Ask anything about RRise…"}
                  className="min-w-0 flex-1 bg-transparent font-mono-space text-[12px] text-white outline-none placeholder:text-white/30"
                  style={{ fontFamily: '"Space Mono", monospace' }}
                  aria-label="Ask the RRise command center"
                />
                <span className="cmd-cursor" aria-hidden />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSubmit()}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                  style={{ background: "rgba(128,82,255,0.25)" }}
                  aria-label="Send command"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function toneStyle(tone: Tone): CSSProperties {
  switch (tone) {
    case "boot":
      return { color: "rgba(255,255,255,0.55)" };
    case "cmd":
      return { color: "#ffffff", fontWeight: 700 };
    case "accent":
      return { color: "#b9a2ff", fontWeight: 700 };
    case "success":
      return { color: "#28c840" };
    case "error":
      return { color: "#ff5f57" };
    case "muted":
      return { color: "rgba(255,255,255,0.4)" };
    case "divider":
      return { height: 8, marginBottom: 4 };
    default:
      return { color: "rgba(255,255,255,0.85)" };
  }
}