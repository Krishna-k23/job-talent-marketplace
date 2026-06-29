// VendorSidebar.tsx - Enhanced UI with same size and content
import { LayoutDashboard, Users, FileText, ChevronLeft, ChevronRight, Briefcase, X, Sparkles, Award } from 'lucide-react';
import LogoLight from '../../../assets/Logo 3.png';
import LogoDark from '../../../assets/Logo 4.png';

interface VendorSidebarProps {
  currentPage: 'dashboard' | 'resources' | 'contracts';
  onNavigate: (page: 'dashboard' | 'resources' | 'contracts') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function VendorSidebar({ 
  currentPage, 
  onNavigate, 
  isCollapsed, 
  onToggleCollapse, 
  isMobileOpen = false, 
  onMobileClose 
}: VendorSidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources' as const, label: 'Resources', icon: Users },
    { id: 'contracts' as const, label: 'Contacts', icon: FileText },
  ];

  const handleNavClick = (page: 'dashboard' | 'resources' | 'contracts') => {
    onNavigate(page);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 dark:from-green-950/20 dark:via-slate-950 dark:to-emerald-950/20 border-r border-green-200/60 dark:border-green-800/30 transition-all duration-300 z-30 shadow-xl shadow-green-500/5 dark:shadow-slate-950/50
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section - Enhanced with gradient background */}
          <div className="relative h-20 flex items-center px-5 border-b border-green-200/60 dark:border-green-800/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5"></div>
            <div className="flex items-center gap-3 flex-1 min-w-0 relative">
              {/* Logo - Enhanced with glow */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-green-500/30 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-20 animate-pulse"></div>
                <img
                  src={LogoLight}
                  alt="BenchAstra"
                  className="w-full h-full object-cover dark:hidden relative z-10"
                />
                <img
                  src={LogoDark}
                  alt="BenchAstra"
                  className="w-full h-full object-cover hidden dark:block relative z-10"
                />
              </div>
              <div className={`transition-opacity duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Vendor Portal
                </h1>
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-green-500" />
                  <p className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap font-medium">
                    BenchAstra
                  </p>
                </div>
              </div>
            </div>
            {/* Close button — mobile only */}
            <button 
              onClick={onMobileClose} 
              className="md:hidden cursor-pointer p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 flex-shrink-0 relative z-10"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Navigation Menu - Enhanced with better visual feedback */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <div className={`text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 px-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
              Main Menu
            </div>
            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-green-500/30"></div>
                    )}
                    <item.icon
                      size={22}
                      className={`flex-shrink-0 transition-colors duration-200 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${
                      isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      {item.label}
                    </span>
                    {!isCollapsed && isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-lg shadow-green-500/30"></div>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl z-50">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle — Enhanced with gradient hover */}
          <div className="p-3 border-t border-green-200/60 dark:border-green-800/30 hidden md:block">
            <button
              onClick={onToggleCollapse}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 text-green-700 dark:text-green-300 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              ) : (
                <>
                  <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* Version Info - Enhanced */}
          <div className={`px-3 py-2 border-t border-green-200/60 dark:border-green-800/30 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            <div className={`flex items-center justify-center ${isCollapsed ? 'flex-col' : 'flex-row'} gap-1`}>
              <span className="text-[10px] text-green-500 dark:text-green-400 font-medium">
                {isCollapsed ? 'v2' : 'v2.0'}
              </span>
              {!isCollapsed && (
                <>
                  <span className="text-[10px] text-green-300 dark:text-green-600">•</span>
                  <span className="text-[10px] text-green-500 dark:text-green-400 font-medium">Pro</span>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}