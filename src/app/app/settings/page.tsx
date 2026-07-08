"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { User, Shield, Moon, Sun, Sparkles, Brain, Download, Trash2, AlertTriangle, Plus, Check, X, Key, ExternalLink } from "lucide-react";
import { useRequireAuth } from "../../../lib/authGuard";
import { loadUserProfile } from "../../../lib/dataLoader";
import { createClientComponentClient } from "@/lib/supabase";
import { useTheme } from "../../../contexts/ThemeContext";
import { audioManager } from "../../../lib/audioManager";
import { saveAIKey, getUserAIKeys, deleteAIKey, testAIKey, hasActiveAIKey } from "../../../lib/byok";
import { getAIUsageStats } from "../../../lib/aiMode";
import { aiGateway } from "../../../lib/aiGateway";
import { modelRegistry } from "../../../lib/aiGateway/models";
import { saveAPIKey, getAPIKey, getAllAPIKeys, deleteAPIKey } from "../../../lib/aiGateway/database";
import type { AIProviderType, AIModel } from "../../../lib/aiGateway/types";

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  
  // AI Settings state (new AI Gateway)
  const [aiConfigs, setAiConfigs] = useState<any[]>([]);
  const [showAddConfigForm, setShowAddConfigForm] = useState(false);
  const [newConfigProvider, setNewConfigProvider] = useState<AIProviderType>('gemini');
  const [newConfigModel, setNewConfigModel] = useState('');
  const [newConfigApiKey, setNewConfigApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  // Usage stats state
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

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
        
        // Load AI configs
        const configs = await getAllAPIKeys(user.id);
        setAiConfigs(configs);
        
        // Load usage stats
        setLoadingUsage(true);
        const stats = await getAIUsageStats(user.id, 30);
        setUsageStats(stats);
        setLoadingUsage(false);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  // Load models when provider changes
  useEffect(() => {
    async function loadModels() {
      if (!newConfigProvider || !newConfigApiKey) {
        setAvailableModels([]);
        return;
      }

      setLoadingModels(true);
      try {
        const models = await modelRegistry.fetchModels(newConfigProvider, newConfigApiKey);
        setAvailableModels(models);
        
        // Set default model
        if (models.length > 0 && !newConfigModel) {
          setNewConfigModel(models[0].id);
        }
      } catch (error) {
        console.error('Error loading models:', error);
        setAvailableModels([]);
      } finally {
        setLoadingModels(false);
      }
    }

    loadModels();
  }, [newConfigProvider, newConfigApiKey]);

  // Handle adding new AI config
  const handleAddAIConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newConfigProvider || !newConfigModel || !newConfigApiKey.trim()) return;

    setSaving(true);
    try {
      const result = await saveAPIKey(user.id, newConfigProvider, newConfigModel, newConfigApiKey);
      if (result) {
        // Reload AI configs
        const configs = await getAllAPIKeys(user.id);
        setAiConfigs(configs);
        setShowAddConfigForm(false);
        setNewConfigApiKey('');
        setNewConfigModel('');
        audioManager.play('success');
      } else {
        alert('Failed to save AI configuration');
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      alert('Failed to save AI configuration');
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting AI config
  const handleDeleteAIConfig = async (provider: AIProviderType) => {
    if (!user) return;

    if (!confirm(`Are you sure you want to delete your ${provider} API key?`)) return;

    try {
      const result = await deleteAPIKey(user.id, provider);
      if (result) {
        // Reload AI configs
        const configs = await getAllAPIKeys(user.id);
        setAiConfigs(configs);
        audioManager.play('click');
      } else {
        alert('Failed to delete AI configuration');
      }
    } catch (error) {
      console.error('Error deleting AI config:', error);
      alert('Failed to delete AI configuration');
    }
  };

  // Handle testing connection
  const handleTestConnection = async () => {
    if (!newConfigProvider || !newConfigModel || !newConfigApiKey.trim()) {
      alert('Please fill in all fields before testing');
      return;
    }

    setTestingConnection(true);
    setTestResult(null);
    
    try {
      const result = await aiGateway.testConnection(newConfigProvider, newConfigApiKey, newConfigModel);
      setTestResult(result);
      if (result.success) {
        audioManager.play('success');
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to test connection' });
    } finally {
      setTestingConnection(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const supabase = createClientComponentClient();
      if (!supabase) {
        alert('Failed to update profile');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: (document.querySelector('input[type="text"]') as HTMLInputElement)?.value || userData?.full_name
        })
        .eq('id', user.id);

      if (error) {
        alert('Failed to update profile');
      } else {
        audioManager.play('success');
        // Reload user data
        const profile = await loadUserProfile(user.id);
        if (profile) {
          setUserData(profile);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including habits, tasks, history, and settings.')) return;

    if (!confirm('This is your last chance. All your data will be permanently deleted. Type "DELETE" to confirm.')) return;

    const confirmation = prompt('Please type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClientComponentClient();
      if (!supabase) {
        alert('Failed to delete account');
        setSaving(false);
        return;
      }

      // Delete all user data from all tables (in order of dependencies)
      const tables = [
        'habit_logs',
        'task_logs',
        'xp_logs',
        'spending_entries',
        'habits',
        'tasks',
        'ai_usage_logs',
        'ai_keys',
        'prompt_memory',
        'streaks',
        'mascot_state',
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq('user_id', user.id);
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      // Delete the user's profile
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) {
        console.error('Error deleting auth user:', authError);
        // If admin delete fails, try regular sign out
        await supabase.auth.signOut();
        alert('Account data deleted. You have been signed out.');
        window.location.href = '/';
        return;
      }

      audioManager.play('success');
      alert('Account deleted successfully.');
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setSaving(false);
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
          {userData?.plan && userData.plan !== "free" && (
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
                    {userData?.plan && userData.plan !== "free" && (
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
                      onClick={handleProfileUpdate}
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
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                          {userData?.plan || "FREE"}
                        </span>
                        {(!userData?.plan || userData.plan === 'free') && (
                          <Link href="/pricing">
                            <Button size="sm" className="bg-primary text-primary-foreground font-semibold">
                              Upgrade to Pro
                            </Button>
                          </Link>
                        )}
                      </div>
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
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <div>
                        <p className="text-sm font-medium">XP Level</p>
                        <p className="text-xs text-muted-foreground mt-1">Current experience level</p>
                      </div>
                      <span className="text-sm text-foreground font-semibold">
                        Level {userData?.xp_level || 1}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-sm font-medium">Account Controls</p>
                        <p className="text-xs text-muted-foreground mt-1">Sign out of the workspace</p>
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={async () => {
                          audioManager.play('click');
                          const supabase = createClientComponentClient();
                          if (supabase) {
                            await supabase.auth.signOut();
                            window.location.href = '/';
                          }
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        Log Out
                      </Button>
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
                        aiConfigs.length > 0 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-white/10 text-muted-foreground"
                      }`}>
                        {aiConfigs.length > 0 ? "Configured" : "Not Configured"}
                      </span>
                    </div>

                    {/* Troubleshooting Guide Link */}
                    <Link href="/app/troubleshoot" className="block">
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-500">Troubleshooting Guide</p>
                            <p className="text-xs text-muted-foreground">Having issues with your API keys? Get help here.</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>
                    </Link>
                    
                    {aiConfigs.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Your AI Configurations</p>
                        {aiConfigs.map((config) => (
                          <div key={config.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Key className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium capitalize">{config.provider}</p>
                                  <p className="text-xs text-muted-foreground">{config.selected_model}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.status === 'active' && (
                                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
                                    Active
                                  </span>
                                )}
                                <Button
                                  variant="glass"
                                  size="icon"
                                  onClick={() => handleDeleteAIConfig(config.provider)}
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

                    {/* Usage Stats - Show for all plans */}
                    {usageStats && (
                      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          AI Usage (Last 30 Days)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Total Requests</span>
                            <span className="font-medium">{usageStats.totalRequests}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Total Tokens</span>
                            <span className="font-medium">{usageStats.totalTokens.toLocaleString()}</span>
                          </div>
                          {/* Show token limit for Pro/Ultra users */}
                          {(userData?.plan === 'pro' || userData?.plan === 'ultra') && (
                            <>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Token Limit</span>
                                <span className="font-medium">{userData?.token_limit?.toLocaleString() || 'Unlimited'}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tokens Remaining</span>
                                <span className={`font-medium ${usageStats.totalTokens >= (userData?.token_limit || Infinity) ? 'text-red-500' : 'text-green-500'}`}>
                                  {userData?.token_limit ? Math.max(0, userData.token_limit - usageStats.totalTokens).toLocaleString() : 'Unlimited'}
                                </span>
                              </div>
                              {userData?.token_limit && (
                                <div className="pt-2">
                                  <div className="w-full bg-white/10 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${
                                        (usageStats.totalTokens / userData.token_limit) > 0.9 ? 'bg-red-500' :
                                        (usageStats.totalTokens / userData.token_limit) > 0.7 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(100, (usageStats.totalTokens / userData.token_limit) * 100)}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {Math.round((usageStats.totalTokens / userData.token_limit) * 100)}% of monthly limit used
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          {Object.entries(usageStats.byProvider).length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <p className="text-xs text-muted-foreground mb-2">By Provider</p>
                              {Object.entries(usageStats.byProvider).map(([provider, stats]: [string, any]) => (
                                <div key={provider} className="flex justify-between items-center text-sm mb-1">
                                  <span className="text-muted-foreground capitalize">{provider}</span>
                                  <span className="font-medium">{stats.tokens.toLocaleString()} tokens</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!showAddConfigForm ? (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => {
                          audioManager.play('click');
                          setShowAddConfigForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add AI Configuration
                      </Button>
                    ) : (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <form onSubmit={handleAddAIConfig} className="space-y-4">
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Provider</label>
                            <select
                              value={newConfigProvider}
                              onChange={(e) => setNewConfigProvider(e.target.value as AIProviderType)}
                              className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                            >
                              <option value="gemini">Google Gemini</option>
                              <option value="openai">OpenAI</option>
                              <option value="anthropic">Anthropic</option>
                              <option value="groq">Groq</option>
                              <option value="openrouter">OpenRouter</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">API Key</label>
                            <input
                              type="password"
                              value={newConfigApiKey}
                              onChange={(e) => setNewConfigApiKey(e.target.value)}
                              className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                              placeholder="Enter your API key"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Model</label>
                            {loadingModels ? (
                              <div className="mt-2 text-sm text-muted-foreground">Loading models...</div>
                            ) : (
                              <select
                                value={newConfigModel}
                                onChange={(e) => setNewConfigModel(e.target.value)}
                                disabled={!newConfigApiKey || availableModels.length === 0}
                                className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                              >
                                {availableModels.length === 0 ? (
                                  <option value="">Enter API key to load models</option>
                                ) : (
                                  availableModels.map((model) => (
                                    <option key={model.id} value={model.id}>
                                      {model.name} {model.description ? `- ${model.description}` : ''}
                                    </option>
                                  ))
                                )}
                              </select>
                            )}
                          </div>
                          <div>
                            <Button
                              type="button"
                              variant="glass"
                              onClick={handleTestConnection}
                              disabled={!newConfigProvider || !newConfigModel || !newConfigApiKey || testingConnection}
                              className="w-full"
                            >
                              {testingConnection ? "Testing Connection..." : "Test Connection"}
                            </Button>
                            {testResult && (
                              <div className={`mt-2 text-xs p-2 rounded ${
                                testResult.success 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {testResult.success 
                                  ? `✓ Connected (${testResult.responseTime}ms)` 
                                  : `✗ ${testResult.error}`}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={saving}
                              className="flex-1"
                            >
                              {saving ? "Saving..." : "Save Configuration"}
                            </Button>
                            <Button
                              type="button"
                              variant="glass"
                              onClick={() => {
                                audioManager.play('click');
                                setShowAddConfigForm(false);
                                setNewConfigApiKey('');
                                setNewConfigModel('');
                                setAvailableModels([]);
                                setTestResult(null);
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
                    <p className="text-sm text-muted-foreground">
                      Memory features are automatically managed by the AI companion. Your preferences, goal history, and plan choices are stored securely to personalize your experience.
                    </p>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Delete Personalization Memory</p>
                        <p className="text-xs text-muted-foreground mt-1">Reset all preferences and AI memories</p>
                      </div>
                      <Button
                        variant="glass"
                        onClick={async () => {
                          if (!user) return;
                          if (!confirm('Are you sure you want to clear your AI companion memory? This will reset all personalized context and settings.')) return;
                          
                          setSaving(true);
                          try {
                            const supabase = createClientComponentClient();
                            if (supabase) {
                              const { error } = await supabase.from('prompt_memory').delete().eq('user_id', user.id);
                              if (error) {
                                alert('Error clearing memory: ' + error.message);
                              } else {
                                audioManager.play('success');
                                alert('AI personalization memory cleared successfully.');
                              }
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        className="text-red-500 hover:text-red-400"
                      >
                        Clear Memory
                      </Button>
                    </div>
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
                    <p className="text-sm text-muted-foreground">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <div className="pt-4 border-t border-red-500/20">
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={saving}
                        variant="glass"
                        className="w-full bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-500"
                      >
                        {saving ? "Deleting..." : "Delete Account"}
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
