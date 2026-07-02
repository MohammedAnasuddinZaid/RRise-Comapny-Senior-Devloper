"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Play, ChevronDown, Lock, ArrowRight } from "lucide-react";
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const { theme } = useTheme();
  const { user } = useRequireAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; plans?: Template[]; followUpQuestions?: string[] }>>([]);
  const [input, setInput] = useState("");
  const [suggestedPlans, setSuggestedPlans] = useState<Template[]>([]);
  const [startingPlan, setStartingPlan] = useState<string | null>(null);
  const [selectedAPI, setSelectedAPI] = useState<'free' | 'byok' | 'pro'>('free');
  const [showAPIDropdown, setShowAPIDropdown] = useState(false);
  const [hasBYOK, setHasBYOK] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [byokDebug, setByokDebug] = useState<{ mode: string; provider: string; model: string; status: string; lastError: string }>({
    mode: 'free',
    provider: 'none',
    model: 'none',
    status: 'idle',
    lastError: 'none'
  });
  
  // Chat history state
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Load user profile and set default API mode
  useEffect(() => {
    async function loadProfileAndKeys() {
      if (!user) return;
      
      const profile = await loadUserProfile(user.id);
      setUserProfile(profile);
      
      const hasOpenAI = await hasActiveAIKey(user.id, 'openai');
      const hasGemini = await hasActiveAIKey(user.id, 'gemini');
      const hasAnthropic = await hasActiveAIKey(user.id, 'anthropic');
      const hasOpenRouter = await hasActiveAIKey(user.id, 'openrouter');
      const keysAvailable = hasOpenAI || hasGemini || hasAnthropic || hasOpenRouter;
      
      setHasBYOK(keysAvailable);
      
      // Auto-select mode based on profile plan and available keys
      if (profile && (profile.plan === 'pro' || profile.plan === 'ultra')) {
        setSelectedAPI('pro');
      } else if (keysAvailable) {
        setSelectedAPI('byok');
      }
      
      // Load conversations
      loadConversations();
    }
    loadProfileAndKeys();
  }, [user]);

  // Load conversations
  const loadConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;
      
      const res = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Create new conversation
  const createNewConversation = async () => {
    if (!user) return;
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;
      
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentConversationId(data.conversation.id);
        setMessages([]);
        loadConversations();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Load messages for a conversation
  const loadConversationMessages = async (conversationId: string) => {
    if (!user) return;
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;
      
      const res = await fetch(`/api/chat/messages?conversation_id=${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setCurrentConversationId(conversationId);
        setShowConversationList(false);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Save message to conversation
  const saveMessageToConversation = async (role: 'user' | 'assistant', content: string) => {
    if (!user || !currentConversationId) {
      // If no conversation, create one first
      await createNewConversation();
      return;
    }
    
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;
      
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          role,
          content
        })
      });
      loadConversations(); // Refresh to update timestamps
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Handle starting a plan from plan suggestion
  const handleStartPlan = async (plan: Template) => {
    if (!user) return;

    setStartingPlan(plan.id);
    try {
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
      alert('Failed to start plan. Please try again.');
    } finally {
      setStartingPlan(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      audioManager.play('click');
      
      // Crisis detection - check BEFORE safety check
      const crisisKeywords = ['suicide', 'kill myself', 'hurt myself', 'self harm', 'end my life', 'want to die', 'no reason to live', 'better off dead'];
      const lowerInput = input.toLowerCase();
      
      if (crisisKeywords.some(keyword => lowerInput.includes(keyword))) {
        setMessages([...messages, { role: 'user', content: input }]);
        setInput("");
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `I'm concerned about what you're sharing. If you're thinking about hurting yourself, please reach out for help immediately:

🆘 **Crisis Resources:**
- **National Suicide Prevention Lifeline:** Call or text 988 (US)
- **Crisis Text Line:** Text HOME to 741741
- **International:** Find helplines at findahelpline.com

You are not alone, and there are people who want to help. Please consider reaching out to a trusted adult, mental health professional, or the crisis lines above. Your life matters.

If you're in immediate danger, please call emergency services (911 in the US).`,
          }]);
        }, 500);
        return;
      }
      
      if (selectedAPI === 'byok' && !hasBYOK) {
        // BYOK mode requires API keys
        setMessages([...messages, { role: 'user', content: input }]);
        setInput("");
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "To use BYOK mode, please add your API keys in Settings. For now, you can use FREE mode for plans.",
          }]);
        }, 500);
        return;
      }
      
      // Perform safety check
      if (user) {
        const safetyCheck = await performSafetyCheck(user.id, input);
        
        if (!safetyCheck.isSafe) {
          // Log safety violation
          logSafetyViolation(user.id, 'input_safety', safetyCheck.reason || 'Unknown');
          
          // Show error message to user
          setMessages([...messages, { role: 'user', content: input }]);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: safetyCheck.reason || "I couldn't process that message due to safety guidelines.",
            }]);
          }, 500);
          setInput("");
          return;
        }
        
        // Use sanitized input
        const sanitizedInput = safetyCheck.sanitizedInput || input;
        
        setMessages([...messages, { role: 'user', content: sanitizedInput }]);
        setInput("");
        
        // Update debug state
        setByokDebug(prev => ({ ...prev, mode: selectedAPI, status: 'calling', lastError: 'none' }));
        
        // Use AI mode to generate response
        const aiResponse = await generateAIResponse(user.id, sanitizedInput, selectedAPI);
        
        // Filter AI response for safety
        const filteredResponse = filterAIResponse(aiResponse.response);
        
        if (!filteredResponse.isSafe) {
          logSafetyViolation(user.id, 'output_safety', filteredResponse.reason || 'Unknown');
          setByokDebug(prev => ({ ...prev, status: 'blocked', lastError: 'safety_filter' }));
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "I couldn't generate a response due to safety guidelines. Please try rephrasing your request.",
            }]);
          }, 1000);
          return;
        }
        
        const followUpQuestions = getFollowUpQuestions(aiResponse.category);
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: filteredResponse.filteredResponse || aiResponse.response,
            plans: aiResponse.templates,
            followUpQuestions,
          }]);
          setSuggestedPlans(aiResponse.templates || []);
        }, 1000);
      } else {
        // Fallback for non-authenticated users
        setMessages([...messages, { role: 'user', content: input }]);
        setInput("");
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Please sign in to use the AI companion features.",
          }]);
        }, 1000);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030303]' : 'bg-white'} text-foreground relative overflow-hidden`}>
      {/* Background Effects */}
      <div className={`absolute top-[-20%] left-[30%] w-[600px] h-[600px] ${theme === 'dark' ? 'bg-primary/5' : 'bg-primary/10'} rounded-full blur-[150px] pointer-events-none`} />
      <div className={`absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] ${theme === 'dark' ? 'bg-primary/3' : 'bg-primary/5'} rounded-full blur-[130px] pointer-events-none`} />

      {/* Header */}
      <header className={`flex items-center justify-between p-6 md:px-12 backdrop-blur-xl ${theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-white/70 border-green-500/20'} border-b fixed top-0 w-full z-40`}>
        <div className="flex items-center gap-4">
          <Link href="/app/dashboard">
            <Button variant="glass" size="icon" className={`border-white/5 hover:border-primary/30 ${theme === 'light' ? 'border-green-500/30 hover:border-green-500' : ''}`}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-playfair text-2xl font-bold">AI Companion</h1>
          {userProfile?.plan && userProfile.plan !== 'free' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getPlanBadgeColor(userProfile.plan)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase">{getPlanDisplayName(userProfile.plan)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* API Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAPIDropdown(!showAPIDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedAPI === 'free' 
                  ? 'bg-white/5 border border-white/10 text-muted-foreground'
                  : 'bg-primary/10 border border-primary/20 text-primary'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {selectedAPI === 'free' ? 'FREE MODE' : selectedAPI === 'byok' ? 'BYOK MODE' : 'PRO MODE'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showAPIDropdown && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-50 ${
                theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/90 border-green-500/20'
              }`}>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setSelectedAPI('free'); setShowAPIDropdown(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedAPI === 'free' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>FREE MODE</span>
                  </button>
                  {hasBYOK && (
                    <button
                      onClick={() => { setSelectedAPI('byok'); setShowAPIDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedAPI === 'byok' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>BYOK MODE</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedAPI('pro'); setShowAPIDropdown(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedAPI === 'pro' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>PRO MODE</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedAPI === 'free' ? 'bg-green-500' : 'bg-primary'}`} />
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-24 pb-8 px-4 md:px-12 max-w-4xl mx-auto w-full">
        {/* BYOK Debug Card (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs">
            <div className="font-bold text-yellow-500 mb-2">BYOK DEBUG (Development Only)</div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>Mode: <span className="text-foreground">{byokDebug.mode}</span></div>
              <div>Provider: <span className="text-foreground">{byokDebug.provider}</span></div>
              <div>Model: <span className="text-foreground">{byokDebug.model}</span></div>
              <div>Status: <span className="text-foreground">{byokDebug.status}</span></div>
              <div className="col-span-2">Last Error: <span className="text-foreground">{byokDebug.lastError}</span></div>
            </div>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="flex-1 space-y-6 mb-8 overflow-y-auto">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20"
            >
              <div className="relative">
                <LottieAnimation animationData={greenParrot} loop={true} className="w-32 h-32" />
              </div>
              <div>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-playfair text-3xl font-bold mb-2"
                >
                  Start a conversation
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground max-w-md"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="inline-block"
                  >
                    What are we focusing on today?
                  </motion.span>
                </motion.p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 border border-white/10 text-foreground'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                        code: ({ node, inline, children, ...props }: any) => 
                          inline 
                            ? <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                            : <code className="block bg-primary/10 p-3 rounded text-xs font-mono overflow-x-auto" {...props}>{children}</code>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.plans && message.plans.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {message.plans.map((plan: Template, tIndex: number) => (
                        <div
                          key={tIndex}
                          className="p-4 bg-primary/10 border border-primary/20 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm text-primary">{plan.title}</div>
                            <div className="text-xs text-muted-foreground">{plan.category} • {plan.difficulty}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">{plan.description}</div>
                          <Button
                            size="sm"
                            onClick={() => {
                              audioManager.play('click');
                              handleStartPlan(plan);
                            }}
                            disabled={startingPlan === plan.id}
                            className="w-full"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {startingPlan === plan.id ? "Starting..." : "Start Plan"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">Suggested questions:</div>
                      {message.followUpQuestions.map((question, qIndex) => (
                        <button
                          key={qIndex}
                          onClick={() => setInput(question)}
                          className="block w-full text-left p-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <form onSubmit={handleSendMessage} className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all duration-500 opacity-50" />
            <div className={`relative ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/80 border-green-500/20'} backdrop-blur-xl border rounded-2xl p-2 flex items-center shadow-2xl`}>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-foreground px-6 py-4 text-lg placeholder:text-muted-foreground/60"
              />
              {/* AI Mode Switcher */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={() => setShowAPIDropdown(!showAPIDropdown)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    selectedAPI === 'free' 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                      : selectedAPI === 'byok'
                      ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                  }`}
                >
                  {selectedAPI === 'free' ? 'FREE' : selectedAPI === 'byok' ? 'BYOK' : 'PRO'}
                </button>
                {showAPIDropdown && (
                  <div className={`absolute bottom-full right-0 mb-2 w-40 rounded-xl border shadow-xl z-50 ${
                    theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/90 border-green-500/20'
                  }`}>
                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => { setSelectedAPI('free'); setShowAPIDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                          selectedAPI === 'free' ? 'bg-green-500/20 text-green-500' : 'text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        <span>FREE</span>
                      </button>
                      {hasBYOK && (
                        <button
                          type="button"
                          onClick={() => { setSelectedAPI('byok'); setShowAPIDropdown(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            selectedAPI === 'byok' ? 'bg-blue-500/20 text-blue-500' : 'text-muted-foreground hover:bg-white/5'
                          }`}
                        >
                          <span>BYOK</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setSelectedAPI('pro'); setShowAPIDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                          selectedAPI === 'pro' ? 'bg-purple-500/20 text-purple-500' : 'text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        <span>PRO</span>
                        <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded">Soon</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-colors mr-1"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className={`max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/90 border-green-500/20'} backdrop-blur-xl`}>
            <CardContent className="p-8 text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Upgrade Required</h2>
              <p className="text-muted-foreground mb-6">
                AI-powered chat is available on Pro and Ultra plans. Upgrade to unlock advanced AI features and BYOK support.
              </p>
              <div className="space-y-3">
                <Link href="/pricing">
                  <Button className="w-full">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="glass"
                  className="w-full"
                  onClick={() => {
                    setShowUpgradePrompt(false);
                    setSelectedAPI('free');
                  }}
                >
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
