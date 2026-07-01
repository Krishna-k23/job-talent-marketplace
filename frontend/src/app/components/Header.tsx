// Header.tsx - Updated with userRole support
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import {
  ChevronDown, Settings, LogOut, Search, Menu, User, Mail,
  Phone, Building2, Camera, Trash2, X, Sparkles, Bell,
  Shield, Award, ChevronRight, UserCircle, Briefcase,
  Star, Clock, CheckCircle, Zap, LayoutDashboard, FileText,
  Users, CreditCard, HelpCircle,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationPanel } from './NotificationPanel';
import { useToast } from '../contexts/ToastContext';

interface HeaderProps {
  onLogout?: () => void;
  onSettingsClick?: () => void;
  sidebarCollapsed?: boolean;
  onMobileMenuToggle?: () => void;
  currentPage?: string;
  userRole?: 'client' | 'vendor' | 'admin' | 'super_admin' | null; // ADD THIS
}

// Page configuration for breadcrumb - Updated with all roles
const pageConfig: Record<string, { label: string; icon: any; parent?: string }> = {
  // Client pages
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  search: { label: 'Search', icon: Search, parent: 'dashboard' },
  requirements: { label: 'Requirements', icon: FileText, parent: 'dashboard' },
  resources: { label: 'Resources', icon: Users, parent: 'dashboard' },
  billing: { label: 'Billing', icon: CreditCard, parent: 'dashboard' },
  settings: { label: 'Settings', icon: Settings, parent: 'dashboard' },
  help: { label: 'Help & Support', icon: HelpCircle, parent: 'settings' },
  
  // Vendor pages
  'vendor-dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  'vendor-resources': { label: 'Resources', icon: Users, parent: 'vendor-dashboard' },
  'vendor-contracts': { label: 'Contracts', icon: FileText, parent: 'vendor-dashboard' },
  
  // Admin pages
  'admin-dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  'admin-users': { label: 'Users', icon: Users, parent: 'admin-dashboard' },
  'admin-resources': { label: 'Resources', icon: FileText, parent: 'admin-dashboard' },
  'admin-requirements': { label: 'Requirements', icon: FileText, parent: 'admin-dashboard' },
  'admin-analytics': { label: 'Analytics', icon: BarChart3, parent: 'admin-dashboard' },
  'admin-settings': { label: 'Settings', icon: Settings, parent: 'admin-dashboard' },
  
  // Super Admin pages
  'superadmin-dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  'superadmin-users': { label: 'Users', icon: Users, parent: 'superadmin-dashboard' },
  'superadmin-system': { label: 'System', icon: Settings, parent: 'superadmin-dashboard' },
  'superadmin-payments': { label: 'Payments', icon: CreditCard, parent: 'superadmin-dashboard' },
};

export function Header({
  onLogout,
  onSettingsClick,
  sidebarCollapsed = false,
  onMobileMenuToggle,
  currentPage = 'dashboard',
  userRole = null, // ADD THIS
}: HeaderProps) {
  const { showSuccess, showError } = useToast();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', phone: '', company: '', role: '', profile_picture: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRoleState, setUserRoleState] = useState<'vendor' | 'client' | 'admin' | 'super_admin' | null>(userRole);
  const [editingUser, setEditingUser] = useState({ name: '', phone: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update userRole when prop changes
  useEffect(() => {
    setUserRoleState(userRole);
  }, [userRole]);

  // Get current page config - map page names to config keys
  const getPageKey = (page: string): string => {
    // Admin pages
    if (page === 'dashboard' && userRoleState === 'admin') return 'admin-dashboard';
    if (page === 'users' && userRoleState === 'admin') return 'admin-users';
    if (page === 'resources' && userRoleState === 'admin') return 'admin-resources';
    if (page === 'requirements' && userRoleState === 'admin') return 'admin-requirements';
    if (page === 'analytics' && userRoleState === 'admin') return 'admin-analytics';
    if (page === 'settings' && userRoleState === 'admin') return 'admin-settings';
    
    // Super Admin pages
    if (page === 'dashboard' && userRoleState === 'super_admin') return 'superadmin-dashboard';
    if (page === 'users' && userRoleState === 'super_admin') return 'superadmin-users';
    if (page === 'system' && userRoleState === 'super_admin') return 'superadmin-system';
    if (page === 'payments' && userRoleState === 'super_admin') return 'superadmin-payments';
    if (page === 'settings' && userRoleState === 'super_admin') return 'superadmin-settings';
    
    // Vendor pages
    if (page === 'dashboard' && userRoleState === 'vendor') return 'vendor-dashboard';
    if (page === 'resources' && userRoleState === 'vendor') return 'vendor-resources';
    if (page === 'contracts' && userRoleState === 'vendor') return 'vendor-contracts';
    
    return page;
  };

  const pageKey = getPageKey(currentPage);
  const currentPageConfig = pageConfig[pageKey] || pageConfig.dashboard;
  const parentPageConfig = currentPageConfig.parent ? pageConfig[currentPageConfig.parent] : null;

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && showSettingsModal) {
        setShowSettingsModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsModal]);

  // Fetch user data from API
  const fetchUser = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role') as 'vendor' | 'client' | 'admin' | 'super_admin' | null;
    if (role) setUserRoleState(role);

    if (!token) {
      setUser({ name: 'Guest', email: 'guest@example.com', phone: '', company: '', role: '', profile_picture: '' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/api/users/me');

      if (response.ok) {
        const userData = await response.json();

        let displayName = userData.full_name;
        if (!displayName || displayName === '') {
          displayName = userData.email ? userData.email.split('@')[0] : 'User';
        }

        const companyName = userData.company?.name || userData.company_name || '';

        setUser({
          name: displayName,
          email: userData.email || 'No email',
          phone: userData.phone || '',
          company: companyName,
          role: userData.role || role || '',
          profile_picture: userData.profile_picture || '',
        });

        setEditingUser({
          name: displayName,
          phone: userData.phone || '',
        });

        setProfileImage(userData.profile_picture || null);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser({ name: 'Guest', email: 'Please login again', phone: '', company: '', role: '', profile_picture: '' });
      } else {
        setError(true);
        setUser({ name: 'Error', email: 'Failed to load', phone: '', company: '', role: '', profile_picture: '' });
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError(true);
      setUser({ name: 'Error', email: 'Connection failed', phone: '', company: '', role: '', profile_picture: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      fetch('/api/notifications/?unread_only=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => setUnreadCount(Array.isArray(data) ? data.length : 0))
        .catch(() => { });
    }
  }, []);

  const getInitials = () => {
    if (loading) return '...';
    if (user.name && user.name !== '') {
      return user.name.charAt(0).toUpperCase();
    }
    if (user.email && user.email !== '') {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getAvatarGradient = () => {
    if (userRoleState === 'vendor') return 'from-green-500 to-emerald-600';
    if (userRoleState === 'admin') return 'from-indigo-500 to-purple-600';
    if (userRoleState === 'super_admin') return 'from-rose-500 to-pink-600';
    return 'from-blue-500 to-indigo-600';
  };

  const getShadowColor = () => {
    if (userRoleState === 'vendor') return 'shadow-green-500/40';
    if (userRoleState === 'admin') return 'shadow-indigo-500/40';
    if (userRoleState === 'super_admin') return 'shadow-rose-500/40';
    return 'shadow-blue-500/40';
  };

  const getRingColor = () => {
    if (userRoleState === 'vendor') return 'ring-green-100 dark:ring-green-900/50 group-hover:ring-green-200';
    if (userRoleState === 'admin') return 'ring-indigo-100 dark:ring-indigo-900/50 group-hover:ring-indigo-200';
    if (userRoleState === 'super_admin') return 'ring-rose-100 dark:ring-rose-900/50 group-hover:ring-rose-200';
    return 'ring-blue-100 dark:ring-blue-900/50 group-hover:ring-blue-200';
  };

  const getStatusColor = () => {
    if (userRoleState === 'vendor') return 'bg-green-500';
    if (userRoleState === 'admin') return 'bg-indigo-500';
    if (userRoleState === 'super_admin') return 'bg-rose-500';
    return 'bg-blue-500';
  };

  const getRoleBadge = () => {
    if (userRoleState === 'vendor') {
      return { label: 'Vendor', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    }
    if (userRoleState === 'admin') {
      return { label: 'Admin', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' };
    }
    if (userRoleState === 'super_admin') {
      return { label: 'Super Admin', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
    }
    return { label: 'Client', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('Image size should be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;

        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const response = await fetchWithAuth('/api/users/me/profile-picture', {
          method: 'PUT',
          body: JSON.stringify({ profile_picture: imageData }),
        });

        if (response.ok) {
          setProfileImage(imageData);
          setUser(prev => ({ ...prev, profile_picture: imageData }));
          showSuccess('Profile picture updated successfully!');
        } else {
          const error = await response.json();
          showError(error.detail || 'Failed to update profile picture');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      const response = await fetchWithAuth('/api/users/me/profile-picture', {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfileImage(null);
        setUser(prev => ({ ...prev, profile_picture: '' }));
        showSuccess('Profile picture removed successfully!');
      } else {
        showError('Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      showError('Error removing profile picture');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetchWithAuth('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: editingUser.name,
          phone: editingUser.phone,
        }),
      });

      if (response.ok) {
        setUser(prev => ({ ...prev, name: editingUser.name, phone: editingUser.phone }));
        setShowSettingsModal(false);
        showSuccess('Profile updated successfully!');
        fetchUser();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error updating profile');
    }
  };

  const handleSettingsClickWrapper = () => {
    setShowProfileDropdown(false);
    setShowSettingsModal(true);
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      <header
        className={`h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 z-40 transition-all duration-300 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 ${
          sidebarCollapsed ? 'md:left-16' : 'md:left-64'
        }`}
      >
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors mr-2 flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
        </button>

        {/* Left Section - Dynamic Breadcrumb */}
        <div className="flex-1 flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <Sparkles size={18} className={`${
              userRoleState === 'vendor' ? 'text-emerald-500' :
              userRoleState === 'admin' ? 'text-indigo-500' :
              userRoleState === 'super_admin' ? 'text-rose-500' :
              'text-blue-500'
            } animate-pulse`} />
            
            {/* Parent page (if exists) */}
            {parentPageConfig && (
              <>
                <span className={`text-sm font-medium ${
                  userRoleState === 'vendor' ? 'text-emerald-600 dark:text-emerald-400' :
                  userRoleState === 'admin' ? 'text-indigo-600 dark:text-indigo-400' :
                  userRoleState === 'super_admin' ? 'text-rose-600 dark:text-rose-400' :
                  'text-slate-600 dark:text-slate-400'
                } hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer`}>
                  {parentPageConfig.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
              </>
            )}
            
            {/* Current page */}
            <span className={`text-sm font-semibold ${
              userRoleState === 'vendor' ? 'text-emerald-700 dark:text-emerald-300' :
              userRoleState === 'admin' ? 'text-indigo-700 dark:text-indigo-300' :
              userRoleState === 'super_admin' ? 'text-rose-700 dark:text-rose-300' :
              'text-slate-800 dark:text-slate-200'
            } flex items-center gap-1.5`}>
              {currentPageConfig.icon && (
                <currentPageConfig.icon size={16} className={
                  userRoleState === 'vendor' ? 'text-emerald-500' :
                  userRoleState === 'admin' ? 'text-indigo-500' :
                  userRoleState === 'super_admin' ? 'text-rose-500' :
                  'text-blue-500'
                } />
              )}
              {currentPageConfig.label}
            </span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <NotificationPanel unreadCount={unreadCount} onCountChange={setUnreadCount} />

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>

          {/* User Profile - Enhanced */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center cursor-pointer gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl px-2.5 py-1.5 transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white font-semibold shadow-lg ${getShadowColor()} ring-2 ${getRingColor()} group-hover:ring-2 transition-all overflow-hidden`}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                {/* Online status dot */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getStatusColor()} rounded-full border-2 border-white dark:border-slate-900`}></div>
              </div>

              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  {loading ? 'Loading...' : (error ? 'Error' : user.name)}
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {loading ? 'Please wait...' : (error ? 'Check console' : user.email)}
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 hidden md:block ${showProfileDropdown ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white font-semibold shadow-lg ${getShadowColor()} text-xl overflow-hidden`}>
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        getInitials()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-base truncate">
                        {loading ? 'Loading...' : (error ? 'Error' : user.name)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {loading ? '...' : (error ? 'Failed to load' : user.email)}
                      </div>
                      {user.company && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Building2 size={12} className="text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.company}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-semibold ${roleBadge.color}`}>
                      {roleBadge.label}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={handleSettingsClickWrapper}
                    className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Settings size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-left">Profile Settings</span>
                    <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout?.();
                    }}
                    className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-950/50 transition-colors">
                      <LogOut size={16} className="text-red-600 dark:text-red-400" strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-left">Logout</span>
                    <ChevronRight size={16} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Signed in as {user.role || 'user'}</span>
                    <span>v2.0 • {userRoleState === 'vendor' ? 'Pro' : userRoleState === 'admin' ? 'Admin' : userRoleState === 'super_admin' ? 'Super' : 'Business'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal - Enhanced */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div ref={modalRef} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`relative bg-gradient-to-r ${
              userRoleState === 'vendor' ? 'from-green-600 to-emerald-600' :
              userRoleState === 'admin' ? 'from-indigo-600 to-purple-600' :
              userRoleState === 'super_admin' ? 'from-rose-600 to-pink-600' :
              'from-blue-600 to-indigo-600'
            } p-6 rounded-t-3xl`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 p-2 cursor-pointer hover:bg-white/20 rounded-xl transition-colors z-10"
                aria-label="Close settings"
              >
                <X size={20} className="text-white" />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <UserCircle size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                  <p className="text-white/80 text-sm">Manage your profile information</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-xl ${getShadowColor()}`}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                    <Camera size={16} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" disabled={uploading} />
                  </label>
                  {profileImage && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="absolute bottom-0 left-0 p-2 bg-red-600 rounded-xl hover:shadow-lg transition-all hover:scale-105"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  )}
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Uploading...</p>
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  Click camera to change, trash to remove
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <User size={14} className="inline mr-1.5 text-blue-500" /> Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mail size={14} className="inline mr-1.5 text-blue-500" /> Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Shield size={16} className="text-emerald-500" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <CheckCircle size={12} className="text-emerald-500" />
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Phone size={14} className="inline mr-1.5 text-blue-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Company/Organization */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Building2 size={14} className="inline mr-1.5 text-blue-500" /> Organization
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user.company || 'Not specified'}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Briefcase size={16} className="text-slate-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Organization from your profile</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${roleBadge.color}`}>
                    <Award size={16} />
                    {roleBadge.label}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {userRoleState === 'vendor' ? 'You can post requirements' :
                     userRoleState === 'admin' ? 'Full platform management' :
                     userRoleState === 'super_admin' ? 'Complete system control' :
                     'You can find resources'}
                  </span>
                </div>
              </div>

              {/* Last updated */}
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Clock size={12} />
                <span>Last updated: Today at 2:30 PM</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 cursor-pointer px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 cursor-pointer px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}