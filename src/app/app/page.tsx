"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { LottieAnimation } from "../../components/ui/LottieAnimation";
import { loadPlans } from "../../lib/templateLoader";
import { Sparkles, ArrowRight, BookOpen, Dumbbell, Wallet, Flower } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { audioManager } from "../../lib/audioManager";
import greenParrot from "../../../public/lottie/green_parrot.json";
import { useRequireAuth } from "../../lib/authGuard";
import { createHabit, createTask } from "../../lib/dataLoader";
import { saveMemory } from "../../lib/memorySystem";

const iconMap: Record<string, React.ReactNode> = {
  "dumbbell": <Dumbbell className="w-6 h-6 text-primary" />,
  "book-open": <BookOpen className="w-6 h-6 text-primary" />,
  "wallet": <Wallet className="w-6 h-6 text-primary" />,
  "flower": <Flower className="w-6 h-6 text-primary" />
};

export default function AppEntryPage() {
  const { user } = useRequireAuth();
  const [prompt, setPrompt] = useState("");
  const [showParrot, setShowParrot] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [startingPlan, setStartingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadPlansData() {
      const plansData = await loadPlans();
      setPlans(plansData);
    }
    loadPlansData();
  }, []);

  const handlePlanClick = async (planId: string) => {
    if (!user) return;
    
    audioManager.play('click');
    setStartingPlan(planId);
    
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Create habits from plan
      if (plan.habits && plan.habits.length > 0) {
        for (const habit of plan.habits) {
          await createHabit(user.id, habit.title, habit.icon || 'brain');
        }
      }

      // Create tasks from plan
      if (plan.tasks && plan.tasks.length > 0) {
        for (const task of plan.tasks) {
          const dueTime = task.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await createTask(user.id, task.title, dueTime);
        }
      }

      // Store selected plan in memory
      await saveMemory(user.id, 'template_history', {
        planId: plan.id,
        planTitle: plan.title,
        planCategory: plan.category,
        startedAt: new Date().toISOString(),
      });

      audioManager.play('success');
      
      // Small delay to ensure data is saved before redirect
      setTimeout(() => {
        router.push('/app/dashboard');
      }, 500);
    } catch (error) {
      console.error('Error starting plan:', error);
      setStartingPlan(null);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      audioManager.play('click');
      router.push("/app/dashboard");
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    setShowParrot(false);
  };

  return (
    <div className="h-full min-h-[80vh] flex flex-col items-center justify-center max-w-4xl mx-auto pt-10 pb-20">
      
      <div className="text-center space-y-6 mb-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
          <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What are we focusing on today?
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            I'm here to help you build habits, track progress, and stay accountable.
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="w-full max-w-2xl mb-20 relative z-20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Green Parrot Mascot above chat */}
        <AnimatePresence>
          {showParrot && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <LottieAnimation animationData={greenParrot} loop={true} className="w-24 h-24" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary/20 border border-primary/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-sans text-primary font-bold uppercase tracking-wider whitespace-nowrap">
                  Your Companion
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handlePromptSubmit} className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all duration-500 opacity-50 group-hover:opacity-80"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <input 
              type="text" 
              value={prompt}
              onChange={handlePromptChange}
              placeholder="e.g. 'I want to build a morning routine'"
              className="flex-1 bg-transparent border-none outline-none text-foreground px-6 py-4 text-lg placeholder:text-muted-foreground/60"
            />
            <button 
              type="submit"
              className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-colors mr-1"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {["Improve fitness", "Study better", "Fix spending", "Build discipline"].map((chip) => (
            <button 
              key={chip}
              onClick={() => setPrompt(chip)}
              className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              {chip}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="col-span-full mb-4">
          <h2 className="font-playfair text-2xl font-medium tracking-tight">Quick Start Plans</h2>
        </div>
        
        {plans.map((plan: any) => (
          <motion.div 
            key={plan.id}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => handlePlanClick(plan.id)}
            className={`cursor-pointer ${startingPlan === plan.id ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Card className="h-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
              <CardContent className="p-8 flex items-start gap-5">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                  {iconMap[plan.icon]}
                </div>
                <div className="flex-1">
                  <h3 className="font-playfair font-semibold text-xl mb-2 text-foreground/90">{plan.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                  {startingPlan === plan.id && (
                    <p className="text-primary text-xs mt-2 font-medium">Starting...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
