import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Download, Upload, Plus, Search } from 'lucide-react';
import { RequirementDetailModal } from './RequirementDetailModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Pagination } from './Pagination';

interface RequirementsProps {
  onViewMatches?: (jobId: string, matchCount: number) => void;
  onCreateNew?: () => void;
}

// Shape returned by GET /requirements/
interface ApiRequirement {
  id: number;
  requirement_id: string;
  role: string;
  experience_min?: number;
  experience_max?: number;
  budget_min?: number;
  budget_max?: number;
  skills?: string[];
  must_have_skills?: string[];
  good_to_have_skills?: string[];
  positions?: number;
  duration?: string;
  work_mode?: string;
  start_date?: string;
  location?: string;
  description?: string;
  status: string;
  matches_count?: number;
  created_at?: string;
  updated_at?: string;
}

function formatExperience(min?: number, max?: number): string {
  if (min != null && max != null) return `${min}–${max} yrs`;
  if (min != null) return `${min}+ yrs`;
  return 'N/A';
}

function formatBudget(min?: number, max?: number): string {
  if (min != null && max != null) return `₹${min.toLocaleString()}–₹${max.toLocaleString()}`;
  if (min != null) return `₹${min.toLocaleString()}+`;
  return 'N/A';
}

export function Requirements({ onViewMatches, onCreateNew }: RequirementsProps) {
  const [selectedRequirement, setSelectedRequirement] = useState<ApiRequirement | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: number; label: string }>({
    show: false,
    id: 0,
    label: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [requirements, setRequirements] = useState<ApiRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/requirements/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequirements(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch requirements:', response.status);
        setRequirements([]);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [statusFilter]);

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      await fetch(`/api/requirements/${deleteConfirmation.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirmation({ show: false, id: 0, label: '' });
      fetchRequirements();
    } catch (error) {
      console.error('Error deleting requirement:', error);
    }
  };

  const handleView = (req: ApiRequirement) => {
    setSelectedRequirement(req);
    setModalMode('view');
  };

  const handleEdit = (req: ApiRequirement) => {
    setSelectedRequirement(req);
    setModalMode('edit');
  };

  const handleDelete = (req: ApiRequirement) => {
    setDeleteConfirmation({ show: true, id: req.id, label: req.requirement_id });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, id: 0, label: '' });
  };

  // Client-side search filter on top of server-side status filter
  const filteredRequirements = requirements.filter((req) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (req.requirement_id || '').toLowerCase().includes(q) ||
      (req.role || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequirements = filteredRequirements.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">My Requirements</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track all your job requirements</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Job ID or Role..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          {(['all', 'open', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            All Requirements ({filteredRequirements.length})
          </h2>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 flex items-center gap-2">
              <Download size={16} />
              Download CSV
            </button>
            <button className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30">
              <Upload size={16} />
              Bulk Upload
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              No requirements found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  {['S.No', 'Job ID', 'Role', 'Experience', 'Budget', 'Status', 'Matching Profiles', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {currentRequirements.map((req, index) => (
                  <tr
                    key={req.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-150 group"
                  >
                    <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-blue-600 dark:text-blue-400">
                      {req.requirement_id}
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {req.role}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                      {formatExperience(req.experience_min, req.experience_max)}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatBudget(req.budget_min, req.budget_max)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          req.status === 'Open'
                            ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                            : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => onViewMatches?.(req.requirement_id, req.matches_count ?? 0)}
                        className="inline-flex px-4 py-2 text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-800"
                      >
                        View {req.matches_count ?? 0}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(req)}
                          className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 group-hover:scale-110"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(req)}
                          className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 group-hover:scale-110"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(req)}
                          className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 group-hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRequirements.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedRequirement && (
        <RequirementDetailModal
          requirement={selectedRequirement}
          mode={modalMode}
          onClose={() => setSelectedRequirement(null)}
        />
      )}

      {deleteConfirmation.show && (
        <DeleteConfirmationModal
          title="Delete Requirement?"
          message={`Are you sure you want to delete requirement ${deleteConfirmation.label}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
