import { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, Download, Filter, Bookmark } from 'lucide-react';
import { ResourceDetailModal } from './ResourceDetailModal';

export function Resources() {
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'saved' | 'contacted'>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Saved', value: 0, color: 'from-blue-500 to-blue-600' },
    { label: 'Contacted', value: 0, color: 'from-green-500 to-green-600' },
    { label: 'In Discussion', value: 0, color: 'from-orange-500 to-orange-600' },
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
        const response = await fetch('/api/resources', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Transform API data to match component format
          const formattedResources = data.map((resource: any) => ({
            id: resource.resource_id || `RES-${resource.id}`,
            name: resource.name,
            role: resource.skill_domain || resource.name,
            experience: resource.experience || `${resource.experience_years || 0} yrs`,
            availability: resource.availability || 'Available',
            rate: resource.base_rate ? `₹${resource.base_rate.toLocaleString()}/mo` : '₹0/mo',
            location: resource.location || 'Not specified',
            skills: resource.skills || [],
            match: Math.floor(Math.random() * 30) + 70, // Random match between 70-100
            status: resource.status === 'Busy' ? 'contacted' : 'saved',
            lastContact: resource.updated_at ? new Date(resource.updated_at).toLocaleDateString() : 'Never',
            saved: resource.status !== 'Busy',
            email: resource.email || 'contact@vendor.com',
            phone: resource.phone || '+91 98765 43210',
            summary: resource.summary || `Experienced professional with ${resource.experience || '5+'} years of experience.`
          }));
          setResources(formattedResources);
          
          // Update stats
          const savedCount = formattedResources.filter((r: any) => r.saved).length;
          const contactedCount = formattedResources.filter((r: any) => r.status === 'contacted').length;
          setStats([
            { label: 'Total Saved', value: savedCount, color: 'from-blue-500 to-blue-600' },
            { label: 'Contacted', value: contactedCount, color: 'from-green-500 to-green-600' },
            { label: 'In Discussion', value: Math.floor(contactedCount / 2), color: 'from-orange-500 to-orange-600' },
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

  const filteredResources = resources.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'saved') return r.saved;
    if (filterStatus === 'contacted') return r.status === 'contacted';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold text-foreground mb-2">My Resources</h1>
        <p className="text-muted-foreground">Manage your saved and contacted talent profiles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
          >
            <div className="text-3xl font-semibold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-primary" />
            <span className="font-medium text-foreground">Filter by:</span>
            <div className="flex items-center gap-2">
              {(['all', 'saved', 'contacted'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    filterStatus === status
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-secondary text-muted-foreground hover:bg-blue-50 hover:text-primary'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium border-2 border-border hover:border-primary/50 rounded-lg hover:bg-secondary transition-all flex items-center gap-2">
            <Download size={16} />
            Export List
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative"
          >
            {/* Saved Badge */}
            {resource.saved && (
              <div className="absolute top-4 right-4">
                <Bookmark size={20} className="text-primary fill-primary" />
              </div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {resource.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">{resource.id}</span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    resource.match >= 90
                      ? 'bg-green-100 text-green-700'
                      : resource.match >= 85
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {resource.match}% Match
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{resource.role}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{resource.experience}</span>
                  <span>•</span>
                  <span>{resource.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar size={16} />
                <span>{resource.availability}</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                <span>{resource.rate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {resource.skills.slice(0, 4).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-medium bg-green-50 text-primary rounded-full border border-primary/20"
                >
                  {skill}
                </span>
              ))}
            </div>

            {resource.status === 'contacted' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <MessageSquare size={14} />
                  <span className="font-medium">Last contacted: {resource.lastContact}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedResource(resource)}
                className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25"
              >
                View Full Profile
              </button>
              <button className="px-4 h-11 border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-xl transition-all">
                <Star size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal resource={selectedResource} onClose={() => setSelectedResource(null)} />
      )}
    </div>
  );
}