import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Edit2, Trash2, X, Check,
  Shield, Crown, User, Mail, Phone, Building2,
  Sparkles, RefreshCw, AlertCircle, Loader2,
  CheckCircle, XCircle, UserPlus, MoreVertical,
  Award, Clock
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import DataTable from '@/app/components/common/DataTable';
import StatusBadge from '@/app/components/common/StatusBadge';
import Modal from '@/app/components/common/Modal';
import { apiGet, apiPut } from '@/config/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: 'client' | 'vendor' | 'admin' | 'super_admin';
  is_active: boolean;
  is_verified: boolean;
  vendor_name?: string;
  company_name?: string;
  created_at: string;
  last_login?: string;
  activity_count: number;
}

export default function SuperAdminUsers() {
  const { showSuccess, showError } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newRole, setNewRole] = useState<string>('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('is_active', statusFilter === 'active' ? 'true' : 'false');
      if (searchQuery) params.append('search', searchQuery);
      
      const data = await apiGet(`/superadmin/users?${params.toString()}`);
      setUsers(data);
    } catch (err) {
      showError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;

    try {
      const endpoint = selectedUser.is_active ? 'deactivate' : 'activate';
      await apiPut(`/superadmin/users/${selectedUser.id}/${endpoint}`);
      showSuccess(`User ${selectedUser.is_active ? 'deactivated' : 'activated'} successfully`);
      setShowDeactivateModal(false);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await apiPut(`/superadmin/users/${selectedUser.id}/role?new_role=${newRole}`);
      showSuccess(`User role changed to ${newRole}`);
      setShowRoleModal(false);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to change user role');
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; color: string }> = {
      client: { label: 'Client', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
      vendor: { label: 'Vendor', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
      super_admin: { label: 'Super Admin', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' },
    };
    const info = roles[role] || { label: role, color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${info.color}`}>{info.label}</span>;
  };

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
            row.role === 'super_admin' ? 'from-rose-500 to-pink-600' :
            row.role === 'admin' ? 'from-indigo-500 to-purple-600' :
            row.role === 'vendor' ? 'from-green-500 to-emerald-600' :
            'from-blue-500 to-indigo-600'
          } flex items-center justify-center text-white font-semibold text-sm shadow-lg flex-shrink-0`}>
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
      key: 'company',
      header: 'Company',
      render: (row: User) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.company_name || row.vendor_name || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: User) => <StatusBadge status={row.is_active ? 'Active' : 'Inactive'} />,
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
      key: 'activity',
      header: 'Activity',
      render: (row: User) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.activity_count || 0} actions
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedUser(row);
              setNewRole(row.role);
              setShowRoleModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            title="Change Role"
          >
            <Shield size={16} className="text-indigo-400 hover:text-indigo-600" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setShowDeactivateModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title={row.is_active ? 'Deactivate' : 'Activate'}
          >
            {row.is_active ? (
              <XCircle size={16} className="text-red-400 hover:text-red-600" />
            ) : (
              <CheckCircle size={16} className="text-emerald-400 hover:text-emerald-600" />
            )}
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users size={28} className="text-rose-500" />
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Full control over all platform users
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Active Users</div>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Inactive Users</div>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Admin Users</div>
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
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
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
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
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
      />

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change User Role"
        subtitle={`Changing role for ${selectedUser?.full_name || selectedUser?.email}`}
        icon={Shield}
        gradient="from-rose-600 to-pink-600"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Current Role
            </label>
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              {selectedUser && getRoleBadge(selectedUser.role)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowRoleModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeRole}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-rose-600/30 font-medium"
            >
              Change Role
            </button>
          </div>
        </div>
      </Modal>

      {/* Deactivate/Activate Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title={selectedUser?.is_active ? 'Deactivate User' : 'Activate User'}
        subtitle={`${selectedUser?.is_active ? 'Deactivate' : 'Activate'} ${selectedUser?.full_name || selectedUser?.email}`}
        icon={selectedUser?.is_active ? XCircle : CheckCircle}
        gradient={selectedUser?.is_active ? 'from-red-600 to-rose-600' : 'from-emerald-600 to-green-600'}
        size="sm"
      >
        <div className="text-center py-4">
          <div className={`w-16 h-16 ${selectedUser?.is_active ? 'bg-red-100 dark:bg-red-950/30' : 'bg-emerald-100 dark:bg-emerald-950/30'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            {selectedUser?.is_active ? (
              <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to <strong>{selectedUser?.is_active ? 'deactivate' : 'activate'}</strong> {selectedUser?.full_name}?
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {selectedUser?.is_active
              ? 'This user will not be able to log in or access the platform.'
              : 'This user will regain full access to the platform.'}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivateUser}
              className={`flex-1 px-6 py-3 ${
                selectedUser?.is_active
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white rounded-xl transition-all font-medium`}
            >
              {selectedUser?.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}