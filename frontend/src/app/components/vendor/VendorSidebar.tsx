import { LayoutDashboard, Users, FileText, ChevronLeft, ChevronRight, Briefcase, X } from 'lucide-react';

interface VendorSidebarProps {
  currentPage: 'dashboard' | 'resources' | 'contracts';
  onNavigate: (page: 'dashboard' | 'resources' | 'contracts') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function VendorSidebar({ currentPage, onNavigate, isCollapsed, onToggleCollapse, isMobileOpen = false, onMobileClose }: VendorSidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources' as const, label: 'Resources', icon: Users },
    { id: 'contracts' as const, label: 'Contracts', icon: FileText },
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
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 dark:from-purple-900/20 dark:via-slate-950 dark:to-purple-900/20 border-r border-purple-200/60 dark:border-purple-800/30 transition-all duration-300 z-30
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-purple-200/60 dark:border-purple-800/30">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0 ring-2 ring-purple-100 dark:ring-purple-900/50">
                <Briefcase size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div className={`transition-opacity duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap">Vendor Portal</h1>
                <p className="text-xs text-purple-600 dark:text-purple-400 whitespace-nowrap">BenchBridge</p>
              </div>
            </div>
            {/* Close button — mobile only */}
            <button onClick={onMobileClose} className="md:hidden p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-4">
              {!isCollapsed && 'Main Menu'}
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}
                    <item.icon
                      size={22}
                      className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}
                      strokeWidth={2}
                    />
                    <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                    {!isCollapsed && isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle — desktop only */}
          <div className="p-3 border-t border-purple-200/60 dark:border-purple-800/30 hidden md:block">
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 dark:bg-purple-950/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl transition-all duration-200 font-medium"
            >
              {isCollapsed ? (
                <ChevronRight size={20} strokeWidth={2.5} />
              ) : (
                <>
                  <ChevronLeft size={20} strokeWidth={2.5} />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
