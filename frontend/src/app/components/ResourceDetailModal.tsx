// ResourceDetailModal.tsx - Ultra Premium Enhanced Version
import { 
  X, MapPin, Mail, Phone, Calendar, DollarSign, 
  Sparkles, Award, Briefcase, Users, Star, Bookmark,
  BookmarkCheck, Share2, MessageSquare, Clock, CheckCircle,
  ArrowRight, UserCircle, Globe, Linkedin, Twitter
} from 'lucide-react';

interface ResourceDetailModalProps {
  resource: {
    id: string;
    name: string;
    role: string;
    experience: string;
    availability: string;
    rate: string;
    location: string;
    email: string;
    phone: string;
    skills: string[];
    summary: string;
    match: number;
    saved?: boolean;
  };
  onClose: () => void;
  onToggleSave?: (id: string) => void;
}

export function ResourceDetailModal({ resource, onClose, onToggleSave }: ResourceDetailModalProps) {
  const getMatchColor = (match: number) => {
    if (match >= 90) return 'from-emerald-500 to-green-600';
    if (match >= 80) return 'from-blue-500 to-indigo-600';
    if (match >= 70) return 'from-amber-500 to-orange-600';
    return 'from-slate-400 to-slate-500';
  };

  const getMatchBadgeColor = (match: number) => {
    if (match >= 90) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
    if (match >= 80) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
    if (match >= 70) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200/60 dark:border-slate-700/50"
        style={{ maxHeight: 'calc(100vh - 1.5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Enhanced with gradient */}
        <div className="flex-shrink-0 relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-5 sm:py-6 rounded-t-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getMatchColor(resource.match)} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
                {resource.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-blue-100 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    {resource.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getMatchBadgeColor(resource.match)}`}>
                    <Award size={12} />
                    {resource.match}% Match
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{resource.name}</h2>
                <p className="text-sm text-blue-100 flex items-center gap-2">
                  <Briefcase size={14} />
                  {resource.role}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(resource.id)}
                  className="p-2 hover:bg-white/20 cursor-pointer rounded-xl transition-all text-white"
                  title={resource.saved ? "Remove from saved" : "Save resource"}
                >
                  {resource.saved ? (
                    <BookmarkCheck size={20} className="text-yellow-300" />
                  ) : (
                    <Bookmark size={20} />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 cursor-pointer rounded-xl transition-all text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Experience & Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Clock size={16} className="text-blue-500" />
                <span className="text-xs font-medium">Experience</span>
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{resource.experience}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Calendar size={16} className="text-amber-500" />
                <span className="text-xs font-medium">Availability</span>
              </div>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{resource.availability}</p>
            </div>
          </div>

          {/* Location & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <MapPin size={16} className="text-purple-500" />
                <span className="text-xs font-medium">Location</span>
              </div>
              <p className="text-base font-medium text-slate-800 dark:text-slate-100">{resource.location}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <DollarSign size={16} className="text-emerald-500" />
                <span className="text-xs font-medium">Rate</span>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{resource.rate}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Skills & Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {resource.skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Professional Summary
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {resource.summary}
            </p>
          </div>

          {/* Contact Details */}
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <UserCircle size={16} className="text-blue-600" />
              Contact Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{resource.email}</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
                  <Phone size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{resource.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Enhanced with actions */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 w-full cursor-pointer h-11 px-6 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Close
            </button>
            <button className="flex-1 w-full cursor-pointer h-11 px-6 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
              <MessageSquare size={16} />
              Contact Resource
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}