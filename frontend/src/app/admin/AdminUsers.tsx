import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Plus, Filter, Edit2, Trash2, X, Check,
  Mail, Phone, User, Shield, Award, Building2, MoreVertical,
  CheckCircle, XCircle, AlertCircle, Loader2, Sparkles,
  ChevronDown, ChevronUp, UserPlus, RefreshCw,Lock
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import StatsCard from '../components/common/StatsCard';
// import ChartWidget from '../components/common/ChartWidget';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { apiGet } from '@/config/api';
// import { Modal } from "antd";
import Modal from "../components/common/Modal"

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: 'client' | 'vendor' | 'admin' | 'super_admin';
  is_active: boolean;
  is_verified: boolean;
  vendor_name?: string;
  profile_picture?: string;
  company_name?: string;
  created_at: string;
  last_login?: string;
  activity_count: number;
}

const USER_ROLES = [
  { value: 'client', label: 'Client', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  { value: 'vendor', label: 'Vendor', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
  { value: 'super_admin', label: 'Super Admin', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' },
];

export default function AdminUsers() {
  const { isAdmin, isSuperAdmin, fetchUsers, createUser, updateUser, deleteUser } = useAdmin();
  const { showSuccess, showError } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'client' as 'client' | 'vendor' | 'admin' | 'super_admin',
    vendor_name: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
      if (searchQuery) params.search = searchQuery;
      
      const data = await fetchUsers(params);
      setUsers(data);
    } catch (err) {
      showError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, roleFilter, statusFilter, searchQuery, showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    // Validate
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.full_name) errors.full_name = 'Full name is required';
    
    if (formData.role === 'vendor' && !formData.vendor_name) {
      errors.vendor_name = 'Vendor name is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await createUser(formData);
      showSuccess('User created successfully');
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
      };
      
      if (formData.role === 'vendor') {
        updateData.vendor_name = formData.vendor_name;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser(selectedUser.id, updateData);
      showSuccess('User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      showSuccess('User deactivated successfully');
      setShowDeleteModal(false);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to deactivate user');
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!isSuperAdmin && user.role === 'admin') {
      showError('Only super admin can modify admin accounts');
      return;
    }
    
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      showSuccess(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to update user status');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'client',
      vendor_name: '',
    });
    setFormErrors({});
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role,
      vendor_name: user.vendor_name || '',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleBadge = (role: string) => {
    const found = USER_ROLES.find(r => r.value === role);
    return found ? (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${found.color}`}>
        {found.label}
      </span>
    ) : (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
        {role}
      </span>
    );
  };

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg flex-shrink-0">
            {row.full_name?.charAt(0) || row.email.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">
              {row.full_name || 'Unknown'}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Mail size={12} />
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: User) => getRoleBadge(row.role),
    },
    {
      key: 'company_name',
      header: 'Company',
      render: (row: User) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.company_name || row.vendor_name || '-'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row: User) => (
        <StatusBadge status={row.is_active ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (row: User) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => (
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => handleToggleActive(row)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={row.is_active ? 'Deactivate' : 'Activate'}
            >
              {row.is_active ? (
                <XCircle size={16} className="text-red-400 hover:text-red-600" />
              ) : (
                <CheckCircle size={16} className="text-emerald-400 hover:text-emerald-600" />
              )}
            </button>
          )}
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} className="text-slate-400 hover:text-slate-600" />
          </button>
          {isSuperAdmin && row.role !== 'super_admin' && (
            <button
              onClick={() => openDeleteModal(row)}
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
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage all platform users and their roles
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
            <UserPlus size={18} />
            Add User
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
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {users.length} users found
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        onRowClick={(row) => openEditModal(row)}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
        subtitle="Create a new platform user account"
        icon={UserPlus}
        gradient="from-indigo-600 to-purple-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Mail size={14} className="inline mr-1.5 text-indigo-500" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                formErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
              placeholder="user@example.com"
            />
            {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Lock size={14} className="inline mr-1.5 text-indigo-500" />
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                formErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
              placeholder="Min 6 characters"
            />
            {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <User size={14} className="inline mr-1.5 text-indigo-500" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                formErrors.full_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
              placeholder="John Doe"
            />
            {formErrors.full_name && <p className="text-xs text-red-500 mt-1">{formErrors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Phone size={14} className="inline mr-1.5 text-indigo-500" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Shield size={14} className="inline mr-1.5 text-indigo-500" />
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
              {isSuperAdmin && (
                <>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </>
              )}
            </select>
          </div>

          {formData.role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Building2 size={14} className="inline mr-1.5 text-indigo-500" />
                Vendor Name *
              </label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 ${
                  formErrors.vendor_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                placeholder="Vendor Company Name"
              />
              {formErrors.vendor_name && <p className="text-xs text-red-500 mt-1">{formErrors.vendor_name}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              Create User
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        subtitle={`Managing ${selectedUser?.full_name || ''}`}
        icon={Edit2}
        gradient="from-indigo-600 to-purple-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Mail size={14} className="inline mr-1.5 text-indigo-500" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Lock size={14} className="inline mr-1.5 text-indigo-500" />
              New Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Leave blank to keep current"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Min 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <User size={14} className="inline mr-1.5 text-indigo-500" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Phone size={14} className="inline mr-1.5 text-indigo-500" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Shield size={14} className="inline mr-1.5 text-indigo-500" />
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
              {isSuperAdmin && (
                <>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </>
              )}
            </select>
          </div>

          {formData.role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Building2 size={14} className="inline mr-1.5 text-indigo-500" />
                Vendor Name
              </label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Deactivate User"
        subtitle={`This will deactivate ${selectedUser?.full_name || 'the user'}'s account`}
        icon={Trash2}
        gradient="from-red-600 to-rose-600"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to deactivate <strong>{selectedUser?.full_name}</strong>?
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            This user will not be able to log in. You can reactivate them later.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
            >
              Deactivate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}