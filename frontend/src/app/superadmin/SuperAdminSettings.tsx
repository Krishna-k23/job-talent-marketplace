// frontend/src/app/superadmin/SuperAdminSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Shield, Bell, Lock, Database, Server,
  Globe, Mail, Phone, User, Building2, Key,
  Sparkles, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Loader2, Save, Trash2, Plus,
  CreditCard, DollarSign, Wallet, TrendingUp,
  Crown, Zap, HardDrive, Cpu, Wifi,
  BarChart3
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import { apiGet, apiPut } from '@/config/api';

interface Setting {
  key: string;
  value: string;
  category: string;
  description: string;
  is_public: boolean;
  updated_at: string;
}

export default function SuperAdminSettings() {
  const { isSuperAdmin } = useAdmin();
  const { showSuccess, showError } = useToast();
  
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'system' | 'payment' | 'features'>('general');
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Use the superadmin endpoint for full access
      const data = await apiGet('/superadmin/settings');
      setSettings(data);
    } catch (err) {
      showError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      await apiPut(`/superadmin/settings/${key}`, { value });
      showSuccess('Setting updated successfully');
      loadSettings();
      setEditingKey(null);
    } catch (err: any) {
      showError(err.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const getCategorySettings = () => {
    switch (activeTab) {
      case 'general':
        return settings.filter(s => s.category === 'general' || !s.category);
      case 'security':
        return settings.filter(s => s.category === 'security');
      case 'notifications':
        return settings.filter(s => s.category === 'notifications');
      case 'system':
        return settings.filter(s => s.category === 'system');
      case 'payment':
        return settings.filter(s => s.category === 'payment');
      case 'features':
        return settings.filter(s => s.category === 'features');
      default:
        return settings;
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Server },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'features', label: 'Features', icon: Zap },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const categorySettings = getCategorySettings();

  // Get settings count for each category
  const getCategoryCount = (category: string) => {
    return settings.filter(s => s.category === category || (category === 'general' && (!s.category || s.category === 'general'))).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings size={28} className="text-rose-500" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Full control over all platform configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {settings.length} settings
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden">
        <div className="flex overflow-x-auto p-1 gap-1 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getCategoryCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {categorySettings.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Settings size={32} className="mx-auto mb-2 opacity-50" />
              <p>No settings available in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySettings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {!setting.is_public && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full">
                          Private
                        </span>
                      )}
                      {setting.category === 'payment' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-full">
                          {setting.key === 'payment_enabled' && setting.value === 'true' ? '✅ Active' : '⛔ Disabled'}
                        </span>
                      )}
                    </div>
                    {setting.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {setting.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingKey === setting.key ? (
                      <>
                        <input
                          type={setting.key.includes('key') || setting.key.includes('secret') || setting.key.includes('api') ? 'password' : 'text'}
                          value={setting.value}
                          onChange={(e) => {
                            setSettings(settings.map(s =>
                              s.key === setting.key ? { ...s, value: e.target.value } : s
                            ));
                          }}
                          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-48"
                          placeholder="Enter value..."
                        />
                        <button
                          onClick={() => handleUpdateSetting(setting.key, setting.value)}
                          disabled={saving}
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-50"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-all"
                        >
                          <XCircle size={16} className="text-slate-600 dark:text-slate-300" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 min-w-[100px] max-w-[200px] truncate">
                          {setting.key.includes('key') || setting.key.includes('secret') || setting.key.includes('api')
                            ? setting.value ? '••••••••' : '(not set)'
                            : setting.value || '-'}
                        </span>
                        <button
                          onClick={() => setEditingKey(setting.key)}
                          className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all"
                        >
                          <Settings size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
              <Database size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Database Status</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={14} />
            <span>All systems operational</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
              <Server size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">API Status</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">v2.0.1</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={14} />
            <span>Running smoothly</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
              <Globe size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Environment</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={14} />
            <span>All services active</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-rose-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Settings Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{settings.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Settings</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {settings.filter(s => s.value && s.value !== 'false' && s.value !== '').length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Active Settings</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {settings.filter(s => !s.is_public).length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Private Settings</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(settings.reduce((acc, s) => ({...acc, [s.category]: true}), {})).length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}