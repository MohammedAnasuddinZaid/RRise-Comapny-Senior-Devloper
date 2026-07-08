"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Header } from "../../components/layout/Header";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

const CONTACT_METHODS = [
  {
    icon: "mail",
    label: "Email",
    value: "rrisewebsite@gmail.com",
    color: "border-primary/20 bg-primary/5",
  },
  {
    icon: "clock",
    label: "Response time",
    value: "Usually within 24 hours",
    color: "border-secondary/20 bg-secondary/5",
  },
  {
    icon: "map",
    label: "Based in",
    value: "Sydney, Australia",
    color: "border-white/10 bg-white/3",
  },
];

type Status = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", issue: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.issue) return;

    setStatus("sending");

    // Open LinkedIn message with pre-filled content
    const linkedinUrl = `https://www.linkedin.com/messaging/thread/new/?`;
    const message = `Name: ${form.name}\n\nIssue: ${form.issue}`;
    
    // Open LinkedIn in new tab
    window.open(linkedinUrl, '_blank');

    setStatus("success");
    setForm({ name: "", issue: "" });

    setTimeout(() => setStatus("idle"), 5000);
  };

  const inputClass = (name: string) =>
    `w-full px-4 py-3.5 rounded-xl font-inter text-sm text-foreground placeholder:text-muted-foreground/50 bg-white/3 border transition-all duration-300 outline-none resize-none ${
      focused === name
        ? "border-primary/50 bg-white/5 shadow-[0_0_20px_rgba(0,255,135,0.08)]"
        : "border-white/8 hover:border-white/15"
    }`;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient */}
      <div className="dark:block hidden absolute top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-secondary/4 blur-[160px] pointer-events-none" />
      <div className="dark:block hidden absolute bottom-[5%] left-[-5%] w-[500px] h-[400px] rounded-full bg-primary/4 blur-[140px] pointer-events-none" />

      <Header />

      <main className="relative z-10 px-6 md:px-12 pt-32 pb-24 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/20 text-xs font-space text-secondary tracking-widest uppercase mb-6">
            Let's connect
          </div>
          <h1
            className="font-clash text-5xl md:text-6xl font-semibold text-foreground mb-4 leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Say{" "}
            <span className="gradient-text">hello</span>
          </h1>
          <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question, a collab idea, or just want to share feedback? I read every message personally.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="space-y-4">
              {CONTACT_METHODS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${m.color}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">{m.label.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-space text-xs text-muted-foreground uppercase tracking-widest">
                      {m.label}
                    </p>
                    <p className="font-inter text-sm text-foreground">{m.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message types */}
            <div className="p-6 rounded-2xl glass border border-white/8">
              <h3
                className="font-clash text-sm font-semibold text-foreground mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                What can I help with?
              </h3>
              <ul className="space-y-2">
                {[
                  "General feedback on RRise",
                  "Feature requests or bug reports",
                  "Partnership or collab ideas",
                  "Press or media inquiries",
                  "Just saying hello",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-inter text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div
              className="p-8 rounded-3xl glass border border-white/8"
              style={{ boxShadow: "0 12px 80px rgba(0,229,255,0.06)" }}
            >
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center text-center py-16 gap-5"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-16 h-16 text-primary" />
                    </motion.div>
                    <h3
                      className="font-clash text-2xl font-semibold text-foreground"
                      style={{ fontFamily: "'Clash Display', sans-serif" }}
                    >
                      Message sent!
                    </h3>
                    <p className="font-inter text-muted-foreground max-w-xs">
                      Thanks for reaching out. Revathy will get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block font-inter text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Name *
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        placeholder="Your name"
                        required
                        className={inputClass("name")}
                      />
                    </div>

                    <div>
                      <label className="block font-inter text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Issue *
                      </label>
                      <textarea
                        name="issue"
                        value={form.issue}
                        onChange={handleChange}
                        onFocus={() => setFocused("issue")}
                        onBlur={() => setFocused(null)}
                        placeholder="Describe your issue..."
                        required
                        rows={5}
                        className={inputClass("issue")}
                      />
                    </div>

                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Something went wrong. Please try again.
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={status === "sending"}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative w-full py-4 rounded-xl font-clash font-semibold text-sm overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed group"
                      style={{ fontFamily: "'Clash Display', sans-serif" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />
                      <span className="relative z-10 flex items-center justify-center gap-2 text-[#020408] font-bold">
                        {status === "sending" ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-[#020408]/30 border-t-[#020408] rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            Opening LinkedIn…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send via LinkedIn
                          </>
                        )}
                      </span>
                    </motion.button>

                    <p className="font-inter text-xs text-muted-foreground/50 text-center">
                      Opens LinkedIn messaging to send your issue directly
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
