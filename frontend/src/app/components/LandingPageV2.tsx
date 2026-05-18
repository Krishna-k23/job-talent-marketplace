import { ArrowRight, Users, Briefcase, TrendingUp, Zap, Shield, Bell, BarChart3, Clock, Globe, CheckCircle, Sparkles, Target, Workflow } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ScrollToTop } from './ScrollToTop';
import { Chatbot } from './Chatbot';

interface LandingPageV2Props {
  onLoginClick: () => void;
  onGetStartedClick: () => void;
}

export function LandingPageV2({ onLoginClick, onGetStartedClick }: LandingPageV2Props) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-green-600/20 animate-gradient-shift"></div>

      {/* Radial Glow - Top Right */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-blue-400/30 via-transparent to-transparent blur-3xl"></div>

      {/* Radial Glow - Bottom Left */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-green-400/20 via-transparent to-transparent blur-3xl"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 dark:bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">BenchBridge</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('solutions')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={onLoginClick}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Background Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 dark:from-slate-950 dark:via-blue-950 dark:to-green-950 relative overflow-hidden">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-green-600/20 animate-gradient-shift"></div>

        {/* Radial Glow - Top Right */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-blue-400/30 via-transparent to-transparent blur-3xl"></div>

        {/* Radial Glow - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-green-400/20 via-transparent to-transparent blur-3xl"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 lg:pr-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg shadow-blue-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">AI-Powered Recruitment Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Transform Hiring with{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent animate-gradient-text">
                Intelligent
              </span>{' '}
              Portals
            </h1>

            {/* Subtext */}
            <p className="text-xl text-white/80 leading-relaxed">
              Manage employers, vendors, and candidates in one unified platform built for speed, collaboration, and scale.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Zap size={18} className="text-green-400" />
                </div>
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium">Enterprise Secure</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} className="text-purple-400" />
                </div>
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Users size={18} className="text-pink-400" />
                </div>
                <span className="text-sm font-medium">Collaborative</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onGetStartedClick}
                className="group px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-2xl shadow-blue-500/50 hover:shadow-green-500/50 hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLoginClick}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                Login
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-white/60">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-white/60">Placements</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-white/60">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Side - 3D Illustration */}
          <div className="relative">
            {/* Central 3D Cube */}
            <div className="relative z-20 flex items-center justify-center">
              <div className="relative w-64 h-64 animate-float">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl blur-3xl opacity-50 animate-pulse-slow"></div>

                {/* Main Cube */}
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9" />
                      <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
                      <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
                    </svg>
                  </div>

                  {/* Corner Dots */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50"></div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            {/* Card 1 - Top Left */}
            <div className="absolute top-0 left-0 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl w-48">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-green-400" />
                  </div>
                  <span className="text-white font-semibold text-sm">Active Users</span>
                </div>
                <div className="text-2xl font-bold text-white">2,847</div>
                <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                  <TrendingUp size={12} />
                  <span>+12.5%</span>
                </div>
              </div>
            </div>

            {/* Card 2 - Top Right */}
            <div className="absolute top-4 right-0 animate-float" style={{ animationDelay: '1s' }}>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl w-52">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Briefcase size={16} className="text-blue-400" />
                  </div>
                  <span className="text-white font-semibold text-sm">Open Positions</span>
                </div>
                <div className="text-2xl font-bold text-white">124</div>
                <div className="flex items-center gap-1 text-blue-400 text-xs mt-1">
                  <span>Updated 5m ago</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Bottom Left */}
            <div className="absolute bottom-4 left-4 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 shadow-2xl w-40">
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={14} className="text-yellow-400" />
                  <span className="text-white font-medium text-xs">New Match</span>
                </div>
                <p className="text-white/80 text-xs">Sarah M. matched for DevOps role</p>
              </div>
            </div>

            {/* Card 4 - Bottom Right - Mini Chart */}
            <div className="absolute bottom-0 right-4 animate-float" style={{ animationDelay: '2s' }}>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl w-56">
                <div className="text-white font-semibold text-sm mb-3">Hiring Velocity</div>
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 60, 45, 80, 65, 90, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-green-500 rounded-t opacity-80"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orbiting Dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50"></div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
            <Sparkles size={16} />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Scale Hiring
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed for modern recruitment workflows
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 - Client Portal */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
              <Briefcase size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Client Portal</h3>
            <p className="text-muted-foreground leading-relaxed">
              Post job requirements, review AI-matched candidates, and manage the entire hiring pipeline from one unified dashboard
            </p>
          </div>

          {/* Feature 2 - Vendor Portal */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-600/30 group-hover:scale-110 transition-transform">
              <Users size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Vendor Portal</h3>
            <p className="text-muted-foreground leading-relaxed">
              Submit qualified candidates, track submissions in real-time, and manage placements with complete transparency
            </p>
          </div>

          {/* Feature 3 - AI-Powered Matching */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Matching</h3>
            <p className="text-muted-foreground leading-relaxed">
              Intelligent algorithms match candidates to requirements based on skills, experience, and availability
            </p>
          </div>

          {/* Feature 4 - Secure & Compliant */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/30 group-hover:scale-110 transition-transform">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Compliant</h3>
            <p className="text-muted-foreground leading-relaxed">
              Enterprise-grade security with role-based access control, data encryption, and compliance certifications
            </p>
          </div>

          {/* Feature 5 - Real-Time Updates */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-600/30 group-hover:scale-110 transition-transform">
              <Clock size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Real-Time Updates</h3>
            <p className="text-muted-foreground leading-relaxed">
              Instant notifications and status updates keep all stakeholders informed throughout the hiring process
            </p>
          </div>

          {/* Feature 6 - Analytics & Reports */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-600/30 group-hover:scale-110 transition-transform">
              <BarChart3 size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Analytics & Reports</h3>
            <p className="text-muted-foreground leading-relaxed">
              Comprehensive insights into hiring metrics, vendor performance, and recruitment efficiency
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
              <Target size={16} />
              <span>Our Solutions</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              How BenchBridge Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete ecosystem connecting employers, vendors, and talent
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Solution 1 */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mb-6">
                <Globe size={24} className="text-blue-600" />
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-4">01</div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">For Clients</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Post your requirements, specify skills, budget, and timeline. Our AI instantly matches you with qualified candidates from our vendor network.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Post unlimited job requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Review AI-matched profiles instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Manage entire hiring pipeline</span>
                </li>
              </ul>
            </div>

            {/* Solution 2 */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-xl flex items-center justify-center mb-6">
                <Users size={24} className="text-green-600" />
              </div>
              <div className="text-5xl font-bold text-green-600 mb-4">02</div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">For Vendors</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Submit your bench resources, receive instant job matches, and track placement status in real-time with full transparency.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Add unlimited candidate profiles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Get matched to relevant openings</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Track submissions & placements</span>
                </li>
              </ul>
            </div>

            {/* Solution 3 */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center mb-6">
                <Workflow size={24} className="text-purple-600" />
              </div>
              <div className="text-5xl font-bold text-purple-600 mb-4">03</div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Smart Workflow</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Automated matching, seamless communication, and intelligent recommendations streamline the entire recruitment process.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">AI-powered candidate matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Automated workflow management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Real-time collaboration tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
            <Zap size={16} />
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible pricing for companies of all sizes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
              <p className="text-muted-foreground text-sm">Get started with basics</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-foreground">₹0</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">Forever free</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">3 submissions/mo</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Basic search</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">No billing</span>
              </li>
            </ul>
            <button className="w-full h-12 px-6 border border-border rounded-lg hover:bg-secondary transition-all font-medium text-foreground">
              Choose
            </button>
          </div>

          {/* Basic Plan - Popular */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-500 rounded-2xl p-8 relative shadow-2xl shadow-blue-600/30 transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg">
                POPULAR
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
              <p className="text-white/80 text-sm">Perfect for growing teams</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">₹1,999</span>
                <span className="text-white/80">/mo</span>
              </div>
              <p className="text-white/60 text-sm mt-2">Billed monthly</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">20 submissions/mo</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">Advanced filters</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">Email support</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">Analytics</span>
              </li>
            </ul>
            <button className="w-full h-12 px-6 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-xl">
              Choose
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
              <p className="text-muted-foreground text-sm">For large enterprises</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-foreground">₹9,999</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">Billed monthly</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Unlimited submits</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Priority access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Dedicated account</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Custom reports</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">API access</span>
              </li>
            </ul>
            <button className="w-full h-12 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg shadow-purple-600/30">
              Choose
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join hundreds of companies already using BenchBridge to streamline their recruitment process
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onGetStartedClick}
                className="px-10 py-4 bg-white text-primary hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-2xl flex items-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={20} />
              </button>
              <button
                onClick={onLoginClick}
                className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-foreground">BenchBridge</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-sm">
                The modern recruitment platform connecting clients and vendors for seamless hiring.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-foreground transition-colors">Solutions</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-foreground transition-colors">Pricing</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2026 BenchBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Global Components */}
      <ScrollToTop />
      <Chatbot isLoggedIn={false} />
    </div>
  );
}
