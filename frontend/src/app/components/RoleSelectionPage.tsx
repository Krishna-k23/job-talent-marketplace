import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface RoleSelectionPageProps {
  onSelectRole: (role: 'vendor' | 'client') => void;
}

export function RoleSelectionPage({ onSelectRole }: RoleSelectionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      {/* Animated floating elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-12 animate-rotate-slow-cw"></div>
      <div className="absolute bottom-32 left-16 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 -rotate-6 animate-rotate-slow-ccw"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-45 animate-rotate-slow-cw" style={{ animationDelay: '2s' }}></div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="auth" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-6">
        {/* Logo */}
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
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to BenchBridge!</h1>
          <p className="text-white/90 text-lg">Choose how you want to use the platform</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Vendor Card */}
          <button
            onClick={() => onSelectRole('vendor')}
            className="group bg-card dark:bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-border p-8 text-left hover:scale-105 hover:shadow-2xl hover:border-white/40 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-2xl group-hover:shadow-green-600/40 transition-all shadow-lg shadow-green-600/20">
              <Users size={36} className="text-white drop-shadow-md" />
            </div>

            <h2 className="text-2xl font-semibold text-card-foreground mb-3">I'm a Vendor</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Showcase your talented resources, manage availability, and connect with companies looking for skilled professionals.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span>List your available resources</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span>Receive job requirement matches</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span>Manage placements & contracts</span>
              </li>
            </ul>

            <div className="flex items-center justify-between text-success font-medium group-hover:text-success/80 transition-colors">
              <span>Continue as Vendor</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Client Card */}
          <button
            onClick={() => onSelectRole('client')}
            className="group bg-card dark:bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-border p-8 text-left hover:scale-105 hover:shadow-2xl hover:border-white/40 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-2xl group-hover:shadow-blue-600/40 transition-all shadow-lg shadow-blue-600/20">
              <Briefcase size={36} className="text-white drop-shadow-md" />
            </div>

            <h2 className="text-2xl font-semibold text-card-foreground mb-3">I'm a Client</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Post job requirements, discover pre-vetted talent, and build your team with the right professionals quickly.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span>Post job requirements</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span>Search & filter qualified talent</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span>Get AI-powered matches</span>
              </li>
            </ul>

            <div className="flex items-center justify-between text-primary font-medium group-hover:text-primary/80 transition-colors">
              <span>Continue as Client</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <p className="text-white/80 text-sm mt-8 text-center max-w-md">
          You can switch roles anytime from your account settings
        </p>
      </div>
    </div>
  );
}
