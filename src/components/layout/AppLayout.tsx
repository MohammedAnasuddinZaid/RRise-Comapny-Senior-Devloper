"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, CheckSquare, CreditCard, Settings, MessageSquare, Clock, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useRequireAuth } from "../../lib/authGuard";
import { loadUserProfile } from "../../lib/dataLoader";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/app/dashboard" },
  { icon: MessageSquare, label: "Chat", href: "/app/chat" },
  { icon: Clock, label: "History", href: "/app/history" },
  { icon: CheckSquare, label: "Tasks", href: "/app/tasks" },
  { icon: CreditCard, label: "Spending", href: "/app/spending" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useRequireAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const profile = await loadUserProfile(user.id);
        setUserProfile(profile);
      }
    }
    loadProfile();
  }, [user]);

  const plan = userProfile?.plan || "FREE";

  return (
    <div className="flex h-screen bg-background overflow-hidden font-lora">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-md flex flex-col p-6 z-10 relative">
        <div className="mb-12 flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img 
              src="/images/RRISE NEW LOGO.png" 
              alt="RRise Logo" 
              className="h-9 w-auto object-contain"
            />
          </Link>
          {plan !== "free" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
              <Crown className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">{plan}</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 space-y-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-300",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(194,159,109,0.05)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute -left-6 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(194,159,109,0.8)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <Link href="/app/settings">
            <div className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
              <Settings className="h-5 w-5" />
              Settings
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="max-w-6xl mx-auto w-full p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
