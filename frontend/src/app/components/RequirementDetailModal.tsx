// RequirementDetailModal.tsx - Ultra Premium Enhanced Version
import { useEffect, useState } from 'react';
import { 
  X, Edit2, Save, MapPin, Briefcase, DollarSign, Clock, 
  Users, Calendar, Sparkles, Award, ChevronRight, 
  Building2, CheckCircle, Plus, Trash2, UserCheck,
  Mail, Phone, Globe, Tag, FileText, Layers
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

// Match the ApiRequirement type from Requirements component
interface ApiRequirement {
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

interface RequirementDetailModalProps {
  requirement: ApiRequirement;
  onClose: () => void;
  mode?: 'view' | 'edit';
  onUpdate?: () => void;
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

export function RequirementDetailModal({ requirement, onClose, mode = 'view', onUpdate }: RequirementDetailModalProps) {
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'matches'>('details');
  
  const [formData, setFormData] = useState({
    role: requirement.role || '',
    experience_min: requirement.experience_min || 0,
    experience_max: requirement.experience_max || 0,
    budget_min: requirement.budget_min || 0,
    budget_max: requirement.budget_max || 0,
    location: requirement.location || 'Bangalore',
    skills: requirement.skills || requirement.must_have_skills || [],
    description: requirement.description || '',
    duration: requirement.duration || '6 Months',
    work_mode: requirement.work_mode || 'Hybrid',
    positions: requirement.positions || 1,
    start_date: requirement.start_date || 'Immediate',
    status: requirement.status || 'Open',
  });

  // Fetch latest requirement details when in edit mode
  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const response = await fetchWithAuth(`/api/requirements/${requirement.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            role: data.role || '',
            experience_min: data.experience_min || 0,
            experience_max: data.experience_max || 0,
            budget_min: data.budget_min || 0,
            budget_max: data.budget_max || 0,
            location: data.location || 'Bangalore',
            skills: data.skills || data.must_have_skills || [],
            description: data.description || '',
            duration: data.duration || '6 Months',
            work_mode: data.work_mode || 'Hybrid',
            positions: data.positions || 1,
            start_date: data.start_date || 'Immediate',
            status: data.status || 'Open',
          });
        }
      } catch (error) {
        console.error('Error fetching requirement:', error);
      }
    };

    if (isEditing) {
      fetchRequirement();
    }
  }, [requirement.id, isEditing]);

  // Update requirement
  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        role: formData.role,
        experience_min: formData.experience_min,
        experience_max: formData.experience_max,
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
        location: formData.location,
        skills: formData.skills,
        description: formData.description,
        duration: formData.duration,
        work_mode: formData.work_mode,
        positions: formData.positions,
        start_date: formData.start_date,
        status: formData.status,
      };

      const response = await fetchWithAuth(`/api/requirements/${requirement.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        showSuccess('Requirement updated successfully');
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update requirement');
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
      showError('Error updating requirement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData({ 
        ...formData, 
        skills: [...formData.skills, newSkill.trim()] 
      });
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const workModes = ['Remote', 'Hybrid', 'Onsite'];
  const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Other'];
  const durations = ['3 Months', '6 Months', '12 Months', '24 Months'];
  const startDates = ['Immediate', '15 Days', '30 Days', '60 Days', 'Custom'];
  const statuses = ['Open', 'Closed'];

  const getStatusColor = (status: string) => {
    return status === 'Open' 
      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 dark:from-slate-800/30 dark:to-gray-800/30 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  const getStatusDot = (status: string) => {
    return status === 'Open' ? 'bg-emerald-500' : 'bg-slate-400';
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col"
        style={{ maxHeight: 'calc(100vh - 1.5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Enhanced with gradient */}
        <div className="flex-shrink-0 relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-5 sm:py-6 rounded-t-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                  <span className="text-blue-100 text-xs font-medium">Requirement</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(formData.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(formData.status)}`}></span>
                  {formData.status}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{requirement.requirement_id}</h2>
                <span className="text-blue-200 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                  {formData.role}
                </span>
              </div>
              <p className="text-sm text-blue-100 mt-1 flex items-center gap-2">
                <FileText size={14} />
                Manage requirement details and track matches
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm cursor-pointer font-semibold bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-white/20"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm cursor-pointer font-semibold bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 cursor-pointer rounded-xl transition-all text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 sm:px-8 pt-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex gap-1">
            {[
              { id: 'details', label: 'Details', icon: Layers },
              { id: 'skills', label: 'Skills', icon: Tag },
              { id: 'matches', label: 'Matches', icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === 'matches' && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      {requirement.matches_count || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Enhanced */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Role */}
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                  Role / Position <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base font-medium"
                    placeholder="Enter role title"
                  />
                ) : (
                  <div className="text-base font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {formData.role || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Experience & Budget - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Clock size={16} className="inline mr-1.5 text-blue-600 dark:text-blue-400" />
                    Experience Required
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={formData.experience_min}
                        onChange={(e) => setFormData({ ...formData, experience_min: parseInt(e.target.value) || 0 })}
                        placeholder="Min"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="number"
                        value={formData.experience_max}
                        onChange={(e) => setFormData({ ...formData, experience_max: parseInt(e.target.value) || 0 })}
                        placeholder="Max"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formatExperience(formData.experience_min, formData.experience_max)}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
                    Budget Range (₹)
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={formData.budget_min}
                        onChange={(e) => setFormData({ ...formData, budget_min: parseInt(e.target.value) || 0 })}
                        placeholder="Min"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="number"
                        value={formData.budget_max}
                        onChange={(e) => setFormData({ ...formData, budget_max: parseInt(e.target.value) || 0 })}
                        placeholder="Max"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formatBudget(formData.budget_min, formData.budget_max)}
                    </div>
                  )}
                </div>
              </div>

              {/* Positions & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Users size={16} className="inline mr-1.5 text-purple-600 dark:text-purple-400" />
                    Positions
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.positions}
                      onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      min="1"
                    />
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formData.positions} position{formData.positions !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar size={16} className="inline mr-1.5 text-blue-600 dark:text-blue-400" />
                    Duration
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {durations.map(dur => (
                        <option key={dur} value={dur}>{dur}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formData.duration || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* Work Mode & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Building2 size={16} className="inline mr-1.5 text-blue-600 dark:text-blue-400" />
                    Work Mode
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-2">
                      {workModes.map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFormData({ ...formData, work_mode: mode })}
                          className={`py-2.5 px-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                            formData.work_mode === mode
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-600/30'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formData.work_mode || 'Not specified'}
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-red-500" />
                    Location
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formData.location || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar size={16} className="inline mr-1.5 text-blue-600 dark:text-blue-400" />
                    Start Date
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {startDates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {formData.start_date || 'Not specified'}
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`inline-flex items-center gap-2 text-base font-semibold px-4 py-3 rounded-xl border ${
                      formData.status === 'Open'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(formData.status)}`}></span>
                      {formData.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <FileText size={16} className="inline mr-1.5 text-blue-600 dark:text-blue-400" />
                  Job Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter job description..."
                  />
                ) : (
                  <div className="text-base text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                    {formData.description || 'No description provided'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Tag size={20} className="text-blue-600" />
                      Required Skills
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} required
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setShowSkillInput(true)}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Skill
                    </button>
                  )}
                </div>

                {isEditing && showSkillInput && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter skill name"
                      className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowSkillInput(false);
                        setNewSkill('');
                      }}
                      className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="group px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 inline-flex items-center gap-2 transition-all hover:shadow-md"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <div className="w-full text-center py-8">
                      <Tag size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet</p>
                      {isEditing && (
                        <button
                          onClick={() => setShowSkillInput(true)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Click here to add skills
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                  <UserCheck size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {requirement.matches_count || 0} Matching Profiles
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {requirement.matches_count && requirement.matches_count > 0 
                    ? 'Profiles that match this requirement\'s skills and experience'
                    : 'No matching profiles found for this requirement yet'}
                </p>
                {requirement.matches_count && requirement.matches_count > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      // The parent component will handle navigation
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    View All Matches
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock size={12} />
            <span>Created: {requirement.created_at ? new Date(requirement.created_at).toLocaleDateString() : 'N/A'}</span>
            <span>•</span>
            <span>Updated: {requirement.updated_at ? new Date(requirement.updated_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original
                  setFormData({
                    role: requirement.role || '',
                    experience_min: requirement.experience_min || 0,
                    experience_max: requirement.experience_max || 0,
                    budget_min: requirement.budget_min || 0,
                    budget_max: requirement.budget_max || 0,
                    location: requirement.location || 'Bangalore',
                    skills: requirement.skills || requirement.must_have_skills || [],
                    description: requirement.description || '',
                    duration: requirement.duration || '6 Months',
                    work_mode: requirement.work_mode || 'Hybrid',
                    positions: requirement.positions || 1,
                    start_date: requirement.start_date || 'Immediate',
                    status: requirement.status || 'Open',
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}