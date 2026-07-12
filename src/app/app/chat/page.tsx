"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Send, Sparkles, Play, ChevronDown, Lock, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { LottieAnimation } from "../../../components/ui/LottieAnimation";
import greenParrot from "../../../../public/lottie/green_parrot.json";
import { audioManager } from "../../../lib/audioManager";
import { useTheme } from "../../../contexts/ThemeContext";
import { searchTemplates, loadAllTemplates } from "../../../lib/templateLoader";
import { generateAIResponse, getFollowUpQuestions } from "../../../lib/aiMode";
import { performSafetyCheck, filterAIResponse, logSafetyViolation } from "../../../lib/aiSafety";
import type { Template } from "../../../lib/templateLoader";
import { useRequireAuth } from "../../../lib/authGuard";
import { createHabit, createTask } from "../../../lib/dataLoader";
import { saveMemory } from "../../../lib/memorySystem";
import { hasActiveAIKey } from "../../../lib/byok";
import { loadUserProfile } from "../../../lib/dataLoader";
import { getPlanBadgeColor, getPlanDisplayName, isAIEnabled, isFeatureAvailable } from "../../../lib/planLogic";
import { createClientComponentClient } from "@/lib/supabase";
import { useChatContext } from "../../../contexts/ChatContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── helpers ──────────────────────────────────────────────────────────────────
async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

// ── Chat page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { theme } = useTheme();
  const { user } = useRequireAuth();
  const router = useRouter();

  // Context shared with sidebar conversation list
  const {
    selectedConversationId,
    setSelectedConversationId,
    triggerRefresh,
  } = useChatContext();

  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; plans?: Template[]; followUpQuestions?: string[] }>
  >([]);
  const [input, setInput]         = useState("");
  const [startingPlan, setStartingPlan] = useState<string | null>(null);
  const [selectedAPI, setSelectedAPI] = useState<"free" | "byok" | "pro">("free");
  const [showAPIDropdown, setShowAPIDropdown] = useState(false);
  const [hasBYOK, setHasBYOK]     = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showBYOKPopup, setShowBYOKPopup] = useState(false);

  // track the "active" conversation id locally too (mirrors context)
  const activeConvIdRef = useRef<string | null>(selectedConversationId);
  activeConvIdRef.current = selectedConversationId;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── load profile & keys ──
  useEffect(() => {
    async function init() {
      if (!user) return;
      const profile = await loadUserProfile(user.id);
      setUserProfile(profile);
      const hasOAI  = await hasActiveAIKey(user.id, "openai");
      const hasGem  = await hasActiveAIKey(user.id, "gemini");
      const hasAnt  = await hasActiveAIKey(user.id, "anthropic");
      const hasOR   = await hasActiveAIKey(user.id, "openrouter");
      const keysOK  = hasOAI || hasGem || hasAnt || hasOR;
      setHasBYOK(keysOK);
      setSelectedAPI("free");
      if (keysOK) {
        setShowBYOKPopup(true);
        setTimeout(() => setShowBYOKPopup(false), 3000);
      }
    }
    init();
  }, [user]);

  // ── load messages when sidebar selects a conversation ──
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    (async () => {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch(`/api/chat/messages?conversation_id=${selectedConversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    })();
  }, [selectedConversationId]);

  // ── get / create conversation id ──
  const getOrCreateConvId = useCallback(async (firstMsg: string): Promise<string | null> => {
    if (activeConvIdRef.current) return activeConvIdRef.current;
    if (!user) return null;
    try {
      const token = await getAuthToken();
      if (!token) return null;
      const title = firstMsg.trim().substring(0, 30) || "New Conversation";
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        const id = data.conversation.id;
        setSelectedConversationId(id);
        triggerRefresh(); // refresh sidebar list
        return id;
      }
    } catch (_) {}
    return null;
  }, [user, setSelectedConversationId, triggerRefresh]);

  // ── save message ──
  const saveMsg = useCallback(async (convId: string, role: "user" | "assistant", content: string) => {
    if (!convId) return;
    const token = await getAuthToken();
    if (!token) return;
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: convId, role, content }),
    });
    triggerRefresh();
  }, [triggerRefresh]);

  // ── start plan ──
  const handleStartPlan = async (plan: Template) => {
    if (!user) return;
    setStartingPlan(plan.id);
    try {
      if (plan.habits?.length) {
        for (const h of plan.habits) await createHabit(user.id, h.title, h.icon || "brain");
      }
      if (plan.tasks?.length) {
        for (const t of plan.tasks) {
          const due = t.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await createTask(user.id, t.title, due);
        }
      }
      await saveMemory(user.id, "template_history", {
        planId: plan.id, planTitle: plan.title, planCategory: plan.category,
        startedAt: new Date().toISOString(),
      });
      audioManager.play("success");
      setTimeout(() => router.push("/app/dashboard"), 500);
    } catch (err) {
      console.error(err);
      alert("Failed to start plan. Please try again.");
    } finally {
      setStartingPlan(null);
    }
  };

  // ── send message ──
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    audioManager.play("click");

    // Crisis detection
    const crisis = ["suicide","kill myself","hurt myself","self harm","end my life","want to die","no reason to live","better off dead"];
    if (crisis.some((k) => input.toLowerCase().includes(k))) {
      setMessages((p) => [...p, { role: "user", content: input }]);
      setInput("");
      setTimeout(() => setMessages((p) => [...p, {
        role: "assistant",
        content: `I'm concerned about what you're sharing. If you're thinking about hurting yourself, please reach out:\n\n🆘 **Crisis Resources:**\n- **National Suicide Prevention Lifeline:** Call or text 988 (US)\n- **Crisis Text Line:** Text HOME to 741741\n- **International:** findahelpline.com\n\nYou are not alone. Your life matters.`,
      }]), 500);
      return;
    }

    if (selectedAPI === "byok" && !hasBYOK) {
      setMessages((p) => [...p, { role: "user", content: input }]);
      setInput("");
      setTimeout(() => setMessages((p) => [...p, { role: "assistant", content: "To use BYOK mode, please add your API keys in Settings." }]), 500);
      return;
    }

    if (!user) {
      setMessages((p) => [...p, { role: "user", content: input }]);
      setInput("");
      setTimeout(() => setMessages((p) => [...p, { role: "assistant", content: "Please sign in to use the AI companion features." }]), 1000);
      return;
    }

    const safetyCheck = await performSafetyCheck(user.id, input);
    if (!safetyCheck.isSafe) {
      logSafetyViolation(user.id, "input_safety", safetyCheck.reason || "Unknown");
      setMessages((p) => [...p, { role: "user", content: input }]);
      setTimeout(() => setMessages((p) => [...p, { role: "assistant", content: safetyCheck.reason || "Message blocked by safety guidelines." }]), 500);
      setInput("");
      return;
    }

    const sanitized = safetyCheck.sanitizedInput || input;
    setMessages((p) => [...p, { role: "user", content: sanitized }]);
    setInput("");

    const convId = await getOrCreateConvId(sanitized);
    if (convId) await saveMsg(convId, "user", sanitized);

    try {
      const aiResponse = await generateAIResponse(user.id, sanitized, selectedAPI);
      const filtered   = filterAIResponse(aiResponse.response);

      if (!filtered.isSafe) {
        logSafetyViolation(user.id, "output_safety", filtered.reason || "Unknown");
        setTimeout(() => setMessages((p) => [...p, { role: "assistant", content: filtered.reason || "Response blocked by safety guidelines." }]), 1000);
        return;
      }

      const followUps = getFollowUpQuestions(aiResponse.category);
      const reply     = filtered.filteredResponse || aiResponse.response;

      setTimeout(() => {
        setMessages((p) => [...p, { role: "assistant", content: reply, plans: aiResponse.templates, followUpQuestions: followUps }]);
        if (convId) saveMsg(convId, "assistant", reply);
      }, 1000);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || "Failed to generate AI response. Please check your connection or try again later.";
      setTimeout(() => {
        setMessages((p) => [...p, { role: "assistant", content: `⚠️ **Error**: ${errorMsg}` }]);
        if (convId) saveMsg(convId, "assistant", `⚠️ **Error**: ${errorMsg}`);
      }, 500);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#030303]" : "bg-white"} text-foreground relative overflow-hidden flex flex-col`}>
      {/* 
        Performance-optimised background: 
        replaced heavy blur-[150px] with a static radial-gradient painted once by the GPU.
        Visually identical but no per-frame blur compositing cost.
      */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 60% 50% at 60% -10%, rgba(0,229,117,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 110% 80%, rgba(0,229,117,0.03) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 60% -10%, rgba(0,200,83,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header
        className={`flex items-center justify-between p-4 md:px-8 backdrop-blur-xl ${isDark ? "bg-black/30 border-white/5" : "bg-white/70 border-green-500/20"} border-b sticky top-0 z-40`}
      >
        <div className="flex items-center gap-4">
          <Link href="/app/dashboard">
            <Button variant="glass" size="icon" className={`border-white/5 hover:border-primary/30 ${!isDark ? "border-green-500/30 hover:border-green-500" : ""}`}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-playfair text-xl md:text-2xl font-bold">AI Companion</h1>
          {userProfile?.plan && userProfile.plan !== "free" && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getPlanBadgeColor(userProfile.plan)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase">{getPlanDisplayName(userProfile.plan)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedAPI === "free" ? "bg-green-500" : "bg-primary"}`} />
            <span className="text-sm text-muted-foreground hidden sm:block">Online</span>
          </div>
        </div>
      </header>

      {/* BYOK popup */}
      {showBYOKPopup && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          onClick={() => setShowBYOKPopup(false)}
        >
          <div className="bg-primary/20 border border-primary/30 backdrop-blur-xl rounded-xl px-4 py-2 text-sm text-primary shadow-lg">
            You can switch to BYOK mode using the selector above
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col px-4 md:px-8 max-w-4xl mx-auto w-full pb-6">
        {/* Messages */}
        <div className="flex-1 space-y-6 pt-6 mb-4 overflow-y-auto">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-6 py-20"
            >
              <LottieAnimation animationData={greenParrot} loop className="w-32 h-32" />
              <div>
                <h2 className="font-playfair text-3xl font-bold mb-2">Start a conversation</h2>
                <p className="text-muted-foreground max-w-md">What are we focusing on today?</p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : `${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"} text-foreground`
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em:     ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                        p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul:     ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol:     ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li:     ({ children }) => <li className="text-sm">{children}</li>,
                        h1:     ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2:     ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3:     ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                        code: ({ node, inline, children, ...props }: any) =>
                          inline
                            ? <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                            : <code className="block bg-primary/10 p-3 rounded text-xs font-mono overflow-x-auto" {...props}>{children}</code>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Plan cards */}
                  {msg.plans && msg.plans.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {msg.plans.map((plan, pi) => (
                        <div key={pi} className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm text-primary">{plan.title}</div>
                            <div className="text-xs text-muted-foreground">{plan.category} • {plan.difficulty}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">{plan.description}</div>
                          <Button size="sm" onClick={() => { audioManager.play("click"); handleStartPlan(plan); }} disabled={startingPlan === plan.id} className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            {startingPlan === plan.id ? "Starting…" : "Start Plan"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up questions */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">Suggested questions:</div>
                      {msg.followUpQuestions.map((q, qi) => (
                        <button
                          key={qi}
                          onClick={() => setInput(q)}
                          className="block w-full text-left p-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area — replaced heavy backdrop-blur + blur-xl glow with a crisp border+gradient approach */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {/* Ambient glow: CSS box-shadow instead of blur-xl div (much cheaper) */}
          <form
            onSubmit={handleSend}
            className={`relative flex items-center rounded-2xl border p-2 shadow-[0_0_30px_rgba(0,229,117,0.08)] ${
              isDark ? "bg-black/60 border-white/10" : "bg-white/90 border-green-500/20"
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 bg-transparent border-none outline-none text-foreground px-4 py-3 text-base placeholder:text-muted-foreground/60"
            />

            {/* Mode chip */}
            <div className="relative mr-2">
              <button
                type="button"
                onClick={() => setShowAPIDropdown(!showAPIDropdown)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  selectedAPI === "free"
                    ? "bg-green-500/15 text-green-500 border border-green-500/30 hover:bg-green-500/25"
                    : selectedAPI === "byok"
                    ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 hover:bg-blue-500/25"
                    : "bg-purple-500/15 text-purple-500 border border-purple-500/30 hover:bg-purple-500/25"
                }`}
              >
                {selectedAPI.toUpperCase()}
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              {showAPIDropdown && (
                <div className={`absolute bottom-full right-0 mb-2 w-44 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? "bg-black/90 border-white/10" : "bg-white/90 border-green-500/20"} backdrop-blur-xl`}>
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { key: "free", label: "FREE MODE", color: "green" },
                      ...(hasBYOK ? [{ key: "byok", label: "BYOK MODE", color: "blue" }] : []),
                      { key: "pro",  label: "PRO MODE",  color: "purple" },
                    ].map((opt) => {
                      const locked = opt.key === "pro" && !(userProfile?.plan === "pro" || userProfile?.plan === "ultra");
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            if (locked) { setShowUpgradePrompt(true); }
                            else { setSelectedAPI(opt.key as any); }
                            setShowAPIDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedAPI === opt.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                          } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{opt.label}</span>
                          {locked && <Lock className="w-3 h-3 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 active:scale-95 transition-all mr-1"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </main>

      {/* Upgrade modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className={`max-w-md w-full mx-4 ${isDark ? "bg-black/90 border-white/10" : "bg-white/90 border-green-500/20"} backdrop-blur-xl`}>
            <CardContent className="p-8 text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Upgrade Required</h2>
              <p className="text-muted-foreground mb-6">AI-powered chat is available on Pro and Ultra plans.</p>
              <div className="space-y-3">
                <Link href="/pricing">
                  <Button className="w-full">
                    View Plans <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="glass" className="w-full" onClick={() => { setShowUpgradePrompt(false); setSelectedAPI("free"); }}>
                  Use Free Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
