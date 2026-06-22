"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { LottieAnimation } from "../../../components/ui/LottieAnimation";
import successConfetti from "../../../../public/lottie/confettie.json";
import { Smile, Frown, Meh, Laugh, Heart, CheckCircle2, ChevronRight, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "../../../lib/authGuard";
import { saveDailyReflection } from "../../../lib/dataLoader";
import { audioManager } from "../../../lib/audioManager";

const MOODS = [
  { val: 1, label: "Quiet", icon: <Frown className="w-6 h-6" />, color: "text-red-400 border-red-500/20 bg-red-500/5" },
  { val: 2, label: "Tired", icon: <Meh className="w-6 h-6" />, color: "text-orange-400 border-orange-500/20 bg-orange-500/5" },
  { val: 3, label: "Steady", icon: <Meh className="w-6 h-6" />, color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
  { val: 4, label: "Focused", icon: <Smile className="w-6 h-6" />, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
  { val: 5, label: "Elevated", icon: <Laugh className="w-6 h-6" />, color: "text-primary border-primary/20 bg-primary/5" },
];

export default function DailyLoopPage() {
  const { user, loading } = useRequireAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalText, setJournalText] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null || !journalText.trim() || !user) return;
    
    setIsSaving(true);
    try {
      const result = await saveDailyReflection(user.id, selectedMood, journalText);
      if (result.success) {
        audioManager.play('success');
        setIsLogged(true);
        setJournalText("");
        setSelectedMood(null);
      } else {
        alert(result.error || 'Failed to save reflection');
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Failed to save reflection');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 max-w-2xl mx-auto relative">
      <AnimatePresence>
        {isLogged && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            <LottieAnimation animationData={successConfetti} loop={false} className="w-full h-full object-cover" />
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4 text-center">
        <Heart className="w-10 h-10 text-primary mx-auto mb-2 opacity-80" />
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Daily Reflection</h1>
        <p className="text-muted-foreground font-light max-w-md mx-auto">
          Align your focus, check in with your mind, and archive today's memories.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isLogged ? (
          <motion.div
            key="journal-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mood card */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl text-center">How is your energy state today?</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center gap-4 flex-wrap">
                  {MOODS.map((mood) => {
                    const isSelected = selectedMood === mood.val;
                    return (
                      <button
                        key={mood.val}
                        type="button"
                        onClick={() => setSelectedMood(mood.val)}
                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 w-24 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary scale-105"
                            : "border-white/10 hover:border-white/20 text-muted-foreground bg-white/[0.01]"
                        }`}
                      >
                        {mood.icon}
                        <span className="text-xs font-medium">{mood.label}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Reflection Card */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    Today's Archive
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write down any breakthrough, obstacle, or simple reflection from today..."
                    className="w-full min-h-36 bg-black/20 border border-white/10 rounded-2xl p-6 text-base outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed placeholder:text-muted-foreground/45"
                  />
                  <Button
                    type="submit"
                    disabled={selectedMood === null || !journalText.trim() || isSaving}
                    className="w-full rounded-2xl py-4 flex items-center justify-center gap-2"
                  >
                    {isSaving ? "Saving..." : "Log Reflection"} <ChevronRight className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Card className="bg-white/5 border-white/10 p-12 space-y-6">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-playfair text-3xl font-bold">Reflection Saved</h2>
              <p className="text-muted-foreground font-light max-w-sm mx-auto">
                Excellent check-in. Your companion evolution progress and stats have been updated (+50 XP).
              </p>
              <Button onClick={() => setIsLogged(false)} variant="glass" className="rounded-xl mt-4 px-6 border-white/10">
                Write Another Log
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
