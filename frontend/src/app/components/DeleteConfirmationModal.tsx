// DeleteConfirmationModal.tsx - Ultra Premium Enhanced Version
import { X, AlertTriangle, Trash2, Shield, AlertCircle, XCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export function DeleteConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  type = 'danger',
}: DeleteConfirmationModalProps) {
  // Color configurations based on type
  const configs = {
    danger: {
      iconBg: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950/40 dark:to-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      buttonShadow: 'shadow-red-600/30',
      border: 'border-red-200 dark:border-red-800/50',
      ring: 'ring-red-200 dark:ring-red-900/50',
    },
    warning: {
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      buttonBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
      buttonShadow: 'shadow-amber-600/30',
      border: 'border-amber-200 dark:border-amber-800/50',
      ring: 'ring-amber-200 dark:ring-amber-900/50',
    },
    info: {
      iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      buttonShadow: 'shadow-blue-600/30',
      border: 'border-blue-200 dark:border-blue-800/50',
      ring: 'ring-blue-200 dark:ring-blue-900/50',
    },
  };

  const config = configs[type];

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 size={28} className={config.iconColor} />;
      case 'warning':
        return <AlertTriangle size={28} className={config.iconColor} />;
      case 'info':
        return <AlertCircle size={28} className={config.iconColor} />;
      default:
        return <Trash2 size={28} className={config.iconColor} />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200/60 dark:border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient accent */}
        <div className={`relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border-b border-slate-200/60 dark:border-slate-700/50 p-6 ${type === 'danger' ? 'border-l-4 border-l-red-500' : type === 'warning' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-500'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-start gap-4 relative">
            <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg ${config.ring} ring-2`}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex-shrink-0"
              aria-label="Close"
            >
              <X size={20} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </button>
          </div>
        </div>

        {/* Warning message for danger type */}
        {type === 'danger' && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-3">
            <Shield size={16} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              This action cannot be undone. This will permanently delete the selected item and all associated data.
            </p>
          </div>
        )}

        {/* Type-specific warning message */}
        {type === 'warning' && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
              Please review the information carefully before proceeding.
            </p>
          </div>
        )}

        {/* Confirmation input for extra safety */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Type <span className="font-bold text-slate-700 dark:text-slate-300">CONFIRM</span> to proceed
          </p>
          <input
            type="text"
            placeholder="Type CONFIRM here..."
            className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value === 'CONFIRM') {
                  onConfirm();
                }
              }
            }}
            onPaste={(e) => e.preventDefault()}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 h-12 px-4 border-2 border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 px-4 cursor-pointer ${config.buttonBg} text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${config.buttonShadow} hover:shadow-xl hover:scale-[1.02]`}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
            <XCircle size={12} />
            <span>Press ESC to cancel or click outside</span>
          </div>
        </div>
      </div>
    </div>
  );
}