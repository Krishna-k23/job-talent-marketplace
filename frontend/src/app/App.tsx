import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPageV2 } from './components/LandingPageV2';
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

type AuthFlow = 'landing' | 'login' | 'signup' | 'forgot-password' | 'enter-otp' | 'reset-password' | 'password-reset-success';

interface NavState {
  isLoggedIn: boolean;
  authFlow: AuthFlow;
  activePage: string;
  currentVendorPage: 'dashboard' | 'resources' | 'contracts';
  userRole: 'vendor' | 'client' | null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>('landing');
  const [resetEmail, setResetEmail] = useState('');
  const [userRole, setUserRole] = useState<'vendor' | 'client' | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showPostRequirement, setShowPostRequirement] = useState(false);
  const [searchFilters, setSearchFilters] = useState<{ jobId?: string; matchCount?: number }>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentVendorPage, setCurrentVendorPage] = useState<'dashboard' | 'resources' | 'contracts'>('dashboard');
  const [vendorSidebarCollapsed, setVendorSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Ref to always have current nav state for history pushes
  const navRef = useRef<NavState>({ isLoggedIn: false, authFlow: 'landing', activePage: 'dashboard', currentVendorPage: 'dashboard', userRole: null });
  useEffect(() => {
    navRef.current = { isLoggedIn, authFlow, activePage, currentVendorPage, userRole };
  }, [isLoggedIn, authFlow, activePage, currentVendorPage, userRole]);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  // ── Browser history: stamp initial state on first load ──────
  useEffect(() => {
    window.history.replaceState(navRef.current, '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Browser back / forward ───────────────────────────────────
  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      if (!e.state) return;
      const s = e.state as NavState;
      const token = getToken();
      // Guard: if history says logged-in but token is gone, show landing
      const loggedIn = s.isLoggedIn && !!token;
      setIsLoggedIn(loggedIn);
      setAuthFlow(loggedIn ? (s.authFlow ?? 'landing') : 'landing');
      setActivePage(s.activePage ?? 'dashboard');
      setCurrentVendorPage(s.currentVendorPage ?? 'dashboard');
      setUserRole(loggedIn ? (s.userRole ?? null) : null);
      setIsMobileSidebarOpen(false);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Helper: update state and push a history entry
  const navigate = (updates: Partial<NavState>) => {
    const next: NavState = { ...navRef.current, ...updates };
    window.history.pushState(next, '');
    if (updates.isLoggedIn !== undefined) setIsLoggedIn(updates.isLoggedIn);
    if (updates.authFlow !== undefined) setAuthFlow(updates.authFlow);
    if (updates.activePage !== undefined) setActivePage(updates.activePage);
    if (updates.currentVendorPage !== undefined) setCurrentVendorPage(updates.currentVendorPage);
    if (updates.userRole !== undefined) setUserRole(updates.userRole);
  };

  // ── Login / Logout ───────────────────────────────────────────
  const handleLogin = async (email: string, password: string, role: 'client' | 'vendor') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        let errorMsg = 'Login failed';
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch {}
        alert(errorMsg);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_role', role);

      navigate({ isLoggedIn: true, userRole: role, activePage: 'dashboard', currentVendorPage: 'dashboard' });
    } catch (error) {
      console.error('Login error:', error);
      alert('Cannot reach server. Make sure the backend is running on port 8000.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate({ isLoggedIn: false, authFlow: 'landing', activePage: 'dashboard', currentVendorPage: 'dashboard', userRole: null });
  };

  // ── Client navigation ────────────────────────────────────────
  const handleClientPageChange = (page: string) => {
    navigate({ activePage: page });
  };

  const handleSettingsClick = () => {
    navigate({ activePage: 'settings' });
  };

  const handleViewMatches = (jobId: string, matchCount: number) => {
    setSearchFilters({ jobId, matchCount });
    navigate({ activePage: 'search' });
  };

  const handleCreateNewRequirement = () => {
    navigate({ activePage: 'post-requirement' });
    setShowPostRequirement(true);
  };

  // ── Vendor navigation ────────────────────────────────────────
  const handleVendorPageChange = (page: 'dashboard' | 'resources' | 'contracts') => {
    navigate({ currentVendorPage: page });
  };

  // ── Auth flow navigation ─────────────────────────────────────
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

  // ── Auth screens (not logged in) ─────────────────────────────
  if (!isLoggedIn) {
    if (authFlow === 'landing') {
      return (
        <ThemeProvider>
          <LandingPageV2 onLoginClick={handleLandingLogin} onGetStartedClick={handleLandingGetStarted} />
        </ThemeProvider>
      );
    }
    if (authFlow === 'login') {
      return (
        <ThemeProvider>
          <div>
            <RoleBasedLoginPage
              onLogin={handleLogin}
              onForgotPassword={handleForgotPassword}
              onSignup={handleSignup}
              onBackToHome={handleBackToHome}
            />
            <Chatbot isLoggedIn={false} />
          </div>
        </ThemeProvider>
      );
    }
    if (authFlow === 'signup') {
      return (
        <ThemeProvider>
          <div>
            <SignupPage onSignup={handleSignupComplete} onBackToLogin={handleBackToLogin} onBackToHome={handleBackToHome} />
            <Chatbot isLoggedIn={false} />
          </div>
        </ThemeProvider>
      );
    }
    if (authFlow === 'forgot-password') {
      return (
        <ThemeProvider>
          <div>
            <ForgotPasswordPage onBackToLogin={handleBackToLogin} onSendCode={handleSendResetCode} />
            <Chatbot isLoggedIn={false} />
          </div>
        </ThemeProvider>
      );
    }
    if (authFlow === 'enter-otp') {
      return (
        <ThemeProvider>
          <div>
            <EnterOTPPage email={resetEmail} onBackToLogin={handleBackToLogin} onVerifyCode={handleVerifyOTP} onResendCode={handleResendCode} />
            <Chatbot isLoggedIn={false} />
          </div>
        </ThemeProvider>
      );
    }
    if (authFlow === 'reset-password') {
      return (
        <ThemeProvider>
          <div>
            <ResetPasswordPage onBackToLogin={handleBackToLogin} onResetPassword={handleResetPassword} />
            <Chatbot isLoggedIn={false} />
          </div>
        </ThemeProvider>
      );
    }
    if (authFlow === 'password-reset-success') {
      return (
        <ThemeProvider>
          <div>
            <PasswordResetSuccessPage onBackToLogin={handleBackToLogin} />
            <Chatbot isLoggedIn={false} />
          </div>
        </ThemeProvider>
      );
    }
  }

  // ── Vendor Portal ────────────────────────────────────────────
  if (userRole === 'vendor') {
    return (
      <ThemeProvider>
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
          <Chatbot isLoggedIn={true} />
        </div>
      </ThemeProvider>
    );
  }

  // ── Client Portal ────────────────────────────────────────────
  if (userRole === 'client') {
    return (
      <ThemeProvider>
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
                    navigate({ activePage: 'dashboard' });
                  }}
                />
              )}
              {activePage === 'requirements' && (
                <Requirements onViewMatches={handleViewMatches} onCreateNew={handleCreateNewRequirement} />
              )}
              {activePage === 'resources' && <Resources />}
              {activePage === 'billing' && <Billing />}
              {activePage === 'settings' && <Settings />}
            </div>
          </main>

          <ScrollToTop />
          <Chatbot isLoggedIn={true} />
        </div>
      </ThemeProvider>
    );
  }

  return null;
}
