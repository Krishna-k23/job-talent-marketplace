import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Download, Upload, Plus, Search } from 'lucide-react';
import { RequirementDetailModal } from './RequirementDetailModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Pagination } from './Pagination';
import { useToast } from '../contexts/ToastContext';

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
  const { showSuccess, showError } = useToast();
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

  // BULK UPLOAD FUNCTIONS - ADD THIS HERE
  const handleBulkUpload = async (file: File) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      showError('Please login first');  // REPLACE alert
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      showError('Please upload an Excel file (.xlsx, .xls) or CSV file');  // REPLACE alert
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/requirements/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(`Successfully uploaded ${result.count || result.length || 0} requirements`);  // REPLACE alert
        fetchRequirements();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to upload file');  // REPLACE alert
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Error uploading file. Please try again.');  // REPLACE alert
    }
  };

  const triggerFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleBulkUpload(file);
      }
    };
    input.click();
  };
  // END OF BULK UPLOAD FUNCTIONS

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">My Requirements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Manage and track all your job requirements</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30 self-start sm:self-auto flex-shrink-0 text-sm sm:text-base"
        >
          <Plus size={18} />
          Create New
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Job ID or Role..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 flex-shrink-0">
          {(['all', 'open', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${statusFilter === s
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
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
            All Requirements ({filteredRequirements.length})
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 flex items-center justify-center gap-2">
              <Download size={15} />
              <span className="hidden sm:inline">Download</span> CSV
            </button>
            {/* UPDATED BULK UPLOAD BUTTON WITH onClick */}
            <button
              onClick={triggerFileUpload}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Upload size={15} />
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
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${req.status === 'Open'
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