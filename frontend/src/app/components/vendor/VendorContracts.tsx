// VendorContracts.tsx - Ultra Premium Enhanced Version
import { useState, useEffect } from 'react';
import { 
  Search, Filter, FileText, Calendar, DollarSign, CheckCircle, 
  Clock, X, Edit2, Save, Sparkles, Briefcase, User, 
  ChevronRight, Award, TrendingUp, Shield, Eye, 
  Mail, Phone, MapPin, Building2, Users
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// Shape returned by GET /contracts/
interface ApiContract {
  id: number;
  contract_id: string;
  client_id: number;
  vendor_id: number;
  requirement_id?: number;
  resource_id?: number;
  rate: number;
  billing_cycle: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: 'Active' | 'Pending' | 'Completed';
  created_at: string;
  client_name?: string;
  vendor_name?: string;
  requirement_role?: string;
  resource_name?: string;
}

const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

export function VendorContracts() {
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContract, setEditingContract] = useState<ApiContract | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editForm, setEditForm] = useState({
    status: '',
    rate: '',
    billing_cycle: '',
    description: ''
  });

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // API call with token refresh
  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = getToken();
    
    if (!token) {
      window.location.href = '/login';
      throw new Error('No token found');
    }
    
    const makeRequest = async (retryToken?: string) => {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${retryToken || token}`
      };
      
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });
      
      return response;
    };
    
    let response = await makeRequest();
    
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = getToken();
        response = await makeRequest(newToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    
    return response;
  };

  const fetchContracts = async () => {
    try {
      const response = await fetchWithAuth('/api/contracts/');
      if (response.ok) {
        const data = await response.json();
        setContracts(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch contracts:', response.status);
        setContracts([]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleStatusUpdate = async (contractId: number, status: string) => {
    try {
      const response = await fetchWithAuth(`/api/contracts/${contractId}/status?status=${status}`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        showSuccess(`Contract status updated to ${status}`);
        setContracts(prev =>
          prev.map(c => c.id === contractId ? { ...c, status: status as ApiContract['status'] } : c)
        );
        if (selectedContract && selectedContract.id === contractId) {
          setSelectedContract({ ...selectedContract, status: status as ApiContract['status'] });
        }
        setShowEditModal(false);
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update contract status');
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      showError('Failed to update contract status');
    }
  };

  const handleEditContract = (contract: ApiContract) => {
    setEditingContract(contract);
    setEditForm({
      status: contract.status,
      rate: contract.rate.toString(),
      billing_cycle: contract.billing_cycle,
      description: contract.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateContract = async () => {
    if (!editingContract) return;

    try {
      const updateData = {
        status: editForm.status,
        rate: parseFloat(editForm.rate),
        billing_cycle: editForm.billing_cycle,
        description: editForm.description
      };

      const response = await fetchWithAuth(`/api/contracts/${editingContract.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        showSuccess('Contract updated successfully!');
        setShowEditModal(false);
        setEditingContract(null);
        fetchContracts();
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      showError('Failed to update contract');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Pending': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Completed': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Pending': return 'bg-amber-500';
      case 'Completed': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      (c.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.contract_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.requirement_role || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'Active').length,
    pending: contracts.filter(c => c.status === 'Pending').length,
    completed: contracts.filter(c => c.status === 'Completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-emerald-100 text-xs font-medium">Contract Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Contacts
            </h1>
            <p className="text-emerald-100 text-sm mt-0.5 flex items-center gap-2">
              <Briefcase size={14} />
              <span>Manage and monitor all your active contacts</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
              <FileText size={16} className="text-emerald-200" />
              <span className="text-sm font-medium">{stats.total} Contacts</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative mt-4 grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'text-blue-200' },
            { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-200' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-200' },
            { label: 'Completed', value: stats.completed, icon: Award, color: 'text-purple-200' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon size={14} className={stat.color} />
                  <span className="text-emerald-100 text-xs">{stat.label}</span>
                </div>
                <div className="text-white font-bold text-lg mt-0.5">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, contract ID, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-colors ${
              showFilters ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowFilters(false)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={40} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No contacts found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery ? `No contacts matching "${searchQuery}"` : 'No contacts available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="group bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 relative"
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(contract.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(contract.status)}`}></span>
                  {contract.status}
                </span>
              </div>

              <div className="flex items-start gap-3 mb-3 pr-20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                  {contract.client_name?.charAt(0) || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                      {contract.contract_id}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
                    {contract.client_name || 'Unknown Client'}
                  </h3>
                  {contract.requirement_role && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {contract.requirement_role}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-500" />
                    Contract Value
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{contract.rate?.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    Duration
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {fmt(contract.start_date)} – {fmt(contract.end_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" />
                    Billing
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {contract.billing_cycle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedContract(contract); setShowDetailsModal(true); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/30 group-hover:shadow-xl"
                >
                  <Eye size={15} />
                  View Details
                </button>
                <button
                  onClick={() => handleEditContract(contract)}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                  title="Edit Contract"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal - Enhanced */}
      {showDetailsModal && selectedContract && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200/60 dark:border-slate-700/50"
            style={{ maxHeight: 'calc(100vh - 1.5rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 relative bg-gradient-to-r from-emerald-600 to-green-600 px-6 sm:px-8 py-5 sm:py-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-100 text-xs font-medium">Contract Details</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(selectedContract.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedContract.status)}`}></span>
                      {selectedContract.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedContract.contract_id}</h3>
                  <p className="text-emerald-100 text-sm mt-0.5">{selectedContract.client_name || 'Unknown Client'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { 
                      setShowDetailsModal(false);
                      handleEditContract(selectedContract);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <X size={24} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Client Information */}
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                  <Users size={16} className="text-emerald-600" />
                  Client Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Client Name</div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {selectedContract.client_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Contract ID</div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {selectedContract.contract_id}
                    </div>
                  </div>
                  {selectedContract.resource_name && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Resource</div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {selectedContract.resource_name}
                      </div>
                    </div>
                  )}
                  {selectedContract.requirement_role && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Role</div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {selectedContract.requirement_role}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedContract.description && (
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-emerald-600" />
                    Description
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedContract.description}
                  </p>
                </div>
              )}

              {/* Duration & Billing */}
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                  <DollarSign size={16} className="text-emerald-600" />
                  Duration & Billing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                      <Calendar size={12} /> Start Date
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {fmt(selectedContract.start_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                      <Calendar size={12} /> End Date
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {fmt(selectedContract.end_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                      <Clock size={12} /> Billing Cycle
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {selectedContract.billing_cycle}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                      <DollarSign size={12} /> Contract Value
                    </div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{selectedContract.rate?.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl flex items-center gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-6 cursor-pointer py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
              {selectedContract.status === 'Pending' && (
                <button
                  onClick={() => { handleStatusUpdate(selectedContract.id, 'Active'); setShowDetailsModal(false); }}
                  className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30"
                >
                  Mark Active
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Contract Modal - Enhanced */}
      {showEditModal && editingContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Edit Contract</h3>
                  <p className="text-emerald-100 text-sm mt-1">{editingContract.contract_id}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <DollarSign size={14} className="inline mr-1.5 text-emerald-500" />
                  Rate (₹/mo)
                </label>
                <input
                  type="number"
                  value={editForm.rate}
                  onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Clock size={14} className="inline mr-1.5 text-emerald-500" />
                  Billing Cycle
                </label>
                <select
                  value={editForm.billing_cycle}
                  onChange={(e) => setEditForm({ ...editForm, billing_cycle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <FileText size={14} className="inline mr-1.5 text-emerald-500" />
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleUpdateContract} className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/30 font-medium flex items-center justify-center gap-2">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}