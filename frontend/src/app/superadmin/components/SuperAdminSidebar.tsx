import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Server, CreditCard, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu,
  Crown, Shield, Activity, BarChart3, Bell,
  HelpCircle, Sparkles, Zap, Globe, Database
} from 'lucide-react';

interface SuperAdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { id: string; label: string }[];
}

export default function SuperAdminSidebar({
  activePage,
  onPageChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}: SuperAdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System Health', icon: Server },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigation = (page: string) => {
    onPageChange(page);
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const getNavItemClass = (id: string) => {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer relative group';
    const active = activePage === id 
      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30' 
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
    const collapsed = isCollapsed ? 'justify-center px-3' : '';
    return `${base} ${active} ${collapsed}`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-200/60 dark:border-slate-700/60 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/30 flex-shrink-0">
          <Crown size={20} />
        </div>
        {!isCollapsed && (
          <div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Super Admin</span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400">Full System Control</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isHovered = hoveredItem === item.id;
          const isExpanded = expandedItems.has(item.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => handleNavigation(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={getNavItemClass(item.id)}
              >
                <Icon size={20} className={isActive ? 'text-white' : ''} />
                {!isCollapsed && (
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>

              {/* Sub-items */}
              {!isCollapsed && item.subItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleNavigation(sub.id)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 w-full text-sm ${
                        activePage === sub.id
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
        {/* System Status Indicator */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              All Systems Operational
            </span>
          </div>
        )}
        
        <button
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCollapsed ? 'justify-center px-3' : ''}`}
          onClick={() => {}}
        >
          <HelpCircle size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Help & Support</span>}
        </button>
        
        <button
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 ${isCollapsed ? 'justify-center px-3' : ''}`}
          onClick={() => window.location.href = '/'}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle - Desktop only */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex items-center justify-center p-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-700/60 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}