"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { User, Shield, Volume2, Palette, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [accountabilityMode, setAccountabilityMode] = useState("standard");
  const [themeColor, setThemeColor] = useState("neon-green");

  return (
    <div className="space-y-10 pb-12 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground font-light">
          Customize the environment, companion response profile, and accountability layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings categories */}
        <div className="md:col-span-1 space-y-3">
          {[
            { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
            { id: "customization", label: "Customization", icon: <Palette className="w-5 h-5 text-primary" /> },
            { id: "accountability", label: "Accountability", icon: <Shield className="w-5 h-5" /> },
            { id: "sounds", label: "Audio Profile", icon: <Volume2 className="w-5 h-5" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left text-sm font-medium transition-all ${
                cat.id === "customization" 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Customization & Audio details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Color Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">App Tint Color</label>
                <div className="flex gap-4">
                  {[
                    { id: "neon-green", name: "Neon Aura", hex: "bg-[#00e575]" },
                    { id: "emerald", name: "Emerald", hex: "bg-emerald-500" },
                    { id: "amber", name: "Amber", hex: "bg-amber-500" },
                    { id: "violet", name: "Indigo", hex: "bg-indigo-500" },
                  ].map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setThemeColor(color.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        themeColor === color.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/5 hover:border-white/10 text-muted-foreground bg-white/[0.01]"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${color.hex}`} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Accountability Calibration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Calibrate feedback tone</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "lenient", title: "Soft Support", desc: "Duolingo-style positive reinforcements." },
                    { id: "standard", title: "Standard", desc: "Balanced coaching with weekly feedback." },
                    { id: "strict", title: "Ruthless", desc: "No sugarcoating. High pressure warnings." },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setAccountabilityMode(mode.id)}
                      className={`flex flex-col items-start gap-2 p-5 rounded-2xl border text-left transition-all ${
                        accountabilityMode === mode.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-white/5 hover:border-white/10 text-muted-foreground bg-white/[0.01]"
                      }`}
                    >
                      <span className="font-semibold text-sm">{mode.title}</span>
                      <span className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-light">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Audio Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm text-foreground/90">Haptic Sounds</h4>
                  <p className="text-xs text-muted-foreground mt-1.5 font-light">Play clicks and level-up congratulations triggers.</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-7 rounded-full transition-all relative ${
                    soundEnabled ? "bg-primary" : "bg-white/10"
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-black transition-all ${
                    soundEnabled ? "translate-x-5 bg-[#09090b]" : "bg-zinc-400"
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="rounded-xl px-8 py-3.5">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
