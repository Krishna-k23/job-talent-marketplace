// VendorResources.tsx - Ultra Premium Enhanced Version with Select All
import { useEffect, useState } from 'react';
import {
  Search, Download, Plus, Eye, Edit2, Trash2, X, Upload,
  Loader2, CheckSquare, Square, Trash, FileSpreadsheet,
  Sparkles, Layers, Zap, Award, Users, Filter, ChevronDown,
  ChevronUp, Clock, MapPin, DollarSign, Mail, Phone, Briefcase,
  Tag, UserCircle, Activity, Star, TrendingUp, Shield,
  FileText
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import * as XLSX from 'xlsx';

interface Resource {
  id: string;
  resource_id: string;
  name: string;
  skill_domain: string;
  experience: string;
  experience_years: number;
  availability: string;
  availability_days: number;
  base_rate: number;
  location: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  status: 'Available' | 'Busy' | 'On Leave';
}

interface FormErrors {
  name?: string;
  skill_domain?: string;
  experience?: string;
  availability?: string;
  base_rate?: string;
  location?: string;
  email?: string;
  phone?: string;
  skills?: string;
}

const ITEMS_PER_PAGE = 8;

export function VendorResources() {
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<FormErrors>({});
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form states for add/edit
  const [resourceName, setResourceName] = useState('');
  const [skillDomain, setSkillDomain] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

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

  // Fetch resources
  const fetchResources = async () => {
    try {
      const response = await fetchWithAuth('/api/resources/');
      if (response.ok) {
        const data = await response.json();
        const mappedResources = data.map((resource: any) => ({
          id: resource.id,
          resource_id: resource.resource_id,
          name: resource.name,
          skill_domain: resource.skill_domain || resource.skillDomain,
          experience: resource.experience || `${resource.experience_years || 0} yrs`,
          experience_years: resource.experience_years || 0,
          availability: resource.availability || 'Available',
          availability_days: resource.availability_days || 0,
          base_rate: resource.base_rate || 0,
          location: resource.location || 'Not specified',
          email: resource.email || '',
          phone: resource.phone || '',
          summary: resource.summary || '',
          skills: resource.skills || [],
          status: resource.status || 'Available'
        }));
        setResources(mappedResources);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      showError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filter resources based on search query and status
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.skill_domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!resourceName.trim()) {
      newErrors.name = 'Resource name is required';
      isValid = false;
    }

    if (!skillDomain.trim()) {
      newErrors.skill_domain = 'Skill domain is required';
      isValid = false;
    }

    if (!experience || parseInt(experience) < 0) {
      newErrors.experience = 'Please enter a valid experience';
      isValid = false;
    }

    if (!availability) {
      newErrors.availability = 'Availability is required';
      isValid = false;
    }

    if (!baseRate || parseFloat(baseRate) <= 0) {
      newErrors.base_rate = 'Please enter a valid base rate';
      isValid = false;
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (phone) {
      const cleanPhone = phone.replace(/\s/g, '');
      const phonePattern = /^(\+91)?[6-9]\d{9}$/;
      if (!phonePattern.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add skill
  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  // Handle skill input keypress
  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Add resource
  const handleAddResource = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetchWithAuth('/api/resources/', {
        method: 'POST',
        body: JSON.stringify({
          name: resourceName,
          skill_domain: skillDomain,
          experience: experience,
          experience_years: parseInt(experience) || 0,
          availability: availability,
          base_rate: parseFloat(baseRate) || 0,
          location: location,
          email: email,
          phone: phone,
          summary: summary,
          skills: selectedSkills,
          status: 'Available'
        }),
      });

      if (response.ok) {
        showSuccess('Resource added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchResources();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to add resource');
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      showError('Failed to add resource');
    }
  };

  // Update resource
  const handleUpdateResource = async () => {
    if (!editingResource || !validateForm()) return;

    try {
      const experienceYears = parseInt(experience) || 0;

      const updateData = {
        name: resourceName,
        skill_domain: skillDomain,
        experience: `${experienceYears} yrs`,
        experience_years: experienceYears,
        availability: availability,
        base_rate: parseFloat(baseRate) || 0,
        location: location,
        email: email || '',
        phone: phone || '',
        summary: summary || '',
        skills: selectedSkills,
      };

      const response = await fetchWithAuth(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        showSuccess('Resource updated successfully!');
        setShowEditModal(false);
        setEditingResource(null);
        resetForm();
        fetchResources();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      showError('Failed to update resource');
    }
  };

  // Delete resource
  const handleDeleteResource = async () => {
    if (!selectedResource) return;

    try {
      const response = await fetchWithAuth(`/api/resources/${selectedResource.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Resource deleted successfully!');
        setShowDeleteModal(false);
        setSelectedResource(null);
        fetchResources();
      } else {
        showError('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      showError('Failed to delete resource');
    }
  };

  // Bulk delete selected resources
  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const promises = ids.map(id =>
        fetchWithAuth(`/api/resources/${id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      showSuccess(`Successfully deleted ${ids.length} resources`);
      setShowBulkDeleteModal(false);
      setSelectedIds(new Set());
      fetchResources();
    } catch (error) {
      console.error('Error deleting resources:', error);
      showError('Failed to delete some resources');
    }
  };

  // Download roster as Excel
  const handleDownloadRoster = () => {
    try {
      const data = filteredResources.map((resource, index) => ({
        'S.No': index + 1,
        'Resource ID': resource.resource_id || resource.id,
        'Name': resource.name,
        'Skill Domain': resource.skill_domain,
        'Experience': resource.experience,
        'Availability': resource.availability,
        'Base Rate (₹/mo)': resource.base_rate,
        'Location': resource.location,
        'Email': resource.email,
        'Phone': resource.phone,
        'Skills': resource.skills?.join(', ') || '',
        'Status': resource.status,
        'Summary': resource.summary || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Resources');

      const colWidths = [
        { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
        { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
        { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 40 }
      ];
      ws['!cols'] = colWidths;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resources_roster_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess('Roster downloaded successfully!');
    } catch (error) {
      console.error('Error downloading roster:', error);
      showError('Failed to download roster');
    }
  };

  const resetForm = () => {
    setResourceName('');
    setSkillDomain('');
    setExperience('');
    setAvailability('');
    setBaseRate('');
    setLocation('');
    setEmail('');
    setPhone('');
    setSummary('');
    setSelectedSkills([]);
    setSkillInput('');
    setErrors({});
  };

  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setResourceName(resource.name);
    setSkillDomain(resource.skill_domain);
    const expNum = resource.experience?.match(/\d+/);
    setExperience(expNum ? expNum[0] : resource.experience_years?.toString() || '0');
    setAvailability(resource.availability);
    setBaseRate(resource.base_rate.toString());
    setLocation(resource.location);
    setEmail(resource.email);
    setPhone(resource.phone);
    setSummary(resource.summary);
    setSelectedSkills(resource.skills || []);
    setSkillInput('');
    setErrors({});
    setShowEditModal(true);
  };

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / ITEMS_PER_PAGE));
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isAllSelected = paginatedResources.length > 0 &&
    paginatedResources.every(r => selectedIds.has(r.id));

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    // Clear selections when searching
    setSelectedIds(new Set());
  };
  
  // Selection handlers (now paginatedResources is defined)
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all on current page
  const toggleSelectAll = () => {
    const currentPageIds = paginatedResources.map(r => r.id);
    const allCurrentPageSelected = currentPageIds.every(id => selectedIds.has(id));

    if (allCurrentPageSelected) {
      const newSelected = new Set(selectedIds);
      currentPageIds.forEach(id => newSelected.delete(id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      currentPageIds.forEach(id => newSelected.add(id));
      setSelectedIds(newSelected);
    }
  };

  // Select all resources across all pages
  const handleSelectAllPages = () => {
    if (selectedIds.size === filteredResources.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredResources.map(r => r.id));
      setSelectedIds(allIds);
    }
  };


  const getStatusColor = (status: string) => {
    if (status === 'Available') return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (status === 'Busy') return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  const getStatusDot = (status: string) => {
    if (status === 'Available') return 'bg-emerald-500';
    if (status === 'Busy') return 'bg-amber-500';
    return 'bg-red-500';
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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-emerald-100 text-xs font-medium">Resource Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Resources
            </h1>
            <p className="text-emerald-100 text-sm mt-0.5 flex items-center gap-2">
              <Users size={14} />
              <span>Manage all bench resources</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
              <Users size={16} className="text-emerald-200" />
              <span className="text-sm font-medium">{resources.length} Resources</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white text-emerald-600 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium text-sm"
            >
              <Plus size={16} />
              Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, skill, location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ NEW: Select All Pages Button */}
          {filteredResources.length > 0 && (
            <button
              onClick={handleSelectAllPages}
              className={`px-3 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-1.5 ${selectedIds.size === filteredResources.length
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              title={selectedIds.size === filteredResources.length ? "Deselect all" : "Select all"}
            >
              {selectedIds.size === filteredResources.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {selectedIds.size === filteredResources.length ? 'All' : 'Select All'}
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <Filter size={18} />
          </button>

          <button
            onClick={handleDownloadRoster}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
          >
            <FileSpreadsheet size={16} />
            Roster
          </button>

          {/* ✅ NEW: Bulk Delete Button - Shows when items are selected */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-red-600/30"
            >
              <Trash2 size={16} />
              Delete {selectedIds.size}
            </button>
          )}
        </div>
      </div>

      {/* ✅ NEW: Selection Info Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl px-4 py-2.5 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              {selectedIds.size} resource{selectedIds.size > 1 ? 's' : ''} selected
              {selectedIds.size === filteredResources.length && (
                <span className="ml-1 font-medium">(All {filteredResources.length} resources)</span>
              )}
            </span>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All</option>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
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

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl flex items-center justify-center mb-4">
            <Users size={40} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No resources found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {searchQuery ? `No resources matching "${searchQuery}"` : 'Add your first resource to get started'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Add Resource
          </button>
        </div>
      ) : (
        <>
          {/* ✅ UPDATED: Header with Select All checkbox */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title={isAllSelected ? "Deselect all on this page" : "Select all on this page"}
                >
                  {isAllSelected ? (
                    <CheckSquare size={20} className="text-emerald-600" />
                  ) : (
                    <Square size={20} className="text-slate-400" />
                  )}
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {isAllSelected ? 'All selected on this page' : 'Select all on this page'}
                </span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {paginatedResources.length} of {filteredResources.length} resources
              </div>
            </div>

            {/* Resource Cards Grid - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
              {paginatedResources.map((resource) => (
                <div
                  key={resource.id}
                  className={`group bg-white dark:bg-slate-800/80 rounded-2xl p-5 border transition-all duration-300 relative ${selectedIds.has(resource.id)
                      ? 'border-emerald-400 dark:border-emerald-600 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-800'
                    }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => toggleSelect(resource.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      {selectedIds.has(resource.id) ? (
                        <CheckSquare size={18} className="text-emerald-600" />
                      ) : (
                        <Square size={18} className="text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(resource.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(resource.status)}`}></span>
                      {resource.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3 pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {resource.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                          {resource.resource_id || resource.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {resource.skill_domain}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock size={14} className="text-emerald-500" />
                        Experience
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {resource.experience}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <DollarSign size={14} className="text-emerald-500" />
                        Rate
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{resource.base_rate?.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin size={14} className="text-purple-500" />
                        Location
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {resource.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Activity size={14} className="text-amber-500" />
                        Availability
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {resource.availability}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {resource.skills?.slice(0, 3).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800 truncate max-w-[80px]"
                      >
                        {skill}
                      </span>
                    ))}
                    {resource.skills?.length > 3 && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                        +{resource.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(resource)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/30 group-hover:shadow-xl"
                    >
                      <Eye size={15} />
                      View Profile
                    </button>
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(resource)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredResources.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredResources.length)} of {filteredResources.length}
                  {selectedIds.size > 0 && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                      • {selectedIds.size} selected
                    </span>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 cursor-pointer text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Previous
                  </button>
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
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 cursor-pointer text-sm rounded-lg font-semibold transition-colors ${pageNum === currentPage
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 cursor-pointer text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals - Same as before */}
      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Add Resource</h3>
                  <p className="text-emerald-100 text-sm mt-1">Add a new resource to your bench</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Form fields - same as before */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <UserCircle size={14} className="inline mr-1.5 text-emerald-500" />
                  Resource Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter resource name"
                  value={resourceName}
                  onChange={(e) => {
                    setResourceName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Briefcase size={14} className="inline mr-1.5 text-emerald-500" />
                  Skill Domain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Full Stack Developer"
                  value={skillDomain}
                  onChange={(e) => {
                    setSkillDomain(e.target.value);
                    if (errors.skill_domain) setErrors({ ...errors, skill_domain: undefined });
                  }}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.skill_domain ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.skill_domain && <p className="text-xs text-red-500 mt-1">{errors.skill_domain}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Clock size={14} className="inline mr-1.5 text-emerald-500" />
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Years"
                    value={experience}
                    onChange={(e) => {
                      setExperience(e.target.value);
                      if (errors.experience) setErrors({ ...errors, experience: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.experience ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <DollarSign size={14} className="inline mr-1.5 text-emerald-500" />
                    Base Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="₹/mo"
                    value={baseRate}
                    onChange={(e) => {
                      setBaseRate(e.target.value);
                      if (errors.base_rate) setErrors({ ...errors, base_rate: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.base_rate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.base_rate && <p className="text-xs text-red-500 mt-1">{errors.base_rate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Activity size={14} className="inline mr-1.5 text-emerald-500" />
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => {
                      setAvailability(e.target.value);
                      if (errors.availability) setErrors({ ...errors, availability: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.availability ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select availability</option>
                    <option value="Immediate">Immediate</option>
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="60+ days">60+ days</option>
                  </select>
                  {errors.availability && <p className="text-xs text-red-500 mt-1">{errors.availability}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <MapPin size={14} className="inline mr-1.5 text-emerald-500" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Bangalore"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({ ...errors, location: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.location ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Mail size={14} className="inline mr-1.5 text-emerald-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Phone size={14} className="inline mr-1.5 text-emerald-500" />
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^+\d]/g, '');
                      setPhone(value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    maxLength={13}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Tag size={14} className="inline mr-1.5 text-emerald-500" />
                  Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., AWS, Docker, Kubernetes"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-800"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <FileText size={14} className="inline mr-1.5 text-emerald-500" />
                  Summary
                </label>
                <textarea
                  placeholder="Enter summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleAddResource} className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/30 font-medium">
                  Add Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Edit Resource</h3>
                  <p className="text-emerald-100 text-sm mt-1">Update resource information</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Same form fields as Add Modal but with values populated */}
              {/* ... (form fields same as add modal) ... */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleUpdateResource} className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/30 font-medium">
                  Update Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Resource</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete <br />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedResource.name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleDeleteResource} className="flex-1 cursor-pointer px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowBulkDeleteModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Selected Resources</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete <br />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedIds.size} resource(s)</span>?
                <br />This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleBulkDelete} className="flex-1 cursor-pointer px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium">
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Resource Details</h3>
                  <p className="text-emerald-100 text-sm mt-1">Complete resource information</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {selectedResource.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{selectedResource.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedResource.skill_domain}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Experience</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedResource.experience}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Base Rate</div>
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{selectedResource.base_rate?.toLocaleString()}/mo</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Availability</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedResource.availability}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Location</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedResource.location}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedResource.skills?.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {skill}
                    </span>
                  ))}
                  {(!selectedResource.skills || selectedResource.skills.length === 0) && (
                    <span className="text-sm text-slate-400">No skills listed</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Summary</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  {selectedResource.summary || 'No summary provided'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Status</div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(selectedResource.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedResource.status)}`}></span>
                    {selectedResource.status}
                  </span>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}