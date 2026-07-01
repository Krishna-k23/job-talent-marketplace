import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart, TrendingUp, TrendingDown, Users,
  Building2, UserCheck, FileText, Briefcase, DollarSign,
  Activity, Zap, Sparkles, ChevronRight, MapPin, Award,
  Clock, AlertCircle, CheckCircle, XCircle, Loader2,
  Download, RefreshCw, Calendar, Filter
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import StatsCard from '../components/common/StatsCard';
import ChartWidget from '../components/common/ChartWidget';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { apiGet } from '@/config/api';

// Recharts imports
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, AreaChart, Area, ComposedChart, Scatter
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6'];

export default function AdminAnalytics() {
  const { stats, loading, error, fetchStats } = useAdmin();
  const { showSuccess, showError } = useToast();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
      showSuccess('Analytics refreshed');
    } catch (err) {
      showError('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Generate trend data
    const generateTrendData = () => {
      const data = [];
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 50) + 10,
          requirements: Math.floor(Math.random() * 30) + 5,
          resources: Math.floor(Math.random() * 20) + 3,
          contracts: Math.floor(Math.random() * 10) + 1,
        });
      }
      return data;
    };
    setTrendData(generateTrendData());
  }, [timeframe]);

  useEffect(() => {
    if (stats?.requirements_by_role) {
      setRoleDistribution(stats.requirements_by_role);
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
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
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const overview = stats?.overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 size={28} className="text-indigo-500" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive platform insights and metrics
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
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
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
          <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            <Download size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <TrendingUp size={18} className="text-blue-500" />
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
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</span>
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            ₹{((overview?.total_revenue || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lifetime revenue</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend */}
        <ChartWidget
          type="area"
          title="User Growth Trend"
          subtitle="New users over time"
          data={trendData}
          dataKey={['users', 'requirements', 'resources']}
          xAxisKey="date"
          colors={['#6366f1', '#8b5cf6', '#10b981']}
          height={300}
        />

        {/* Requirements by Role */}
        <ChartWidget
          type="pie"
          title="Requirements by Role"
          subtitle="Distribution across roles"
          data={roleDistribution}
          dataKey="count"
          nameKey="role"
          colors={COLORS}
          height={300}
        />
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Comparison */}
        <ChartWidget
          type="bar"
          title="Activity Comparison"
          subtitle="Requirements vs Resources"
          data={trendData.slice(-7)}
          dataKey={['requirements', 'resources']}
          xAxisKey="date"
          colors={['#f59e0b', '#10b981']}
          height={280}
          stacked={false}
        />

        {/* Vendor Distribution */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Vendor Distribution</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">By location and status</p>
            </div>
            <MapPin size={20} className="text-purple-500" />
          </div>
          <div className="h-72">
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
      </div>

      {/* Platform Activity Timeline */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Platform Activity Timeline</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Combined platform metrics</p>
          </div>
          <Calendar size={20} className="text-indigo-500" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
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
              <Bar yAxisId="left" dataKey="requirements" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Requirements" />
              <Bar yAxisId="left" dataKey="resources" fill="#10b981" radius={[4, 4, 0, 0]} name="Resources" />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} name="Users" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}