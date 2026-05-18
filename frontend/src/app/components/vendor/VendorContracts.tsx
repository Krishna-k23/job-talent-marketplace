import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Calendar, DollarSign, CheckCircle, Clock, X } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    try {
      const response = await fetch('/api/contracts/', {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`/api/contracts/${contractId}/status?status=${status}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(prev =>
        prev.map(c => c.id === contractId ? { ...c, status: status as ApiContract['status'] } : c)
      );
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Pending': return 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Completed': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredContracts = contracts.filter(c =>
    (c.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contract_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.requirement_role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Contracts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor all your active contracts</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name or contract ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Filter size={20} />
          <span className="font-medium">Filter</span>
        </button>
      </div>

      {filteredContracts.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          {searchQuery ? `No contracts matching "${searchQuery}"` : 'No contracts found yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                    <FileText size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      {contract.client_name || 'Unknown Client'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{contract.contract_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Contract Value</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    ₹{contract.rate?.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {fmt(contract.start_date)} – {fmt(contract.end_date)}
                  </span>
                </div>
                {contract.requirement_role && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {contract.requirement_role}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setSelectedContract(contract); setShowDetailsModal(true); }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/30"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && selectedContract && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-600 to-purple-700">
              <div>
                <h3 className="text-xl font-bold text-white">Contract Details</h3>
                <p className="text-purple-100 text-sm mt-1">{selectedContract.contract_id}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400">Client Name</label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                      {selectedContract.client_name || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400">Contract ID</label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                      {selectedContract.contract_id}
                    </div>
                  </div>
                  {selectedContract.resource_name && (
                    <div className="space-y-2">
                      <label className="text-sm text-slate-500 dark:text-slate-400">Resource</label>
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                        {selectedContract.resource_name}
                      </div>
                    </div>
                  )}
                  {selectedContract.requirement_role && (
                    <div className="space-y-2">
                      <label className="text-sm text-slate-500 dark:text-slate-400">Role</label>
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                        {selectedContract.requirement_role}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedContract.description && (
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Description</h4>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200">
                    {selectedContract.description}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Duration & Billing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Calendar size={16} /> Start Date</label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                      {fmt(selectedContract.start_date)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Calendar size={16} /> End Date</label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                      {fmt(selectedContract.end_date)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><DollarSign size={16} /> Billing Cycle</label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200">
                      {selectedContract.billing_cycle}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><DollarSign size={16} /> Contract Value</label>
                    <div className="px-4 py-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg font-bold text-purple-600 dark:text-purple-400">
                      ₹{selectedContract.rate?.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Status</h4>
                <div className={`inline-flex px-4 py-2 rounded-xl font-semibold border items-center gap-2 ${getStatusColor(selectedContract.status)}`}>
                  {selectedContract.status === 'Active' && <CheckCircle size={18} />}
                  {selectedContract.status === 'Pending' && <Clock size={18} />}
                  {selectedContract.status === 'Completed' && <CheckCircle size={18} />}
                  {selectedContract.status}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
              {selectedContract.status === 'Pending' && (
                <button
                  onClick={() => { handleStatusUpdate(selectedContract.id, 'Active'); setShowDetailsModal(false); }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-600/30"
                >
                  Mark Active
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
