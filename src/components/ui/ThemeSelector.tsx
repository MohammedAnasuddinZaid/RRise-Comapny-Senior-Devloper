"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette, Sun, Cloud, Sparkles, Moon } from "lucide-react";

const themes = [
  { id: 'default' as const, name: 'Default', icon: Moon, description: 'Dark neon theme' },
  { id: 'sky' as const, name: 'Sky', icon: Cloud, description: 'Blue & white cloudy' },
  { id: 'diva' as const, name: 'Diva💅🏼', icon: Sparkles, description: 'Pink & grainy' },
  { id: 'manga' as const, name: 'Manga', icon: Sun, description: 'Black & white glow' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-border transition-colors"
      >
        {currentTheme && <currentTheme.icon className="w-4 h-4" />}
        <span className="text-sm">{currentTheme?.name || 'Default'}</span>
        <Palette className="w-4 h-4 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      theme === t.id 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                    {theme === t.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
