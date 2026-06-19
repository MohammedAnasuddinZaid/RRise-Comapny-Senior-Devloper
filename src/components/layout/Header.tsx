"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { AuthModal } from "../auth/AuthModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Connect" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        {/* Enhanced glassmorphic backdrop */}
        <div className="absolute inset-0 glass-enhanced border-b border-white/5" />

        <div className="relative flex items-center justify-between px-6 md:px-12 h-20">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/images/RRISE NEW LOGO.png"
                alt="RRise"
                className="h-10 w-auto object-contain"
              />
            </motion.div>
            <span
              className="font-monument text-lg tracking-widest gradient-text hidden sm:block transition-all duration-300"
              style={{ fontFamily: "'Monument Extended', sans-serif", letterSpacing: "0.15em" }}
            >
              RRise
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative"
                >
                  <motion.div
                    className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right side — theme toggle + CTA */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full glass-enhanced border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-300"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Sign In CTA */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden md:block relative px-6 py-2.5 text-sm font-semibold rounded-full overflow-hidden group premium-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-0 group-hover:opacity-60 transition-opacity" />
              <span className="relative z-10 font-bold text-[#020408]">Sign In</span>
            </motion.button>

            {/* Mobile menu toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2.5 rounded-full glass-enhanced text-foreground border border-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 inset-x-0 z-40 glass-enhanced border-b border-white/5 px-6 py-6 flex flex-col gap-2 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <motion.button
              onClick={() => {
                setMobileOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="mt-3 px-5 py-3 rounded-full text-sm font-bold text-center bg-gradient-to-r from-primary to-secondary text-[#020408]"
            >
              Sign In
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
