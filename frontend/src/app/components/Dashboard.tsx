import { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, Clock, TrendingUp, TrendingDown, MapPin, Briefcase, Target, Plus, Upload, ArrowRight, Activity, X, Download } from 'lucide-react';
import { PostRequirement } from './PostRequirement';

interface DashboardProps {
  onViewMatches?: (jobId: string, matchCount: number) => void;
}

export function Dashboard({ onViewMatches }: DashboardProps) {
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

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  // Fetch dashboard stats from API
  const fetchStats = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch('/api/dashboard/client/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
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
    const token = getToken();
    if (!token) return;
    
    try {
      const url = '/api/requirements/?limit=10';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequirements(data);
        
        // Calculate requirements by role for chart
        const roleCounts: Record<string, number> = {};
        data.forEach((req: any) => {
          const role = req.role.split(' ')[0];
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
        const roleArray = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
        setRequirementsByRole(roleArray.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUser = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  // Handle Add Requirement
  const handleAddRequirement = () => {
    setShowPostRequirement(true);
  };

  // Handle Bulk Upload
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert('Please select a CSV file');
      return;
    }
    
    setBulkUploading(true);
    const token = getToken();
    
    const formData = new FormData();
    formData.append('file', bulkFile);
    
    try {
      const response = await fetch('/api/requirements/bulk-upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        alert('Requirements uploaded successfully!');
        setShowBulkUpload(false);
        setBulkFile(null);
        fetchRequirements();
        fetchStats();
      } else {
        alert('Upload failed. Please check the file format.');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  // Handle Download CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = `Role,Experience Min,Experience Max,Positions,Skills,Budget Min,Budget Max,Duration,Work Mode,Start Date,Location,Description
DevOps Engineer,5,8,2,"AWS,Docker,Kubernetes",100000,150000,12 Months,Hybrid,Immediate,Bangalore,"Looking for DevOps engineer"
Java Developer,7,10,1,"Java,Spring Boot,Microservices",120000,180000,12 Months,Remote,Immediate,Pune,"Lead Java developer"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summaryStats = [
    { label: 'Total Requirements', value: stats.totalRequirements.toString(), trend: '+12%', trendUp: true, icon: FileText, bgColor: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Open Requirements', value: stats.openRequirements.toString(), trend: '+8%', trendUp: true, icon: Target, bgColor: 'bg-orange-50 dark:bg-orange-950/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    { label: 'Closed Requirements', value: stats.closedRequirements.toString(), trend: '+4', trendUp: true, icon: Briefcase, bgColor: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600 dark:text-green-400' },
    { label: 'Total Matching Profiles', value: stats.totalMatchingProfiles.toString(), trend: '+15%', trendUp: true, icon: Users, bgColor: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  ];

  const filteredRequirements = requirements.filter(req => {
    if (statusFilter === 'all') return true;
    return req.status?.toLowerCase() === statusFilter;
  });

  const maxRoleCount = Math.max(...requirementsByRole.map(r => r.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Bulk Upload Requirements</h3>
              <button onClick={() => setShowBulkUpload(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={24} className="text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 mb-2">Click to upload CSV file</p>
                <p className="text-xs text-slate-400">Download template for correct format</p>
                <input type="file" accept=".csv" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} className="hidden" id="bulk-file" />
                <label htmlFor="bulk-file" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
                  Choose File
                </label>
                {bulkFile && <p className="mt-2 text-sm text-green-600">Selected: {bulkFile.name}</p>}
              </div>
              <button onClick={handleDownloadTemplate} className="w-full py-2 text-blue-600 text-sm font-semibold hover:underline">
                Download CSV Template
              </button>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowBulkUpload(false)} className="flex-1 px-6 py-3 border rounded-xl">Cancel</button>
                <button onClick={handleBulkUpload} disabled={bulkUploading} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl disabled:opacity-50">
                  {bulkUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Good morning, {userName} 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 text-sm sm:text-base">
          <Activity size={16} /> Here's what's happening with your requirements today
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {summaryStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={20} className={`${stat.iconColor} sm:hidden`} strokeWidth={2.5} />
                <stat.icon size={28} className={`${stat.iconColor} hidden sm:block`} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Active Requirements</h2>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              {(['all', 'open', 'closed'] as const).map((filter) => (
                <button key={filter} onClick={() => setStatusFilter(filter)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === filter ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequirements.slice(0, 6).map((req) => (
              <div key={req.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-blue-600 mb-1">{req.requirement_id || req.id}</div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{req.role}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${req.status === 'Open' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                    {req.status}
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Clock size={16} /> Experience</span>
                    <span className="font-medium">{req.experience_min}-{req.experience_max} yrs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><DollarSign size={16} /> Budget</span>
                    <span className="font-medium">₹{req.budget_min?.toLocaleString()}-{req.budget_max?.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><MapPin size={16} /> Location</span>
                    <span className="font-medium">{req.location || 'Remote'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {req.skills?.slice(0, 3).map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{skill}</span>
                  ))}
                </div>
                <button onClick={() => onViewMatches?.(req.id, req.matches_count || 0)} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  View {req.matches_count || 0} Profiles <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={handleAddRequirement} className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 transition-all">
                <Plus size={20} /><span className="font-semibold">Add Requirement</span>
              </button>
              <button onClick={() => setShowBulkUpload(true)} className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 transition-all">
                <Upload size={20} /><span className="font-semibold">Bulk Upload</span>
              </button>
              <button onClick={handleDownloadTemplate} className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 transition-all">
                <Download size={20} /><span className="font-semibold">Download Template</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border">
            <h3 className="text-lg font-bold mb-4">Requirements by Status</h3>
            <div className="space-y-4">
              <div><div className="flex justify-between mb-2"><span className="text-sm">Open</span><span className="text-sm font-bold">{stats.openRequirements}</span></div><div className="w-full bg-slate-100 rounded-full h-3"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${stats.totalRequirements ? (stats.openRequirements / stats.totalRequirements) * 100 : 0}%` }}></div></div></div>
              <div><div className="flex justify-between mb-2"><span className="text-sm">Closed</span><span className="text-sm font-bold">{stats.closedRequirements}</span></div><div className="w-full bg-slate-100 rounded-full h-3"><div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.totalRequirements ? (stats.closedRequirements / stats.totalRequirements) * 100 : 0}%` }}></div></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements by Role Chart */}
      {requirementsByRole.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border">
          <h3 className="text-lg font-bold mb-6">Requirements by Role</h3>
          <div className="flex items-end justify-between gap-4 h-48">
            {requirementsByRole.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end items-center gap-3 h-full">
                <div className="w-full flex flex-col justify-end h-full">
                  <div className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg relative group" style={{ height: `${(data.count / maxRoleCount) * 100}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {data.count} requirements
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-center">{data.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}