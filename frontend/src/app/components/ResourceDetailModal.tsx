// ResourceDetailModal.tsx - FIXED
import { X, Mail, Phone, MapPin, Clock, DollarSign, Briefcase, Award, Download, FileText, User, Activity, Tag, AlertCircle, Send } from 'lucide-react';
import React from 'react';

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
    status?: string;
    resume_url?: string | null;
    original_id?: number;
  };
  onClose: () => void;
  onToggleSave?: (id: string) => void;
  onDownloadResume?: (url: string, name: string) => void;
  onContact?: (resource: any) => void;
}

export function ResourceDetailModal({ 
  resource, 
  onClose, 
  onToggleSave, 
  onDownloadResume,
  onContact
}: ResourceDetailModalProps) {
  const getMatchColor = (match: number) => {
    if (match >= 90) return 'from-emerald-500 to-green-600';
    if (match >= 80) return 'from-blue-500 to-indigo-600';
    if (match >= 70) return 'from-amber-500 to-orange-600';
    return 'from-slate-400 to-slate-500';
  };

  const getMatchBadgeColor = (match: number) => {
    if (match >= 90) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (match >= 80) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (match >= 70) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${getMatchColor(resource.match)} p-6 rounded-t-3xl flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-white/80" />
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getMatchBadgeColor(resource.match)}`}>
                  {resource.match}% Match
                </span>
                {resource.status && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/20`}>
                    {resource.status === 'saved' ? 'Available' : 
                     resource.status === 'contacted' ? 'In Discussion' : 
                     resource.status === 'contracted' ? 'Contracted' : resource.status}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">{resource.name}</h2>
              <p className="text-white/90 text-sm flex items-center gap-2">
                <Briefcase size={14} />
                {resource.role}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <Clock size={12} className="text-blue-500" />
                Experience
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{resource.experience}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <Activity size={12} className="text-amber-500" />
                Availability
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{resource.availability}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <DollarSign size={12} className="text-emerald-500" />
                Rate
              </div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{resource.rate}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-purple-500" />
                Location
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{resource.location}</div>
            </div>
          </div>

          {/* Contact Info */}
          {(resource.email || resource.phone) && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Contact Information</h4>
              <div className="flex flex-wrap gap-4">
                {resource.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-blue-500" />
                    <a href={`mailto:${resource.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {resource.email}
                    </a>
                  </div>
                )}
                {resource.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-green-500" />
                    <a href={`tel:${resource.phone}`} className="text-green-600 dark:text-green-400 hover:underline">
                      {resource.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {resource.skills && resource.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-blue-500" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {resource.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {resource.summary && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-blue-500" />
                Summary
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 leading-relaxed">
                {resource.summary}
              </p>
            </div>
          )}

          {/* Resume Section */}
          {resource.resume_url && onDownloadResume && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Resume/CV</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {resource.resume_url.split('/').pop()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDownloadResume(resource.resume_url!, resource.name)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Download size={16} />
                  Download CV
                </button>
              </div>
            </div>
          )}

          {/* Resource ID */}
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2 border-t border-slate-200 dark:border-slate-700">
            Resource ID: {resource.id}
            {resource.original_id && (
              <span className="ml-2 text-slate-400">(DB ID: {resource.original_id})</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl">
          {/* Save Profile Button */}
          {onToggleSave && (
            <button
              onClick={() => {
                onToggleSave(resource.id);
                onClose();
              }}
              className="flex-1 min-w-[120px] px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} className="text-blue-500" />
              Save Profile
            </button>
          )}

          {/* Contact Resource Button */}
          {onContact && resource.status !== 'contracted' && (
            <button
              onClick={() => {
                console.log('📞 Contact button clicked from modal for:', resource);
                onContact(resource);
                onClose();
              }}
              className="flex-1 min-w-[120px] px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-purple-600/30 font-medium flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Contact Resource
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-1 min-w-[100px] px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/30 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}