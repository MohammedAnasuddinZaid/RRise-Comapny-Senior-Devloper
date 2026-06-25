"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Mascot } from "../../../components/mascot/Mascot";
import { LottieAnimation } from "../../../components/ui/LottieAnimation";
import { Star, TrendingUp, CheckCircle, Brain, Book, Dumbbell, Wallet, Award, Sparkles, Check, Play, Plus, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../../../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { audioManager } from "../../../lib/audioManager";
import { useRequireAuth } from "../../../lib/authGuard";
import { getPlanDisplayName, getPlanBadgeColor } from "../../../lib/planLogic";
import { loadUserProfile, loadHabits, loadTasks, loadMascotState, loadStreakCount, toggleHabitCompletion, toggleTaskCompletion, createHabit, createTask, loadWeeklyPerformanceData } from "../../../lib/dataLoader";

// Lottie Assets
import fireStreak from "../../../../public/lottie/fire_streak.json";
import xpAnimation from "../../../../public/lottie/xp.json";
import successTrophy from "../../../../public/lottie/succes_trophy.json";
import blueBirdsFlying from "../../../../public/lottie/blue_birds_flying_in_white_background.json";

const iconMap: Record<string, React.ReactNode> = {
  "brain": <Brain className="w-4 h-4" />,
  "book": <Book className="w-4 h-4" />,
  "dumbbell": <Dumbbell className="w-4 h-4" />
};

// Weekly chart data - loaded dynamically in useEffect
const initialChartData = [
  { name: 'Mon', score: 0 },
  { name: 'Tue', score: 0 },
  { name: 'Wed', score: 0 },
  { name: 'Thu', score: 0 },
  { name: 'Fri', score: 0 },
  { name: 'Sat', score: 0 },
  { name: 'Sun', score: 0 },
];

/**
 * Get parrot evolution stage based on completion percentage
 * 
 * IMPORTANT: Evolution stages are based on completion percentage:
 * - 0-20%: Egg
 * - 21-40%: Baby
 * - 41-60%: Young
 * - 61-80%: Adult
 * - 81-100%: Elder
 * 
 * @param percentage - Completion percentage (0-100)
 * @returns Stage name
 */
function getParrotStage(percentage: number): string {
  if (percentage <= 20) return "Egg";
  if (percentage <= 40) return "Baby";
  if (percentage <= 60) return "Young";
  if (percentage <= 80) return "Adult";
  return "Elder";
}

function getParrotStages(): string[] {
  return ["Egg", "Baby", "Young", "Adult", "Elder"];
}

function getCurrentStageIndex(percentage: number): number {
  if (percentage <= 20) return 0;
  if (percentage <= 40) return 1;
  if (percentage <= 60) return 2;
  if (percentage <= 80) return 3;
  return 4;
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useRequireAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [xpGain, setXpGain] = useState(false);
  // Track the last XP amount gained to display in the overlay
  const [lastXpAmount, setLastXpAmount] = useState(10);
  const [streakCelebration, setStreakCelebration] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [mascotState, setMascotState] = useState<any>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [chartData, setChartData] = useState(initialChartData);

  // Update today's chart score whenever habits or tasks change
  // (Other days are loaded from the DB via loadWeeklyPerformanceData)
  useEffect(() => {
    const totalItems = habits.length + tasks.length;
    const completedItems = habits.filter(h => h.completed).length + tasks.filter(t => t.completed).length;
    const score = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Map current day of the week (0-6, starting Sunday) to chart index (Mon-Sun: Mon is 0, Sun is 6)
    const dayIndex = (new Date().getDay() + 6) % 7; 

    setChartData(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, score } : day
    ));
  }, [habits, tasks]);

  const [dataLoading, setDataLoading] = useState(true);

  /**
   * Calculate completion percentage based on habits and tasks
   * 
   * IMPORTANT: Progress is based on completion percentage (completed/total * 100)
   * Evolution stages:
   * - 0-20%: Egg
   * - 21-40%: Baby
   * - 41-60%: Young
   * - 61-80%: Adult
   * - 81-100%: Elder
   * 
   * @param habits - Array of habits with completed status
   * @param tasks - Array of tasks with completed status
   * @returns Percentage and stage info
   */
  const calculateProgressPercentage = (habits: any[], tasks: any[]) => {
    const totalItems = habits.length + tasks.length;
    const completedItems = habits.filter(h => h.completed).length + tasks.filter(t => t.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { percentage, totalItems, completedItems };
  };

  // Load user data from Supabase
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      setDataLoading(true);
      try {
        // Load profile data from profiles table (contains xp_total)
        const profile = await loadUserProfile(user.id);
        if (profile) {
          setUserData(profile);
        }

        // Load mascot state from mascot_state table
        const mascot = await loadMascotState(user.id);
        if (mascot) {
          setMascotState(mascot);
        }

        // Load streak count from streaks table
        const streak = await loadStreakCount(user.id);
        setStreakCount(streak);

        // Load habits from habits table (includes completed, streak, icon from dataLoader)
        const userHabits = await loadHabits(user.id);
        if (userHabits.length > 0) {
          const transformedHabits = userHabits.map(h => ({
            id: h.id,
            title: h.title,
            completed: h.completed,
            streak: h.streak,
            icon: h.icon,
          }));
          setHabits(transformedHabits);
        }

        // Load tasks from tasks table (includes completed, dueTime from dataLoader)
        const userTasks = await loadTasks(user.id);
        if (userTasks.length > 0) {
          const transformedTasks = userTasks.map(t => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            dueTime: t.dueTime,
          }));
          setTasks(transformedTasks);
        }

        // Load real weekly performance data from DB for the chart (Mon-Sun of this week)
        const weeklyData = await loadWeeklyPerformanceData(user.id);
        setChartData(weeklyData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  // Calculate progress percentage from habits and tasks
  const progressData = calculateProgressPercentage(habits, tasks);

  // Import audio manager (must be before early return to satisfy Rules of Hooks)
  useEffect(() => {
    // Add click sound to streak button
    const streakButton = document.querySelector('[data-streak-button]');
    if (streakButton) {
      streakButton.addEventListener('click', () => audioManager.play('click'));
    }

    // Add click sound to companion
    const companionElement = document.querySelector('[data-companion]');
    if (companionElement) {
      companionElement.addEventListener('click', () => audioManager.play('click'));
    }

    // Start idle detection
    audioManager.startIdleDetection(() => {
      console.log('Parrot is idle');
    });

    return () => {
      audioManager.cleanup();
    };
  }, []);

  // Show loading state while checking auth or loading data
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleHabitToggle = async (id: string) => {
    if (!user) return;
    
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    const nextState = !habit.completed;
    
    // Optimistic UI update
    setHabits((prevHabits: any[]) => prevHabits.map(h => 
      h.id === id ? { ...h, completed: nextState } : h
    ));
    
    // Play sound on completion
    if (nextState) {
      audioManager.play('success');
    }
    
    // Persist to Supabase
    const result = await toggleHabitCompletion(id, user.id, nextState);
    if (!result.success) {
      // Revert on error
      setHabits((prevHabits: any[]) => prevHabits.map(h => 
        h.id === id ? { ...h, completed: !nextState } : h
      ));
      console.error('Failed to toggle habit:', result.error);
    }
  };

  const handleTaskToggle = async (id: string) => {
    if (!user) return;
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const nextState = !task.completed;
    
    // Optimistic UI update
    setTasks((prevTasks: any[]) => prevTasks.map(t => 
      t.id === id ? { ...t, completed: nextState } : t
    ));
    
    // Play sound on completion
    if (nextState) {
      audioManager.play('success');
    }
    
    // Persist to Supabase
    const result = await toggleTaskCompletion(id, user.id, nextState);
    if (!result.success) {
      // Revert on error
      setTasks((prevTasks: any[]) => prevTasks.map(t => 
        t.id === id ? { ...t, completed: !nextState } : t
      ));
      console.error('Failed to toggle task:', result.error);
    }
  };

  return (
    <div className={`space-y-10 pb-16 relative ${theme === 'dark' ? '' : 'bg-white text-foreground'}`}>
      {/* Blue Bird Flying Animation at Top */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark' ? 'from-white/5' : 'from-green-500/10'} to-transparent`} />
        <LottieAnimation animationData={blueBirdsFlying} loop={true} className="w-full h-full opacity-60" />
      </div>

      {/* Floating XP Reward Overlay */}
      <AnimatePresence>
        {xpGain && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className={`fixed bottom-10 right-10 z-50 pointer-events-none w-32 h-32 ${theme === 'dark' ? 'bg-black/40 border-primary/20' : 'bg-white/80 border-green-500/30'} backdrop-blur-xl rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,229,117,0.2)]`}
          >
            <LottieAnimation animationData={xpAnimation} loop={false} className="w-16 h-16" />
            <span className="text-primary font-bold text-sm -mt-2">+{lastXpAmount} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Achievement Milestone overlay */}
      <AnimatePresence>
        {streakCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStreakCelebration(false)}
            className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/70' : 'bg-black/50'} backdrop-blur-md z-50 flex items-center justify-center p-6 cursor-pointer`}
          >
            <div className={`max-w-md w-full ${theme === 'dark' ? 'bg-[#070709] border-white/10' : 'bg-white border-green-500/20'} p-10 rounded-3xl text-center space-y-6 shadow-[0_0_50px_rgba(0,229,117,0.1)]`}>
              <LottieAnimation animationData={successTrophy} loop={false} className="w-48 h-48 mx-auto" />
              <h3 className="font-playfair text-3xl font-bold">Milestone Unlocked</h3>
              <p className="text-muted-foreground font-light">
                Congratulations! You reached a new productivity peak. Your companion evolution progress is accelerating.
              </p>
              <span className="text-xs text-primary font-semibold tracking-widest uppercase">Click to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative z-10">
        
        {/* Left Welcome panel */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6 py-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-white/5 border border-white/5 text-primary text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                Focus Mode Active
              </div>
              <div className={`inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border ${getPlanBadgeColor(userData?.plan || 'free')}`}>
                {getPlanDisplayName(userData?.plan || 'free')}
              </div>
              <button
                onClick={() => {
                  audioManager.play('click');
                  toggleTheme();
                }}
                className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-primary/30' : 'bg-green-500/10 border-green-500/30 hover:border-green-500'} transition-all duration-300`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
              </button>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Good morning, {userData?.full_name || 'User'}.
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-lg leading-relaxed">
              Your focus and habits are building momentum. Continue your loops to maintain the streak.
            </p>
          </div>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              data-streak-button
              onClick={() => {
                audioManager.play('click');
                setStreakCelebration(true);
              }}
              className={`flex items-center gap-3 ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-primary/20' : 'bg-green-500/5 border-green-500/20 hover:border-green-500'} rounded-2xl px-5 py-3 transition-all duration-300 text-left hover:-translate-y-0.5`}
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <LottieAnimation animationData={fireStreak} loop={true} className="w-full h-full" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Streak</p>
                <p className="font-semibold text-base text-primary">{streakCount} Days</p>
              </div>
            </button>
            <div 
              data-companion
              onClick={() => {
                audioManager.play('click');
              }}
              className={`flex items-center gap-3 ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-primary/20' : 'bg-green-500/5 border-green-500/20 hover:border-green-500'} rounded-2xl px-5 py-3 transition-all duration-300 cursor-pointer hover:-translate-y-0.5`}
            >
              <div className={`w-12 h-12 rounded-xl ${theme === 'dark' ? 'bg-primary/10 border-primary/20' : 'bg-green-500/10 border-green-500/30'} flex items-center justify-center text-primary`}>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Companion</p>
                <p className="font-semibold text-base">{getParrotStage(progressData.percentage)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Specimen Display Companion Panel */}
        <div className={`relative rounded-3xl border ${theme === 'dark' ? 'border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent' : 'border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent'} p-8 flex flex-col items-center justify-center text-center overflow-hidden`}>
          <div className={`absolute top-2 right-3 px-3 py-1 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-green-500/10 border-green-500/30'} rounded-full text-[10px] text-muted-foreground font-mono uppercase tracking-widest`}>
            Companion Specimen
          </div>
          
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
          
          <Mascot level={getCurrentStageIndex(progressData.percentage) + 1} className="relative z-10 w-44 h-44 mb-4" />
          
          <div className="space-y-1 z-10">
            <h3 className="font-playfair text-xl font-bold tracking-wide">Evolving Parrot</h3>
            <p className="text-xs text-primary font-medium tracking-wider uppercase">{getParrotStage(progressData.percentage)}</p>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* XP Ledger */}
        <Card className={`col-span-1 md:col-span-3 ${theme === 'dark' ? 'bg-[#070709] border-white/5' : 'bg-white border-green-500/20'}`}>
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">Progress</p>
                <h3 className="font-playfair text-2xl font-bold">{getParrotStage(progressData.percentage)}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">{progressData.completedItems} / {progressData.totalItems}</p>
                <p className="text-xs text-muted-foreground">{progressData.percentage}% complete</p>
              </div>
            </div>
            <ProgressBar value={progressData.percentage} max={100} className={`h-2.5 ${theme === 'dark' ? 'bg-white/5' : 'bg-green-500/10'}`} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {getParrotStages().map((stage, index) => (
                <span 
                  key={index} 
                  className={index <= getCurrentStageIndex(progressData.percentage) ? "text-primary font-semibold" : ""}
                >
                  {stage}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editorial Habits Card */}
        <Card className={`col-span-1 ${theme === 'dark' ? 'bg-[#070709] border-white/5' : 'bg-white border-green-500/20'} flex flex-col justify-between`}>
          <CardHeader className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-green-500/20'} pb-4`}>
            <CardTitle className="flex items-center justify-between text-lg font-medium">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-primary" />
                Ritual Tracker
              </div>
              <button
                onClick={async () => {
                  audioManager.play('click');
                  if (!user) return;
                  const result = await createHabit(user.id, 'New habit', 'brain');
                  if (result.success && result.data) {
                    setHabits([...habits, {
                      id: result.data.id,
                      title: result.data.title,
                      completed: result.data.completed,
                      streak: result.data.streak,
                      icon: result.data.icon,
                    }]);
                  }
                }}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3.5 flex-1">
            {habits.map(habit => (
              <div 
                key={habit.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  habit.completed 
                    ? "bg-primary/[0.02] border-primary/20" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border transition-colors ${
                    habit.completed 
                      ? "bg-primary/20 border-primary/30 text-primary" 
                      : "bg-white/5 border-white/5 text-muted-foreground"
                  }`}>
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
                      habit.completed 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-muted-foreground/30 text-transparent hover:border-primary"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => {
                      audioManager.play('click');
                      setHabits(habits.filter(h => h.id !== habit.id));
                    }}
                    className="w-7 h-7 rounded-full border-2 border-red-500/30 text-red-500/50 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Minimalist Tasks Card */}
        <Card className={`col-span-1 ${theme === 'dark' ? 'bg-[#070709] border-white/5' : 'bg-white border-green-500/20'} flex flex-col justify-between`}>
          <CardHeader className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-green-500/20'} pb-4`}>
            <CardTitle className="flex items-center justify-between text-lg font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-primary" />
                Daily Focus
              </div>
              <button
                onClick={async () => {
                  audioManager.play('click');
                  if (!user) return;
                  const result = await createTask(user.id, 'New task', new Date().toISOString());
                  if (result.success && result.data) {
                    setTasks([...tasks, {
                      id: result.data.id,
                      title: result.data.title,
                      completed: result.data.completed,
                      dueTime: result.data.due_date,
                    }]);
                  }
                }}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3.5 flex-1">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${
                  task.completed 
                    ? "bg-white/[0.01] border-white/5 opacity-60" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTaskToggle(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
                      task.completed 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-muted-foreground/30 text-transparent hover:border-primary"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => {
                      audioManager.play('click');
                      setTasks(tasks.filter(t => t.id !== task.id));
                    }}
                    className="w-6 h-6 rounded-lg border-2 border-red-500/30 text-red-500/50 hover:border-red-500 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>{task.title}</p>
                  <p className="text-[11px] text-muted-foreground font-light mt-0.5">{task.dueTime}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Minimalist Ledger Spending Card */}
        <Card className={`col-span-1 ${theme === 'dark' ? 'bg-[#070709] border-white/5' : 'bg-white border-green-500/20'} flex flex-col justify-between`}>
          <CardHeader className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-green-500/20'} pb-4`}>
            <CardTitle className="flex items-center gap-2.5 text-lg font-medium">
              <Wallet className="w-5 h-5 text-primary" />
              Resource Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1.5">Spent Today</p>
              <p className="font-playfair text-3xl font-bold text-foreground">
                $0.00
              </p>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-3 font-light">
                <span>Budget Limit</span>
                <span>$100.00</span>
              </div>
              <ProgressBar value={0} max={100} className="mt-2 h-1.5 bg-white/5" />
            </div>
            
            <div className="space-y-2.5 border-t border-white/5 pt-4 mt-auto">
              <div className="flex justify-between items-center text-xs font-light">
                <span className="text-muted-foreground">No recent transactions</span>
                <span className="font-medium text-foreground">-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High-End Weekly Area Chart */}
        <Card className={`col-span-1 md:col-span-3 ${theme === 'dark' ? 'bg-[#070709] border-white/5' : 'bg-white border-green-500/20'}`}>
          <CardHeader className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-green-500/20'} pb-4`}>
            <CardTitle className="text-lg font-medium">Weekly Performance Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-72 w-full pt-6 pb-6 min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e575" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00e575" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,200,83,0.1)'} vertical={false} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,200,83,0.3)'} tick={{fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,200,83,0.6)', fontSize: 11}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,200,83,0.3)'} tick={{fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,200,83,0.6)', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#070709' : '#ffffff', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,200,83,0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: theme === 'dark' ? '#00e575' : '#00c853' }}
                />
                <Area type="monotone" dataKey="score" stroke={theme === 'dark' ? '#00e575' : '#00c853'} strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
