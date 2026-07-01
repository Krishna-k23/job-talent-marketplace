import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Plus, Filter, Edit2, Trash2, X, Check,
  Calendar, DollarSign, MapPin, Clock, Users, Briefcase,
  Sparkles, ChevronDown, ChevronUp, Eye, RefreshCw,
  AlertCircle, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import StatsCard from '../components/common/StatsCard';
import ChartWidget from '../components/common/ChartWidget';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';;
import Modal from '../components/common/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

interface Requirement {
  description: string;
  id: number;
  requirement_id: string;
  role: string;
  client_id: number;
  client_name?: string;
  experience_min: number;
  experience_max: number;
  positions: number;
  skills: string[];
  budget_min: number;
  budget_max: number;
  duration: string;
  work_mode: string;
  location: string;
  status: 'Open' | 'Closed';
  created_at: string;
  matches_count: number;
}

export default function AdminRequirements() {
  const { isAdmin, isSuperAdmin } = useAdmin();
  const { showSuccess, showError } = useToast();
  
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    role: '',
    experience_min: '',
    experience_max: '',
    positions: '1',
    skills: [] as string[],
    budget_min: '',
    budget_max: '',
    duration: '6 Months',
    work_mode: 'Remote',
    location: '',
    description: '',
    client_id: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');
      
      const data = await apiGet(`/admin/requirements?${params.toString()}`);
      setRequirements(data);
    } catch (err) {
      showError('Failed to load requirements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [statusFilter, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequirements();
    setRefreshing(false);
  };

  const handleCreateRequirement = async () => {
    const errors: Record<string, string> = {};
    if (!formData.role) errors.role = 'Role is required';
    if (!formData.client_id) errors.client_id = 'Client is required';
    if (!formData.location) errors.location = 'Location is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await apiPost('/admin/requirements', {
        ...formData,
        experience_min: parseInt(formData.experience_min) || 0,
        experience_max: parseInt(formData.experience_max) || 0,
        positions: parseInt(formData.positions) || 1,
        budget_min: parseFloat(formData.budget_min) || 0,
        budget_max: parseFloat(formData.budget_max) || 0,
        client_id: parseInt(formData.client_id)
      });
      showSuccess('Requirement created successfully');
      setShowCreateModal(false);
      resetForm();
      loadRequirements();
    } catch (err: any) {
      showError(err.message || 'Failed to create requirement');
    }
  };

  const handleUpdateRequirement = async () => {
    if (!selectedRequirement) return;

    try {
      await apiPut(`/admin/requirements/${selectedRequirement.id}`, {
        ...formData,
        experience_min: parseInt(formData.experience_min) || 0,
        experience_max: parseInt(formData.experience_max) || 0,
        positions: parseInt(formData.positions) || 1,
        budget_min: parseFloat(formData.budget_min) || 0,
        budget_max: parseFloat(formData.budget_max) || 0
      });
      showSuccess('Requirement updated successfully');
      setShowEditModal(false);
      loadRequirements();
    } catch (err: any) {
      showError(err.message || 'Failed to update requirement');
    }
  };

  const handleDeleteRequirement = async () => {
    if (!selectedRequirement) return;

    try {
      await apiDelete(`/admin/requirements/${selectedRequirement.id}`);
      showSuccess('Requirement deleted successfully');
      setShowDeleteModal(false);
      loadRequirements();
    } catch (err: any) {
      showError(err.message || 'Failed to delete requirement');
    }
  };

  const resetForm = () => {
    setFormData({
      role: '',
      experience_min: '',
      experience_max: '',
      positions: '1',
      skills: [],
      budget_min: '',
      budget_max: '',
      duration: '6 Months',
      work_mode: 'Remote',
      location: '',
      description: '',
      client_id: ''
    });
    setSkillInput('');
    setFormErrors({});
  };

  const openEditModal = (req: Requirement) => {
    setSelectedRequirement(req);
    setFormData({
      role: req.role,
      experience_min: req.experience_min?.toString() || '',
      experience_max: req.experience_max?.toString() || '',
      positions: req.positions?.toString() || '1',
      skills: req.skills || [],
      budget_min: req.budget_min?.toString() || '',
      budget_max: req.budget_max?.toString() || '',
      duration: req.duration || '6 Months',
      work_mode: req.work_mode || 'Remote',
      location: req.location || '',
      description: req.description || '',
      client_id: req.client_id?.toString() || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const columns = [
    {
      key: 'requirement_id',
      header: 'ID',
      render: (row: Requirement) => (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {row.requirement_id}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: Requirement) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">{row.role}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {row.client_name || `Client #${row.client_id}`}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (row: Requirement) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.location || 'Remote'}
        </span>
      ),
    },
    {
      key: 'positions',
      header: 'Positions',
      render: (row: Requirement) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {row.positions || 1}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row: Requirement) => (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          ₹{row.budget_min?.toLocaleString()} - ₹{row.budget_max?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Requirement) => <StatusBadge status={row.status} />,
    },
    {
      key: 'matches',
      header: 'Matches',
      render: (row: Requirement) => (
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {row.matches_count || 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Requirement) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} className="text-slate-400 hover:text-slate-600" />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => {
                setSelectedRequirement(row);
                setShowDeleteModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} className="text-red-400 hover:text-red-600" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText size={28} className="text-indigo-500" />
            Requirements Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage all client requirements across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            Add Requirement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search requirements by role or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {requirements.length} requirements found
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <DataTable
        columns={columns}
        data={requirements}
        loading={loading}
        emptyMessage="No requirements found"
      />

      {/* Create Requirement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Requirement"
        subtitle="Add a new requirement as admin"
        icon={FileText}
        gradient="from-indigo-600 to-purple-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                formErrors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="e.g., Senior Software Engineer"
            />
            {formErrors.role && <p className="text-xs text-red-500 mt-1">{formErrors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Experience (Min)
              </label>
              <input
                type="number"
                value={formData.experience_min}
                onChange={(e) => setFormData({ ...formData, experience_min: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Experience (Max)
              </label>
              <input
                type="number"
                value={formData.experience_max}
                onChange={(e) => setFormData({ ...formData, experience_max: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Positions
              </label>
              <input
                type="number"
                value={formData.positions}
                onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                  formErrors.location ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="e.g., Bangalore"
              />
              {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Budget (Min)
              </label>
              <input
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Budget (Max)
              </label>
              <input
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., React, Node.js"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium border border-indigo-200 dark:border-indigo-800"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Job description..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRequirement}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium"
            >
              Create Requirement
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Requirement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Requirement"
        subtitle={`Editing ${selectedRequirement?.requirement_id || ''}`}
        icon={Edit2}
        gradient="from-indigo-600 to-purple-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Experience (Min)
              </label>
              <input
                type="number"
                value={formData.experience_min}
                onChange={(e) => setFormData({ ...formData, experience_min: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Experience (Max)
              </label>
              <input
                type="number"
                value={formData.experience_max}
                onChange={(e) => setFormData({ ...formData, experience_max: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Budget (Min)
              </label>
              <input
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Budget (Max)
              </label>
              <input
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={selectedRequirement?.status || 'Open'}
              onChange={(e) => {
                if (selectedRequirement) {
                  setSelectedRequirement({
                    ...selectedRequirement,
                    status: e.target.value as 'Open' | 'Closed'
                  });
                }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRequirement}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium"
            >
              Update Requirement
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Requirement"
        subtitle={`This will permanently delete ${selectedRequirement?.requirement_id || ''}`}
        icon={Trash2}
        gradient="from-red-600 to-rose-600"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <strong>{selectedRequirement?.requirement_id}</strong>?
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            This action cannot be undone. All matches and related data will be removed.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRequirement}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}