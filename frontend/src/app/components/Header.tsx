import { useState, useEffect } from 'react';
import { ChevronDown, Settings, LogOut, Search, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  onLogout?: () => void;
  onSettingsClick?: () => void;
  sidebarCollapsed?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Header({
  onLogout,
  onSettingsClick,
  sidebarCollapsed = false,
  onMobileMenuToggle,
}: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      // Check for both possible token keys
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      console.log('Token found:', token ? 'Yes' : 'No');

      if (!token) {
        console.log('No token found, using fallback');
        setUser({ name: 'Guest', email: 'guest@example.com' });
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user from API...');
        const response = await fetch('/api/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('API Response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);

          let displayName = userData.full_name;
          if (!displayName || displayName === '') {
            displayName = userData.email ? userData.email.split('@')[0] : 'User';
          }

          setUser({
            name: displayName,
            email: userData.email || 'No email'
          });
        } else if (response.status === 401) {
          console.log('Unauthorized - token may be expired');
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser({ name: 'Guest', email: 'Please login again' });
        } else {
          const errorData = await response.text();
          console.error('API error:', response.status, errorData);
          setError(true);
          setUser({ name: 'Error', email: 'Failed to load' });
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(true);
        setUser({ name: 'Error', email: 'Connection failed' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Seed initial unread count without opening the panel
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      fetch('/api/notifications/?unread_only=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => setUnreadCount(Array.isArray(data) ? data.length : 0))
        .catch(() => {});
    }
  }, []);

  // Get initials for avatar
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

  return (
    <header className={`h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 z-40 transition-all duration-300 shadow-sm left-0 ${sidebarCollapsed ? 'md:left-20' : 'md:left-64'}`}>
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors mr-2 flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={22} className="text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
      </button>

      {/* Left Section - Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full h-10 md:h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <NotificationPanel unreadCount={unreadCount} onCountChange={setUnreadCount} />

        {/* Divider */}
        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-3 py-2.5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 ring-2 ring-blue-100 dark:ring-blue-900/50 group-hover:ring-blue-200 dark:group-hover:ring-blue-800/50 transition-all">
              {getInitials()}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {loading ? 'Loading...' : (error ? 'Error' : user.name)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {loading ? 'Please wait...' : (error ? 'Check console' : user.email)}
              </div>
            </div>
            <ChevronDown size={18} className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 hidden md:block ${showProfileDropdown ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </button>

          {showProfileDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileDropdown(false)}
              ></div>
              <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 text-lg">
                      {getInitials()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {loading ? 'Loading...' : (error ? 'Error' : user.name)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {loading ? '...' : (error ? 'Failed to load' : user.email)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onSettingsClick?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Settings size={18} className="text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
                    </div>
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                      <LogOut size={18} className="text-red-600 dark:text-red-400" strokeWidth={2.5} />
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}