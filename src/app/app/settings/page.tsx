"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { User, Shield, Moon, Sun, Sparkles, Brain, Download, Trash2, AlertTriangle, Plus, Check, X, Key } from "lucide-react";
import { useRequireAuth } from "../../../lib/authGuard";
import { loadUserProfile } from "../../../lib/dataLoader";
import { createClientComponentClient } from "@/lib/supabase";
import { useTheme } from "../../../contexts/ThemeContext";
import { audioManager } from "../../../lib/audioManager";
import { saveAIKey, getUserAIKeys, deleteAIKey, testAIKey, hasActiveAIKey } from "../../../lib/byok";

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  
  // AI Settings state
  const [aiKeys, setAiKeys] = useState<any[]>([]);
  const [showAddKeyForm, setShowAddKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState<"openai" | "gemini" | "anthropic">("openai");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Load user data from Supabase
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      setDataLoading(true);
      try {
        const profile = await loadUserProfile(user.id);
        if (profile) {
          setUserData(profile);
          // Load settings from app_settings table if available
          // For now, use defaults
        }
        
        // Load AI keys
        const keys = await getUserAIKeys(user.id);
        setAiKeys(keys);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  // Handle adding new AI key
  const handleAddAIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newKeyName.trim() || !newKeyValue.trim()) return;

    setSaving(true);
    try {
      const result = await saveAIKey(user.id, newKeyProvider, newKeyName, newKeyValue);
      if (result.success) {
        // Reload AI keys
        const keys = await getUserAIKeys(user.id);
        setAiKeys(keys);
        setShowAddKeyForm(false);
        setNewKeyName("");
        setNewKeyValue("");
        audioManager.play('success');
      } else {
        alert(result.error || 'Failed to save AI key');
      }
    } catch (error) {
      console.error('Error saving AI key:', error);
      alert('Failed to save AI key');
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting AI key
  const handleDeleteAIKey = async (keyId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const result = await deleteAIKey(keyId, user.id);
      if (result.success) {
        // Reload AI keys
        const keys = await getUserAIKeys(user.id);
        setAiKeys(keys);
        audioManager.play('click');
      } else {
        alert(result.error || 'Failed to delete AI key');
      }
    } catch (error) {
      console.error('Error deleting AI key:', error);
      alert('Failed to delete AI key');
    }
  };

  // Handle testing AI key
  const handleTestAIKey = async (provider: "openai" | "gemini" | "anthropic", apiKey: string) => {
    setTestingKey(apiKey);
    setTestResult(null);
    
    try {
      const result = await testAIKey(provider, apiKey);
      setTestResult(result);
      if (result.success) {
        audioManager.play('success');
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to test AI key' });
    } finally {
      setTestingKey(null);
    }
  };

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

  return (
    <div className="space-y-10 pb-12 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-4xl font-bold tracking-tight">Preferences</h1>
            <p className="text-muted-foreground font-light">
              Customize the environment, companion response profile, and accountability layer.
            </p>
          </div>
          {userData?.plan && userData.plan !== "FREE" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase">{userData.plan}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings categories */}
        <div className="md:col-span-1 space-y-3">
          {[
            { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
            { id: "account", label: "Account", icon: <Shield className="w-5 h-5" /> },
            { id: "customization", label: "Theme", icon: theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" /> },
            { id: "ai", label: "AI Settings", icon: <Brain className="w-5 h-5" /> },
            { id: "memory", label: "Memory", icon: <Sparkles className="w-5 h-5" /> },
            { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSection(cat.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left text-sm font-medium transition-all ${
                activeSection === cat.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Settings details - dynamic based on active section */}
        <div className="md:col-span-2 space-y-6">
          {activeSection === "profile" && (
            <>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="border-b border-white/5 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Settings
                    </CardTitle>
                    {userData?.plan && userData.plan !== "FREE" && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase">{userData.plan}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</label>
                      <input
                        type="text"
                        defaultValue={userData?.full_name || ""}
                        className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your username"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        disabled
                        className="w-full mt-2 bg-black/10 border border-white/5 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <Button 
                      onClick={async () => {
                        setSaving(true);
                        // TODO: Implement profile update in Supabase
                        setTimeout(() => setSaving(false), 1000);
                      }}
                      disabled={saving}
                      className="mt-4"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "account" && (
            <>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="border-b border-white/5 pb-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <div>
                        <p className="text-sm font-medium">Plan</p>
                        <p className="text-xs text-muted-foreground mt-1">Current subscription plan</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                        {userData?.plan || "FREE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-xs text-muted-foreground mt-1">Account creation date</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-sm font-medium">XP Level</p>
                        <p className="text-xs text-muted-foreground mt-1">Current experience level</p>
                      </div>
                      <span className="text-sm text-foreground font-semibold">
                        Level {userData?.xp_level || 1}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "customization" && (
            <>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="border-b border-white/5 pb-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                    Theme Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choose between dark and light mode for your preferred viewing experience.
                    </p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          toggleTheme();
                          audioManager.play('click');
                        }}
                        variant={theme === 'dark' ? 'default' : 'glass'}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Moon className="w-4 h-4" />
                        Dark Mode
                      </Button>
                      <Button
                        onClick={() => {
                          toggleTheme();
                          audioManager.play('click');
                        }}
                        variant={theme === 'light' ? 'default' : 'glass'}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Sun className="w-4 h-4" />
                        Light Mode
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "ai" && (
            <>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="border-b border-white/5 pb-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <div>
                        <p className="text-sm font-medium">BYOK Status</p>
                        <p className="text-xs text-muted-foreground mt-1">Bring Your Own Key configuration</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        aiKeys.length > 0 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-white/10 text-muted-foreground"
                      }`}>
                        {aiKeys.length > 0 ? "Configured" : "Not Configured"}
                      </span>
                    </div>
                    
                    {aiKeys.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Your API Keys</p>
                        {aiKeys.map((key) => (
                          <div key={key.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Key className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{key.key_name}</p>
                                  <p className="text-xs text-muted-foreground uppercase">{key.provider}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {key.is_active && (
                                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
                                    Active
                                  </span>
                                )}
                                <Button
                                  variant="glass"
                                  size="icon"
                                  onClick={() => handleDeleteAIKey(key.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showAddKeyForm ? (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => {
                          audioManager.play('click');
                          setShowAddKeyForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add API Key
                      </Button>
                    ) : (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <form onSubmit={handleAddAIKey} className="space-y-4">
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Provider</label>
                            <select
                              value={newKeyProvider}
                              onChange={(e) => setNewKeyProvider(e.target.value as any)}
                              className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                            >
                              <option value="openai">OpenAI</option>
                              <option value="gemini">Gemini</option>
                              <option value="anthropic">Anthropic</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key Name</label>
                            <input
                              type="text"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                              className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                              placeholder="e.g., My OpenAI Key"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">API Key</label>
                            <input
                              type="password"
                              value={newKeyValue}
                              onChange={(e) => setNewKeyValue(e.target.value)}
                              className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                              placeholder="sk-..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={saving}
                              className="flex-1"
                            >
                              {saving ? "Saving..." : "Save Key"}
                            </Button>
                            <Button
                              type="button"
                              variant="glass"
                              onClick={() => {
                                audioManager.play('click');
                                setShowAddKeyForm(false);
                                setNewKeyName("");
                                setNewKeyValue("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "memory" && (
            <>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="border-b border-white/5 pb-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Memory Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Button className="w-full mt-4 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Memory Data
                    </Button>
                    <Button className="w-full flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                      Clear All Memory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "danger" && (
            <>
              <Card className="bg-white/5 border-red-500/20">
                <CardHeader className="border-b border-red-500/20 pb-6">
                  <CardTitle className="text-xl flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <p className="text-sm font-medium text-red-400 mb-2">Delete Account</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
