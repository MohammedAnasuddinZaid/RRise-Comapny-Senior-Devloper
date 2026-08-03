"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Mascot } from "../../../components/mascot/Mascot";
import { LottieAnimation } from "../../../components/ui/LottieAnimation";
import { FocusReveal } from "../../../components/focus/FocusReveal";
import {
  Star, TrendingUp, CheckCircle, Brain, Book, Dumbbell, Wallet, Award,
  Sparkles, Check, Play, Plus, X, Pencil, Trash2, GripVertical, ChevronDown,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../../../contexts/ThemeContext";
import { ThemeSelector } from "../../../components/ui/ThemeSelector";
import { audioManager } from "../../../lib/audioManager";
import { useRequireAuth } from "../../../lib/authGuard";
import { getPlanDisplayName, getPlanBadgeColor } from "../../../lib/planLogic";
import {
  loadUserProfile, loadHabits, loadTasks, loadMascotState, loadStreakCount,
  toggleHabitCompletion, toggleTaskCompletion, createHabit, createTask,
  loadWeeklyPerformanceData, updateProfileMetadata,
} from "../../../lib/dataLoader";

// ── Lottie ───────────────────────────────────────────────────────────────────
import fireStreak       from "../../../../public/lottie/fire_streak.json";
import xpAnimation      from "../../../../public/lottie/xp.json";
import successTrophy    from "../../../../public/lottie/succes_trophy.json";
import blueBirdsFlying  from "../../../../public/lottie/blue_birds_flying_in_white_background.json";

// ── Types ────────────────────────────────────────────────────────────────────
type SectionType = "habits" | "tasks" | "spending";

interface DashboardSection {
  id: string;
  name: string;
  type: SectionType;
}

const DEFAULT_SECTIONS: DashboardSection[] = [
  { id: "habits",   name: "Ritual Tracker",      type: "habits"  },
  { id: "tasks",    name: "Daily Focus",          type: "tasks"   },
  { id: "spending", name: "Resource Allocation",  type: "spending"},
];

// ── Icon map ──────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  brain:    <Brain    className="w-4 h-4" />,
  book:     <Book     className="w-4 h-4" />,
  dumbbell: <Dumbbell className="w-4 h-4" />,
};

// ── Chart placeholder ─────────────────────────────────────────────────────────
const initialChartData = [
  { name: "Mon", score: 0 }, { name: "Tue", score: 0 }, { name: "Wed", score: 0 },
  { name: "Thu", score: 0 }, { name: "Fri", score: 0 }, { name: "Sat", score: 0 },
  { name: "Sun", score: 0 },
];

// ── Parrot helpers ────────────────────────────────────────────────────────────
function getParrotStage(pct: number) {
  if (pct <= 20) return "Egg";
  if (pct <= 40) return "Baby";
  if (pct <= 60) return "Young";
  if (pct <= 80) return "Adult";
  return "Elder";
}
function getParrotStages() { return ["Egg","Baby","Young","Adult","Elder"]; }
function getCurrentStageIndex(pct: number) {
  if (pct <= 20) return 0; if (pct <= 40) return 1;
  if (pct <= 60) return 2; if (pct <= 80) return 3; return 4;
}

// ── Inline-editable section header ───────────────────────────────────────────
function SectionHeader({
  section, onRename, onDelete, canDelete, theme,
}: {
  section: DashboardSection;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  theme: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(section.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== section.name) onRename(section.id, trimmed);
    else setDraft(section.name);
    setEditing(false);
  };

  const SectionIcon = section.type === "habits"
    ? TrendingUp
    : section.type === "tasks"
    ? CheckCircle
    : Wallet;

  return (
    <CardTitle className="flex items-center justify-between text-lg font-medium">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <SectionIcon className="w-5 h-5 text-primary flex-shrink-0" />
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(section.name); setEditing(false); } }}
            className="bg-transparent border-b border-primary/50 outline-none text-sm font-medium text-foreground flex-1 min-w-0"
          />
        ) : (
          <span className="truncate">{section.name}</span>
        )}
      </div>
      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
        <button
          onClick={() => { setDraft(section.name); setEditing(true); }}
          className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
          title="Rename section"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete(section.id)}
            className="p-1 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </CardTitle>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { theme } = useTheme();
  const { user, loading } = useRequireAuth();

  const [habits,    setHabits]    = useState<any[]>([]);
  const [tasks,     setTasks]     = useState<any[]>([]);
  const [xpGain,    setXpGain]    = useState(false);
  const [lastXpAmount, setLastXpAmount] = useState(10);
  const [streakCelebration, setStreakCelebration] = useState(false);
  const [userData,  setUserData]  = useState<any>(null);
  const [mascotState, setMascotState] = useState<any>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [chartData,   setChartData]   = useState(initialChartData);
  const [dataLoading, setDataLoading] = useState(true);

  // ── Editable sections ──
  const [sections, setSections] = useState<DashboardSection[]>(DEFAULT_SECTIONS);
  const [savingSections, setSavingSections] = useState(false);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<"dashboard" | "focus">("dashboard");

  // keep sections in sync with profile metadata
  const persistSections = useCallback(async (newSections: DashboardSection[]) => {
    if (!user) return;
    setSavingSections(true);
    await updateProfileMetadata(user.id, { dashboard_sections: newSections });
    setSavingSections(false);
  }, [user]);

  const handleRenameSection = (id: string, name: string) => {
    const updated = sections.map((s) => s.id === id ? { ...s, name } : s);
    setSections(updated);
    persistSections(updated);
  };

  const handleDeleteSection = (id: string) => {
    if (!confirm("Delete this section?")) return;
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    persistSections(updated);
  };

  const handleAddSection = () => {
    const newSection: DashboardSection = {
      id: `tasks_${Date.now()}`,
      name: "New Section",
      type: "tasks",
    };
    const updated = [...sections, newSection];
    setSections(updated);
    persistSections(updated);
  };

  // ── Chart update ──
  useEffect(() => {
    const total     = habits.length + tasks.length;
    const completed = habits.filter((h) => h.completed).length + tasks.filter((t) => t.completed).length;
    const score     = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dayIndex  = (new Date().getDay() + 6) % 7;
    setChartData((prev) => prev.map((d, i) => i === dayIndex ? { ...d, score } : d));
  }, [habits, tasks]);

  // ── Load data ──
  useEffect(() => {
    async function loadAll() {
      if (!user) return;
      setDataLoading(true);
      try {
        const [profile, mascot, streak, userHabits, userTasks, weeklyData] = await Promise.all([
          loadUserProfile(user.id),
          loadMascotState(user.id),
          loadStreakCount(user.id),
          loadHabits(user.id),
          loadTasks(user.id),
          loadWeeklyPerformanceData(user.id),
        ]);

        if (profile) {
          setUserData(profile);
          // Load saved sections from metadata, fall back to defaults
          const saved = (profile as any)?.metadata?.dashboard_sections as DashboardSection[] | undefined;
          if (saved && Array.isArray(saved) && saved.length > 0) {
            setSections(saved);
          }
        }
        if (mascot) setMascotState(mascot);
        setStreakCount(streak);

        if (userHabits.length > 0) {
          setHabits(userHabits.map((h: any) => ({
            id: h.id, title: h.title, completed: h.completed, streak: h.streak, icon: h.icon,
          })));
        }
        if (userTasks.length > 0) {
          setTasks(userTasks.map((t: any) => ({
            id: t.id, title: t.title, completed: t.completed, dueTime: t.dueTime,
          })));
        }
        setChartData(weeklyData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadAll();
  }, [user]);

  // ── Audio setup ──
  useEffect(() => {
    audioManager.startIdleDetection(() => {});
    return () => { audioManager.cleanup(); };
  }, []);

  // ── Progress ──
  const total     = habits.length + tasks.length;
  const completed = habits.filter((h) => h.completed).length + tasks.filter((t) => t.completed).length;
  const percentage= total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Handlers ──
  const handleHabitToggle = async (id: string) => {
    if (!user) return;
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const next = !habit.completed;
    setHabits((p) => p.map((h) => h.id === id ? { ...h, completed: next } : h));
    if (next) audioManager.play("success");
    const res = await toggleHabitCompletion(id, user.id, next);
    if (!res.success) setHabits((p) => p.map((h) => h.id === id ? { ...h, completed: !next } : h));
  };

  const handleTaskToggle = async (id: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const next = !task.completed;
    setTasks((p) => p.map((t) => t.id === id ? { ...t, completed: next } : t));
    if (next) audioManager.play("success");
    const res = await toggleTaskCompletion(id, user.id, next);
    if (!res.success) setTasks((p) => p.map((t) => t.id === id ? { ...t, completed: !next } : t));
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const cardBg  = "bg-card border-border";
  const hdrBdr  = "border-border";

  // ── Render a single section card ──
  const renderSectionCard = (section: DashboardSection) => {
    const canDelete = sections.length > 1;

    if (section.type === "habits") {
      return (
        <Card key={section.id} className={`col-span-1 ${cardBg} flex flex-col justify-between`}>
          <CardHeader className={`border-b ${hdrBdr} pb-4`}>
            <SectionHeader
              section={section} onRename={handleRenameSection}
              onDelete={handleDeleteSection} canDelete={canDelete} theme={theme}
            />
            {/* Add habit */}
            <button
              onClick={async () => {
                audioManager.play("click");
                if (!user) return;
                const r = await createHabit(user.id, "New habit", "brain");
                if (r.success && r.data) {
                  setHabits((p) => [...p, { id: r.data.id, title: r.data.title, completed: r.data.completed, streak: r.data.streak, icon: r.data.icon }]);
                }
              }}
              className="text-primary hover:text-primary/80 transition-colors absolute top-4 right-4"
            >
              <Plus className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6 space-y-3.5 flex-1 relative">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  habit.completed ? "bg-primary/[0.02] border-primary/20" : "bg-white/[0.01] border-border hover:border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border transition-colors ${habit.completed ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-border text-muted-foreground"}`}>
                    {iconMap[habit.icon] || <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground/90">{habit.title}</p>
                    <p className="text-[11px] text-muted-foreground font-light mt-0.5">{habit.streak} day streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHabitToggle(habit.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      habit.completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-transparent hover:border-primary"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => { audioManager.play("click"); setHabits(habits.filter((h) => h.id !== habit.id)); }}
                    className="w-7 h-7 rounded-full border-2 border-red-500/30 text-red-500/50 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {habits.length === 0 && (
              <p className="text-sm text-muted-foreground/50 text-center py-4">No habits yet. Click + to add one.</p>
            )}
          </CardContent>
        </Card>
      );
    }

    if (section.type === "spending") {
      return (
        <Card key={section.id} className={`col-span-1 ${cardBg} flex flex-col justify-between`}>
          <CardHeader className={`border-b ${hdrBdr} pb-4`}>
            <SectionHeader
              section={section} onRename={handleRenameSection}
              onDelete={handleDeleteSection} canDelete={canDelete} theme={theme}
            />
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1.5">Spent Today</p>
              <p className="font-playfair text-3xl font-bold text-foreground">$0.00</p>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-3 font-light">
                <span>Budget Limit</span><span>$100.00</span>
              </div>
              <ProgressBar value={0} max={100} className="mt-2 h-1.5 bg-white/5" />
            </div>
            <div className="space-y-2.5 border-t border-border pt-4 mt-auto">
              <div className="flex justify-between items-center text-xs font-light">
                <span className="text-muted-foreground">No recent transactions</span>
                <span className="font-medium text-foreground">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default: tasks section
    return (
      <Card key={section.id} className={`col-span-1 ${cardBg} flex flex-col justify-between`}>
        <CardHeader className={`border-b ${hdrBdr} pb-4 relative`}>
          <SectionHeader
            section={section} onRename={handleRenameSection}
            onDelete={handleDeleteSection} canDelete={canDelete} theme={theme}
          />
          <button
            onClick={async () => {
              audioManager.play("click");
              if (!user) return;
              const r = await createTask(user.id, "New task", new Date().toISOString());
              if (r.success && r.data) {
                setTasks((p) => [...p, { id: r.data.id, title: r.data.title, completed: r.data.completed, dueTime: r.data.due_date }]);
              }
            }}
            className="text-primary hover:text-primary/80 transition-colors absolute top-4 right-4"
          >
            <Plus className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6 space-y-3.5 flex-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${
                task.completed ? "bg-white/[0.01] border-border opacity-60" : "bg-white/[0.01] border-border hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
                    task.completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-transparent hover:border-primary"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <button
                  onClick={() => { audioManager.play("click"); setTasks(tasks.filter((t) => t.id !== task.id)); }}
                  className="w-6 h-6 rounded-lg border-2 border-red-500/30 text-red-500/50 hover:border-red-500 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground/90"}`}>{task.title}</p>
                <p className="text-[11px] text-muted-foreground font-light mt-0.5">{task.dueTime}</p>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground/50 text-center py-4">No tasks yet. Click + to add one.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10 pb-16 relative">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "dashboard"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("focus")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "focus"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Focus Reveal
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" ? (
        <>
      {/* Optimised bird animation header */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none z-0">
        {/* Gradient painted by GPU, no blur pass */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, var(--muted), transparent)",
          }}
        />
        <LottieAnimation animationData={blueBirdsFlying} loop className="w-full h-full opacity-60" />
      </div>

      {/* XP overlay */}
      <AnimatePresence>
        {xpGain && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
className="fixed bottom-10 right-10 z-50 pointer-events-none w-32 h-32 bg-card border-border backdrop-blur-xl rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,229,117,0.2)]"
          >
            <LottieAnimation animationData={xpAnimation} loop={false} className="w-16 h-16" />
            <span className="text-primary font-bold text-sm -mt-2">+{lastXpAmount} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak celebration */}
      <AnimatePresence>
        {streakCelebration && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setStreakCelebration(false)}
className="fixed inset-0 bg-background backdrop-blur-md z-50 flex items-center justify-center p-6 cursor-pointer"
          >
<div className="max-w-md w-full bg-card border-border p-10 rounded-3xl text-center space-y-6 shadow-[0_0_50px_rgba(0,229,117,0.1)]">
              <LottieAnimation animationData={successTrophy} loop={false} className="w-48 h-48 mx-auto" />
              <h3 className="font-playfair text-3xl font-bold">Milestone Unlocked</h3>
              <p className="text-muted-foreground font-light">Congratulations! You reached a new productivity peak.</p>
              <span className="text-xs text-primary font-semibold tracking-widest uppercase">Click to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header + Companion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative z-10">
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6 py-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-border text-primary text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-4 h-4" /> Focus Mode Active
              </div>
              <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border ${getPlanBadgeColor(userData?.plan || "free")}`}>
                {getPlanDisplayName(userData?.plan || "free")}
              </div>
              <ThemeSelector />
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Good morning, {userData?.full_name || "User"}.
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-lg leading-relaxed">
              Your focus and habits are building momentum. Continue your loops to maintain the streak.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              data-streak-button
              onClick={() => { audioManager.play("click"); setStreakCelebration(true); }}
className="flex items-center gap-3 bg-surface border-border hover:border-primary/30 border rounded-2xl px-5 py-3 transition-all duration-300 text-left hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <LottieAnimation animationData={fireStreak} loop className="w-full h-full" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Streak</p>
                <p className="font-semibold text-base text-primary">{streakCount} Days</p>
              </div>
            </button>

            <div
              data-companion
              onClick={() => audioManager.play("click")}
className="flex items-center gap-3 bg-surface border-border hover:border-primary/30 border rounded-2xl px-5 py-3 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            >
<div className="w-12 h-12 rounded-xl bg-primary/10 border-primary/20 border flex items-center justify-center text-primary">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Companion</p>
                <p className="font-semibold text-base">{getParrotStage(percentage)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Companion panel */}
<div className="relative rounded-3xl border border-border bg- p-8 flex flex-col items-center justify-center text-center overflow-hidden">
<div className="absolute top-2 right-3 px-3 py-1 bg-surface border-border border rounded-full text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            Companion Specimen
          </div>
          {/* Static gradient instead of blur-[60px] radial — cheaper, visually equivalent */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,229,117,0.05) 0%, transparent 70%)" }}
          />
          <Mascot level={getCurrentStageIndex(percentage) + 1} className="relative z-10 w-44 h-44 mb-4" />
          <div className="space-y-1 z-10">
            <h3 className="font-playfair text-xl font-bold tracking-wide">Evolving Parrot</h3>
            <p className="text-xs text-primary font-medium tracking-wider uppercase">{getParrotStage(percentage)}</p>
          </div>
        </div>
      </div>

      {/* Progress card */}
      <Card className={`col-span-1 md:col-span-3 ${cardBg}`}>
        <CardContent className="p-8 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">Progress</p>
              <h3 className="font-playfair text-2xl font-bold">{getParrotStage(percentage)}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">{completed} / {total}</p>
              <p className="text-xs text-muted-foreground">{percentage}% complete</p>
            </div>
          </div>
<ProgressBar value={percentage} max={100} className="h-2.5 bg-muted" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {getParrotStages().map((stage, i) => (
              <span key={i} className={i <= getCurrentStageIndex(percentage) ? "text-primary font-semibold" : ""}>{stage}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Editable section grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Sections</h2>
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => renderSectionCard(section))}
        </div>
      </div>

      {/* Weekly performance chart */}
      <Card className={`col-span-1 md:col-span-3 ${cardBg}`}>
        <CardHeader className={`border-b ${hdrBdr} pb-4`}>
          <CardTitle className="text-lg font-medium">Weekly Performance Curve</CardTitle>
        </CardHeader>
        <CardContent className="h-72 w-full pt-6 pb-6 min-h-[288px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e575" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00e575" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false} tickLine={false} dy={10}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={{
backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                }}
itemStyle={{ color: "var(--primary)" }}
              />
<Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
      ) : (
        <FocusReveal />
      )}
    </div>
  );
}
