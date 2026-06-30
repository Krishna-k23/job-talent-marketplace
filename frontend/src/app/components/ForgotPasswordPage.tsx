// ForgotPasswordPage.tsx - Enhanced with Logo Images
import { useState } from 'react';
import React from 'react';
import { Mail, ArrowRight, ArrowLeft, Sparkles, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import LogoLight from '../../assets/Logo 3.png';
import LogoDark from '../../assets/Logo 4.png';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onSendCode: (email: string) => void;
}

export function ForgotPasswordPage({ onBackToLogin, onSendCode }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setError('Please enter a valid email address');
      setIsValid(false);
    } else if (value && validateEmail(value)) {
      setError('');
      setIsValid(true);
    } else {
      setError('');
      setIsValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        onSendCode(email);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to send reset code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      {/* Animated floating elements */}
      <div className="absolute top-20 right-20 w-48 h-48 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-12 animate-rotate-slow-cw"></div>
      <div className="absolute bottom-32 left-16 w-36 h-36 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 -rotate-6 animate-rotate-slow-ccw"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 animate-pulse-slow"></div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="auth" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo - Using actual images */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/30 flex-shrink-0">
            {/* Light mode logo */}
            <img
              src={LogoLight}
              alt="BenchAstra"
              className="w-full h-full object-cover dark:hidden"
            />
            {/* Dark mode logo */}
            <img
              src={LogoDark}
              alt="BenchAstra"
              className="w-full h-full object-cover hidden dark:block"
            />
          </div>
          <div>
            <span className="text-2xl font-bold text-white tracking-tight">BenchAstra</span>
            <div className="flex items-center gap-1">
              <Sparkles size={10} className="text-blue-200" />
              <span className="text-[10px] text-blue-200/80 font-medium tracking-wider">RESET PASSWORD</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative">
            <button
              onClick={onBackToLogin}
              className="flex items-center cursor-pointer gap-2 text-blue-200 hover:text-white transition-all duration-200 mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Login</span>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-400/20">
                <Shield size={32} className="text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-blue-200/80 text-sm">Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className={`w-full h-12 pl-11 pr-12 bg-white/10 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder:text-blue-300/40 ${
                      error ? 'border-red-400/60 focus:ring-red-400' : 
                      isValid ? 'border-emerald-400/60' : 'border-white/20'
                    }`}
                    required
                  />
                  {isValid && (
                    <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                  {error && !isValid && email && (
                    <AlertCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" />
                  )}
                </div>
                {error && (
                  <p className="text-xs text-red-300 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {error}
                  </p>
                )}
                {!error && isValid && (
                  <p className="text-xs text-emerald-300 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    Valid email address
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-[1.02] ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-blue-200/60">
                We'll send a password reset code to your email
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rotate-slow-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-slow-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-rotate-slow-cw {
          animation: rotate-slow-cw 20s linear infinite;
        }
        .animate-rotate-slow-ccw {
          animation: rotate-slow-ccw 25s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}