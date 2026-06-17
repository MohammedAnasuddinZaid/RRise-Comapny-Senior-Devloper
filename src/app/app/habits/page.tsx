"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Plus, Flame, Check, Trash2, Brain, Book, Dumbbell, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "../../../lib/authGuard";
import { loadHabits, toggleHabitCompletion } from "../../../lib/dataLoader";

const iconMap: Record<string, React.ReactNode> = {
  "brain": <Brain className="w-5 h-5 text-primary" />,
  "book": <Book className="w-5 h-5 text-primary" />,
  "dumbbell": <Dumbbell className="w-5 h-5 text-primary" />
};

export default function HabitsPage() {
  const { user, loading } = useRequireAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("brain");
  const [dataLoading, setDataLoading] = useState(true);

  // Load habits from Supabase
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      setDataLoading(true);
      try {
        const userHabits = await loadHabits(user.id);
        setHabits(userHabits);
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setDataLoading(false);
      }
    }

    loadUserData();
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

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit = {
      id: Date.now().toString(),
      title: newHabitTitle,
      completed: false,
      streak: 0,
      icon: newHabitIcon,
    };

    setHabits([...habits, newHabit]);
    setNewHabitTitle("");
  };

  const toggleHabit = async (id: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const nextCompleted = !habit.completed;
    
    // Update local state optimistically
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          return {
            ...h,
            completed: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );

    // Update Supabase
    const result = await toggleHabitCompletion(id, user.id, nextCompleted);
    if (!result.success) {
      // Revert on error
      setHabits(
        habits.map((h) => {
          if (h.id === id) {
            return {
              ...h,
              completed: habit.completed,
              streak: habit.streak,
            };
          }
          return h;
        })
      );
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-10 pb-12 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Habit Rituals</h1>
        <p className="text-muted-foreground font-light">
          Consistency is the cornerstone of mastery. Track your daily loops and build your character.
        </p>
      </div>

      {/* Habit Creation Card */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8">
          <form onSubmit={handleCreateHabit} className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="Name your new ritual (e.g. 'Cold Shower', 'Journaling')"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-base placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-black/20 border border-white/10 rounded-xl p-1">
                {["brain", "book", "dumbbell"].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewHabitIcon(icon)}
                    className={`p-3 rounded-lg capitalize transition-colors ${
                      newHabitIcon === icon ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {iconMap[icon]}
                  </button>
                ))}
              </div>
              
              <Button type="submit" className="rounded-xl h-full py-4 px-6">
                <Plus className="w-5 h-5 mr-2" /> Add Habit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence initial={false}>
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`h-full border transition-all duration-300 relative group ${
                habit.completed 
                  ? "bg-primary/[0.03] border-primary/20" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}>
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`p-3.5 rounded-xl border transition-colors ${
                        habit.completed 
                          ? "bg-primary/20 border-primary/30" 
                          : "bg-white/5 border-white/10"
                      }`}>
                        {iconMap[habit.icon] || <Star className="w-6 h-6 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-playfair text-xl font-bold">{habit.title}</h3>
                        <div className="flex items-center gap-1.5 mt-2.5 text-orange-500 font-sans text-sm font-medium">
                          <Flame className="w-4 h-4 fill-current" />
                          <span>{habit.streak} Day Streak</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        habit.completed 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-muted-foreground/50 text-transparent hover:border-primary"
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                  {/* Weekly Progress Tracker indicator mockup */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
                        // Mock past completions
                        const isCompleted = index < 3 || (index === 6 && habit.completed);
                        return (
                          <div key={index} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground font-light">{day}</span>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-sans transition-colors ${
                              isCompleted 
                                ? "bg-primary/20 border-primary/30 text-primary font-bold" 
                                : "border-white/10 text-muted-foreground/40 bg-white/[0.01]"
                            }`}>
                              {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 self-end"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
