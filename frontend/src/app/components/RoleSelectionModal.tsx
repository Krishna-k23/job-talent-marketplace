// components/RoleSelectionModal.tsx
import { Building2, Users, X } from 'lucide-react';
import LogoLight from '../../assets/Logo 3.png';
import LogoDark from '../../assets/Logo 4.png';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'client' | 'vendor') => void;
}

export function RoleSelectionModal({ isOpen, onClose, onSelectRole }: RoleSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/60 dark:border-slate-700/50">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-white/20 flex-shrink-0">
              <img src={LogoLight} alt="BenchAstra" className="w-full h-full object-cover dark:hidden" />
              <img src={LogoDark} alt="BenchAstra" className="w-full h-full object-cover hidden dark:block" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Choose Your Role</h2>
              <p className="text-blue-100 text-sm">Select how you want to use BenchAstra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <button
            onClick={() => onSelectRole('client')}
            className="w-full group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Building2 size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Client</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Post requirements and find talent</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <span>Find resources</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>Hire professionals</span>
                </div>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectRole('vendor')}
            className="w-full group p-5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl border-2 border-transparent hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Users size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Vendor</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage resources and find work</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Showcase talent</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>Get hired</span>
                </div>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
            You can change your role later from settings
          </p>
        </div>
      </div>
    </div>
  );
}