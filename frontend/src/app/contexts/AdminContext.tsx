import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: 'client' | 'vendor' | 'admin' | 'super_admin';
  is_active: boolean;
  is_verified: boolean;
  vendor_name?: string;
  profile_picture?: string;
  company_name?: string;
  created_at: string;
  last_login?: string;
  activity_count: number;
}

interface AdminStats {
  overview: {
    total_users: number;
    total_clients: number;
    total_vendors: number;
    total_admins: number;
    total_requirements: number;
    total_resources: number;
    total_contracts: number;
    total_revenue: number;
    active_users_today: number;
    new_users_this_week: number;
    growth_percentage: number;
  };
  recent_users: AdminUser[];
  recent_activity: any[];
  requirements_by_role: Array<{ role: string; count: number }>;
  user_growth: Array<{ date: string; clients: number; vendors: number; total: number }>;
  vendor_by_location: Array<{ location: string; count: number }>;
  service_health: Array<{
    service_name: string;
    status: 'healthy' | 'degraded' | 'down';
    response_time: number;
    error_rate: number;
    last_check: string;
    details?: any;
    uptime_percentage?: number;
  }>;
}

interface AdminContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchUsers: (filters?: any) => Promise<AdminUser[]>;
  createUser: (userData: any) => Promise<AdminUser>;
  updateUser: (userId: number, userData: any) => Promise<AdminUser>;
  deleteUser: (userId: number) => Promise<void>;
  fetchSettings: () => Promise<any>;
  updateSetting: (key: string, value: any) => Promise<void>;
  togglePayment: (enabled: boolean) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isSuperAdmin = userRole === 'super_admin';

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/admin/dashboard/stats');
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchUsers = useCallback(async (filters?: any) => {
    if (!isAdmin) return [];
    
    try {
      const params = new URLSearchParams(filters || {});
      const data = await apiGet(`/admin/users?${params.toString()}`);
      return data;
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }, [isAdmin]);

  const createUser = useCallback(async (userData: any) => {
    if (!isAdmin) throw new Error('Admin access required');
    
    try {
      const data = await apiPost('/admin/users', userData);
      return data;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }, [isAdmin]);

  const updateUser = useCallback(async (userId: number, userData: any) => {
    if (!isAdmin) throw new Error('Admin access required');
    
    try {
      const data = await apiPut(`/admin/users/${userId}`, userData);
      return data;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }, [isAdmin]);

  const deleteUser = useCallback(async (userId: number) => {
    if (!isSuperAdmin) throw new Error('Super admin access required');
    
    try {
      await apiDelete(`/admin/users/${userId}`);
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }, [isSuperAdmin]);

  const fetchSettings = useCallback(async () => {
    if (!isAdmin) return {};
    
    try {
      const data = await apiGet('/admin/settings');
      return data;
    } catch (err) {
      console.error('Error fetching settings:', err);
      throw err;
    }
  }, [isAdmin]);

  const updateSetting = useCallback(async (key: string, value: any) => {
    if (!isAdmin) throw new Error('Admin access required');
    
    try {
      await apiPut(`/admin/settings/${key}`, { value });
    } catch (err) {
      console.error('Error updating setting:', err);
      throw err;
    }
  }, [isAdmin]);

  const togglePayment = useCallback(async (enabled: boolean) => {
    if (!isSuperAdmin) throw new Error('Super admin access required');
    
    try {
      await apiPost('/admin/payments/toggle', { enabled });
    } catch (err) {
      console.error('Error toggling payment:', err);
      throw err;
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isSuperAdmin,
        stats,
        loading,
        error,
        fetchStats,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        fetchSettings,
        updateSetting,
        togglePayment,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};