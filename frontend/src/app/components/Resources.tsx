// Resources.tsx - Using Shared Match Score Utility
import { useState, useEffect } from 'react';
import {
  Star, MessageSquare, Calendar, Download, Filter, Bookmark,
  Sparkles, Users, UserCheck, Briefcase, MapPin, DollarSign,
  Clock, Award, TrendingUp, ChevronRight, Eye, Zap,
  BookmarkCheck, BookmarkX, FileText, Mail, Phone, Activity,
  Tag, User, AlertCircle, Send, CheckCircle,
  X
} from 'lucide-react';
import { ResourceDetailModal } from './ResourceDetailModal';
import { generateConsistentMatchScore } from '../../config/matchScore';
import { useToast } from '../contexts/ToastContext';

export function Resources() {
  const { showSuccess, showError } = useToast();
  const [selectedResource, setSelectedResource] = useState<any>(null);
  // ✅ FIXED: Removed 'contracted' from filterStatus type
  const [filterStatus, setFilterStatus] = useState<'all' | 'saved' | 'contacted'>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactingResource, setContactingResource] = useState<any>(null);
  const [contractForm, setContractForm] = useState({
    rate: '',
    billing_cycle: 'Monthly',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [stats, setStats] = useState([
    { label: 'Total Saved', value: 0, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
    { label: 'Contacted', value: 0, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
    { label: 'In Discussion', value: 0, icon: Users, color: 'from-amber-500 to-orange-600' },
  ]);

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

  // Download resume/CV
  const handleDownloadResume = async (resumeUrl: string, resourceName: string) => {
    if (!resumeUrl) {
      showError('No resume available for this resource');
      return;
    }

    try {
      console.log('📥 Downloading resume from:', resumeUrl);

      const response = await fetchWithAuth(resumeUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to download resume: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const filename = resumeUrl.split('/').pop() || `${resourceName}_resume.pdf`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      showError('Failed to download resume. Please try again.');
    }
  };

  // Handle Contact/Contract creation
  const handleContactResource = async (resource: any) => {
    console.log('📞 Contacting resource:', resource);
    console.log('📞 Original ID:', resource.original_id);
    console.log('📞 Resource ID:', resource.id);

    setContactingResource(resource);
    // Set default dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    setContractForm({
      rate: resource.base_rate?.toString() || '',
      billing_cycle: 'Monthly',
      start_date: today.toISOString().split('T')[0],
      end_date: nextMonth.toISOString().split('T')[0],
      description: `Contract for ${resource.name} - ${resource.role}`
    });
    setShowContactModal(true);
  };

  // Submit contract/contact
  const handleSubmitContract = async () => {
    if (!contactingResource) {
      showError('No resource selected');
      return;
    }

    try {
      console.log('🔍 Contacting resource:', contactingResource);
      console.log('🔍 Original ID:', contactingResource.original_id);
      console.log('🔍 ID:', contactingResource.id);

      // Get the numeric ID - use original_id or fallback to parsing the id
      let numericResourceId = contactingResource.original_id;

      // If original_id is not set, try to parse it from the string ID
      if (!numericResourceId && contactingResource.id) {
        // If id is like "RES800", extract the number
        if (typeof contactingResource.id === 'string') {
          const match = contactingResource.id.match(/\d+/);
          if (match) {
            numericResourceId = parseInt(match[0]);
          }
        } else {
          numericResourceId = contactingResource.id;
        }
      }

      console.log('🔍 Numeric Resource ID:', numericResourceId);

      if (!numericResourceId) {
        showError('Invalid resource ID. Please refresh and try again.');
        return;
      }

      // Get the requirement ID
      const requirementsResponse = await fetchWithAuth('/api/requirements/?status=Open&limit=10');
      let requirementId = null;

      if (requirementsResponse.ok) {
        const requirements = await requirementsResponse.json();
        console.log('📋 Available requirements:', requirements);
        if (requirements && requirements.length > 0) {
          requirementId = requirements[0].id;
        }
      }

      if (!requirementId) {
        showError('No open requirements found. Please create a requirement first.');
        return;
      }

      // Prepare contract data with numeric IDs
      const contractData = {
        requirement_id: requirementId,
        resource_id: numericResourceId, // Use the numeric ID
        rate: parseFloat(contractForm.rate) || 0,
        billing_cycle: contractForm.billing_cycle || 'Monthly',
        start_date: new Date(contractForm.start_date).toISOString(),
        end_date: new Date(contractForm.end_date).toISOString(),
        description: contractForm.description || ''
      };

      console.log('📤 Sending contract data:', contractData);

      const response = await fetchWithAuth('/api/contracts/', {
        method: 'POST',
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Contract created:', result);
        showSuccess(`Contact initiated with ${contactingResource.name}!`);
        setShowContactModal(false);
        setContactingResource(null);
        // Refresh resources to update status
        await fetchResources();
        // Also refresh contracts
        window.dispatchEvent(new Event('contractsUpdated'));
      } else {
        const error = await response.json();
        console.error('❌ Contract creation error:', error);

        // Extract and show meaningful error message
        let errorMessage = 'Failed to create contract';
        if (error.detail) {
          if (typeof error.detail === 'string') {
            errorMessage = error.detail;
          } else if (Array.isArray(error.detail)) {
            errorMessage = error.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
          } else if (typeof error.detail === 'object') {
            errorMessage = JSON.stringify(error.detail);
          }
        }
        showError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error creating contract:', error);
      showError('Failed to create contract: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Fetch resources from API
  const fetchResources = async () => {
    const token = getToken();
    if (!token) {
      console.log('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/api/resources/');

      if (response.ok) {
        const data = await response.json();
        // Load saved state from localStorage
        const savedResources = JSON.parse(localStorage.getItem('savedResources') || '{}');
        // Load contacted state from localStorage
        const contactedResources = JSON.parse(localStorage.getItem('contactedResources') || '{}');

        const formattedResources = data.map((resource: any) => {
          const resourceId = resource.resource_id || `RES-${resource.id}`;
          const isContacted = contactedResources[resource.id] || false;

          return {
            id: resourceId, // String ID for display
            original_id: resource.id, // ✅ FIXED: Use resource.id (numeric database ID)
            resource_id: resource.resource_id || `RES${String(resource.id).padStart(4, '0')}`,
            name: resource.name,
            role: resource.skill_domain || resource.name,
            experience: resource.experience || `${resource.experience_years || 0} yrs`,
            experience_years: resource.experience_years || 0,
            availability: resource.availability || 'Available',
            availability_days: resource.availability_days || 0,
            rate: resource.base_rate ? `₹${resource.base_rate.toLocaleString()}/mo` : '₹0/mo',
            base_rate: resource.base_rate || 0,
            location: resource.location || 'Not specified',
            skills: resource.skills || [],
            match: generateConsistentMatchScore(resourceId, resource.skills || []),
            status: isContacted ? 'contracted' : (resource.status === 'Busy' ? 'contacted' : 'saved'),
            lastContact: resource.updated_at ? new Date(resource.updated_at).toLocaleDateString() : 'Never',
            saved: savedResources[resource.id] !== undefined ? savedResources[resource.id] : resource.status !== 'Busy',
            email: resource.email || '',
            phone: resource.phone || '',
            summary: resource.summary || `Experienced professional with ${resource.experience || '5+'} years of experience.`,
            resume_url: resource.resume_url || null,
            created_at: resource.created_at,
            updated_at: resource.updated_at,
          };
        });
        setResources(formattedResources);

        // Update stats
        const savedCount = formattedResources.filter((r: any) => r.saved).length;
        const contactedCount = formattedResources.filter((r: any) => r.status === 'contacted' || r.status === 'contracted').length;
        setStats([
          { label: 'Total Saved', value: savedCount, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
          { label: 'Contacted', value: contactedCount, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
          { label: 'In Discussion', value: Math.floor(contactedCount / 2), icon: Users, color: 'from-amber-500 to-orange-600' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    // Listen for contract updates
    const handleContractUpdate = () => {
      fetchResources();
    };
    window.addEventListener('contractsUpdated', handleContractUpdate);

    return () => {
      window.removeEventListener('contractsUpdated', handleContractUpdate);
    };
  }, []);

  // Toggle save/bookmark
  const toggleSave = (resourceId: string) => {
    setResources(prevResources => {
      const updatedResources = prevResources.map(r => {
        if (r.id === resourceId) {
          return { ...r, saved: !r.saved };
        }
        return r;
      });

      // Save to localStorage
      const savedResources: Record<string, boolean> = {};
      updatedResources.forEach(r => {
        savedResources[r.id] = r.saved;
      });
      localStorage.setItem('savedResources', JSON.stringify(savedResources));

      // Update stats
      const savedCount = updatedResources.filter(r => r.saved).length;
      const contactedCount = updatedResources.filter(r => r.status === 'contacted' || r.status === 'contracted').length;
      setStats([
        { label: 'Total Saved', value: savedCount, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
        { label: 'Contacted', value: contactedCount, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
        { label: 'In Discussion', value: Math.floor(contactedCount / 2), icon: Users, color: 'from-amber-500 to-orange-600' },
      ]);

      return updatedResources;
    });
  };

  // Mark as contacted
  const markAsContacted = (resourceId: string, originalId: number) => {
    setResources(prevResources => {
      const updatedResources = prevResources.map(r => {
        if (r.id === resourceId) {
          return {
            ...r,
            status: 'contracted',
            lastContact: new Date().toLocaleDateString()
          };
        }
        return r;
      });

      // Save to localStorage
      const contactedResources: Record<string, boolean> = {};
      updatedResources.forEach(r => {
        if (r.status === 'contracted') {
          contactedResources[r.original_id] = true;
        }
      });
      localStorage.setItem('contactedResources', JSON.stringify(contactedResources));

      // Update stats
      const savedCount = updatedResources.filter(r => r.saved).length;
      const contactedCount = updatedResources.filter(r => r.status === 'contacted' || r.status === 'contracted').length;
      setStats([
        { label: 'Total Saved', value: savedCount, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
        { label: 'Contacted', value: contactedCount, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
        { label: 'In Discussion', value: Math.floor(contactedCount / 2), icon: Users, color: 'from-amber-500 to-orange-600' },
      ]);

      showSuccess('Resource marked as contacted!');
      return updatedResources;
    });
  };

  // ✅ FIXED: Updated filteredResources to include 'contracted' in 'contacted' filter
  const filteredResources = resources.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'saved') return r.saved;
    if (filterStatus === 'contacted') return r.status === 'contacted' || r.status === 'contracted';
    return true;
  });

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'from-emerald-500 to-green-600';
    if (match >= 80) return 'from-blue-500 to-indigo-600';
    if (match >= 70) return 'from-amber-500 to-orange-600';
    return 'from-slate-400 to-slate-500';
  };

  const getMatchBadgeColor = (match: number) => {
    if (match >= 90) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (match >= 80) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (match >= 70) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Available' || status === 'saved') return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (status === 'Busy' || status === 'contacted') return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (status === 'contracted') return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (status === 'On Leave') return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  const getStatusDot = (status: string) => {
    if (status === 'Available' || status === 'saved') return 'bg-emerald-500';
    if (status === 'Busy' || status === 'contacted') return 'bg-amber-500';
    if (status === 'contracted') return 'bg-blue-500';
    if (status === 'On Leave') return 'bg-red-500';
    return 'bg-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Resource Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              My Resources
            </h1>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
              <Users size={14} />
              <span>Manage your saved and contacted talent profiles</span>
            </p>
          </div>
          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-medium border border-white/20 text-sm hover:scale-105">
            <Download size={16} />
            Export List
          </button>
        </div>

        {/* Quick Stats */}
        <div className="relative mt-4 grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon size={14} className="text-blue-200" />
                  <span className="text-blue-100 text-xs">{stat.label}</span>
                </div>
                <div className="text-white font-bold text-lg mt-0.5">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
              {/* ✅ FIXED: Only show 'all', 'saved', 'contacted' - removed 'contracted' */}
              {(['all', 'saved', 'contacted'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 cursor-pointer sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'saved' && (
                    <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {resources.filter(r => r.saved).length}
                    </span>
                  )}
                  {status === 'contacted' && (
                    <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {resources.filter(r => r.status === 'contacted' || r.status === 'contracted').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{filteredResources.length} profiles</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>{resources.filter(r => r.saved).length} saved</span>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative"
          >
            {/* Save/Bookmark Button */}
            <button
              onClick={() => toggleSave(resource.id)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 z-10"
              title={resource.saved ? "Remove from saved" : "Save resource"}
            >
              {resource.saved ? (
                <BookmarkCheck size={20} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
              ) : (
                <BookmarkX size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              )}
            </button>

            {/* Top Row - Avatar and Badges */}
            <div className="flex items-start gap-4 mb-4 pr-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getMatchColor(resource.match)} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                {resource.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                    {resource.resource_id || resource.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getMatchBadgeColor(resource.match)}`}>
                    <Award size={10} />
                    {resource.match}% Match
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(resource.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(resource.status)}`}></span>
                    {resource.status === 'saved' ? 'Available' : resource.status === 'contacted' ? 'In Discussion' : resource.status === 'contracted' ? 'Contracted' : resource.status}
                  </span>
                  {resource.resume_url && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileText size={10} />
                      Resume
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                  {resource.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} className="text-blue-500" />
                    {resource.role}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-blue-500" />
                    {resource.experience}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-purple-500" />
                    {resource.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Row */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar size={16} className="text-amber-500" />
                <span className="font-medium">{resource.availability}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <DollarSign size={16} />
                <span>{resource.rate}</span>
              </div>
              {resource.email && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Mail size={14} />
                  <span className="text-xs truncate max-w-[120px]">{resource.email}</span>
                </div>
              )}
              {resource.phone && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Phone size={14} />
                  <span className="text-xs truncate max-w-[100px]">{resource.phone}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {resource.skills.slice(0, 4).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800"
                >
                  {skill}
                </span>
              ))}
              {resource.skills.length > 4 && (
                <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                  +{resource.skills.length - 4}
                </span>
              )}
            </div>

            {resource.status === 'contracted' && (
              <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle size={14} />
                  <span className="font-medium">Contract Active - {resource.lastContact}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedResource(resource)}
                className="flex-1 h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 group-hover:shadow-xl"
              >
                <Eye size={16} />
                View Full Profile
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              {resource.status !== 'contracted' && (
                <button
                  onClick={() => handleContactResource(resource)}
                  className="h-11 px-4 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-600/30"
                  title="Contact Resource"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Contact</span>
                </button>
              )}
              <button
                onClick={() => toggleSave(resource.id)}
                className={`px-4 cursor-pointer h-11 rounded-xl transition-all duration-200 flex items-center justify-center ${resource.saved
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700'
                  : 'border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
              >
                <Star size={18} className={resource.saved ? 'fill-white' : ''} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl flex items-center justify-center mb-4">
            <Users size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No resources found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {filterStatus === 'saved' ? 'You haven\'t saved any resources yet' :
              filterStatus === 'contacted' ? 'No contacted resources found' :
                'No resources available'}
          </p>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onToggleSave={toggleSave}
          onDownloadResume={handleDownloadResume}
          onContact={handleContactResource}
        />
      )}

      {/* Contact Modal */}
      {showContactModal && contactingResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowContactModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Contact Resource</h3>
                  <p className="text-purple-100 text-sm mt-1">
                    Initiate contract with {contactingResource.name}
                  </p>
                </div>
                <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <DollarSign size={14} className="inline mr-1.5 text-purple-500" />
                  Rate (₹/mo)
                </label>
                <input
                  type="number"
                  value={contractForm.rate}
                  onChange={(e) => setContractForm({ ...contractForm, rate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter rate"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Clock size={14} className="inline mr-1.5 text-purple-500" />
                  Billing Cycle
                </label>
                <select
                  value={contractForm.billing_cycle}
                  onChange={(e) => setContractForm({ ...contractForm, billing_cycle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Calendar size={14} className="inline mr-1.5 text-purple-500" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={contractForm.start_date}
                    onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Calendar size={14} className="inline mr-1.5 text-purple-500" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={contractForm.end_date}
                    onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <FileText size={14} className="inline mr-1.5 text-purple-500" />
                  Description
                </label>
                <textarea
                  value={contractForm.description}
                  onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Contract description"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => setShowContactModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleSubmitContract} className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-purple-600/30 font-medium flex items-center justify-center gap-2">
                  <Send size={18} />
                  Send Contact Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}