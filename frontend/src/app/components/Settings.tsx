// Settings.tsx - Ultra Premium Enhanced Version
import { useEffect, useState } from 'react';
import { 
  Bell, Shield, CreditCard, User, Building2, Save, Loader2, 
  Sparkles, Mail, Phone, Briefcase, Globe, MapPin, 
  Lock, Key, UserCheck, Award, TrendingUp, Clock,
  CheckCircle, ChevronRight, Edit2, Camera, FileText
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface CompanyData {
  name: string;
  website: string;
  industry: string;
  description: string;
  size?: string;
  location?: string;
}

interface UserData {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string;
  role?: string;
  company_id?: number;
  company?: CompanyData;
}

export function Settings() {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<UserData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    company: {
      name: '',
      website: '',
      industry: '',
      description: '',
      location: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security'>('profile');

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

  // Fetch user data on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setFetching(true);
        const response = await fetchWithAuth('/api/users/me');

        if (response.ok) {
          const data = await response.json();
          
          console.log('User data received:', data);
          
          const fullName = data.full_name || '';
          const nameParts = fullName.split(' ');
          const firstName = data.first_name || nameParts[0] || '';
          const lastName = data.last_name || nameParts.slice(1).join(' ') || '';
          
          const companyData = data.company || {};
          
          setFormData({
            id: data.id,
            first_name: firstName,
            last_name: lastName,
            email: data.email || '',
            phone: data.phone || '',
            designation: data.designation || '',
            role: data.role || '',
            company_id: data.company_id || companyData.id,
            company: {
              name: companyData.name || data.company_name || '',
              website: companyData.website || data.website || '',
              industry: companyData.industry || data.industry || '',
              description: companyData.description || data.description || '',
              size: companyData.size || data.company_size || '',
              location: companyData.location || data.location || '',
            }
          });
        } else {
          const error = await response.json();
          showError(error.detail || 'Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        showError('Failed to load user data');
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, []);

  // Update user profile
  const handleSave = async () => {
    setLoading(true);
    
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        phone: formData.phone,
        designation: formData.designation,
        company: {
          name: formData.company?.name || '',
          website: formData.company?.website || '',
          industry: formData.company?.industry || '',
          description: formData.company?.description || '',
          location: formData.company?.location || '',
        }
      };

      const response = await fetchWithAuth('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Update response:', data);
        
        const companyData = data.company || {};
        const fullName = data.full_name || '';
        const nameParts = fullName.split(' ');
        
        setFormData({
          ...formData,
          first_name: data.first_name || nameParts[0] || formData.first_name,
          last_name: data.last_name || nameParts.slice(1).join(' ') || formData.last_name,
          email: data.email || formData.email,
          phone: data.phone || formData.phone,
          designation: data.designation || formData.designation,
          company: {
            name: companyData.name || data.company_name || formData.company?.name || '',
            website: companyData.website || data.website || formData.company?.website || '',
            industry: companyData.industry || data.industry || formData.company?.industry || '',
            description: companyData.description || data.description || formData.company?.description || '',
            location: companyData.location || data.location || formData.company?.location || '',
          }
        });
        
        showSuccess('Profile updated successfully!');
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Loading settings...</p>
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
              <span className="text-blue-100 text-xs font-medium">Account Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Settings
            </h1>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
              <UserCheck size={14} />
              <span>Manage your account preferences and settings</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {formData.role && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
                <Award size={16} className="text-yellow-300" />
                <span className="text-sm font-medium">Role:</span>
                <span className="text-sm font-bold bg-white/20 px-3 py-0.5 rounded-full">
                  {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-800/80 rounded-2xl p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'company', label: 'Company', icon: Building2 },
          { id: 'security', label: 'Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Profile Information</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal information</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {formData.first_name?.charAt(0)}{formData.last_name?.charAt(0)}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera size={14} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {formData.first_name} {formData.last_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formData.designation || 'No designation set'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <User size={14} className="inline mr-1.5 text-blue-500" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="First name"
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <User size={14} className="inline mr-1.5 text-blue-500" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Last name"
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Briefcase size={14} className="inline mr-1.5 text-blue-500" />
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Senior Developer, Team Lead"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Mail size={14} className="inline mr-1.5 text-blue-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full h-11 px-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      disabled
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle size={16} className="text-emerald-500" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                    <Lock size={12} className="text-emerald-500" />
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Phone size={14} className="inline mr-1.5 text-blue-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Company Section */}
          {activeTab === 'company' && (
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Company Profile</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your company information</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Building2 size={14} className="inline mr-1.5 text-blue-500" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      company: { ...formData.company!, name: e.target.value } 
                    })}
                    placeholder="Enter company name"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Globe size={14} className="inline mr-1.5 text-blue-500" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.company?.website || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      company: { ...formData.company!, website: e.target.value } 
                    })}
                    placeholder="https://example.com"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <MapPin size={14} className="inline mr-1.5 text-blue-500" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.company?.location || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      company: { ...formData.company!, location: e.target.value } 
                    })}
                    placeholder="City, Country"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Briefcase size={14} className="inline mr-1.5 text-blue-500" />
                    Industry
                  </label>
                  <select
                    value={formData.company?.industry || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      company: { ...formData.company!, industry: e.target.value } 
                    })}
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <FileText size={14} className="inline mr-1.5 text-blue-500" />
                    Company Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.company?.description || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      company: { ...formData.company!, description: e.target.value } 
                    })}
                    placeholder="Tell us about your company..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Security Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
                      <Key size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Change Password</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center">
                      <Lock size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Enabled</span>
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center">
                      <Clock size={18} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Session Management</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">View and manage active sessions</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
                      <Bell size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Security Alerts</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Configure security notification preferences</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-6 rounded-full bg-blue-600 relative cursor-pointer transition-colors">
                      <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl flex items-center justify-center">
                <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Account Overview</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-sm text-slate-500 dark:text-slate-400">Account Type</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1) || 'User'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-sm text-slate-500 dark:text-slate-400">Company</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {formData.company?.name || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-sm text-slate-500 dark:text-slate-400">Designation</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {formData.designation || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Member Since</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Jan 2024</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-200" />
              <span className="text-blue-100 text-sm font-medium">Account Stats</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-blue-100 text-sm">Total Requirements</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-blue-100 text-sm">Saved Resources</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-blue-100 text-sm">Active Sessions</span>
                <span className="font-bold text-lg">1</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}