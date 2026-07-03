"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Users, Activity, Zap, Key, TrendingUp, Calendar, Shield, AlertCircle, DollarSign, RefreshCw, MoreVertical, FileText, Edit, Save, Plus, Trash2 } from "lucide-react";
import { useRequireAuth } from "../../lib/authGuard";
import { createClientComponentClient, isSupabaseConfigured } from "../../lib/supabase";

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    ultraUsers: 0,
    suspendedUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'content' | 'deleted'>('users');
  
  // Content management state
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [contentFilter, setContentFilter] = useState<'all' | 'pricing' | 'legal' | 'page'>('all');
  
  // Deleted users tracking
  const [deletedUsers, setDeletedUsers] = useState<any[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  
  const [userApiKeys, setUserApiKeys] = useState<any[]>([]);
  const [newTokenLimit, setNewTokenLimit] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState("gemini");
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newKeyModel, setNewKeyModel] = useState("gemini-2.5-flash");

  // Default models per provider
  const PROVIDER_DEFAULT_MODELS: Record<string, { model: string; label: string }[]> = {
    gemini: [
      { model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
      { model: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { model: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    ],
    openai: [
      { model: 'gpt-4o-mini', label: 'GPT-4o Mini (Recommended)' },
      { model: 'gpt-4o', label: 'GPT-4o' },
      { model: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    anthropic: [
      { model: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Recommended)' },
      { model: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { model: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
    groq: [
      { model: 'llama3-8b-8192', label: 'Llama 3 8B (Recommended)' },
      { model: 'llama3-70b-8192', label: 'Llama 3 70B' },
    ],
    openrouter: [
      { model: 'openai/gpt-4o-mini', label: 'GPT-4o Mini via OpenRouter' },
      { model: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash via OpenRouter' },
    ],
  };

  const getAuthToken = async () => {
    const supabase = createClientComponentClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const loadAdminData = async () => {
    if (!user || !isSupabaseConfigured()) return;
    
    setLoadingData(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("No token");

      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setIsAdmin(false);
        }
        throw new Error("Failed to load users");
      }

      setIsAdmin(true);
      const data = await res.json();
      const profiles = data.users || [];

      const freeUsers = profiles.filter((p: any) => p.plan === 'free').length;
      const proUsers = profiles.filter((p: any) => p.plan === 'pro').length;
      const ultraUsers = profiles.filter((p: any) => p.plan === 'ultra').length;
      const suspendedUsers = profiles.filter((p: any) => p.plan === 'suspended').length;

      setStats({
        totalUsers: profiles.length,
        freeUsers,
        proUsers,
        ultraUsers,
        suspendedUsers,
        activeUsers: profiles.length - suspendedUsers,
        monthlyRevenue: 0, // TODO: Calculate from actual Stripe subscriptions
        activeSubscriptions: proUsers + ultraUsers,
      });

      setRecentUsers(profiles);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSystemSettings(data.settings || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Content management functions
  const loadContent = async () => {
    setLoadingContent(true);
    try {
      const token = await getAuthToken();
      const url = contentFilter === 'all' 
        ? '/api/admin/content' 
        : `/api/admin/content?type=${contentFilter}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContentItems(data.content || []);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      const token = await getAuthToken();
      const method = editingContent.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/content', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingContent)
      });
      if (res.ok) {
        alert('Content saved successfully');
        setShowContentEditor(false);
        setEditingContent(null);
        loadContent();
      } else {
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('Content deleted successfully');
        loadContent();
      } else {
        alert('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content');
    }
  };

  const openContentEditor = (content?: any) => {
    if (content) {
      setEditingContent({ ...content });
    } else {
      setEditingContent({
        key: '',
        type: 'page',
        title: '',
        content: '',
        metadata: {},
        is_published: true
      });
    }
    setShowContentEditor(true);
  };

  const loadDeletedUsers = async () => {
    setLoadingDeleted(true);
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      setDeletedUsers(data || []);
    } catch (error) {
      console.error('Error loading deleted users:', error);
    } finally {
      setLoadingDeleted(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string, description: string) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description })
      });
      if (res.ok) {
        alert("Setting updated successfully");
        loadSystemSettings();
      } else {
        alert("Failed to update setting");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating setting");
    }
  };

  const handleUpdateUser = async (userId: string, updates: { plan?: string, token_limit?: number }) => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, ...updates })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Update user error:', errorData);
        throw new Error(errorData.error || "Failed to update user");
      }

      alert("User updated successfully");
      loadAdminData();
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, ...updates });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}? This will permanently delete ALL their data including habits, tasks, spending, and account. This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Delete user error:', errorData);
        throw new Error(errorData.error || "Failed to delete user");
      }

      alert("User and all data deleted successfully");
      setShowUserModal(false);
      setSelectedUser(null);
      loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const handleAddAiKey = async (userId: string) => {
    if (!newKeyValue || !newKeyName) {
      alert("Please fill in key name and value");
      return;
    }
    
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId, 
          provider: newKeyProvider, 
          keyName: newKeyName, 
          key: newKeyValue,
          model: newKeyModel
        })
      });

      if (!res.ok) throw new Error("Failed to add key");

      alert("API key added successfully");
      setNewKeyName("");
      setNewKeyValue("");
      loadAdminData();
      
      // Reload user data to show new key
      const updatedUsers = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedData = await updatedUsers.json();
      const updatedUser = updatedData.users.find((u: any) => u.id === userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
        setUserApiKeys(updatedUser.api_keys || []);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add API key");
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId })
      });

      if (!res.ok) throw new Error("Failed to delete key");

      alert("API key deleted successfully");
      loadAdminData();
      
      // Reload user data to remove deleted key
      const updatedUsers = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedData = await updatedUsers.json();
      const updatedUser = updatedData.users.find((u: any) => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
        setUserApiKeys(updatedUser.api_keys || []);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete API key");
    }
  };

  useEffect(() => {
    loadAdminData();
    loadSystemSettings();
    if (activeTab === 'content') {
      loadContent();
    }
    if (activeTab === 'deleted') {
      loadDeletedUsers();
    }
  }, [user, activeTab]);

  if (loading) return <div>Loading...</div>;
  if (!isSupabaseConfigured()) return <div>Supabase Not Configured</div>;
  if (!loadingData && !isAdmin) return <div>Access Denied</div>;
  if (loadingData) return <div>Loading admin data...</div>;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-4">
      <div className="space-y-4">
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor user activity, plans, and system performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Pro Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.proUsers}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Ultra Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.ultraUsers}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${stats.monthlyRevenue}</div></CardContent></Card>
      </div>

      <div className="flex gap-4 border-b pb-2">
        <Button variant={activeTab === 'users' ? 'default' : 'glass'} onClick={() => setActiveTab('users')}>Users</Button>
        <Button variant={activeTab === 'settings' ? 'default' : 'glass'} onClick={() => setActiveTab('settings')}>System Settings</Button>
        <Button variant={activeTab === 'content' ? 'default' : 'glass'} onClick={() => setActiveTab('content')}>Content Management</Button>
        <Button variant={activeTab === 'deleted' ? 'default' : 'glass'} onClick={() => setActiveTab('deleted')}>Deleted Users</Button>
      </div>

      {activeTab === 'users' && (
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{profile.name || profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">Plan: {profile.plan}</p>
                    <p className="text-xs text-muted-foreground">Tokens: {profile.token_limit || 0}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedUser(profile);
                    setNewTokenLimit(profile.token_limit?.toString() || "0");
                    setShowUserModal(true);
                  }}>
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'settings' && (
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-primary/10 text-primary border border-primary/20 rounded-lg">
            <h3 className="font-bold mb-1">Guide for Admins:</h3>
            <p className="text-sm">Here you can configure global application settings like Stripe prices and payment links. Changing these values will immediately update the frontend display across the site. Make sure your checkout links are active in Stripe.</p>
          </div>
          <div className="space-y-6">
            {systemSettings.map((setting) => (
              <div key={setting.key} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex-1 w-full">
                  <p className="font-medium text-primary">{setting.key}</p>
                  <p className="text-sm text-muted-foreground mb-2">{setting.description}</p>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={setting.value}
                    id={`setting-${setting.key}`}
                  />
                </div>
                <Button 
                  onClick={() => {
                    const input = document.getElementById(`setting-${setting.key}`) as HTMLInputElement;
                    if (input) handleUpdateSetting(setting.key, input.value, setting.description);
                  }}
                  className="w-full md:w-auto"
                >
                  Save
                </Button>
              </div>
            ))}
            {systemSettings.length === 0 && (
              <div className="text-muted-foreground">No settings found. Run the SQL update script.</div>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'content' && (
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-primary/10 text-primary border border-primary/20 rounded-lg">
            <h3 className="font-bold mb-1">Content Management System:</h3>
            <p className="text-sm">Manage all dynamic content including pricing, legal documents, and page content. Changes here update the entire application in real-time.</p>
          </div>
          
          {/* Filter and Add */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <Button 
                variant={contentFilter === 'all' ? 'default' : 'glass'} 
                onClick={() => setContentFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={contentFilter === 'pricing' ? 'default' : 'glass'} 
                onClick={() => setContentFilter('pricing')}
              >
                Pricing
              </Button>
              <Button 
                variant={contentFilter === 'legal' ? 'default' : 'glass'} 
                onClick={() => setContentFilter('legal')}
              >
                Legal
              </Button>
              <Button 
                variant={contentFilter === 'page' ? 'default' : 'glass'} 
                onClick={() => setContentFilter('page')}
              >
                Pages
              </Button>
            </div>
            <Button 
              onClick={() => openContentEditor()}
              className="ml-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>

          {/* Content List */}
          {loadingContent ? (
            <div className="text-center py-8">Loading content...</div>
          ) : contentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No content found</div>
          ) : (
            <div className="space-y-4">
              {contentItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.type === 'pricing' ? 'bg-green-500/10 text-green-500' :
                        item.type === 'legal' ? 'bg-blue-500/10 text-blue-500' :
                        item.type === 'page' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {item.type}
                      </span>
                      <span className="font-medium">{item.title}</span>
                      {!item.is_published && (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-500">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Key: {item.key}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {typeof item.content === 'string' ? item.content.substring(0, 100) + '...' : JSON.stringify(item.content).substring(0, 100) + '...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openContentEditor(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteContent(item.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {activeTab === 'deleted' && (
      <Card>
        <CardHeader>
          <CardTitle>Deleted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg">
            <h3 className="font-bold mb-1">Account Deletion History:</h3>
            <p className="text-sm">View users who have deleted their accounts. This shows deletion date and reason if provided.</p>
          </div>
          
          {loadingDeleted ? (
            <div className="text-center py-8">Loading deleted users...</div>
          ) : deletedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No deleted users found</div>
          ) : (
            <div className="space-y-4">
              {deletedUsers.map((user) => (
                <div key={user.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4 bg-red-500/5 border-red-500/20">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-500">DELETED</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Deleted: {user.deleted_at ? new Date(user.deleted_at).toLocaleString() : 'Unknown'}
                    </p>
                    {user.deletion_reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {user.deletion_reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Original Plan: {user.plan?.toUpperCase() || 'Free'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Manage User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Manage User: {selectedUser.email}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedUser.plan === 'pro' ? 'bg-primary/20 text-primary' :
                  selectedUser.plan === 'ultra' ? 'bg-secondary/20 text-secondary' :
                  selectedUser.plan === 'suspended' ? 'bg-red-500/20 text-red-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {selectedUser.plan?.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedUser.xp_total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">{selectedUser.streak_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Streak Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedUser.total_tokens_used || 0}</p>
                  <p className="text-xs text-muted-foreground">Tokens Used</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{selectedUser.tokens_remaining || 0}</p>
                  <p className="text-xs text-muted-foreground">Tokens Left</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="p-4 bg-background border rounded-lg space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stripe Customer</p>
                    <p className="font-medium font-mono text-xs">{selectedUser.stripe_customer_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Token Limit</p>
                    <p className="font-medium">{selectedUser.token_limit || 'Unlimited'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Admin Status</p>
                    <p className="font-medium">{selectedUser.is_admin ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Plan Management */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Plan Management
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {['free', 'pro', 'ultra', 'suspended'].map(plan => (
                    <Button 
                      key={plan} 
                      variant={selectedUser.plan === plan ? 'default' : 'outline'} 
                      onClick={() => handleUpdateUser(selectedUser.id, { plan })}
                      className={selectedUser.plan === plan ? 'bg-gradient-to-r from-primary to-secondary' : ''}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Token Limit */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Token Limit
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={newTokenLimit} 
                    onChange={e => setNewTokenLimit(e.target.value)} 
                    placeholder="Enter token limit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  />
                  <Button onClick={() => handleUpdateUser(selectedUser.id, { token_limit: parseInt(newTokenLimit) })}>Save</Button>
                </div>
              </div>

              {/* Existing API Keys */}
              {userApiKeys.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Existing API Keys ({userApiKeys.length})
                  </h3>
                  <div className="space-y-2">
                    {userApiKeys.map((key: any) => (
                      <div key={key.id} className="p-3 bg-background border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{key.provider}</p>
                          <p className="text-sm text-muted-foreground">{key.selected_model}</p>
                          <p className="text-xs text-muted-foreground">Status: {key.status}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="text-red-500 hover:text-red-400 border-red-500/30 hover:border-red-500"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New API Key */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Assign Platform Key (BYOK)
                </h3>
                <div className="space-y-3 p-4 bg-background border rounded-lg">
                  <select 
                    value={newKeyProvider} 
                    onChange={e => { setNewKeyProvider(e.target.value); setNewKeyModel(PROVIDER_DEFAULT_MODELS[e.target.value]?.[0]?.model || ''); }} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="groq">Groq</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                  <select 
                    value={newKeyModel} 
                    onChange={e => setNewKeyModel(e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {(PROVIDER_DEFAULT_MODELS[newKeyProvider] || []).map(({ model, label }) => (
                      <option key={model} value={model}>{label}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Key Name (e.g. Pro User Key)" 
                    value={newKeyName} 
                    onChange={e => setNewKeyName(e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  />
                  <input 
                    type="password" 
                    placeholder="sk-..." 
                    value={newKeyValue} 
                    onChange={e => setNewKeyValue(e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  />
                  <Button className="w-full" onClick={() => handleAddAiKey(selectedUser.id)}>Assign Key</Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}
                  className="text-red-500 hover:text-red-400 border-red-500/30 hover:border-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
                <Button variant="outline" onClick={() => setShowUserModal(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Editor Modal */}
      {showContentEditor && editingContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingContent.id ? 'Edit Content' : 'Add Content'}</span>
                <Button variant="ghost" size="sm" onClick={() => setShowContentEditor(false)}>✕</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Key (unique identifier)</label>
                  <input 
                    type="text" 
                    value={editingContent.key}
                    onChange={e => setEditingContent({ ...editingContent, key: e.target.value })}
                    placeholder="e.g., pro_price, privacy_policy"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select 
                    value={editingContent.type}
                    onChange={e => setEditingContent({ ...editingContent, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="page">Page</option>
                    <option value="pricing">Pricing</option>
                    <option value="legal">Legal</option>
                    <option value="setting">Setting</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input 
                    type="text" 
                    value={editingContent.title}
                    onChange={e => setEditingContent({ ...editingContent, title: e.target.value })}
                    placeholder="Content title"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content (Plain Text)</label>
                  <textarea 
                    value={editingContent.content}
                    onChange={e => setEditingContent({ ...editingContent, content: e.target.value })}
                    placeholder="Enter content here..."
                    rows={12}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Simple plain text content</p>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_published"
                    checked={editingContent.is_published}
                    onChange={e => setEditingContent({ ...editingContent, is_published: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <label htmlFor="is_published" className="text-sm">Published (visible to users)</label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowContentEditor(false)}>Cancel</Button>
                  <Button onClick={handleSaveContent}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
