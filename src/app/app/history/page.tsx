"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, Wallet, Trophy, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { audioManager } from "../../../lib/audioManager";
import { useTheme } from "../../../contexts/ThemeContext";
import { useRequireAuth } from "../../../lib/authGuard";
import { loadActivityHistory } from "../../../lib/dataLoader";

type ActivityType = 'all' | 'habits' | 'tasks' | 'spending' | 'xp';

export default function HistoryPage() {
  const { theme } = useTheme();
  const { user, loading } = useRequireAuth();
  const [filter, setFilter] = useState<ActivityType>('all');
  const [activityData, setActivityData] = useState<{
    habitCompletions: Array<{ id: string; habitTitle: string; completedAt: string; xpEarned: number }>;
    taskCompletions: Array<{ id: string; taskTitle: string; completedAt: string; xpEarned: number }>;
    spendingTransactions: Array<{ id: string; category: string; amount: number; spentAt: string }>;
    xpGains: Array<{ id: string; amount: number; reason: string; source: string; createdAt: string }>;
  }>({
    habitCompletions: [],
    taskCompletions: [],
    spendingTransactions: [],
    xpGains: [],
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

  // Combine all activities into a single timeline
  const allActivities = [
    ...activityData.habitCompletions.map(item => ({
      id: item.id,
      type: 'habit' as const,
      title: `Completed: ${item.habitTitle}`,
      description: `Earned ${item.xpEarned} XP`,
      date: item.completedAt,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    })),
    ...activityData.taskCompletions.map(item => ({
      id: item.id,
      type: 'task' as const,
      title: `Completed: ${item.taskTitle}`,
      description: `Earned ${item.xpEarned} XP`,
      date: item.completedAt,
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
    })),
    ...activityData.spendingTransactions.map(item => ({
      id: item.id,
      type: 'spending' as const,
      title: `Spent $${item.amount}`,
      description: `Category: ${item.category}`,
      date: item.spentAt,
      icon: <Wallet className="w-5 h-5 text-yellow-500" />,
    })),
    ...activityData.xpGains.map(item => ({
      id: item.id,
      type: 'xp' as const,
      title: `+${item.amount} XP`,
      description: `${item.reason} (${item.source})`,
      date: item.createdAt,
      icon: <Trophy className="w-5 h-5 text-purple-500" />,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter activities based on selected filter
  const filteredActivities = filter === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type === filter);

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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030303]' : 'bg-white'} text-foreground relative overflow-hidden`}>
      {/* Background Effects */}
      <div className={`absolute top-[-20%] left-[30%] w-[600px] h-[600px] ${theme === 'dark' ? 'bg-primary/5' : 'bg-primary/10'} rounded-full blur-[150px] pointer-events-none`} />
      <div className={`absolute bottom-[20%] right=[-10%] w-[500px] h-[500px] ${theme === 'dark' ? 'bg-primary/3' : 'bg-primary/5'} rounded-full blur-[130px] pointer-events-none`} />

      {/* Header */}
      <header className={`flex items-center justify-between p-6 md:px-12 backdrop-blur-xl ${theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-white/70 border-green-500/20'} border-b fixed top-0 w-full z-40`}>
        <div className="flex items-center gap-4">
          <Link href="/app/dashboard">
            <Button variant="glass" size="icon" className={`border-white/5 hover:border-primary/30 ${theme === 'light' ? 'border-green-500/30 hover:border-green-500' : ''}`}>
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
      <main className="flex-1 pt-24 pb-8 px-4 md:px-12 max-w-4xl mx-auto w-full">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'habits', 'tasks', 'spending', 'xp'] as ActivityType[]).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'glass'}
              size="sm"
              onClick={() => {
                audioManager.play('click');
                setFilter(type);
              }}
              className={filter === type ? 'bg-primary text-primary-foreground' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {filteredActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-playfair text-2xl font-bold mb-2">No activity yet</h2>
              <p className="text-muted-foreground mb-6">Complete habits, tasks, or track spending to see your activity here</p>
              <Link href="/app/dashboard">
                <Button className="bg-primary text-primary-foreground">
                  Go to Dashboard
                </Button>
              </Link>
            </motion.div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-xl transition-all duration-300"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{activity.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(activity.date)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  );
}
