import { useState, useEffect } from 'react';
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

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

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

      setUserRole(role);
      setIsLoggedIn(true);
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
    setIsLoggedIn(false);
    setAuthFlow('landing');
    setActivePage('dashboard');
    setUserRole(null);
    setCurrentVendorPage('dashboard');
  };

  const handleSettingsClick = () => {
    setActivePage('settings');
  };

  const handleViewMatches = (jobId: string, matchCount: number) => {
    setSearchFilters({ jobId, matchCount });
    setActivePage('search');
  };

  const handleCreateNewRequirement = () => {
    setActivePage('post-requirement');
    setShowPostRequirement(true);
  };

  const handleForgotPassword = () => {
    setAuthFlow('forgot-password');
  };

  const handleSignup = () => {
    setAuthFlow('signup');
  };

  const handleBackToLogin = () => {
    setAuthFlow('login');
  };

  const handleLandingLogin = () => {
    setAuthFlow('login');
  };

  const handleLandingGetStarted = () => {
    setAuthFlow('signup');
  };

  const handleBackToHome = () => {
    setAuthFlow('landing');
  };

  const handleSendResetCode = (email: string) => {
    setResetEmail(email);
    setAuthFlow('enter-otp');
  };

  const handleVerifyOTP = (code: string) => {
    console.log('OTP verified:', code);
    setAuthFlow('reset-password');
  };

  const handleResendCode = () => {
    console.log('Resending code to:', resetEmail);
  };

  const handleResetPassword = (password: string) => {
    console.log('Password reset successful');
    setAuthFlow('password-reset-success');
  };

  const handleSignupComplete = () => {
    setAuthFlow('login');
  };

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

  // Vendor Portal
  if (userRole === 'vendor') {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <VendorSidebar
            currentPage={currentVendorPage}
            onNavigate={setCurrentVendorPage}
            isCollapsed={vendorSidebarCollapsed}
            onToggleCollapse={() => setVendorSidebarCollapsed(!vendorSidebarCollapsed)}
          />
          <Header
            onLogout={handleLogout}
            onSettingsClick={handleSettingsClick}
            sidebarCollapsed={vendorSidebarCollapsed}
          />

          <main className={`min-h-screen pt-20 transition-all duration-300 ${vendorSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <div className="p-8 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
              {currentVendorPage === 'dashboard' && <VendorDashboard />}
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

  // Client Portal
  if (userRole === 'client') {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Sidebar
            activePage={activePage}
            onPageChange={setActivePage}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <Header
            onLogout={handleLogout}
            onSettingsClick={handleSettingsClick}
            sidebarCollapsed={isSidebarCollapsed}
          />

          <main className={`min-h-screen pt-20 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <div className="p-8 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
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