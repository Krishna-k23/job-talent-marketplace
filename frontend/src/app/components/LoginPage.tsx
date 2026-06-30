// LoginPage.tsx - No Scroll Version
import { useState, useEffect } from 'react';
import React from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, Shield, Building2, Users, CheckCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import Carousel1 from "../../assets/Carousel 1.jpeg";
import Carousel2 from "../../assets/Carousel 2.jpeg";
import Carousel3 from "../../assets/Carousel 3.jpeg";
import LogoLight from '../../assets/Logo 3.png';
import LogoDark from '../../assets/Logo 4.png';
import { apiPost } from '@/config/api';
import { apiGet } from '@/config/api';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  onForgotPassword: () => void;
  onSignup: () => void;
  onBackToHome?: () => void;
}

// 3 dummy images for carousel
const CAROUSEL_IMAGES = [
  Carousel1,
  Carousel2,
  Carousel3,
];

// Constant text - same for all carousel images
const BRAND_NAME = "BenchAstra";

export function LoginPage({ onLogin, onForgotPassword, onSignup, onBackToHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      try {
        const userData = await apiGet('/users/me');
        localStorage.setItem('user_email', userData.email);
      } catch (err) {
        console.error('Failed to get user info:', err);
      }

      const result = await onLogin(email, password);

      if (!result.success) {
        setError('Login failed. Please try again.');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('user');
      }

    } catch (err: any) {
      if (err.response?.status === 401) {
        if (err.response?.data?.detail?.includes('register')) {
          setError('No account found with this email. Please sign up as a client or vendor.');
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else if (err.message?.includes('Incorrect email or password')) {
        setError('Invalid credentials. Please check your email and password.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Carousel with Constant Text */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center h-full">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {CAROUSEL_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={img}
                alt={`Carousel ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/1a4fa3/ffffff?text=BenchAstra';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
            </div>
          ))}
        </div>

        {/* Content overlay - Constant Text */}
        <div className="relative z-10 text-left px-16 max-w-2xl ml-12">
          {/* Brand Name with Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-white/20 flex-shrink-0">
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
            <h2 className="text-4xl font-bold text-white tracking-wide">
              {BRAND_NAME}
            </h2>
          </div>

          {/* Tagline */}
          <div className="mb-4">
            <p className="text-4xl font-bold text-white leading-snug">
              Bridging the gap between <span className="text-emerald-400">talent</span> and demand.
            </p>
          </div>

          {/* Subtext */}
          <div className="mt-6">
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
              The premium ecosystem for vendor bench management and seamless client engagements.
            </p>
          </div>

          {/* Carousel Navigation Dots */}
          <div className="flex justify-start gap-2 mt-8">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`transition-all duration-300 cursor-pointer rounded-full ${idx === currentImageIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 relative overflow-hidden flex flex-col h-full">
        {/* Header with Back Button and Theme Toggle */}
        <div className="absolute top-6 left-6 right-6 z-20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200 group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Home</span>
                </button>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          {/* Login Card */}
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Shield size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                </div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field with Visibility Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSignup}
                  className="font-medium cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Features */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 size={12} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span>Post Requirements</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={12} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>Find Talent</span>
              </div>
            </div>

            {/* Terms & Privacy */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              By continuing, you agree to BenchAstra's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}