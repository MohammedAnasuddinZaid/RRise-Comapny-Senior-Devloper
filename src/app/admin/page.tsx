"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Users, Activity, Zap, Key, TrendingUp, Calendar, Shield, AlertCircle, DollarSign, RefreshCw, MoreVertical } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  
  const [newTokenLimit, setNewTokenLimit] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState("openai");
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");

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
        monthlyRevenue: proUsers * 29 + ultraUsers * 99,
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

      if (!res.ok) throw new Error("Failed to update user");

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
          key: newKeyValue 
        })
      });

      if (!res.ok) throw new Error("Failed to add key");

      alert("API key added successfully");
      setNewKeyName("");
      setNewKeyValue("");
    } catch (error) {
      console.error(error);
      alert("Failed to add key");
    }
  };

  useEffect(() => {
    loadAdminData();
    loadSystemSettings();
  }, [user]);

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

      {/* Manage User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Manage User: {selectedUser.email}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Plan Management</h3>
                <div className="flex gap-2">
                  {['free', 'pro', 'ultra', 'suspended'].map(plan => (
                    <Button key={plan} variant={selectedUser.plan === plan ? 'default' : 'outline'} onClick={() => handleUpdateUser(selectedUser.id, { plan })}>
                      {plan}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Token Limit</h3>
                <div className="flex gap-2">
                  <input type="number" value={newTokenLimit} onChange={e => setNewTokenLimit(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <Button onClick={() => handleUpdateUser(selectedUser.id, { token_limit: parseInt(newTokenLimit) })}>Save</Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assign Platform Key (BYOK)</h3>
                <div className="space-y-2">
                  <select value={newKeyProvider} onChange={e => setNewKeyProvider(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                  </select>
                  <input type="text" placeholder="Key Name (e.g. Pro User Key)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input type="password" placeholder="sk-..." value={newKeyValue} onChange={e => setNewKeyValue(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <Button className="w-full" onClick={() => handleAddAiKey(selectedUser.id)}>Assign Key</Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowUserModal(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
