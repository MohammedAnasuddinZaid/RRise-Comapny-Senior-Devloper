"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, CheckSquare, Target, CreditCard, Settings, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/app/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/app/tasks" },
  { icon: Target, label: "Habits", href: "/app/habits" },
  { icon: CreditCard, label: "Spending", href: "/app/spending" },
  { icon: Play, label: "Daily Loop", href: "/app/loop" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background overflow-hidden font-lora">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-md flex flex-col p-6 z-10 relative">
        <div className="mb-12 flex items-center px-2">
          <img 
            src="/images/RRISE NEW LOGO.png" 
            alt="RRise Logo" 
            className="h-9 w-auto object-contain"
          />
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
