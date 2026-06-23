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
import { getAIUsageStats } from "../../../lib/aiMode";

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
  const [newKeyProvider, setNewKeyProvider] = useState<"openai" | "gemini" | "anthropic" | "openrouter">("openai");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  
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
        
        // Load AI keys
        const keys = await getUserAIKeys(user.id);
        setAiKeys(keys);
        
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

  // Handle testing AI key
  const handleTestAIKey = async (provider: "openai" | "gemini" | "anthropic" | "openrouter", apiKey: string) => {
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

                    {/* Usage Stats */}
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
                              <option value="openrouter">OpenRouter</option>
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
                            <div className="flex gap-2 mt-2">
                              <input
                                type="password"
                                value={newKeyValue}
                                onChange={(e) => setNewKeyValue(e.target.value)}
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                                placeholder="sk-..."
                              />
                              <Button
                                type="button"
                                variant="glass"
                                onClick={() => handleTestAIKey(newKeyProvider, newKeyValue)}
                                disabled={!newKeyValue || testingKey === newKeyValue}
                                className="px-4"
                              >
                                {testingKey === newKeyValue ? "Testing..." : "Test"}
                              </Button>
                            </div>
                            {testResult && (
                              <div className={`mt-2 text-xs ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                {testResult.success ? '✓ Key is valid' : `✗ ${testResult.error}`}
                              </div>
                            )}
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
                    <p className="text-sm text-muted-foreground">
                      Memory features are automatically managed by the AI companion. Your preferences and context are stored securely.
                    </p>
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
