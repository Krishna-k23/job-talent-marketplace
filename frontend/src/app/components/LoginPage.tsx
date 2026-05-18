import { useState } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { api } from '../../api/client';
import { ENDPOINTS } from '../../config/api';

interface LoginPageProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onSignup: () => void;
  onBackToHome?: () => void;
}

export function LoginPage({ onLogin, onForgotPassword, onSignup, onBackToHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Replace the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token with both keys for compatibility
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        onLogin();
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Gradient Background with Animation */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden items-center justify-center p-12">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        {/* Animated floating background elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-12 animate-rotate-slow-cw"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 -rotate-6 animate-rotate-slow-ccw animate-float-1"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-45 animate-rotate-slow-cw animate-float-2" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 -rotate-12 animate-rotate-slow-ccw" style={{ animationDelay: '4s' }}></div>

        {/* Logo */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to BenchBridge</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Connect with top talent and build your dream team
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-background relative overflow-y-auto">
        {/* Back to Home & Theme toggle */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          )}
          <div className={!onBackToHome ? 'ml-auto' : ''}>
            <ThemeToggle variant="auth" />
          </div>
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">BenchBridge</span>
          </div>

          {/* Card */}
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
              >
                <span>Login</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSignup}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to BenchBridge's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
