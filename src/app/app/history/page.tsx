"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, Wallet, Calendar, Filter, TrendingUp, Activity, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { audioManager } from "../../../lib/audioManager";
import { useTheme } from "../../../contexts/ThemeContext";
import { useRequireAuth } from "../../../lib/authGuard";
import { loadActivityHistory } from "../../../lib/dataLoader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

type ActivityType = 'all' | 'habits' | 'tasks' | 'spending';

export default function HistoryPage() {
  const { theme } = useTheme();
  const { user, loading } = useRequireAuth();
  const [filter, setFilter] = useState<ActivityType>('all');
  const [activityData, setActivityData] = useState<{
    habitCompletions: Array<{ id: string; habitTitle: string; completedAt: string }>;
    taskCompletions: Array<{ id: string; taskTitle: string; completedAt: string }>;
    spendingTransactions: Array<{ id: string; category: string; amount: number; spentAt: string }>;
  }>({
    habitCompletions: [],
    taskCompletions: [],
    spendingTransactions: [],
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Load activity history from Supabase
  useEffect(() => {
    async function fetchActivityHistory() {
      if (!user) return;

      setDataLoading(true);
      try {
        const data = await loadActivityHistory(user.id);
        setActivityData(data);
      } catch (error) {
        console.error('Error loading activity history:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchActivityHistory();
  }, [user]);

  // Show loading state
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

  // Process data for analytics charts
  const processChartData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const habitCount = activityData.habitCompletions.filter(
        h => h.completedAt.startsWith(dateStr)
      ).length;
      
      const taskCount = activityData.taskCompletions.filter(
        t => t.completedAt.startsWith(dateStr)
      ).length;
      
      const spendingTotal = activityData.spendingTransactions
        .filter(s => s.spentAt.startsWith(dateStr))
        .reduce((sum, s) => sum + s.amount, 0);
      
      last7Days.push({
        date: dayName,
        habits: habitCount,
        tasks: taskCount,
        spending: spendingTotal,
        total: habitCount + taskCount
      });
    }
    
    return last7Days;
  };

  const chartData = processChartData();

  // Calculate summary stats
  const totalHabitsCompleted = activityData.habitCompletions.length;
  const totalTasksCompleted = activityData.taskCompletions.length;
  const totalSpending = activityData.spendingTransactions.reduce((sum, s) => sum + s.amount, 0);
  const avgDailyCompletion = chartData.reduce((sum, day) => sum + day.total, 0) / 7;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right=[-10%] w-[500px] h-[500px] bg-primary/3 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between p-6 md:px-12 backdrop-blur-xl bg-card border-border border-b fixed top-0 w-full z-40">
        <div className="flex items-center gap-4">
          <Link href="/app/dashboard">
            <Button variant="glass" size="icon" className="border-border hover:border-primary/30">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-playfair text-2xl font-bold">Activity History</h1>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last 30 days</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-12 max-w-6xl mx-auto w-full">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border bg-card border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Habits Completed</span>
            </div>
            <p className="text-3xl font-bold">{totalHabitsCompleted}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border bg-card border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Tasks Completed</span>
            </div>
            <p className="text-3xl font-bold">{totalTasksCompleted}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl border bg-card border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Avg Daily</span>
            </div>
            <p className="text-3xl font-bold">{avgDailyCompletion.toFixed(1)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl border bg-card border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Total Spent</span>
            </div>
            <p className="text-3xl font-bold">${totalSpending.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border bg-card border-border mb-8"
        >
          <h3 className="font-playfair text-xl font-bold mb-4">Weekly Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e575" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00e575" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: '12px' }}
                itemStyle={{ color: "var(--primary)" }}
              />
              <Area type="monotone" dataKey="total" stroke="#00e575" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Habits vs Tasks Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border bg-card border-border"
        >
          <h3 className="font-playfair text-xl font-bold mb-4">Habits vs Tasks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: '12px' }}
                itemStyle={{ color: "var(--primary)" }}
              />
              <Bar dataKey="habits" fill="#22c55e" name="Habits" />
              <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </main>
    </div>
  );
}
