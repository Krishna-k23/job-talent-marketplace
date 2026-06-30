// Requirements.tsx - Premium Enhanced Version with Date Fix
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Eye, Edit2, Trash2, Download, Upload, Plus, Search,
  CheckSquare, Square, Trash, Loader2, X, ChevronRight,
  Filter, Calendar, Briefcase, DollarSign, MapPin, Clock,
  Sparkles, Layers, Zap, TrendingUp, Award, FileText,
  ChevronDown, ChevronUp, Copy, Share2,
  Users
} from 'lucide-react';
import { RequirementDetailModal } from './RequirementDetailModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Pagination } from './Pagination';
import { useToast } from '../contexts/ToastContext';

interface RequirementsProps {
  onViewMatches?: (jobId: string, matchCount: number) => void;
  onCreateNew?: () => void;
}

interface ApiRequirement {
  custom_start_date: string;
  id: number;
  requirement_id: string;
  role: string;
  experience_min?: number;
  experience_max?: number;
  budget_min?: number;
  budget_max?: number;
  skills?: string[];
  must_have_skills?: string[];
  good_to_have_skills?: string[];
  positions?: number;
  duration?: string;
  work_mode?: string;
  start_date?: string;
  location?: string;
  description?: string;
  status: string;
  matches_count?: number;
  created_at?: string;
  updated_at?: string;
}

function formatExperience(min?: number, max?: number): string {
  if (min != null && max != null) return `${min}–${max} yrs`;
  if (min != null) return `${min}+ yrs`;
  return 'N/A';
}

function formatBudget(min?: number, max?: number): string {
  if (min != null && max != null) return `₹${min.toLocaleString()}–₹${max.toLocaleString()}`;
  if (min != null) return `₹${min.toLocaleString()}+`;
  return 'N/A';
}

// Helper function to format start date properly
function formatStartDate(startDate?: string, customStartDate?: string): string {
  if (startDate === 'Pick Date' && customStartDate) {
    try {
      let dateObj = null;
      
      // If it's a timestamp (number), convert it
      if (!isNaN(Number(customStartDate))) {
        dateObj = new Date(Number(customStartDate));
      }
      // If it contains T or -, it's likely ISO format
      else if (customStartDate.includes('T') || customStartDate.includes('-')) {
        dateObj = new Date(customStartDate);
      } 
      // Try adding T00:00:00 to make it a valid ISO string
      else {
        dateObj = new Date(customStartDate + 'T00:00:00');
      }
      
      // Check if date is valid
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If all parsing fails, return the raw value
      return customStartDate;
    } catch (e) {
      return customStartDate || 'Invalid Date';
    }
  }
  return startDate || 'N/A';
}

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
  let token = localStorage.getItem('token') || localStorage.getItem('access_token');

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
      const newToken = localStorage.getItem('token') || localStorage.getItem('access_token');
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

export function Requirements({ onViewMatches, onCreateNew }: RequirementsProps) {
  const { showSuccess, showError } = useToast();
  const [selectedRequirement, setSelectedRequirement] = useState<ApiRequirement | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: number; label: string }>({
    show: false,
    id: 0,
    label: '',
  });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState<{ show: boolean; count: number }>({
    show: false,
    count: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [requirements, setRequirements] = useState<ApiRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'role' | 'created_at' | 'status'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Bulk upload state
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 8;

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetchWithAuth(`/api/requirements/?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setRequirements(Array.isArray(data) ? data : []);
        setSelectedIds(new Set());
      } else {
        console.error('Failed to fetch requirements:', response.status);
        setRequirements([]);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [statusFilter]);

  const handleViewMatches = async (requirement: ApiRequirement) => {
    try {
      const endpoint = `/api/requirements/${requirement.id}/matches`;
      const response = await fetchWithAuth(endpoint);

      if (response.ok) {
        const data = await response.json();
        onViewMatches?.(requirement.requirement_id, data.length || requirement.matches_count || 0);
      } else if (response.status === 404) {
        onViewMatches?.(requirement.requirement_id, 0);
        showError('No matches found for this requirement.');
      } else {
        onViewMatches?.(requirement.requirement_id, requirement.matches_count || 0);
        showError('Could not fetch matches. Showing cached count.');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      onViewMatches?.(requirement.requirement_id, requirement.matches_count || 0);
    }
  };

  const confirmDelete = async () => {
    try {
      await fetchWithAuth(`/api/requirements/${deleteConfirmation.id}`, {
        method: 'DELETE',
      });
      setDeleteConfirmation({ show: false, id: 0, label: '' });
      fetchRequirements();
      showSuccess('Requirement deleted successfully');
    } catch (error) {
      console.error('Error deleting requirement:', error);
      showError('Failed to delete requirement');
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const promises = ids.map(id =>
        fetchWithAuth(`/api/requirements/${id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      setBulkDeleteConfirmation({ show: false, count: 0 });
      setSelectedIds(new Set());
      fetchRequirements();
      showSuccess(`Successfully deleted ${ids.length} requirements`);
    } catch (error) {
      console.error('Error deleting requirements:', error);
      showError('Failed to delete some requirements');
    }
  };

  const handleView = (req: ApiRequirement) => {
    setSelectedRequirement(req);
    setModalMode('view');
  };

  const handleEdit = (req: ApiRequirement) => {
    setSelectedRequirement(req);
    setModalMode('edit');
  };

  const handleDelete = (req: ApiRequirement) => {
    setDeleteConfirmation({ show: true, id: req.id, label: req.requirement_id });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, id: 0, label: '' });
  };

  const cancelBulkDelete = () => {
    setBulkDeleteConfirmation({ show: false, count: 0 });
  };

  // Filtered and sorted requirements
  const filteredRequirements = useMemo(() => {
    let filtered = requirements.filter((req) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (req.requirement_id || '').toLowerCase().includes(q) ||
        (req.role || '').toLowerCase().includes(q) ||
        (req.location || '').toLowerCase().includes(q)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'role') {
        comparison = (a.role || '').localeCompare(b.role || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else {
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requirements, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequirements = filteredRequirements.slice(startIndex, startIndex + itemsPerPage);

  // Selection handlers
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentRequirements.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(currentRequirements.map(r => r.id));
      setSelectedIds(allIds);
    }
  };

  const isAllSelected = currentRequirements.length > 0 && selectedIds.size === currentRequirements.length;

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
    }
    e.target.value = '';
  };

  // Handle Bulk Upload
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      showError('Please select a CSV file');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      showError('Please login first');
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(bulkFile.type) && !bulkFile.name.endsWith('.csv') && !bulkFile.name.endsWith('.xlsx') && !bulkFile.name.endsWith('.xls')) {
      showError('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      let response = await fetch('/api/requirements/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem('token') || localStorage.getItem('access_token');
          response = await fetch('/api/requirements/bulk-upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
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
        const count = result.count || result.length || result.uploaded_count || 0;
        showSuccess(`Successfully uploaded ${count} requirements`);
        setShowBulkUploadModal(false);
        setBulkFile(null);
        fetchRequirements();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to upload file. Please check the format.');
        console.error('Upload error:', error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'role',
      'experience_min',
      'experience_max',
      'positions',
      'skills',
      'budget_min',
      'budget_max',
      'duration',
      'work_mode',
      'start_date',
      'custom_start_date',
      'location',
      'description'
    ];

    const sampleData = [
      'DevOps Engineer',
      '5',
      '8',
      '2',
      'AWS,Docker,Kubernetes',
      '100000',
      '150000',
      '12 Months',
      'Hybrid',
      'Pick Date',
      '2026-07-15',
      'Bangalore',
      'Looking for experienced DevOps engineer'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

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

  // Stats for the header
  const stats = {
    total: requirements.length,
    open: requirements.filter(r => r.status === 'Open').length,
    closed: requirements.filter(r => r.status === 'Closed').length,
    matches: requirements.reduce((sum, r) => sum + (r.matches_count || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Bulk Upload Modal - Enhanced */}
      {showBulkUploadModal && (
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
                    if (!uploading) {
                      setShowBulkUploadModal(false);
                      setBulkFile(null);
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                  disabled={uploading}
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {uploading ? (
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
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="bulk-file-input"
                      ref={fileInputRef}
                    />
                    <label htmlFor="bulk-file-input" className="cursor-pointer block">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload size={36} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium">
                        {bulkFile ? 'Change file' : 'Click to upload CSV file'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Supported formats: .csv, .xlsx, .xls</p>
                    </label>
                    {bulkFile && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium">
                        <CheckSquare size={16} />
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
                        setShowBulkUploadModal(false);
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

      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Requirements Management</span>
            </div>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
              <FileText size={14} />
              <span>Manage and track all your job requirements in one place</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-medium border border-white/20 text-sm hover:scale-105"
            >
              <Plus size={16} />
              Create New
            </button>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium text-sm"
            >
              <Upload size={16} />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative mt-4 grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'text-blue-200' },
            { label: 'Open', value: stats.open, icon: TrendingUp, color: 'text-amber-200' },
            { label: 'Closed', value: stats.closed, icon: CheckSquare, color: 'text-emerald-200' },
            { label: 'Matches', value: stats.matches, icon: Award, color: 'text-purple-200' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <stat.icon size={14} className={stat.color} />
                <span className="text-blue-100 text-xs">{stat.label}</span>
              </div>
              <div className="text-white font-bold text-lg mt-0.5">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters - Enhanced */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Job ID, Role, or Location..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 flex-shrink-0">
            {(['all', 'open', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${statusFilter === s
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Date Created</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowFilters(false)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Requirements Table - Enhanced */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800/40">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              Requirements
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                ({filteredRequirements.length})
              </span>
            </h2>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkDeleteConfirmation({ show: true, count: selectedIds.size })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors animate-in fade-in"
              >
                <Trash size={16} />
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 flex items-center gap-2"
            >
              <Download size={15} />
              Template
            </button>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Upload size={15} />
              Bulk Upload
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Loading requirements...</p>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No requirements found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first requirement to get started</p>
              <button
                onClick={onCreateNew}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Create Requirement
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b-2 border-slate-200/60 dark:border-slate-700/60">
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      {isAllSelected ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} className="text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matches</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
                {currentRequirements.map((req, index) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200 group ${selectedIds.has(req.id) ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                      }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelect(req.id)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {selectedIds.has(req.id) ? (
                          <CheckSquare size={18} className="text-blue-600" />
                        ) : (
                          <Square size={18} className="text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-lg">
                        {req.requirement_id || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {req.role || 'N/A'}
                      </div>
                      {req.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <MapPin size={12} />
                          {req.location}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Clock size={14} className="text-blue-500" />
                        {formatExperience(req.experience_min, req.experience_max)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <DollarSign size={14} className="text-emerald-500" />
                        {formatBudget(req.budget_min, req.budget_max)}
                      </div>
                    </td>
                    {/* FIXED: Start Date column with proper date formatting */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar size={14} className="text-purple-500" />
                        <span className={req.start_date === 'Pick Date' && req.custom_start_date ? 'font-medium text-purple-600 dark:text-purple-400' : ''}>
                          {formatStartDate(req.start_date, req.custom_start_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${req.status === 'Open'
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${req.status === 'Open' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                        {req.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewMatches(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 hover:from-blue-600 hover:to-purple-600 hover:text-white rounded-full transition-all duration-200 border border-blue-200 dark:border-blue-800 group-hover:shadow-lg"
                      >
                        <Users size={12} />
                        {req.matches_count ?? 0}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(req)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(req)}
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(req)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredRequirements.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRequirements.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modals */}
      {selectedRequirement && (
        <RequirementDetailModal
          requirement={selectedRequirement}
          mode={modalMode}
          onClose={() => setSelectedRequirement(null)}
          onUpdate={fetchRequirements}
        />
      )}

      {deleteConfirmation.show && (
        <DeleteConfirmationModal
          title="Delete Requirement?"
          message={`Are you sure you want to delete requirement ${deleteConfirmation.label}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {bulkDeleteConfirmation.show && (
        <DeleteConfirmationModal
          title="Delete Selected Requirements?"
          message={`Are you sure you want to delete ${bulkDeleteConfirmation.count} selected requirement(s)? This action cannot be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={cancelBulkDelete}
        />
      )}
    </div>
  );
}