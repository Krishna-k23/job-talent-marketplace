// Dashboard.tsx - No Scroll, Dynamic Layout with Pagination
import { useState, useEffect, useRef } from 'react';
import {
  Users, FileText, DollarSign, Clock, TrendingUp, TrendingDown,
  MapPin, Target, Plus, Upload, ArrowRight, Activity,
  X, Download, Loader2, Sparkles, ChevronRight, Calendar,
  CheckCircle, BarChart3, PieChart, Layers, Zap, Award,
  ChevronLeft
} from 'lucide-react';
import { PostRequirement } from './PostRequirement';
import { useToast } from '../contexts/ToastContext';

interface DashboardProps {
  onViewMatches?: (jobId: string, matchCount: number) => void;
}

export function Dashboard({ onViewMatches }: DashboardProps) {
  const { showSuccess, showError } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [stats, setStats] = useState({
    totalRequirements: 0,
    openRequirements: 0,
    closedRequirements: 0,
    totalMatchingProfiles: 0
  });
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');
  const [requirementsByRole, setRequirementsByRole] = useState<{ role: string; count: number }[]>([]);
  const [showPostRequirement, setShowPostRequirement] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 2 rows x 3 columns = 6 items, or 2 rows x 2 columns = 4 items
  const containerRef = useRef<HTMLDivElement>(null);

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
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${retryToken || token}`
      };

      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers
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

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/api/dashboard/client/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalRequirements: data.total_requirements || 0,
          openRequirements: data.open_requirements || 0,
          closedRequirements: data.closed_requirements || 0,
          totalMatchingProfiles: data.total_matching_profiles || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRequirements = async () => {
    try {
      const response = await fetchWithAuth('/api/requirements/?limit=50');
      if (response.ok) {
        const data = await response.json();
        setRequirements(data);
        setCurrentPage(1); // Reset to first page when data changes

        const roleCounts: Record<string, number> = {};
        data.forEach((req: any) => {
          const role = req.role.split(' ')[0];
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
        const roleArray = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
        setRequirementsByRole(roleArray.slice(0, 6));

        // Generate recent activity
        const activities = data.slice(0, 3).map((req: any) => ({
          id: req.id,
          action: req.status === 'Open' ? 'New requirement posted' : 'Requirement updated',
          role: req.role,
          time: '2 hours ago',
          status: req.status
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetchWithAuth('/api/users/me');
      if (response.ok) {
        const userData = await response.json();
        setUserName(userData.full_name || userData.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRequirements();
    fetchUser();
  }, []);

  const handleAddRequirement = () => {
    setShowPostRequirement(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
    }
    e.target.value = '';
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      showError('Please select a CSV file');
      return;
    }

    setBulkUploading(true);
    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      let token = getToken();
      if (!token) {
        showError('Please login again');
        window.location.href = '/login';
        return;
      }

      let response = await fetch('/api/requirements/bulk-upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = getToken();
          response = await fetch('/api/requirements/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${newToken}` },
            body: formData
          });
        } else {
          showError('Session expired. Please login again.');
          window.location.href = '/login';
          return;
        }
      }

      if (response.ok) {
        const result = await response.json();
        showSuccess(`Successfully uploaded ${result.count || result.length || 0} requirements`);
        setShowBulkUpload(false);
        setBulkFile(null);
        fetchRequirements();
        fetchStats();
      } else {
        const error = await response.json();
        showError(error.detail || 'Upload failed. Please check the file format.');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      showError('Upload failed. Please try again.');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = `role,experience_min,experience_max,positions,skills,budget_min,budget_max,duration,work_mode,start_date,location,description
DevOps Engineer,5,8,2,"AWS,Docker,Kubernetes",100000,150000,12 Months,Hybrid,Immediate,Bangalore,"Looking for experienced DevOps engineer"
Java Developer,7,10,1,"Java,Spring Boot,Microservices",120000,180000,12 Months,Remote,Immediate,Pune,"Lead Java developer"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showSuccess('Template downloaded successfully!');
  };

  const summaryStats = [
    {
      label: 'Total Requirements',
      value: stats.totalRequirements.toString(),
      trendUp: true,
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      description: 'All time requirements'
    },
    {
      label: 'Open Positions',
      value: stats.openRequirements.toString(),
      trendUp: true,
      icon: Target,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-500',
      description: 'Currently active'
    },
    {
      label: 'Closed Positions',
      value: stats.closedRequirements.toString(),
      trendUp: true,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      description: 'Successfully filled'
    },
    {
      label: 'Matching Profiles',
      value: stats.totalMatchingProfiles.toString(),
      trendUp: true,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
      description: 'Best matches found'
    },
  ];

  const filteredRequirements = requirements.filter(req => {
    if (statusFilter === 'all') return true;
    return req.status?.toLowerCase() === statusFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRequirements.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const maxRoleCount = Math.max(...requirementsByRole.map(r => r.count), 1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Color palette for role bars
  const roleColors = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-red-600',
    'from-cyan-600 to-blue-600',
    'from-rose-600 to-pink-600'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Post Requirement Dialog */}
      {showPostRequirement && (
        <PostRequirement
          onClose={() => {
            setShowPostRequirement(false);
            fetchRequirements();
            fetchStats();
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Bulk Upload</h3>
                  <p className="text-blue-100 text-sm mt-1">Import multiple requirements at once</p>
                </div>
                <button
                  onClick={() => {
                    if (!bulkUploading) {
                      setShowBulkUpload(false);
                      setBulkFile(null);
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                  disabled={bulkUploading}
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {bulkUploading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative">
                    <Loader2 size={56} className="text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4">Uploading...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we process your file</p>
                  <div className="w-full max-w-xs mt-6 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-shimmer" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 group">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="bulk-file-input"
                    />
                    <label htmlFor="bulk-file-input" className="cursor-pointer block">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload size={36} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium">
                        {bulkFile ? 'Change file' : 'Click to upload CSV file'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Supported format: .csv</p>
                    </label>
                    {bulkFile && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} />
                        {bulkFile.name}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full py-3 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={16} />
                    Download CSV Template
                  </button>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowBulkUpload(false);
                        setBulkFile(null);
                      }}
                      className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      disabled={!bulkFile}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                    >
                      <Upload size={18} />
                      Upload Now
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-5 shadow-2xl flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Welcome back</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {getGreeting()}, {userName} 👋
            </h1>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
              <Activity size={14} />
              <span>Here's what's happening with your requirements today</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRequirement}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-medium border border-white/20 text-sm hover:scale-105"
            >
              <Plus size={16} />
              Add New
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium text-sm"
            >
              <Upload size={16} />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        {summaryStats.map((stat, index) => (
          <div
            key={index}
            className={`group bg-gradient-to-br ${stat.bgGradient} rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={20} className={stat.iconColor} strokeWidth={2} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
            </div>
            <div className={`mt-2 h-0.5 w-full rounded-full bg-gradient-to-r ${stat.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Main Content - Takes remaining height with flex-1 */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0 mb-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              Active Requirements
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                ({filteredRequirements.length} total)
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/50">
                {(['all', 'open', 'closed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setStatusFilter(filter);
                      setCurrentPage(1); // Reset to first page on filter change
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${statusFilter === filter
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50'
                      }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements Grid - Takes remaining height with overflow-hidden */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${currentItems.length > 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'} gap-3 h-full`}>
              {currentItems.map((req, index) => (
                <div
                  key={req.id}
                  className="group bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full inline-block truncate max-w-full">
                        {req.requirement_id || req.id}
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {req.role}
                      </h3>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${req.status === 'Open'
                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                      : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
                      }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-1.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={12} className="text-blue-500" />
                        Exp
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {req.experience_min}-{req.experience_max}y
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <DollarSign size={12} className="text-emerald-500" />
                        Budget
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate">
                        ₹{req.budget_min?.toLocaleString()}-{req.budget_max?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin size={12} className="text-purple-500" />
                        Location
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate">
                        {req.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {req.skills?.slice(0, 2).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-medium border border-blue-100 dark:border-blue-800 truncate max-w-[70px]">
                        {skill}
                      </span>
                    ))}
                    {req.skills?.length > 2 && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-[9px] font-medium">
                        +{req.skills.length - 2}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onViewMatches?.(req.id, req.matches_count || 0)}
                    className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/30 text-xs"
                  >
                    <span>View {req.matches_count || 0} Profiles</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}

              {/* Empty state - fill remaining space with placeholder cards if needed */}
              {filteredRequirements.length === 0 && (
                <div className="col-span-full flex items-center justify-center p-8 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No requirements found</p>
                    <button
                      onClick={handleAddRequirement}
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      Create your first requirement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pagination - Only show if more than itemsPerPage */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2 pb-1 flex-shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredRequirements.length)} of {filteredRequirements.length}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-all duration-200 ${currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-slate-400 dark:text-slate-500">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-8 h-8 text-xs font-medium rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Compact */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {/* Quick Stats Widget */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 text-white shadow-xl flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-blue-200" />
              <span className="text-blue-100 text-xs font-medium">Performance</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-blue-100 text-xs">Match Rate</span>
                <span className="font-bold text-base">
                  {stats.totalRequirements ? Math.round((stats.totalMatchingProfiles / stats.totalRequirements) * 10) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-blue-100 text-xs">Open Rate</span>
                <span className="font-bold text-base">
                  {stats.totalRequirements ? Math.round((stats.openRequirements / stats.totalRequirements) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-blue-100 text-xs">Total Matches</span>
                <span className="font-bold text-base">{stats.totalMatchingProfiles}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Zap size={16} className="text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={handleAddRequirement}
                className="w-full flex items-center gap-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group"
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={14} />
                </div>
                <span className="font-semibold flex-1 text-left text-xs">Add Requirement</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setShowBulkUpload(true)}
                className="w-full flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-300 group"
              >
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold flex-1 text-left text-xs text-slate-700 dark:text-slate-300">Bulk Upload</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-300 group"
              >
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download size={14} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold flex-1 text-left text-xs text-slate-700 dark:text-slate-300">Template</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Status Distribution - Compact */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex-1 min-h-0 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
              <PieChart size={16} className="text-blue-600" />
              Status Distribution
            </h3>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 inline-block"></span>
                    Open
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{stats.openRequirements}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalRequirements ? (stats.openRequirements / stats.totalRequirements) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 inline-block"></span>
                    Closed
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{stats.closedRequirements}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalRequirements ? (stats.closedRequirements / stats.totalRequirements) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{stats.totalRequirements}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Compact */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1.5">
              <Activity size={16} className="text-blue-600" />
              Recent Activity
              {recentActivity.length > 2 && (
                <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-auto">
                  {recentActivity.length} activities
                </span>
              )}
            </h3>
            <div className="recent-activity-scroll space-y-1 pr-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors">
                    <div className="w-5 h-5 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                      {activity.status === 'Open' ? (
                        <Plus size={11} className="text-blue-600" />
                      ) : (
                        <CheckCircle size={11} className="text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {activity.action}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {activity.role}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements by Role Chart - Compact */}
      {requirementsByRole.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600" />
              Requirements by Role
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {requirementsByRole.reduce((sum, r) => sum + r.count, 0)} total
              </span>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {requirementsByRole.length} roles
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-center gap-4 min-h-[80px]">
            {requirementsByRole.map((data, index) => {
              const percentage = (data.count / maxRoleCount) * 100;
              const color = roleColors[index % roleColors.length];
              const barHeight = Math.max(percentage, 15);

              return (
                <div key={index} className="flex flex-col items-center gap-1.5 min-w-[40px] flex-1 max-w-[80px]">
                  <div className="w-full flex flex-col justify-end h-[60px] group">
                    <div
                      className={`w-full bg-gradient-to-t ${color} rounded-md relative transition-all duration-500 hover:opacity-80 cursor-pointer`}
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
                        {data.count}
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center truncate w-full px-1">
                    {data.role}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend for bar chart */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            {requirementsByRole.slice(0, 4).map((data, index) => {
              const color = roleColors[index % roleColors.length];
              return (
                <div key={index} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color}`}></div>
                  <span className="text-[9px] text-slate-600 dark:text-slate-400 truncate max-w-[40px]">
                    {data.role}
                  </span>
                </div>
              );
            })}
            {requirementsByRole.length > 4 && (
              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                +{requirementsByRole.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}