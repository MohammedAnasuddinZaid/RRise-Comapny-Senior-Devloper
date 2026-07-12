"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, CheckSquare, CreditCard, Settings, MessageSquare,
  Clock, Crown, Menu, X, ChevronLeft, ChevronRight,
  Plus, Trash2, MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useRequireAuth } from "../../lib/authGuard";
import { loadUserProfile } from "../../lib/dataLoader";
import { createClientComponentClient } from "../../lib/supabase";
import { useChatContext } from "../../contexts/ChatContext";

const NAV_ITEMS = [
  { icon: Home,         label: "Home",    href: "/app/dashboard" },
  { icon: MessageSquare,label: "Chat",    href: "/app/chat" },
  { icon: Clock,        label: "History", href: "/app/history" },
  { icon: CheckSquare,  label: "Tasks",   href: "/app/tasks" },
  { icon: CreditCard,   label: "Spending",href: "/app/spending" },
];

// ─── Conversation list shown inside sidebar when on /app/chat ───────────────
function ConversationList({ collapsed }: { collapsed: boolean }) {
  const { user } = useRequireAuth();
  const { selectedConversationId, setSelectedConversationId, refreshTrigger } = useChatContext();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClientComponentClient();
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (_) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  const handleDelete = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm("Delete this conversation?")) return;
    try {
      const supabase = createClientComponentClient();
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch("/api/chat/conversations", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId }),
      });
      if (res.ok) {
        if (selectedConversationId === convId) setSelectedConversationId(null);
        load();
      }
    } catch (_) {}
  };

  if (collapsed) return null; // don't show in icon-only mode

  return (
    <div className="mt-4 flex flex-col gap-1">
      {/* New chat */}
      <button
        onClick={() => setSelectedConversationId(null)}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 border border-dashed border-white/10 hover:border-primary/30 transition-all duration-200"
      >
        <Plus className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">New Chat</span>
      </button>

      {/* Conversation list */}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
        {loading && (
          <div className="text-xs text-muted-foreground/50 px-3 py-2">Loading…</div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="text-xs text-muted-foreground/40 px-3 py-2 italic">No conversations yet</div>
        )}
        {conversations.map((conv: any) => {
          const isActive = selectedConversationId === conv.id;
          return (
            <div
              key={conv.id}
              onClick={() => setSelectedConversationId(conv.id)}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              )}
            >
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{conv.title || "Untitled"}</p>
                <p className="text-[10px] text-muted-foreground/50">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all flex-shrink-0"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main layout ─────────────────────────────────────────────────────────────
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useRequireAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOnChat = pathname?.startsWith("/app/chat");

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const profile = await loadUserProfile(user.id);
        setUserProfile(profile);
      }
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const plan = userProfile?.plan || "FREE";

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn("mb-8 flex items-center px-2", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img
              src="/images/rrise-logo.webp"
              alt="RRise Logo"
              className="h-9 w-auto object-contain"
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="flex items-center cursor-pointer">
            <img
              src="/images/Logo.webp"
              alt="RRise"
              className="h-9 w-9 object-contain"
            />
          </Link>
        )}
        {!collapsed && plan !== "free" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase">{plan}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <div key={item.href}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center rounded-xl px-3 py-3 text-[15px] font-medium transition-all duration-300",
                    collapsed ? "justify-center" : "gap-4 px-4",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(0,255,135,0.05)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  {!collapsed && item.label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute -left-3 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,255,135,0.8)]"
                    />
                  )}
                </motion.div>
              </Link>

              {/* Chat history — shown inline under the Chat nav item */}
              {item.href === "/app/chat" && isOnChat && !collapsed && (
                <ConversationList collapsed={collapsed} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <Link href="/app/settings">
          <div
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center rounded-xl px-3 py-3 text-[15px] font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors",
              collapsed ? "justify-center" : "gap-4 px-4"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && "Settings"}
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-lora">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md z-10 relative transition-all duration-300",
          sidebarCollapsed ? "w-[72px] p-4" : "w-64 p-6"
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all z-20 shadow-md"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {/* ── Mobile Hamburger Button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:border-primary/30 transition-all shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Mobile Drawer Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-black/90 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto relative z-0 min-w-0">
        <div className="max-w-6xl mx-auto w-full p-4 pt-16 md:pt-8 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
