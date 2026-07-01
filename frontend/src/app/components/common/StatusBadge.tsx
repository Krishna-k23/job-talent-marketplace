import React from 'react';

interface StatusBadgeProps {
  status: 'Active' | 'Inactive' | 'healthy' | 'degraded' | 'down' | 'Pending' | 'Completed' | string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    const statusMap: Record<string, { color: string; dot: string }> = {
      'Active': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
      'Inactive': { color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
      'healthy': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
      'degraded': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
      'down': { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800', dot: 'bg-red-500' },
      'Pending': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
      'Completed': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
      'Available': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
      'Busy': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
      'On Leave': { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800', dot: 'bg-red-500' },
      'Open': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
      'Closed': { color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
    };
    return statusMap[status] || { color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' };
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.color} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {status}
    </span>
  );
}