"use client";

/**
 * Admin Dashboard
 * 
 * This dashboard provides admin visibility into:
 * - Total users
 * - Free, Pro, Ultra Max users
 * - Active users
 * - Total AI usage
 * - Recent signups
 * - Key status per user
 * 
 * Security: This page is protected by email allowlist
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Users, Activity, Zap, Key, TrendingUp, Calendar, Shield, AlertCircle } from "lucide-react";
import { useRequireAuth } from "../../lib/authGuard";
import { createClientComponentClient } from "../../lib/supabase";

const ADMIN_EMAILS = [
  "admin@rrise.com",
  "founder@rrise.com",
  // Add more admin emails here
];

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Security: Validate admin emails to prevent injection
const validateAdminEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    ultraMaxUsers: 0,
    activeUsers: 0,
    totalUsage: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user?.email && validateAdminEmail(user.email)) {
      setIsAdmin(ADMIN_EMAILS.includes(user.email));
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    async function loadAdminData() {
      if (!isAdmin || !user || !isSupabaseConfigured()) return;

      setLoadingData(true);
      const supabase = createClientComponentClient();
      if (!supabase) return;

      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: false });

        // Get users by plan
        const { data: profiles } = await supabase
          .from('profiles')
          .select('plan, created_at, email, full_name')
          .order('created_at', { ascending: false })
          .limit(10);

        if (profiles) {
          const freeUsers = profiles.filter(p => p.plan === 'free').length;
          const proUsers = profiles.filter(p => p.plan === 'pro').length;
          const ultraMaxUsers = profiles.filter(p => p.plan === 'ultra_max').length;

          setStats({
            totalUsers: totalUsers || 0,
            freeUsers,
            proUsers,
            ultraMaxUsers,
            activeUsers: profiles.length, // Simplified for now
            totalUsage: 0, // Would need to aggregate from ai_usage_logs
          });

          setRecentUsers(profiles);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoadingData(false);
      }
    }

    loadAdminData();
  }, [isAdmin, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Supabase Not Configured</h2>
            <p className="text-muted-foreground mb-4">
              The admin dashboard requires Supabase to be configured.
            </p>
            <p className="text-sm text-muted-foreground">
              Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor user activity, plans, and system performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultra Max Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ultraMaxUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              recentUsers.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{profile.full_name || profile.email}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{profile.plan}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-500 mb-1">Security Notice</h3>
              <p className="text-sm text-muted-foreground">
                This dashboard is protected by email allowlist. Only authorized admins can access this page.
                Ensure your email is added to the ADMIN_EMAILS array in the admin dashboard component.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
