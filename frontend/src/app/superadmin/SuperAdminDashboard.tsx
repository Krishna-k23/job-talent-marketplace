import React, { useState, useEffect } from 'react';
import {
  Crown, Shield, Users, Building2, FileText, Briefcase, DollarSign,
  TrendingUp, TrendingDown, Activity, Zap, Sparkles, ChevronRight,
  MapPin, Award, Clock, AlertCircle, CheckCircle, XCircle, Loader2,
  BarChart3, PieChart, UserPlus, Calendar, Download, RefreshCw,
  Lock, Unlock, CreditCard, Settings, Server, Database, Globe,
  UserCheck,
  X
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import StatsCard from '../components/common/StatsCard';
// import ChartWidget from '../components/common/ChartWidget';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

// Recharts imports
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function SuperAdminDashboard() {
  const { stats, loading, error, fetchStats, togglePayment, isSuperAdmin } = useAdmin();
  const { showSuccess, showError } = useToast();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [showPaymentToggle, setShowPaymentToggle] = useState(false);

  useEffect(() => {
    // Load payment settings
    const loadPaymentSettings = async () => {
      try {
        const response = await fetch('/api/admin/payments/settings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPaymentEnabled(data.enabled);
        }
      } catch (err) {
        console.error('Failed to load payment settings:', err);
      }
    };
    loadPaymentSettings();
  }, []);

  const handleTogglePayment = async () => {
    try {
      await togglePayment(!paymentEnabled);
      setPaymentEnabled(!paymentEnabled);
      showSuccess(`Payment system ${!paymentEnabled ? 'enabled' : 'disabled'} successfully`);
      setShowPaymentToggle(false);
    } catch (err: any) {
      showError(err.message || 'Failed to toggle payment system');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
      showSuccess('Dashboard refreshed');
    } catch (err) {
      showError('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const overview = stats?.overview;

  return (
    <div className="space-y-6">
      {/* Header with Super Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={24} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={28} className="text-rose-500" />
            Super Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Full system control and comprehensive platform overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  timeframe === t
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* System Controls - Super Admin Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Control */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment System</span>
            </div>
            <StatusBadge status={paymentEnabled ? 'Active' : 'Disabled'} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {paymentEnabled ? 'Accepting payments' : 'Payments disabled'}
            </span>
            <button
              onClick={() => setShowPaymentToggle(true)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              {paymentEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Server size={18} className="text-emerald-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Status</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={16} />
            <span>All systems operational</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Uptime: 99.97%</span>
            <span>•</span>
            <span>Response: 142ms</span>
          </div>
        </div>

        {/* Database Stats */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database size={18} className="text-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Database</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Size</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">2.4 GB</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-500 dark:text-slate-400">Records</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{overview?.total_users || 0}+</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Users"
          value={overview?.total_users || 0}
          icon={Users}
          color="from-blue-500 to-indigo-600"
          subtitle={`${overview?.growth_percentage || 0}% growth`}
        />
        <StatsCard
          title="Clients"
          value={overview?.total_clients || 0}
          icon={Building2}
          color="from-emerald-500 to-green-600"
        />
        <StatsCard
          title="Vendors"
          value={overview?.total_vendors || 0}
          icon={UserCheck}
          color="from-purple-500 to-pink-600"
        />
        <StatsCard
          title="Requirements"
          value={overview?.total_requirements || 0}
          icon={FileText}
          color="from-amber-500 to-orange-600"
        />
        <StatsCard
          title="Resources"
          value={overview?.total_resources || 0}
          icon={Briefcase}
          color="from-cyan-500 to-blue-600"
        />
        <StatsCard
          title="Revenue"
          value={`₹${((overview?.total_revenue || 0) / 100000).toFixed(1)}L`}
          icon={DollarSign}
          color="from-rose-500 to-red-600"
        />
      </div>

      {/* User Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Active Today</span>
            <Activity size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {overview?.active_users_today || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Users active in last 24h</div>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">New This Week</span>
            <UserPlus size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {overview?.new_users_this_week || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">New registrations</div>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Growth Rate</span>
            {(overview?.growth_percentage || 0) >= 0 ? (
              <TrendingUp size={18} className="text-emerald-500" />
            ) : (
              <TrendingDown size={18} className="text-red-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            (overview?.growth_percentage || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {(overview?.growth_percentage || 0).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs previous week</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">User Growth</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">New users over time</p>
            </div>
            <button className="text-sm text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
              <Download size={14} />
              Export
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.user_growth || []}>
                <defs>
                  <linearGradient id="colorClients2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorVendors2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="clients"
                  stroke="#6366f1"
                  fill="url(#colorClients2)"
                  strokeWidth={2}
                  name="Clients"
                />
                <Area
                  type="monotone"
                  dataKey="vendors"
                  stroke="#8b5cf6"
                  fill="url(#colorVendors2)"
                  strokeWidth={2}
                  name="Vendors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requirements by Role */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Requirements by Role</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Distribution across roles</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats?.requirements_by_role || []}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {(stats?.requirements_by_role || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vendor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendors by Location */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Vendors by Location</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Geographic distribution</p>
            </div>
            <MapPin size={20} className="text-purple-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.vendor_by_location || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="location" type="category" tick={{ fontSize: 11 }} width={80} />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                  {(stats?.vendor_by_location || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Health */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Service Health</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">System status overview</p>
            </div>
            <Activity size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-4">
            {stats?.service_health?.map((service) => (
              <div key={service.service_name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  {service.status === 'healthy' && <CheckCircle size={18} className="text-emerald-500" />}
                  {service.status === 'degraded' && <AlertCircle size={18} className="text-amber-500" />}
                  {service.status === 'down' && <XCircle size={18} className="text-red-500" />}
                  <div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{service.service_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {service.response_time}ms · {service.error_rate}% errors
                    </div>
                  </div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
            {(!stats?.service_health || stats.service_health.length === 0) && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p>No service health data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recent Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Latest admin actions</p>
          </div>
          <button className="text-sm text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
            View All
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {stats?.recent_activity?.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                <Activity size={18} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-700 dark:text-slate-300">{activity.action}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {activity.details && typeof activity.details === 'object'
                    ? Object.values(activity.details).slice(0, 2).join(' · ')
                    : 'No details'}
                </div>
              </div>
              <div className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {new Date(activity.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Toggle Modal */}
      {showPaymentToggle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="relative bg-gradient-to-r from-rose-600 to-pink-600 p-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {paymentEnabled ? 'Disable' : 'Enable'} Payment System
                  </h3>
                  <p className="text-rose-100 text-sm mt-1">
                    {paymentEnabled ? 'This will stop all payment processing' : 'This will start all payment processing'}
                  </p>
                </div>
                <button onClick={() => setShowPaymentToggle(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {paymentEnabled
                    ? 'Disabling payments will affect all active subscriptions and prevent new transactions.'
                    : 'Enabling payments will activate the payment gateway for all users.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentToggle(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTogglePayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-rose-600/30 font-medium"
                >
                  {paymentEnabled ? 'Disable Payments' : 'Enable Payments'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}