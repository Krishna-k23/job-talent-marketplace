import { LayoutDashboard, Search, FileText, Users, CreditCard, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ activePage, onPageChange, isCollapsed, onToggleCollapse, isMobileOpen = false, onMobileClose }: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (page: string) => {
    onPageChange(page);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <div className={`h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-r border-slate-200/60 dark:border-slate-700/50 flex flex-col fixed left-0 top-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 z-30
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0 ring-2 ring-blue-100 dark:ring-blue-900/50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              BenchBridge
            </span>
          </div>
          {/* Close button — mobile only */}
          <button onClick={onMobileClose} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 px-4'}`}>
            Main Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" strokeWidth={2.5} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle — desktop only */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/50 hidden md:block">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={20} strokeWidth={2.5} />
            ) : (
              <>
                <ChevronLeft size={20} strokeWidth={2.5} />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
