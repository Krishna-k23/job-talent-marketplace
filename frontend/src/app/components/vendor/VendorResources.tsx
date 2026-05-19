import { useEffect, useState } from 'react';
import { Search, Download, Plus, Eye, Edit2, Trash2, X, Upload } from 'lucide-react';

interface Resource {
  id: string;
  resource_id: string;
  name: string;
  skill_domain: string;
  experience: string;
  experience_years: number;
  availability: string;
  availability_days: number;
  base_rate: number;
  location: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  status: 'Available' | 'Busy' | 'On Leave';
}

const ITEMS_PER_PAGE = 10;

export function VendorResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form states for add/edit
  const [resourceName, setResourceName] = useState('');
  const [skillDomain, setSkillDomain] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  // Fetch resources
  const fetchResources = async () => {
    const token = getToken();
    if (!token) {
      console.log('No token found');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/resources/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map API response to our interface
        const mappedResources = data.map((resource: any) => ({
          id: resource.id,
          resource_id: resource.resource_id,
          name: resource.name,
          skill_domain: resource.skill_domain || resource.skillDomain,
          experience: resource.experience || `${resource.experience_years || 0} yrs`,
          experience_years: resource.experience_years || 0,
          availability: resource.availability || 'Available',
          availability_days: resource.availability_days || 0,
          base_rate: resource.base_rate || 0,
          location: resource.location || 'Not specified',
          email: resource.email || '',
          phone: resource.phone || '',
          summary: resource.summary || '',
          skills: resource.skills || [],
          status: resource.status || 'Available'
        }));
        setResources(mappedResources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Add resource
  const handleAddResource = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch('/api/resources/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: resourceName,
          skill_domain: skillDomain,
          experience: experience,
          experience_years: parseInt(experience) || 0,
          availability: availability,
          base_rate: parseFloat(baseRate) || 0,
          location: location,
          email: email,
          phone: phone,
          summary: summary,
          skills: selectedSkills,
          status: 'Available'
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        // Reset form
        setResourceName('');
        setSkillDomain('');
        setExperience('');
        setAvailability('');
        setBaseRate('');
        setLocation('');
        setEmail('');
        setPhone('');
        setSummary('');
        setSelectedSkills([]);
        // Refresh list
        fetchResources();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to add resource');
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource');
    }
  };

  // Update resource
  const handleUpdateResource = async () => {
    if (!editingResource) return;
    
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: resourceName,
          skill_domain: skillDomain,
          experience: experience,
          experience_years: parseInt(experience) || 0,
          availability: availability,
          base_rate: parseFloat(baseRate) || 0,
          location: location,
          email: email,
          phone: phone,
          summary: summary,
          skills: selectedSkills,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingResource(null);
        // Reset form
        setResourceName('');
        setSkillDomain('');
        setExperience('');
        setAvailability('');
        setBaseRate('');
        setLocation('');
        setEmail('');
        setPhone('');
        setSummary('');
        setSelectedSkills([]);
        // Refresh list
        fetchResources();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Failed to update resource');
    }
  };

  // Delete resource
  const handleDeleteResource = async () => {
    if (!selectedResource) return;
    
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch(`/api/resources/${selectedResource.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedResource(null);
        fetchResources();
      } else {
        alert('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setResourceName(resource.name);
    setSkillDomain(resource.skill_domain);
    setExperience(resource.experience);
    setAvailability(resource.availability);
    setBaseRate(resource.base_rate.toString());
    setLocation(resource.location);
    setEmail(resource.email);
    setPhone(resource.phone);
    setSummary(resource.summary);
    setSelectedSkills(resource.skills || []);
    setShowEditModal(true);
  };

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };

  // Filter resources based on search query
  const filteredResources = resources.filter((resource) =>
    resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.skill_domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / ITEMS_PER_PAGE));
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Resources</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">Manage all bench resources</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/30 self-start sm:self-auto text-sm sm:text-base"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search by name, skill, location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Download */}
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all text-sm flex-shrink-0">
            <Download size={18} strokeWidth={2.5} />
            <span>Download Roster</span>
          </button>
        </div>
      </div>

      {/* Resources — card grid (mobile) + table (md+) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Empty state */}
        {filteredResources.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
            {searchQuery ? `No resources found matching "${searchQuery}"` : 'No resources found. Add your first resource!'}
          </div>
        )}

        {/* Mobile card layout (hidden on md+) */}
        {paginatedResources.length > 0 && (
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
            {paginatedResources.map((resource, index) => (
              <div key={resource.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{resource.name}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{resource.resource_id || resource.id}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                    resource.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                    resource.status === 'Busy' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' :
                    'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                  }`}>{resource.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <span>{resource.skill_domain}</span>
                  <span>{resource.experience} exp</span>
                  <span>{resource.location}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">₹{resource.base_rate?.toLocaleString()}/mo</span>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleViewDetails(resource)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"><Eye size={16} /></button>
                  <button onClick={() => handleEdit(resource)} className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(resource)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop table layout (hidden on mobile) */}
        {paginatedResources.length > 0 && (
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Skill Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Exp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Availability</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Rate/mo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paginatedResources.map((resource, index) => (
                  <tr key={resource.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-slate-800 dark:text-slate-100">{resource.name}</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">{resource.resource_id || resource.id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{resource.skill_domain}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{resource.experience}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{resource.availability}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{resource.location}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">₹{resource.base_rate?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        resource.status === 'Busy' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>{resource.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleViewDetails(resource)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="View"><Eye size={16} strokeWidth={2.5} /></button>
                        <button onClick={() => handleEdit(resource)} className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors" title="Edit"><Edit2 size={16} strokeWidth={2.5} /></button>
                        <button onClick={() => handleDelete(resource)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Delete"><Trash2 size={16} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredResources.length > 0 && (
          <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredResources.length)} of {filteredResources.length}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg font-semibold transition-colors ${page === currentPage ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >{page}</button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Resource Modal - Keep your existing modal code */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-600 to-purple-700 sticky top-0">
              <h3 className="text-xl font-bold text-white">Add Resource</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Resource Name *</label>
                <input type="text" placeholder="Enter resource name" value={resourceName} onChange={(e) => setResourceName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Skill Domain *</label>
                <input type="text" placeholder="e.g., Full Stack Developer" value={skillDomain} onChange={(e) => setSkillDomain(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Experience (years) *</label>
                <input type="number" placeholder="e.g., 5" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Availability</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl">
                  <option value="Immediate">Immediate</option>
                  <option value="15 days">15 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60+ days">60+ days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Base Rate (₹/mo) *</label>
                <input type="number" placeholder="e.g., 120000" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location</label>
                <input type="text" placeholder="e.g., Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Phone</label>
                <input type="text" placeholder="Enter phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Skills (comma separated)</label>
                <input type="text" placeholder="e.g., AWS, Docker, Kubernetes" value={selectedSkills.join(', ')} onChange={(e) => setSelectedSkills(e.target.value.split(',').map(s => s.trim()))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Summary</label>
                <textarea placeholder="Enter summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl resize-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-slate-300 rounded-xl">Cancel</button>
                <button onClick={handleAddResource} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg shadow-green-600/30">Add Resource</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Details Modal */}
      {showDetailsModal && selectedResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Resource Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-white/20 rounded-lg"><X size={24} className="text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs text-slate-500 mb-1">Resource Name</div><div className="text-sm font-semibold">{selectedResource.name}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Skill Domain</div><div className="text-sm font-semibold">{selectedResource.skill_domain}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Experience</div><div className="text-sm font-semibold">{selectedResource.experience}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Base Rate</div><div className="text-sm font-semibold text-green-600">₹{selectedResource.base_rate?.toLocaleString()}/mo</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Availability</div><div className="text-sm font-semibold">{selectedResource.availability}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Location</div><div className="text-sm font-semibold">{selectedResource.location}</div></div>
              </div>
              <div><div className="text-xs text-slate-500 mb-2">Skills</div><div className="flex flex-wrap gap-2">{selectedResource.skills?.map((skill, i) => (<span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{skill}</span>))}</div></div>
              <div><div className="text-xs text-slate-500 mb-2">Summary</div><p className="text-sm text-slate-600">{selectedResource.summary || 'No summary provided'}</p></div>
              <div><div className="text-xs text-slate-500 mb-1">Status</div><div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${selectedResource.status === 'Available' ? 'bg-green-100 text-green-700' : selectedResource.status === 'Busy' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{selectedResource.status}</div></div>
              <button onClick={() => setShowDetailsModal(false)} className="w-full px-6 py-3 bg-slate-100 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditModal && editingResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 sticky top-0">
              <h3 className="text-xl font-bold text-white">Edit Resource</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-white/20 rounded-lg"><X size={24} className="text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold mb-2">Resource Name *</label><input type="text" value={resourceName} onChange={(e) => setResourceName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Skill Domain *</label><input type="text" value={skillDomain} onChange={(e) => setSkillDomain(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Experience (years) *</label><input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Availability</label><select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl"><option>Immediate</option><option>15 days</option><option>30 days</option><option>60+ days</option></select></div>
              <div><label className="block text-sm font-semibold mb-2">Base Rate (₹/mo) *</label><input type="number" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Skills (comma separated)</label><input type="text" value={selectedSkills.join(', ')} onChange={(e) => setSelectedSkills(e.target.value.split(',').map(s => s.trim()))} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 border rounded-xl">Cancel</button><button onClick={handleUpdateResource} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl">Update Resource</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} className="text-red-600" /></div>
              <h3 className="text-2xl font-bold mb-2">Delete Resource</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to delete <br /><span className="font-semibold">{selectedResource.name}</span>?</p>
              <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 border rounded-xl">Cancel</button><button onClick={handleDeleteResource} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl">Delete</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}