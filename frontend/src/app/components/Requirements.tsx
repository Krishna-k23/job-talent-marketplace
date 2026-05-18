import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Download, Upload, Plus, Search, Filter } from 'lucide-react';
import { RequirementDetailModal } from './RequirementDetailModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Pagination } from './Pagination';

interface RequirementsProps {
  onViewMatches?: (jobId: string, matchCount: number) => void;
  onCreateNew?: () => void;
}

export function Requirements({ onViewMatches, onCreateNew }: RequirementsProps) {
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; jobId: string }>({
    show: false,
    jobId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  const [requirements, setRequirements] = useState<any[]>([]);

  const itemsPerPage = 7;

  // Fetch all requirements
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `/api/requirements?status=${statusFilter}&search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setRequirements(data);

      } catch (error) {
        console.error('Error fetching requirements:', error);
      }
    };

    fetchRequirements();

  }, [statusFilter, searchQuery, currentPage]);

  // Create requirement
  const handleCreateNew = async () => {
    onCreateNew?.();
  };

  // Delete requirement
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        `/api/requirements/${deleteConfirmation.jobId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeleteConfirmation({
        show: false,
        jobId: '',
      });

      // Refresh requirements
      window.location.reload();

    } catch (error) {
      console.error('Error deleting requirement:', error);
    }
  };


  const handleView = (req: any) => {
    setSelectedRequirement(req);
    setModalMode('view');
  };

  const handleEdit = (req: any) => {
    setSelectedRequirement(req);
    setModalMode('edit');
  };

  const handleDelete = (jobId: string) => {
    setDeleteConfirmation({ show: true, jobId });
  };


  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, jobId: '' });
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequirements = filteredRequirements.slice(startIndex, endIndex);

  const handleDownloadCSV = () => {
    console.log('Downloading all requirements as CSV');
  };

  const handleBulkUpload = () => {
    console.log('Opening bulk upload dialog');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">My Requirements</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track all your job requirements</p>
        </div>
        <button
          onClick={handleCreateNew}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === 'open'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            Open
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === 'closed'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">All Requirements ({filteredRequirements.length})</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 flex items-center gap-2"
            >
              <Download size={16} />
              Download CSV
            </button>
            <button
              onClick={handleBulkUpload}
              className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Upload size={16} />
              Bulk Upload
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  S.No
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Experience
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Budget
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Matching Profiles
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
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
                    {req.id}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {req.role}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                    {req.experience}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {req.budget}
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
                      onClick={() => onViewMatches?.(req.id, req.matches)}
                      className="inline-flex px-4 py-2 text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-800"
                    >
                      View {req.matches}
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
                        onClick={() => handleDelete(req.id)}
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
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRequirements.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
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
          message={`Are you sure you want to delete requirement ${deleteConfirmation.jobId}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
