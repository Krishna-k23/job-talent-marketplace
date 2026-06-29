// Sidebar.tsx - Enhanced with same size as Vendor Sidebar
import { 
  LayoutDashboard, Search, FileText, Users, CreditCard, Settings, 
  ChevronLeft, ChevronRight, X, Zap, Award, TrendingUp, 
  Bell, HelpCircle, LogOut, User, Sparkles, Menu
} from 'lucide-react';
import LogoLight from '../../assets/Logo 3.png';
import LogoDark from '../../assets/Logo 4.png';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ 
  activePage, 
  onPageChange, 
  isCollapsed, 
  onToggleCollapse, 
  isMobileOpen = false, 
  onMobileClose 
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'search', label: 'Search', icon: Search, badge: null },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Users, badge: null },
    { id: 'billing', label: 'Billing', icon: CreditCard, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const bottomMenuItems = [
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const handleNavClick = (page: string) => {
    if (page === 'logout') {
      const logoutEvent = new CustomEvent('sidebar-logout');
      window.dispatchEvent(logoutEvent);
      return;
    }
    onPageChange(page);
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

      <div 
        className={`h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-r border-slate-200/60 dark:border-slate-700/50 flex flex-col fixed left-0 top-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 z-30
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo Section - Enhanced with gradient overlay */}
        <div className="relative h-16 flex items-center px-4 border-b border-slate-200/60 dark:border-slate-700/50 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 relative">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
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
            <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                BenchAstra
              </span>
            </div>
          </div>
          
          <button 
            onClick={onMobileClose} 
            className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex-shrink-0 relative z-10"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Navigation Menu - Enhanced */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-hidden flex flex-col">
          <div className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 px-2'}`}>
            Main
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`relative flex-shrink-0 ${isActive ? 'text-white' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && !isCollapsed && (
                    <div className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                      <span className="text-[8px] font-bold text-white">{item.badge}</span>
                    </div>
                  )}
                </div>
                
                {!isCollapsed && (
                  <span className="text-sm truncate flex-1 text-left">{item.label}</span>
                )}
                
                {isCollapsed && item.badge && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                    <span className="text-[6px] font-bold text-white">{item.badge}</span>
                  </div>
                )}

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-blue-500/30"></div>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
                  </div>
                )}
              </button>
            );
          })}

          <div className={`border-t border-slate-200/60 dark:border-slate-700/50 my-2 transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}></div>
          
          {/* Bottom Menu Items - Enhanced */}
          <div className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 px-2'}`}>
            Support
          </div>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm truncate flex-1 text-left">{item.label}</span>}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
                  </div>
                )}
              </button>
            );
          })}
          
          {/* Spacer to push bottom items down */}
          <div className="flex-1"></div>

          {/* Quick Help Section - Enhanced */}
          {!isCollapsed && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Need Help?</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Check our help center for quick answers
              </p>
              <button 
                onClick={() => handleNavClick('help')}
                className="w-full text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-1.5 px-3 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Visit Help Center
              </button>
            </div>
          )}
        </nav>

        {/* Collapse Toggle - Enhanced */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/50 hidden md:block flex-shrink-0">
          <button
            onClick={onToggleCollapse}
            className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-slate-200 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-lg transition-all duration-300 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 group shadow-sm hover:shadow-md"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={18} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <>
                <ChevronLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Version Info - Enhanced */}
        <div className={`px-4 py-2 border-t border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 flex-shrink-0 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center justify-center ${isCollapsed ? 'flex-col' : 'flex-row'} gap-1`}>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {isCollapsed ? 'v2' : 'v2.0'}
            </span>
            {!isCollapsed && (
              <>
                <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Pro</span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}