"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { audioManager } from "../../../lib/audioManager";
import { useTheme } from "../../../contexts/ThemeContext";

// Mock chat history data
const mockChatHistory = [
  {
    id: 1,
    title: "Morning routine planning",
    date: "2026-06-14",
    lastMessage: "Let's start with a 5-minute meditation",
    messageCount: 12
  },
  {
    id: 2,
    title: "Habit tracking discussion",
    date: "2026-06-13",
    lastMessage: "Great progress on your streak!",
    messageCount: 8
  },
  {
    id: 3,
    title: "Finance goals",
    date: "2026-06-12",
    lastMessage: "Let's set up a budget for next month",
    messageCount: 15
  },
  {
    id: 4,
    title: "Weekly review",
    date: "2026-06-11",
    lastMessage: "You've completed 80% of your goals",
    messageCount: 20
  }
];

export default function HistoryPage() {
  const { theme } = useTheme();
  
  const handleDeleteChat = (id: number) => {
    audioManager.play('click');
    // TODO: Connect to Supabase to delete chat
    console.log(`Delete chat ${id}`);
  };

  const handleOpenChat = (id: number) => {
    audioManager.play('click');
    // TODO: Connect to Supabase to load chat
    console.log(`Open chat ${id}`);
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
          <h1 className="font-playfair text-2xl font-bold">Chat History</h1>
        </div>
        <Link href="/app/chat">
          <Button className="bg-primary text-primary-foreground">
            New Chat
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-12 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {mockChatHistory.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleOpenChat(chat.id)}
              className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-playfair text-xl font-semibold text-foreground">{chat.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {chat.date}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{chat.lastMessage}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    {chat.messageCount} messages
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {mockChatHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-playfair text-2xl font-bold mb-2">No chat history yet</h2>
              <p className="text-muted-foreground mb-6">Start a conversation to see your chat history here</p>
              <Link href="/app/chat">
                <Button className="bg-primary text-primary-foreground">
                  Start New Chat
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
