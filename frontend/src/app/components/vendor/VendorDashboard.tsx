// VendorDashboard.tsx - Ultra Premium Enhanced Version
import { useState, useEffect } from 'react';
import { 
  Users, Briefcase, FileCheck, DollarSign, TrendingUp, 
  Sparkles, Award, Calendar, Clock, Zap, ChevronRight,
  UserCheck, BarChart3, PieChart, Layers, Target,
  Star, Activity, Shield, Crown, Rocket, TrendingDown,
  CheckCircle, AlertCircle, Eye, ArrowUpRight
} from 'lucide-react';

interface VendorDashboardProps {
  onNavigate?: (page: 'dashboard' | 'resources' | 'contracts') => void;
}

export function VendorDashboard({ onNavigate }: VendorDashboardProps) {
  const [trendFilter, setTrendFilter] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [stats, setStats] = useState({
    active_resources: 0,
    fulfilled_jobs: 0,
    active_contracts: 0,
    monthly_revenue: 0
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState('Vendor');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // API call with token refresh
  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = getToken();
    
    if (!token) {
      window.location.href = '/login';
      throw new Error('No token found');
    }
    
    const makeRequest = async (retryToken?: string) => {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${retryToken || token}`
      };
      
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });
      
      return response;
    };
    
    let response = await makeRequest();
    
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = getToken();
        response = await makeRequest(newToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    
    return response;
  };

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const response = await fetchWithAuth('/api/dashboard/vendor/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchTrends = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const response = await fetchWithAuth('/api/analytics/vendor/availability-trend');
        if (response.ok) {
          const trends = await response.json();
          setTrendData(trends[trendFilter] || []);
        }
      } catch (error) {
        console.error('Error fetching trends:', error);
        // Fallback data
        setTrendData([
          { label: 'Mon', value: 85 }, { label: 'Tue', value: 70 }, { label: 'Wed', value: 90 },
          { label: 'Thu', value: 75 }, { label: 'Fri', value: 95 }, { label: 'Sat', value: 60 }, { label: 'Sun', value: 50 }
        ]);
      }
    };

    const fetchUser = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const response = await fetchWithAuth('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setVendorName(userData.vendor_name || userData.full_name || userData.email?.split('@')[0] || 'Vendor');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Generate recent activity
    const generateRecentActivity = () => {
      const activities = [
        { icon: UserCheck, label: 'New resource added', description: 'John Doe - Full Stack Developer', time: '5 min ago', color: 'text-emerald-500' },
        { icon: Briefcase, label: 'Contract signed', description: 'TechCorp - Project Lead', time: '2 hours ago', color: 'text-blue-500' },
        { icon: FileCheck, label: 'Job fulfilled', description: 'Senior DevOps Engineer position filled', time: '1 day ago', color: 'text-purple-500' },
      ];
      setRecentActivity(activities);
    };

    fetchStats();
    fetchTrends();
    fetchUser();
    generateRecentActivity();
  }, [trendFilter]);

  const statsArray = [
    { 
      label: 'Active Resources', 
      value: stats.active_resources, 
      icon: Users, 
      bgColor: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'Available for deployment',
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      label: 'Fulfilled Jobs', 
      value: stats.fulfilled_jobs, 
      icon: FileCheck, 
      bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Successful placements',
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      label: 'Active Contracts', 
      value: stats.active_contracts, 
      icon: Briefcase, 
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'In progress',
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      label: 'Monthly Revenue', 
      value: `₹${(stats.monthly_revenue / 1000).toFixed(1)}L`, 
      icon: DollarSign, 
      bgColor: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      description: 'This month',
      gradient: 'from-amber-500 to-orange-600'
    },
  ];

  const currentData = trendData;
  const maxValue = Math.max(...currentData.map((d: any) => d.value), 1);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Vendor Themed */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-emerald-100 text-xs font-medium">Vendor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {getGreeting()}, {vendorName}! 👋
            </h1>
            <p className="text-emerald-100 text-sm mt-0.5 flex items-center gap-2">
              <Activity size={14} />
              <span>Let's review today's business overview</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
              <Crown size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">Vendor Pro</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
              <Award size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">Top Rated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsArray.map((stat, index) => (
          <div 
            key={index} 
            className={`group bg-gradient-to-br ${stat.bgColor} rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl bg-white/60 dark:bg-slate-800/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} className={stat.iconColor} strokeWidth={2} />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-full">
                <TrendingUp size={14} />
                <span>+12%</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{stat.label}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stat.description}</div>
            </div>
            <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${stat.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Resource Availability Trend</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {trendFilter.charAt(0).toUpperCase() + trendFilter.slice(1)} resource utilization overview
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 self-start flex-shrink-0">
                {(['weekly', 'monthly', 'yearly'] as const).map((filter) => (
                  <button 
                    key={filter} 
                    onClick={() => setTrendFilter(filter)} 
                    className={`px-3 cursor-pointer sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      trendFilter === filter 
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 h-56">
              {currentData.map((data: any, index: number) => {
                const heightPercentage = (data.value / maxValue) * 100;
                const colors = ['from-emerald-500 to-green-600', 'from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-red-600', 'from-cyan-500 to-blue-600', 'from-teal-500 to-emerald-600'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={index} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                    <div className="w-full flex flex-col justify-end h-full group">
                      <div 
                        className={`w-full bg-gradient-to-t ${color} rounded-lg relative transition-all duration-500 hover:opacity-80 cursor-pointer`}
                        style={{ height: `${heightPercentage}%` }}
                      >
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
                          {data.value}% Availability
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
                        </div>
                        {data.value > 80 && (
                          <div className="absolute -top-6 right-1">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center truncate w-full">
                      {data.label}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">High Availability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Medium Availability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Low Availability</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions - Vendor Themed */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Zap size={18} className="text-emerald-600" />
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate?.('resources')}
                className="w-full cursor-pointer flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 group"
              >
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={18} />
                </div>
                <span className="font-semibold flex-1 text-left text-sm">Add New Resource</span>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button
                onClick={() => onNavigate?.('contracts')}
                className="w-full cursor-pointer flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 group"
              >
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold flex-1 text-left text-sm text-slate-700 dark:text-slate-300">View Active Contracts</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onNavigate?.('resources')}
                className="w-full cursor-pointer flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 group"
              >
                <div className="w-9 h-9 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold flex-1 text-left text-sm text-slate-700 dark:text-slate-300">Manage Resources</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-emerald-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className={activity.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {activity.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No recent activity to display
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-yellow-300" />
            <span className="text-emerald-100 text-sm font-medium">Performance Score</span>
          </div>
          <div className="text-3xl font-bold mb-1">94%</div>
          <div className="text-sm text-emerald-100">Excellent performance rating</div>
          <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-blue-200" />
            <span className="text-blue-100 text-sm font-medium">Success Rate</span>
          </div>
          <div className="text-3xl font-bold mb-1">87%</div>
          <div className="text-sm text-blue-100">Jobs successfully fulfilled</div>
          <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
            <div className="h-full bg-blue-300 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-purple-200" />
            <span className="text-purple-100 text-sm font-medium">Client Satisfaction</span>
          </div>
          <div className="text-3xl font-bold mb-1">4.8</div>
          <div className="text-sm text-purple-100">Average rating from clients</div>
          <div className="mt-3 flex items-center gap-1">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} size={16} className="fill-yellow-300 text-yellow-300" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}