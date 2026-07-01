// app.tsx - Updated with Admin and Super Admin support
import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdminProvider } from './contexts/AdminContext';
import { LandingPageV2 } from './components/LandingPageV2';
import { LoginPage } from './components/LoginPage';
import { RoleSelectionAfterLogin } from './components/RoleSelectionAfterLogin';
import { HelpSupport } from './components/HelpSupport';
import { RoleBasedLoginPage } from './components/RoleBasedLoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { EnterOTPPage } from './components/EnterOTPPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { PasswordResetSuccessPage } from './components/PasswordResetSuccessPage';
import { SignupPage } from './components/SignupPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SearchResources } from './components/SearchResources';
import { Requirements } from './components/Requirements';
import { Resources } from './components/Resources';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { PostRequirement } from './components/PostRequirement';
import { VendorSidebar } from './components/vendor/VendorSidebar';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { VendorResources } from './components/vendor/VendorResources';
import { VendorContracts } from './components/vendor/VendorContracts';
import { ScrollToTop } from './components/ScrollToTop';
import { Chatbot } from './components/Chatbot';
import { apiPost, apiGet, isTokenExpired, getToken, clearAuthData } from '@/config/api';
import '../styles/index.css';

// Admin Imports
import AdminDashboard from '../app/admin/AdminDashboard';
import AdminUsers from '../app/admin/AdminUsers';
import AdminResources from '../app/admin/AdminResources';
import AdminRequirements from '../app/admin/AdminRequirements';
import AdminAnalytics from '../app/admin/AdminAnalytics';
import AdminSettings from '../app/admin/AdminSettings';
import AdminSidebar from '../app/admin/components/AdminSidebar';

// Super Admin Imports
import SuperAdminDashboard from '../app/superadmin/SuperAdminDashboard';
import SuperAdminUsers from '../app/superadmin/SuperAdminUsers';
import SuperAdminSystem from '../app/superadmin/SuperAdminSystem';
import SuperAdminPayments from '../app/superadmin/SuperAdminPayments';
import SuperAdminSidebar from '../app/superadmin/components/SuperAdminSidebar';
import SuperAdminSettings from '../app/superadmin/SuperAdminSettings';

type AuthFlow = 'landing' | 'login' | 'signup' | 'forgot-password' | 'enter-otp' | 'reset-password' | 'password-reset-success';

interface NavState {
  isLoggedIn: boolean;
  authFlow: AuthFlow;
  activePage: string;
  currentVendorPage: 'dashboard' | 'resources' | 'contracts';
  userRole: 'vendor' | 'client' | 'admin' | 'super_admin' | null;
  showRoleSelection: boolean;
}

// Wrapper component that provides Theme, Toast, and Admin contexts
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminProvider>
          {children}
        </AdminProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper functions for localStorage persistence
const saveStateToLocalStorage = (state: NavState) => {
  try {
    localStorage.setItem('app_nav_state', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
};

const loadStateFromLocalStorage = (): NavState | null => {
  try {
    const saved = localStorage.getItem('app_nav_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return null;
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return !!token;
};

export default function App() {
  // Initialize state from localStorage on page load
  const getInitialState = (): {
    isLoggedIn: boolean;
    authFlow: AuthFlow;
    activePage: string;
    currentVendorPage: 'dashboard' | 'resources' | 'contracts';
    userRole: 'vendor' | 'client' | 'admin' | 'super_admin' | null;
    showRoleSelection: boolean;
    userEmail: string;
  } => {
    // Check token first
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const savedState = loadStateFromLocalStorage();
    const savedRole = localStorage.getItem('user_role') as 'vendor' | 'client' | 'admin' | 'super_admin' | null;

    if (token && savedState && savedState.isLoggedIn) {
      // User was logged in before refresh
      return {
        isLoggedIn: true,
        authFlow: savedState.authFlow || 'landing',
        activePage: savedState.activePage || 'dashboard',
        currentVendorPage: savedState.currentVendorPage || 'dashboard',
        userRole: savedState.userRole || savedRole,
        showRoleSelection: savedState.showRoleSelection || false,
        userEmail: localStorage.getItem('user_email') || '',
      };
    } else if (token) {
      // Has token but no saved state - user was logged in
      return {
        isLoggedIn: true,
        authFlow: 'landing',
        activePage: 'dashboard',
        currentVendorPage: 'dashboard',
        userRole: savedRole,
        showRoleSelection: !savedRole,
        userEmail: localStorage.getItem('user_email') || '',
      };
    }

    // Not logged in
    if (savedState && !savedState.isLoggedIn) {
      return {
        isLoggedIn: false,
        authFlow: savedState.authFlow || 'landing',
        activePage: 'dashboard',
        currentVendorPage: 'dashboard',
        userRole: null,
        showRoleSelection: false,
        userEmail: '',
      };
    }

    return {
      isLoggedIn: false,
      authFlow: 'landing',
      activePage: 'dashboard',
      currentVendorPage: 'dashboard',
      userRole: null,
      showRoleSelection: false,
      userEmail: '',
    };
  };

  const initialState = getInitialState();

  const [isLoggedIn, setIsLoggedIn] = useState(initialState.isLoggedIn);
  const [authFlow, setAuthFlow] = useState<AuthFlow>(initialState.authFlow);
  const [resetEmail, setResetEmail] = useState('');
  const [userRole, setUserRole] = useState<'vendor' | 'client' | 'admin' | 'super_admin' | null>(initialState.userRole);
  const [showRoleSelection, setShowRoleSelection] = useState(initialState.showRoleSelection);
  const [activePage, setActivePage] = useState(initialState.activePage);
  const [showPostRequirement, setShowPostRequirement] = useState(false);
  const [searchFilters, setSearchFilters] = useState<{ jobId?: string; matchCount?: number }>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentVendorPage, setCurrentVendorPage] = useState<'dashboard' | 'resources' | 'contracts'>(initialState.currentVendorPage);
  const [vendorSidebarCollapsed, setVendorSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialState.userEmail);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Admin state
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [adminMobileSidebarOpen, setAdminMobileSidebarOpen] = useState(false);
  const [adminActivePage, setAdminActivePage] = useState('dashboard');
  
  // Super Admin state
  const [superAdminSidebarCollapsed, setSuperAdminSidebarCollapsed] = useState(false);
  const [superAdminMobileSidebarOpen, setSuperAdminMobileSidebarOpen] = useState(false);
  const [superAdminActivePage, setSuperAdminActivePage] = useState('dashboard');

  const navRef = useRef<NavState>({
    isLoggedIn: initialState.isLoggedIn,
    authFlow: initialState.authFlow,
    activePage: initialState.activePage,
    currentVendorPage: initialState.currentVendorPage,
    userRole: initialState.userRole,
    showRoleSelection: initialState.showRoleSelection
  });

  // Update ref when state changes
  useEffect(() => {
    navRef.current = { isLoggedIn, authFlow, activePage, currentVendorPage, userRole, showRoleSelection };
    saveStateToLocalStorage(navRef.current);
  }, [isLoggedIn, authFlow, activePage, currentVendorPage, userRole, showRoleSelection]);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      if (isNavigating) return;

      const token = getToken();
      const isAuth = !!token;

      if (!isInitialized) return;

      if (!e.state) {
        if (isAuth) {
          return;
        }
        return;
      }

      const s = e.state as NavState;

      if (isAuth && (s.authFlow === 'login' || s.authFlow === 'signup' || s.authFlow === 'landing' || s.authFlow === 'forgot-password')) {
        return;
      }

      if (isAuth && s.showRoleSelection === true && userRole !== null) {
        return;
      }

      const loggedIn = s.isLoggedIn && isAuth;
      setIsLoggedIn(loggedIn);
      setAuthFlow(loggedIn ? (s.authFlow ?? 'landing') : 'landing');
      setActivePage(s.activePage ?? 'dashboard');
      setCurrentVendorPage(s.currentVendorPage ?? 'dashboard');
      setUserRole(loggedIn ? (s.userRole ?? null) : null);
      setShowRoleSelection(s.showRoleSelection ?? false);
      setIsMobileSidebarOpen(false);
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [userRole, isInitialized, isNavigating]);

  // Initialize history on mount
  useEffect(() => {
    const token = getToken();
    const isAuth = !!token;

    if (isAuth && userRole) {
      const currentState = {
        isLoggedIn: true,
        authFlow: 'landing',
        activePage: activePage,
        currentVendorPage: currentVendorPage,
        userRole: userRole,
        showRoleSelection: false
      };
      window.history.replaceState(currentState, '', window.location.href);
    } else if (isAuth && showRoleSelection) {
      const currentState = {
        isLoggedIn: true,
        authFlow: 'landing',
        activePage: 'dashboard',
        currentVendorPage: 'dashboard',
        userRole: null,
        showRoleSelection: true
      };
      window.history.replaceState(currentState, '', window.location.href);
    } else if (!isAuth) {
      const currentState = {
        isLoggedIn: false,
        authFlow: authFlow,
        activePage: 'dashboard',
        currentVendorPage: 'dashboard',
        userRole: null,
        showRoleSelection: false
      };
      window.history.replaceState(currentState, '', window.location.href);
    }

    setIsInitialized(true);
  }, []);

  // Security: Check authentication
  useEffect(() => {
    if (isLoggedIn && !isAuthenticated()) {
      handleLogout();
    }
  }, [isLoggedIn]);

  const navigate = (updates: Partial<NavState>) => {
    const next: NavState = { ...navRef.current, ...updates };

    const token = getToken();
    if (token && (next.authFlow === 'login' || next.authFlow === 'signup' || next.authFlow === 'landing')) {
      return;
    }

    setIsNavigating(true);
    window.history.pushState(next, '');
    if (updates.isLoggedIn !== undefined) setIsLoggedIn(updates.isLoggedIn);
    if (updates.authFlow !== undefined) setAuthFlow(updates.authFlow);
    if (updates.activePage !== undefined) setActivePage(updates.activePage);
    if (updates.currentVendorPage !== undefined) setCurrentVendorPage(updates.currentVendorPage);
    if (updates.userRole !== undefined) setUserRole(updates.userRole);
    if (updates.showRoleSelection !== undefined) setShowRoleSelection(updates.showRoleSelection);

    setTimeout(() => setIsNavigating(false), 100);
  };

  const isTokenValid = (): boolean => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (exp) {
        const now = Math.floor(Date.now() / 1000);
        return now < exp;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (!isAuthenticated() || !isTokenValid()) {
        handleLogout();
        setAuthFlow('login');
      }
    }
  }, [isLoggedIn]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const data = await apiPost('/auth/login', { email, password });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      if (data.role) {
        localStorage.setItem('user_role', data.role);
        sessionStorage.setItem('userRole', data.role);
        sessionStorage.setItem('user', JSON.stringify({ email, role: data.role }));
      }

      try {
        const userData = await apiGet('/users/me');
        setUserEmail(userData.email);
        localStorage.setItem('user_email', userData.email);
      } catch (err) {
        console.error('Failed to get user info:', err);
      }

      const userRole = data.role || null;

      setIsLoggedIn(true);
      setUserRole(userRole);
      setAuthFlow('landing');

      if (userRole) {
        setShowRoleSelection(false);
        setActivePage('dashboard');

        const newState = {
          isLoggedIn: true,
          authFlow: 'landing',
          activePage: 'dashboard',
          currentVendorPage: 'dashboard',
          userRole: userRole,
          showRoleSelection: false
        };
        window.history.replaceState(newState, '', window.location.href);
      } else {
        setShowRoleSelection(true);

        const newState = {
          isLoggedIn: true,
          authFlow: 'landing',
          activePage: 'dashboard',
          currentVendorPage: 'dashboard',
          userRole: null,
          showRoleSelection: true
        };
        window.history.replaceState(newState, '', window.location.href);
      }

      return { success: true, role: userRole };
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.message.includes('Incorrect email or password')) {
        alert('Invalid credentials. Please check your email and password.');
      } else {
        alert(error.message || 'Cannot reach server. Make sure the backend is running on port 8000.');
      }
      return { success: false };
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        clearAuthData();
        setAuthFlow('login');
        setShowRoleSelection(false);
        setIsLoggedIn(false);
      }
    }
  }, [isLoggedIn]);

  const handleRoleSelection = (role: 'vendor' | 'client') => {
    const storedUser = sessionStorage.getItem('user');
    let actualRole = userRole;

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        actualRole = userData.role;
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }

    if (actualRole && actualRole !== role) {
      const errorMsg = actualRole === 'client'
        ? "You are registered as a client. Please continue as Client."
        : "You are registered as a vendor. Please continue as Vendor.";

      alert(errorMsg);
      return;
    }

    localStorage.setItem('user_role', role);

    setUserRole(role);
    setShowRoleSelection(false);
    setActivePage('dashboard');

    const newState = {
      isLoggedIn: true,
      authFlow: 'landing',
      activePage: 'dashboard',
      currentVendorPage: 'dashboard',
      userRole: role,
      showRoleSelection: false
    };
    window.history.replaceState(newState, '', window.location.href);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('app_nav_state');
    setUserEmail('');
    window.location.href = '/';
  };

  const handleClientPageChange = (page: string) => {
    if (activePage === page) return;
    setActivePage(page);
    const currentState = { ...navRef.current, activePage: page };
    window.history.replaceState(currentState, '', window.location.href);
  };

  const handleSettingsClick = () => {
    if (activePage === 'settings') return;
    setActivePage('settings');
    const currentState = { ...navRef.current, activePage: 'settings' };
    window.history.replaceState(currentState, '', window.location.href);
  };

  const handleViewMatches = (jobId: string, matchCount: number) => {
    setSearchFilters({ jobId, matchCount });
    setActivePage('search');
    const currentState = { ...navRef.current, activePage: 'search' };
    window.history.replaceState(currentState, '', window.location.href);
  };

  const handleCreateNewRequirement = () => {
    setActivePage('post-requirement');
    setShowPostRequirement(true);
    const currentState = { ...navRef.current, activePage: 'post-requirement' };
    window.history.replaceState(currentState, '', window.location.href);
  };

  const handleVendorPageChange = (page: 'dashboard' | 'resources' | 'contracts') => {
    if (currentVendorPage === page) return;
    setCurrentVendorPage(page);
    const currentState = { ...navRef.current, currentVendorPage: page };
    window.history.replaceState(currentState, '', window.location.href);
  };

  // Admin handlers
  const handleAdminPageChange = (page: string) => {
    if (adminActivePage === page) return;
    setAdminActivePage(page);
  };

  const handleAdminSettingsClick = () => {
    setAdminActivePage('settings');
  };

  // Super Admin handlers
  const handleSuperAdminPageChange = (page: string) => {
    if (superAdminActivePage === page) return;
    setSuperAdminActivePage(page);
  };

  const handleSuperAdminSettingsClick = () => {
    setSuperAdminActivePage('settings');
  };

  const handleForgotPassword = () => navigate({ authFlow: 'forgot-password' });
  const handleSignup = () => navigate({ authFlow: 'signup' });
  const handleBackToLogin = () => navigate({ authFlow: 'login' });
  const handleLandingLogin = () => navigate({ authFlow: 'login' });
  const handleLandingGetStarted = () => navigate({ authFlow: 'signup' });
  const handleBackToHome = () => navigate({ authFlow: 'landing' });
  const handleSignupComplete = () => navigate({ authFlow: 'login' });

  const handleSendResetCode = (email: string) => {
    setResetEmail(email);
    navigate({ authFlow: 'enter-otp' });
  };

  const handleVerifyOTP = (code: string) => {
    console.log('OTP verified:', code);
    navigate({ authFlow: 'reset-password' });
  };

  const handleResendCode = () => {
    console.log('Resending code to:', resetEmail);
  };

  const handleResetPassword = (_password: string) => {
    navigate({ authFlow: 'password-reset-success' });
  };

  // Function to render the appropriate content based on state
  const renderContent = () => {
    // Auth screens (not logged in)
    if (!isLoggedIn) {
      if (authFlow === 'landing') {
        return <LandingPageV2 onLoginClick={handleLandingLogin} onGetStartedClick={handleLandingGetStarted} />;
      }
      if (authFlow === 'login') {
        return (
          <div>
            <LoginPage
              onLogin={handleLogin}
              onForgotPassword={handleForgotPassword}
              onSignup={handleSignup}
              onBackToHome={handleBackToHome}
            />
            <Chatbot
              isLoggedIn={false}
              userRole={null}
              onLoginClick={handleLandingLogin}
              onSignupClick={handleLandingGetStarted}
            />
          </div>
        );
      }
      if (authFlow === 'signup') {
        return (
          <div>
            <SignupPage onSignup={handleSignupComplete} onBackToLogin={handleBackToLogin} onBackToHome={handleBackToHome} />
            <Chatbot
              isLoggedIn={false}
              userRole={null}
              onLoginClick={handleLandingLogin}
              onSignupClick={handleLandingGetStarted}
            />
          </div>
        );
      }
      if (authFlow === 'forgot-password') {
        return (
          <div>
            <ForgotPasswordPage onBackToLogin={handleBackToLogin} onSendCode={handleSendResetCode} />
            <Chatbot
              isLoggedIn={false}
              userRole={null}
              onLoginClick={handleLandingLogin}
              onSignupClick={handleLandingGetStarted}
            />
          </div>
        );
      }
      if (authFlow === 'enter-otp') {
        return (
          <div>
            <EnterOTPPage
              email={resetEmail}
              onVerifyCode={handleVerifyOTP}
              onResendCode={handleResendCode}
              onBackToLogin={handleBackToLogin}
            />
            <Chatbot
              isLoggedIn={false}
              userRole={null}
              onLoginClick={handleLandingLogin}
              onSignupClick={handleLandingGetStarted}
            />
          </div>
        );
      }
      if (authFlow === 'reset-password') {
        return (
          <div>
            <ResetPasswordPage onBackToLogin={handleBackToLogin} onResetPassword={handleResetPassword} />
            <Chatbot
              isLoggedIn={false}
              userRole={null}
              onLoginClick={handleLandingLogin}
              onSignupClick={handleLandingGetStarted}
            />
          </div>
        );
      }
      if (authFlow === 'password-reset-success') {
        return (
          <div>
            <PasswordResetSuccessPage onBackToLogin={handleBackToLogin} />
            <Chatbot
              isLoggedIn={false}
              userRole={null}
              onLoginClick={handleLandingLogin}
              onSignupClick={handleLandingGetStarted}
            />
          </div>
        );
      }
    }

    // Role selection after login
    if (isLoggedIn && showRoleSelection) {
      return (
        <>
          <RoleSelectionAfterLogin
            onSelectRole={handleRoleSelection}
            onLogout={handleLogout}
            userEmail={userEmail}
          />
          <Chatbot
            isLoggedIn={true}
            userRole={null}
            onLoginClick={handleLandingLogin}
            onSignupClick={handleLandingGetStarted}
          />
        </>
      );
    }

    // ==================== ADMIN PORTAL ====================
    if (userRole === 'admin') {
      return (
        <div className="min-h-screen bg-background">
          <AdminSidebar
            activePage={adminActivePage}
            onPageChange={handleAdminPageChange}
            isCollapsed={adminSidebarCollapsed}
            onToggleCollapse={() => setAdminSidebarCollapsed(!adminSidebarCollapsed)}
            isMobileOpen={adminMobileSidebarOpen}
            onMobileClose={() => setAdminMobileSidebarOpen(false)}
          />
          <Header
            onLogout={handleLogout}
            onSettingsClick={handleAdminSettingsClick}
            sidebarCollapsed={adminSidebarCollapsed}
            onMobileMenuToggle={() => setAdminMobileSidebarOpen(!adminMobileSidebarOpen)}
            currentPage={adminActivePage}
            userRole="admin"
          />

          <main className={`min-h-screen pt-16 md:pt-20 transition-all duration-300 ${adminSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <div className="p-4 md:p-8 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
              {adminActivePage === 'dashboard' && <AdminDashboard />}
              {adminActivePage === 'users' && <AdminUsers />}
              {adminActivePage === 'resources' && <AdminResources />}
              {adminActivePage === 'requirements' && <AdminRequirements />}
              {adminActivePage === 'analytics' && <AdminAnalytics />}
              {adminActivePage === 'settings' && <AdminSettings />}
            </div>
          </main>

          <ScrollToTop />
          <Chatbot
            isLoggedIn={true}
            userRole={userRole}
            onLoginClick={handleLandingLogin}
            onSignupClick={handleLandingGetStarted}
          />
        </div>
      );
    }

    // ==================== SUPER ADMIN PORTAL ====================
    if (userRole === 'super_admin') {
      return (
        <div className="min-h-screen bg-background">
          <SuperAdminSidebar
            activePage={superAdminActivePage}
            onPageChange={handleSuperAdminPageChange}
            isCollapsed={superAdminSidebarCollapsed}
            onToggleCollapse={() => setSuperAdminSidebarCollapsed(!superAdminSidebarCollapsed)}
            isMobileOpen={superAdminMobileSidebarOpen}
            onMobileClose={() => setSuperAdminMobileSidebarOpen(false)}
          />
          <Header
            onLogout={handleLogout}
            onSettingsClick={handleSuperAdminSettingsClick}
            sidebarCollapsed={superAdminSidebarCollapsed}
            onMobileMenuToggle={() => setSuperAdminMobileSidebarOpen(!superAdminMobileSidebarOpen)}
            currentPage={superAdminActivePage}
            userRole="super_admin"
          />

          <main className={`min-h-screen pt-16 md:pt-20 transition-all duration-300 ${superAdminSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <div className="p-4 md:p-8 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
              {superAdminActivePage === 'dashboard' && <SuperAdminDashboard />}
              {superAdminActivePage === 'users' && <SuperAdminUsers />}
              {superAdminActivePage === 'system' && <SuperAdminSystem />}
              {superAdminActivePage === 'payments' && <SuperAdminPayments />}
              {superAdminActivePage === 'settings' && <SuperAdminSettings />}
            </div>
          </main>

          <ScrollToTop />
          <Chatbot
            isLoggedIn={true}
            userRole={userRole}
            onLoginClick={handleLandingLogin}
            onSignupClick={handleLandingGetStarted}
          />
        </div>
      );
    }

    // ==================== VENDOR PORTAL ====================
    if (userRole === 'vendor') {
      return (
        <div className="min-h-screen bg-background">
          <VendorSidebar
            currentPage={currentVendorPage}
            onNavigate={handleVendorPageChange}
            isCollapsed={vendorSidebarCollapsed}
            onToggleCollapse={() => setVendorSidebarCollapsed(!vendorSidebarCollapsed)}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
          <Header
            onLogout={handleLogout}
            onSettingsClick={handleSettingsClick}
            sidebarCollapsed={vendorSidebarCollapsed}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            currentPage={currentVendorPage}
            userRole="vendor"
          />

          <main className={`min-h-screen pt-16 md:pt-20 transition-all duration-300 ${vendorSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <div className="p-4 md:p-8 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
              {currentVendorPage === 'dashboard' && (
                <VendorDashboard onNavigate={handleVendorPageChange} />
              )}
              {currentVendorPage === 'resources' && <VendorResources />}
              {currentVendorPage === 'contracts' && <VendorContracts />}
            </div>
          </main>

          <ScrollToTop />
          <Chatbot
            isLoggedIn={true}
            userRole={userRole}
            onLoginClick={handleLandingLogin}
            onSignupClick={handleLandingGetStarted}
          />
        </div>
      );
    }

    // ==================== CLIENT PORTAL ====================
    if (userRole === 'client') {
      return (
        <div className="min-h-screen bg-background">
          <Sidebar
            activePage={activePage}
            onPageChange={handleClientPageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
          <Header
            onLogout={handleLogout}
            onSettingsClick={handleSettingsClick}
            sidebarCollapsed={isSidebarCollapsed}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            currentPage={activePage}
            userRole="client"
          />

          <main className={`min-h-screen pt-16 md:pt-20 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <div className="p-4 md:p-8 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
              {activePage === 'dashboard' && <Dashboard onViewMatches={handleViewMatches} />}
              {activePage === 'search' && (
                <SearchResources
                  preFilteredJobId={searchFilters.jobId}
                  preFilteredCount={searchFilters.matchCount}
                />
              )}
              {(activePage === 'post-requirement' || showPostRequirement) && (
                <PostRequirement
                  onClose={() => {
                    setShowPostRequirement(false);
                    setActivePage('dashboard');
                    const currentState = { ...navRef.current, activePage: 'dashboard' };
                    window.history.replaceState(currentState, '', window.location.href);
                  }}
                />
              )}
              {activePage === 'requirements' && (
                <Requirements onViewMatches={handleViewMatches} onCreateNew={handleCreateNewRequirement} />
              )}
              {activePage === 'resources' && <Resources />}
              {activePage === 'billing' && <Billing />}
              {activePage === 'settings' && <Settings />}
              {activePage === 'help' && <HelpSupport />}
            </div>
          </main>

          <ScrollToTop />
          <Chatbot
            isLoggedIn={true}
            userRole={userRole}
            onLoginClick={handleLandingLogin}
            onSignupClick={handleLandingGetStarted}
          />
        </div>
      );
    }

    return null;
  };

  // Wrap everything with providers
  return (
    <AppProviders>
      {renderContent()}
    </AppProviders>
  );
}