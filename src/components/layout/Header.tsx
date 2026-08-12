"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { AuthModal } from "../auth/AuthModal";
import { InstallButton } from "../ui/InstallButton";
import { SquashHamburger } from "../synapsex/SquashHamburger";
import RriseParrot from "../rrise/RriseParrot";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isVoid = pathname === "/";

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* Glass void backdrop */}
        <div
          className="absolute inset-0 border-b"
          style={{
            background: isVoid
              ? "rgba(0,0,0,0.35)"
              : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        />

        <div className="relative flex items-center justify-between px-4 sm:px-6 md:px-10 h-20">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-3 group z-10">
            <RriseParrot
              size={46}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span
              className="text-lg font-mono-space tracking-[0.18em] text-white uppercase transition-all duration-300 group-hover:text-[#b9a2ff]"
              style={{ fontFamily: '"Space Mono", monospace', fontWeight: 400 }}
            >
              RRise
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border px-2 py-1.5"
            style={{ borderColor: "rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-full"
                >
                  <motion.span
                    className={`nav-link text-[13px] uppercase tracking-[0.14em] ${
                      isActive ? "!text-white" : ""
                    }`}
                    style={isActive ? { textShadow: "0 0 16px rgba(128,82,255,0.9)" } : undefined}
                    whileHover={{ y: -1 }}
                  >
                    {link.label}
                  </motion.span>
                  {isActive && (
                    <motion.span
                      layoutId="rrise-nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(128,82,255,0.16)",
                        border: "1px solid rgba(128,82,255,0.4)",
                        boxShadow: "0 0 24px rgba(128,82,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {/* Install app — desktop */}
            <InstallButton
              showLabel={false}
              className="hidden sm:flex h-11 w-11"
            />

            {user ? (
              <>
                <Link
                  href="/app/dashboard"
                  className="pill-iris hidden sm:flex items-center gap-2 px-5 h-11 text-[13px] uppercase tracking-[0.12em] font-mono-space"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full border border-white/10 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="pill-iris hidden sm:flex items-center gap-2 px-6 h-11 text-sm uppercase tracking-[0.12em] font-mono-space"
              >
                Sign In
              </motion.button>
            )}

            {/* Mobile toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <SquashHamburger open={mobileOpen} mobile />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 z-40 lg:hidden px-4 pb-6"
            style={{ top: "calc(5rem + env(safe-area-inset-top))" }}
          >
            <div
              className="rounded-3xl p-5 flex flex-col gap-1 border"
              style={{
                background: "rgba(8,8,14,0.92)",
                borderColor: "rgba(128,82,255,0.25)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(128,82,255,0.15)",
              }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm uppercase tracking-[0.14em] transition-all ${
                      pathname === link.href
                        ? "text-white"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                    style={
                      pathname === link.href
                        ? { background: "rgba(128,82,255,0.16)", border: "1px solid rgba(128,82,255,0.35)" }
                        : undefined
                    }
                  >
                    {link.label}
                    <span style={{ color: pathname === link.href ? "#8052ff" : "rgba(255,255,255,0.2)" }}>
                      →
                    </span>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex flex-col gap-2"
              >
                {/* Install app — mobile */}
                <InstallButton
                  showLabel
                  label="Install App"
                  className="w-full h-12 flex"
                />

                {user ? (
                  <>
                    <Link
                      href="/app/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="pill-iris flex h-12 w-full items-center justify-center gap-2 text-sm uppercase tracking-[0.12em] font-mono-space"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 font-mono-space text-sm uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    onClick={() => {
                      setMobileOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="pill-iris h-12 text-sm uppercase tracking-[0.12em]"
                  >
                    Sign In
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
