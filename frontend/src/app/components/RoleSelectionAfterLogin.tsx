// components/RoleSelectionAfterLogin.tsx
import { useState, useEffect } from 'react';
import React from 'react';
import { Users, Briefcase, ArrowRight, CheckCircle, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface RoleSelectionAfterLoginProps {
  onSelectRole: (role: 'vendor' | 'client') => void;
  onLogout: () => void;
  userEmail?: string;
}

const vendorFeatures = [
  'List your available resources',
  'Receive job requirement matches',
  'Manage placements & contracts',
  'Get AI-powered matches',
];

const clientFeatures = [
  'Post job requirements',
  'Search & filter qualified talent',
  'Manage placements & contracts',
  'Get AI-powered matches',
];

export function RoleSelectionAfterLogin({ onSelectRole, onLogout, userEmail }: RoleSelectionAfterLoginProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Prevent body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Dynamic background based on theme
  const getBackgroundStyle = () => {
    if (isDark) {
      return 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
    }
    return 'linear-gradient(135deg, #1a4fa3 0%, #1e62c4 45%, #1a8fd1 100%)';
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        height: '100vh',
        width: '100vw',
        maxWidth: '100%',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: getBackgroundStyle(),
      }}
    >
      {/* Decorative elements - adjust opacity for dark mode */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark 
            ? 'radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.03) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.02) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 180,
          height: 180,
          top: '-40px',
          right: '-40px',
          borderRadius: '28px',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(2px)',
          transform: 'rotate(15deg)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 110,
          height: 110,
          bottom: '-28px',
          left: '-28px',
          borderRadius: '20px',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.06)' : '1.5px solid rgba(255,255,255,0.13)',
          backdropFilter: 'blur(2px)',
          transform: 'rotate(-12deg)',
        }}
      />
      
      {/* Header with Logout and Theme Toggle */}
      <div className="absolute top-0 right-0 z-30 p-4 flex items-center gap-3">
        {userEmail && (
          <span className="text-white/80 text-sm hidden sm:block">{userEmail}</span>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/20"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium hidden sm:inline">Logout</span>
        </button>
        <ThemeToggle />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-full">
        
        {/* Logo and Heading */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl mb-2"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white font-bold text-[14px] tracking-tight">BenchBridge</span>
          </div>
          
          <h1
            className="text-[1.75rem] sm:text-[2rem] font-extrabold text-white leading-tight"
            style={{ letterSpacing: '-0.5px' }}
          >
            Welcome Back!
          </h1>
          <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
            Choose how you want to use the platform
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[760px]">
          {/* Vendor Card */}
          <RoleCard
            iconBg="#22c55e"
            icon={<Users size={26} color="white" />}
            title="I'm a Vendor"
            description="Showcase your talented resources, manage availability, and connect with companies looking for skilled professionals."
            features={vendorFeatures}
            checkColor="#22c55e"
            btnBg="#16a34a"
            btnHover="#15803d"
            btnLabel="Continue as Vendor"
            onClick={() => onSelectRole('vendor')}
            isDark={isDark}
          />
          
          {/* Client Card */}
          <RoleCard
            iconBg="#3b82f6"
            icon={<Briefcase size={26} color="white" />}
            title="I'm a Client"
            description="Post job requirements, discover pre-vetted talent, and build your team with the right professionals quickly."
            features={clientFeatures}
            checkColor="#3b82f6"
            btnBg="#2563eb"
            btnHover="#1d4ed8"
            btnLabel="Continue as Client"
            onClick={() => onSelectRole('client')}
            isDark={isDark}
          />
        </div>

        {/* Footer Note */}
        <p className="text-[12px] font-medium mt-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          You can switch roles anytime from your account settings
        </p>
      </div>
    </div>
  );
}

// Role Card Component
interface RoleCardProps {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  checkColor: string;
  btnBg: string;
  btnHover: string;
  btnLabel: string;
  onClick: () => void;
  isDark?: boolean;
}

function RoleCard({
  iconBg, icon, title, description, features,
  checkColor, btnBg, btnHover, btnLabel, onClick,
  isDark = false,
}: RoleCardProps) {
  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden cursor-pointer transition-all duration-250 group"
      style={{
        background: isDark ? '#1e293b' : '#ffffff',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 4px 20px rgba(0,0,0,0.12)',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = isDark 
          ? '0 20px 44px rgba(0,0,0,0.4)' 
          : '0 20px 44px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = isDark 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 4px 20px rgba(0,0,0,0.12)';
      }}
    >
      <div className="flex flex-col flex-1 p-5 pb-4">
        <div
          className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
          style={{ background: iconBg }}
        >
          {icon}
        </div>

        <h2
          className="text-[19px] font-bold mb-2"
          style={{ color: isDark ? '#f1f5f9' : '#1e293b', letterSpacing: '-0.3px' }}
        >
          {title}
        </h2>

        <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          {description}
        </p>

        <ul className="flex flex-col gap-2">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-[12.5px] font-medium"
              style={{ color: isDark ? '#cbd5e1' : '#334155' }}
            >
              <CheckCircle size={14} style={{ color: checkColor, flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <button
        className="w-full py-3.5 flex items-center justify-center gap-2 text-white text-[13.5px] font-bold transition-colors duration-150 touch-manipulation"
        style={{ background: btnBg, borderRadius: '0 0 16px 16px', letterSpacing: '0.1px' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = btnHover; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = btnBg; }}
      >
        {btnLabel} <ArrowRight size={16} />
      </button>
    </div>
  );
}