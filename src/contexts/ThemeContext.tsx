"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = 'default' | 'sky' | 'diva' | 'manga';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['default', 'sky', 'diva', 'manga'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.remove('theme-default', 'theme-sky', 'theme-diva', 'theme-manga');
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return { theme: 'default' as Theme, setTheme: () => {}, mounted: false };
  }
  return context;
}
