import { useState } from 'react';
import { Users, Briefcase, ArrowRight, Mail, Lock, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface RoleBasedLoginPageProps {
  onLogin: (email: string, password: string, role: 'client' | 'vendor') => void;
  onForgotPassword: () => void;
  onSignup: () => void;
  onBackToHome?: () => void;
}

export function RoleBasedLoginPage({ onLogin, onForgotPassword, onSignup, onBackToHome }: RoleBasedLoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'client' | 'vendor' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role: 'client' | 'vendor') => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }
    
    setLoading(true);
    setError('');
    onLogin(email, password, selectedRole);
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  // If no role selected, show role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle variant="auth" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">BenchBridge</span>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">Welcome Back!</h1>
            <p className="text-white/90 text-lg">First, tell us who you are</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
            {/* Client Card */}
            <button
              onClick={() => handleRoleSelect('client')}
              className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-left hover:scale-105 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-2xl shadow-lg">
                <Briefcase size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">I'm a Client</h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                Post job requirements, discover pre-vetted talent, and build your team quickly.
              </p>
              <div className="flex items-center justify-between text-white font-medium group-hover:text-white/80">
                <span>Continue as Client</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Vendor Card */}
            <button
              onClick={() => handleRoleSelect('vendor')}
              className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-left hover:scale-105 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-2xl shadow-lg">
                <Users size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">I'm a Vendor</h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                Showcase your talented resources, manage availability, and connect with companies.
              </p>
              <div className="flex items-center justify-between text-white font-medium group-hover:text-white/80">
                <span>Continue as Vendor</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              Don't have an account?{' '}
              <button onClick={onSignup} className="text-white font-semibold hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form for selected role
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="auth" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md">
          <button
            onClick={handleBackToRoleSelect}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to role selection</span>
          </button>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                {selectedRole === 'client' ? <Briefcase size={32} className="text-white" /> : <Users size={32} className="text-white" />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedRole === 'client' ? 'Client Login' : 'Vendor Login'}
              </h2>
              <p className="text-white/70">Sign in to your {selectedRole} account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-11 pl-11 pr-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-11 pr-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/10" />
                  <span className="text-white/70">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Login as {selectedRole === 'client' ? 'Client' : 'Vendor'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/70">
              Don't have an account?{' '}
              <button onClick={onSignup} className="text-white font-semibold hover:underline">
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}