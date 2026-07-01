import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, Lock, Unlock, Settings,
  Shield, AlertCircle, CheckCircle, XCircle, RefreshCw,
  Sparkles, Crown, Wallet, TrendingUp, TrendingDown,
  Calendar, Clock, FileText, Download, Eye, Edit2,
  Save, X, Loader2, Plus, Trash2
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '@/app/components/common/StatusBadge';
import Modal from '@/app/components/common/Modal';
import { apiGet, apiPost, apiPut } from '@/config/api';

interface PaymentSettings {
  enabled: boolean;
  provider: string;
  test_mode: boolean;
  api_key_configured: boolean;
  webhook_configured: boolean;
  api_key?: string;
  webhook_url?: string;
}

export default function SuperAdminPayments() {
  const { showSuccess, showError } = useToast();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [newEnabled, setNewEnabled] = useState(false);
  
  const [configForm, setConfigForm] = useState({
    provider: 'stripe',
    api_key: '',
    webhook_url: '',
    test_mode: true
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/superadmin/payments/settings');
      setSettings(data);
      setConfigForm({
        provider: data.provider || 'stripe',
        api_key: data.api_key || '',
        webhook_url: data.webhook_url || '',
        test_mode: data.test_mode !== undefined ? data.test_mode : true
      });
    } catch (err) {
      showError('Failed to load payment settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleTogglePayment = async () => {
    if (!settings) return;

    try {
      await apiPost('/superadmin/payments/toggle', { enabled: newEnabled });
      showSuccess(`Payment system ${newEnabled ? 'enabled' : 'disabled'} successfully`);
      setShowToggleModal(false);
      loadSettings();
    } catch (err: any) {
      showError(err.message || 'Failed to toggle payment system');
    }
  };

  const handleConfigurePayment = async () => {
    try {
      await apiPost('/superadmin/payments/configure', configForm);
      showSuccess('Payment configuration updated successfully');
      setShowConfigureModal(false);
      loadSettings();
    } catch (err: any) {
      showError(err.message || 'Failed to configure payment system');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

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
            <CreditCard size={28} className="text-rose-500" />
            Payment Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure and manage the payment system
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

      {/* Payment Status Card */}
      <div className={`bg-white dark:bg-slate-800/80 rounded-2xl p-6 border-2 ${
        settings?.enabled ? 'border-emerald-500/30 dark:border-emerald-500/20' : 'border-red-500/30 dark:border-red-500/20'
      } shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${
              settings?.enabled ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-red-100 dark:bg-red-950/30'
            } flex items-center justify-center`}>
              {settings?.enabled ? (
                <Unlock size={32} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Lock size={32} className="text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Payment System {settings?.enabled ? 'Active' : 'Disabled'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {settings?.enabled 
                  ? 'Payment processing is currently enabled and operational'
                  : 'Payment processing is currently disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setNewEnabled(!settings?.enabled);
              setShowToggleModal(true);
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              settings?.enabled
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
            }`}
          >
            {settings?.enabled ? 'Disable Payment' : 'Enable Payment'}
          </button>
        </div>
      </div>

      {/* Payment Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
              <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Configuration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Payment provider settings</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300">Provider</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {settings?.provider || 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300">Mode</span>
              <StatusBadge status={settings?.test_mode ? 'Test' : 'Live'} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300">API Key</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {settings?.api_key_configured ? '✅ Configured' : '❌ Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">Webhook</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {settings?.webhook_configured ? '✅ Configured' : '❌ Not configured'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setConfigForm({
                provider: settings?.provider || 'stripe',
                api_key: settings?.api_key || '',
                webhook_url: settings?.webhook_url || '',
                test_mode: settings?.test_mode !== undefined ? settings.test_mode : true
              });
              setShowConfigureModal(true);
            }}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium"
          >
            Configure Payment
          </button>
        </div>

        {/* Payment Stats */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
              <Wallet size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Payment Statistics</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Overview of payment activity</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">₹12.8L</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={12} />
                  +12.5%
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="text-xs text-slate-500 dark:text-slate-400">Transactions</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">342</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={12} />
                  +8.2%
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Monthly Recurring Revenue</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-100">₹8.4L</div>
                </div>
                <div className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-full">
                  +14.3%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Payment Modal */}
      <Modal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        title={newEnabled ? 'Enable Payment System' : 'Disable Payment System'}
        subtitle={newEnabled 
          ? 'This will start processing payments'
          : 'This will stop all payment processing'}
        icon={newEnabled ? Unlock : Lock}
        gradient={newEnabled ? 'from-emerald-600 to-green-600' : 'from-red-600 to-rose-600'}
        size="sm"
      >
        <div className="text-center py-4">
          <div className={`w-16 h-16 ${newEnabled ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-red-100 dark:bg-red-950/30'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <AlertCircle size={32} className={newEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to <strong>{newEnabled ? 'enable' : 'disable'}</strong> the payment system?
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {newEnabled
              ? 'All payment features will be activated for all users.'
              : 'All payment features will be deactivated. Users will not be able to make payments.'}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowToggleModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleTogglePayment}
              className={`flex-1 px-6 py-3 ${
                newEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white rounded-xl transition-all font-medium`}
            >
              {newEnabled ? 'Enable Payments' : 'Disable Payments'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Configure Payment Modal */}
      <Modal
        isOpen={showConfigureModal}
        onClose={() => setShowConfigureModal(false)}
        title="Configure Payment System"
        subtitle="Update payment provider settings"
        icon={Settings}
        gradient="from-indigo-600 to-purple-600"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Provider
            </label>
            <select
              value={configForm.provider}
              onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="stripe">Stripe</option>
              <option value="razorpay">Razorpay</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              API Key / Secret
            </label>
            <input
              type="password"
              value={configForm.api_key}
              onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter API key"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave blank to keep current key</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Webhook URL
            </label>
            <input
              type="text"
              value={configForm.webhook_url}
              onChange={(e) => setConfigForm({ ...configForm, webhook_url: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://your-domain.com/webhook"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={configForm.test_mode}
                onChange={(e) => setConfigForm({ ...configForm, test_mode: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Test Mode</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use test environment for payments</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowConfigureModal(false)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfigurePayment}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 font-medium"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}