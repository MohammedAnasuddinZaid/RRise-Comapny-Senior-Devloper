"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { AuthModal } from "../auth/AuthModal";
import { ThemeSelector } from "../ui/ThemeSelector";

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

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        {/* Enhanced glassmorphic backdrop */}
        <div className="absolute inset-0 glass-enhanced border-b border-border" />

        <div className="relative flex items-center justify-between px-6 md:px-12 h-20">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/images/rrise-logo.webp"
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

          {/* Right side — theme selector + CTA */}
          <div className="flex items-center gap-4">
            {/* Theme selector */}
            <ThemeSelector />

            {/* Sign In CTA */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden md:block relative px-6 py-2.5 text-sm font-semibold rounded-full overflow-hidden group premium-glow"
            >
              <div className="absolute inset-0 bg- transition-opacity" />
              <div className="absolute inset-0 bg- blur-xl opacity-0 group-hover:opacity-60 transition-opacity" />
              <span className="relative z-10 font-bold text-[#020408]">Sign In</span>
            </motion.button>

            {/* Mobile menu toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2.5 rounded-full glass-enhanced text-foreground border border-border"
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
            className="fixed top-20 inset-x-0 z-40 glass-enhanced border-b border-border px-6 py-6 flex flex-col gap-2 md:hidden"
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
              className="mt-3 px-5 py-3 rounded-full text-sm font-bold text-center bg- text-[#020408]"
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
