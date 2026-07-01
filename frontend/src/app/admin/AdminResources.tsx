import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Filter, Edit2, Trash2, X, Check,
  Mail, Phone, MapPin, DollarSign, Briefcase, Clock,
  Sparkles, ChevronDown, ChevronUp, Eye, RefreshCw,
  AlertCircle, Loader2, CheckCircle, XCircle, FileText,
  Download, Upload
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';;
import Modal from '../components/common/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

interface Resource {
  id: number;
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
  vendor_id: number;
  vendor_name?: string;
  created_at: string;
}

export default function AdminResources() {
  const { isAdmin, isSuperAdmin } = useAdmin();
  const { showSuccess, showError } = useToast();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [vendors, setVendors] = useState<{ id: number; name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    skill_domain: '',
    experience: '',
    experience_years: '',
    availability: 'Immediate',
    availability_days: '0',
    base_rate: '',
    location: '',
    email: '',
    phone: '',
    summary: '',
    skills: [] as string[],
    vendor_id: '',
    status: 'Available' as 'Available' | 'Busy' | 'On Leave'
  });
  const [skillInput, setSkillInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');
      
      const data = await apiGet(`/admin/resources?${params.toString()}`);
      setResources(data);
    } catch (err) {
      showError('Failed to load resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await apiGet('/admin/users?role=vendor&limit=100');
      setVendors(data.map((u: any) => ({ id: u.id, name: u.vendor_name || u.full_name || u.email })));
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  useEffect(() => {
    loadResources();
    loadVendors();
  }, [statusFilter, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResources();
    setRefreshing(false);
  };

  const handleCreateResource = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.skill_domain) errors.skill_domain = 'Skill domain is required';
    if (!formData.vendor_id) errors.vendor_id = 'Vendor is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.base_rate) errors.base_rate = 'Base rate is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await apiPost('/admin/resources', {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        base_rate: parseFloat(formData.base_rate) || 0,
        vendor_id: parseInt(formData.vendor_id),
        availability_days: parseInt(formData.availability_days) || 0
      });
      showSuccess('Resource created successfully');
      setShowCreateModal(false);
      resetForm();
      loadResources();
    } catch (err: any) {
      showError(err.message || 'Failed to create resource');
    }
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;

    try {
      await apiPut(`/admin/resources/${selectedResource.id}`, {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        base_rate: parseFloat(formData.base_rate) || 0,
        vendor_id: parseInt(formData.vendor_id),
        availability_days: parseInt(formData.availability_days) || 0
      });
      showSuccess('Resource updated successfully');
      setShowEditModal(false);
      loadResources();
    } catch (err: any) {
      showError(err.message || 'Failed to update resource');
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedResource) return;

    try {
      await apiDelete(`/admin/resources/${selectedResource.id}`);
      showSuccess('Resource deleted successfully');
      setShowDeleteModal(false);
      loadResources();
    } catch (err: any) {
      showError(err.message || 'Failed to delete resource');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      skill_domain: '',
      experience: '',
      experience_years: '',
      availability: 'Immediate',
      availability_days: '0',
      base_rate: '',
      location: '',
      email: '',
      phone: '',
      summary: '',
      skills: [],
      vendor_id: '',
      status: 'Available'
    });
    setSkillInput('');
    setFormErrors({});
  };

  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      skill_domain: resource.skill_domain || '',
      experience: resource.experience || '',
      experience_years: resource.experience_years?.toString() || '',
      availability: resource.availability || 'Immediate',
      availability_days: resource.availability_days?.toString() || '0',
      base_rate: resource.base_rate?.toString() || '',
      location: resource.location || '',
      email: resource.email || '',
      phone: resource.phone || '',
      summary: resource.summary || '',
      skills: resource.skills || [],
      vendor_id: resource.vendor_id?.toString() || '',
      status: resource.status || 'Available'
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
      key: 'name',
      header: 'Resource',
      render: (row: Resource) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">{row.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {row.resource_id}
          </div>
        </div>
      ),
    },
    {
      key: 'skill_domain',
      header: 'Skill Domain',
      render: (row: Resource) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.skill_domain || '-'}
        </span>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (row: Resource) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.vendor_name || `Vendor #${row.vendor_id}`}
        </span>
      ),
    },
    {
      key: 'experience_years',
      header: 'Experience',
      render: (row: Resource) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.experience_years || 0} yrs
        </span>
      ),
    },
    {
      key: 'base_rate',
      header: 'Rate',
      render: (row: Resource) => (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          ₹{row.base_rate?.toLocaleString() || 0}/mo
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Resource) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Resource) => (
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
                setSelectedResource(row);
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
            <Users size={28} className="text-indigo-500" />
            Resources Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage all vendor resources across the platform
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
            Add Resource
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
              placeholder="Search resources by name or skill..."
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
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {resources.length} resources found
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <DataTable
        columns={columns}
        data={resources}
        loading={loading}
        emptyMessage="No resources found"
      />

      {/* Create Resource Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Resource"
        subtitle="Add a new resource as admin"
        icon={Users}
        gradient="from-indigo-600 to-purple-600"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Resource Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="e.g., John Doe"
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Skill Domain *
              </label>
              <input
                type="text"
                value={formData.skill_domain}
                onChange={(e) => setFormData({ ...formData, skill_domain: e.target.value })}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                  formErrors.skill_domain ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="e.g., Full Stack Developer"
              />
              {formErrors.skill_domain && <p className="text-xs text-red-500 mt-1">{formErrors.skill_domain}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Vendor *
              </label>
              <select
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                  formErrors.vendor_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {formErrors.vendor_id && <p className="text-xs text-red-500 mt-1">{formErrors.vendor_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Base Rate (₹/mo) *
              </label>
              <input
                type="number"
                value={formData.base_rate}
                onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                  formErrors.base_rate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="0"
              />
              {formErrors.base_rate && <p className="text-xs text-red-500 mt-1">{formErrors.base_rate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Immediate">Immediate</option>
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
                <option value="60+ days">60+ days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+91 98765 43210"
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
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Resource summary..."
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
              onClick={handleCreateResource}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium"
            >
              Create Resource
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Resource Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resource"
        subtitle={`Editing ${selectedResource?.name || ''}`}
        icon={Edit2}
        gradient="from-indigo-600 to-purple-600"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Resource Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Skill Domain *
              </label>
              <input
                type="text"
                value={formData.skill_domain}
                onChange={(e) => setFormData({ ...formData, skill_domain: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Vendor
              </label>
              <select
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Base Rate (₹/mo) *
              </label>
              <input
                type="number"
                value={formData.base_rate}
                onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Immediate">Immediate</option>
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
                <option value="60+ days">60+ days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateResource}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium"
            >
              Update Resource
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resource"
        subtitle={`This will permanently delete ${selectedResource?.name || ''}`}
        icon={Trash2}
        gradient="from-red-600 to-rose-600"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <strong>{selectedResource?.name}</strong>?
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
              onClick={handleDeleteResource}
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