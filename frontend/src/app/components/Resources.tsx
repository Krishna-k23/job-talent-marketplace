// Resources.tsx - Ultra Premium Enhanced Version with Working Bookmarks
import { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Calendar, Download, Filter, Bookmark, 
  Sparkles, Users, UserCheck, Briefcase, MapPin, DollarSign,
  Clock, Award, TrendingUp, ChevronRight, Eye, Zap,
  BookmarkCheck, BookmarkX
} from 'lucide-react';
import { ResourceDetailModal } from './ResourceDetailModal';

export function Resources() {
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'saved' | 'contacted'>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Saved', value: 0, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
    { label: 'Contacted', value: 0, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
    { label: 'In Discussion', value: 0, icon: Users, color: 'from-amber-500 to-orange-600' },
  ]);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/resources/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Load saved state from localStorage
          const savedResources = JSON.parse(localStorage.getItem('savedResources') || '{}');
          
          const formattedResources = data.map((resource: any) => ({
            id: resource.resource_id || `RES-${resource.id}`,
            name: resource.name,
            role: resource.skill_domain || resource.name,
            experience: resource.experience || `${resource.experience_years || 0} yrs`,
            availability: resource.availability || 'Available',
            rate: resource.base_rate ? `₹${resource.base_rate.toLocaleString()}/mo` : '₹0/mo',
            location: resource.location || 'Not specified',
            skills: resource.skills || [],
            match: Math.floor(Math.random() * 30) + 70,
            status: resource.status === 'Busy' ? 'contacted' : 'saved',
            lastContact: resource.updated_at ? new Date(resource.updated_at).toLocaleDateString() : 'Never',
            saved: savedResources[resource.id] !== undefined ? savedResources[resource.id] : resource.status !== 'Busy',
            email: resource.email || 'contact@vendor.com',
            phone: resource.phone || '+91 98765 43210',
            summary: resource.summary || `Experienced professional with ${resource.experience || '5+'} years of experience.`
          }));
          setResources(formattedResources);

          // Update stats
          const savedCount = formattedResources.filter((r: any) => r.saved).length;
          const contactedCount = formattedResources.filter((r: any) => r.status === 'contacted').length;
          setStats([
            { label: 'Total Saved', value: savedCount, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
            { label: 'Contacted', value: contactedCount, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
            { label: 'In Discussion', value: Math.floor(contactedCount / 2), icon: Users, color: 'from-amber-500 to-orange-600' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Toggle save/bookmark
  const toggleSave = (resourceId: string) => {
    setResources(prevResources => {
      const updatedResources = prevResources.map(r => {
        if (r.id === resourceId) {
          return { ...r, saved: !r.saved };
        }
        return r;
      });
      
      // Save to localStorage
      const savedResources: Record<string, boolean> = {};
      updatedResources.forEach(r => {
        savedResources[r.id] = r.saved;
      });
      localStorage.setItem('savedResources', JSON.stringify(savedResources));
      
      // Update stats
      const savedCount = updatedResources.filter(r => r.saved).length;
      const contactedCount = updatedResources.filter(r => r.status === 'contacted').length;
      setStats([
        { label: 'Total Saved', value: savedCount, icon: Bookmark, color: 'from-blue-500 to-indigo-600' },
        { label: 'Contacted', value: contactedCount, icon: MessageSquare, color: 'from-emerald-500 to-green-600' },
        { label: 'In Discussion', value: Math.floor(contactedCount / 2), icon: Users, color: 'from-amber-500 to-orange-600' },
      ]);
      
      return updatedResources;
    });
  };

  const filteredResources = resources.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'saved') return r.saved;
    if (filterStatus === 'contacted') return r.status === 'contacted';
    return true;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Resource Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              My Resources
            </h1>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
              <Users size={14} />
              <span>Manage your saved and contacted talent profiles</span>
            </p>
          </div>
          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-medium border border-white/20 text-sm hover:scale-105">
            <Download size={16} />
            Export List
          </button>
        </div>

        {/* Quick Stats */}
        <div className="relative mt-4 grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon size={14} className="text-blue-200" />
                  <span className="text-blue-100 text-xs">{stat.label}</span>
                </div>
                <div className="text-white font-bold text-lg mt-0.5">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
              {(['all', 'saved', 'contacted'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 cursor-pointer sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'saved' && (
                    <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {resources.filter(r => r.saved).length}
                    </span>
                  )}
                  {status === 'contacted' && (
                    <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {resources.filter(r => r.status === 'contacted').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{filteredResources.length} profiles</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>{resources.filter(r => r.saved).length} saved</span>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative"
          >
            {/* Save/Bookmark Button - Fixed */}
            <button
              onClick={() => toggleSave(resource.id)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group z-10"
              title={resource.saved ? "Remove from saved" : "Save resource"}
            >
              {resource.saved ? (
                <BookmarkCheck size={20} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
              ) : (
                <BookmarkX size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              )}
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getMatchColor(resource.match)} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                {resource.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                    {resource.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getMatchBadgeColor(resource.match)}`}>
                    <Award size={10} />
                    {resource.match}% Match
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                  {resource.role}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-blue-500" />
                    {resource.experience}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-purple-500" />
                    {resource.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar size={16} className="text-amber-500" />
                <span className="font-medium">{resource.availability}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <DollarSign size={16} />
                <span>{resource.rate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {resource.skills.slice(0, 4).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800"
                >
                  {skill}
                </span>
              ))}
              {resource.skills.length > 4 && (
                <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                  +{resource.skills.length - 4}
                </span>
              )}
            </div>

            {resource.status === 'contacted' && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <MessageSquare size={14} />
                  <span className="font-medium">Last contacted: {resource.lastContact}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedResource(resource)}
                className="flex-1 h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 group-hover:shadow-xl"
              >
                <Eye size={16} />
                View Full Profile
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => toggleSave(resource.id)}
                className={`px-4 cursor-pointer h-11 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  resource.saved 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700' 
                    : 'border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Star size={18} className={resource.saved ? 'fill-white' : ''} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl flex items-center justify-center mb-4">
            <Users size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No resources found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {filterStatus === 'saved' ? 'You haven\'t saved any resources yet' : 
             filterStatus === 'contacted' ? 'No contacted resources found' : 
             'No resources available'}
          </p>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)}
          onToggleSave={toggleSave}
        />
      )}
    </div>
  );
}