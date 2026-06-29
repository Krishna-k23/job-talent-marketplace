// Billing.tsx - With fixed stats calculation
import { Check, Sparkles, Download, CreditCard, Calendar, Clock, Zap, Crown, Shield, Rocket, Star, TrendingUp, Award, FileText, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Billing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [loading, setLoading] = useState(true);

  // Fetch subscription plans and invoices
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/billing/plans');
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([
          { 
            name: 'Free', 
            price: '₹0', 
            period: '/month', 
            highlighted: false, 
            icon: 'Zap',
            color: 'from-slate-400 to-slate-500',
            features: ['3 submissions/month', 'Basic search', 'No billing', 'Email support'] 
          },
          { 
            name: 'Pro', 
            price: '₹1,999', 
            period: '/month', 
            highlighted: true, 
            icon: 'Rocket',
            color: 'from-blue-500 to-indigo-600',
            features: ['20 submissions/month', 'Advanced filters', 'Priority email support', 'Analytics dashboard', 'API access'] 
          },
          { 
            name: 'Enterprise', 
            price: '₹9,999', 
            period: '/month', 
            highlighted: false, 
            icon: 'Crown',
            color: 'from-purple-500 to-pink-600',
            features: ['Unlimited submissions', 'Priority access', 'Dedicated account manager', 'Custom reports', 'Full API access', '24/7 support'] 
          }
        ]);
      }
    };

    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const response = await fetch('/api/billing/invoices', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentHistory(data);
        } else {
          setPaymentHistory([
            { id: 'INV-001', date: '2024-01-15', amount: 1999, status: 'Paid', description: 'Pro Plan - Monthly' },
            { id: 'INV-002', date: '2024-02-15', amount: 1999, status: 'Paid', description: 'Pro Plan - Monthly' },
            { id: 'INV-003', date: '2024-03-15', amount: 1999, status: 'Pending', description: 'Pro Plan - Monthly' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setPaymentHistory([
          { id: 'INV-001', date: '2024-01-15', amount: 1999, status: 'Paid', description: 'Pro Plan - Monthly' },
          { id: 'INV-002', date: '2024-02-15', amount: 1999, status: 'Paid', description: 'Pro Plan - Monthly' },
          { id: 'INV-003', date: '2024-03-15', amount: 1999, status: 'Pending', description: 'Pro Plan - Monthly' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    fetchInvoices();
  }, []);

  // Upgrade subscription
  const handleUpgrade = async (planName: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planName }),
      });

      if (response.ok) {
        alert(`Successfully upgraded to ${planName}`);
        setCurrentPlan(planName);
      } else {
        alert('Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    if (status?.toLowerCase() === 'paid') {
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
    if (status?.toLowerCase() === 'pending') {
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
    return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  const getStatusDot = (status: string) => {
    if (status?.toLowerCase() === 'paid') return 'bg-emerald-500';
    if (status?.toLowerCase() === 'pending') return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getPlanIcon = (iconName: string) => {
    switch(iconName) {
      case 'Zap': return <Zap size={24} />;
      case 'Rocket': return <Rocket size={24} />;
      case 'Crown': return <Crown size={24} />;
      default: return <Zap size={24} />;
    }
  };

  // FIXED: Handle both string and number amounts
  const stats = {
    totalSpent: paymentHistory.reduce((sum, p) => {
      const amount = p.amount;
      // Convert to string safely
      const amountStr = typeof amount === 'number' ? amount.toString() : (amount || '0');
      const numericValue = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;
      return sum + numericValue;
    }, 0),
    totalInvoices: paymentHistory.length,
    paidInvoices: paymentHistory.filter(p => p.status?.toLowerCase() === 'paid').length,
    pendingInvoices: paymentHistory.filter(p => p.status?.toLowerCase() === 'pending').length,
  };

  // Format amount for display
  const formatAmount = (amount: any) => {
    if (typeof amount === 'number') {
      return `₹${amount.toLocaleString()}`;
    }
    if (typeof amount === 'string') {
      // If it already has ₹ symbol or is formatted
      if (amount.startsWith('₹')) return amount;
      // If it's a numeric string
      const num = parseInt(amount.replace(/[^0-9]/g, ''));
      if (!isNaN(num)) return `₹${num.toLocaleString()}`;
      return amount;
    }
    return '₹0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Billing Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Billing & Subscription
            </h1>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
              <CreditCard size={14} />
              <span>Manage your subscription plan and payment history</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
              <span className="text-sm font-medium">Current Plan:</span>
              <span className="text-sm font-bold bg-white/20 px-3 py-0.5 rounded-full">{currentPlan}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats - Using the fixed stats */}
        <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-200' },
            { label: 'Total Invoices', value: stats.totalInvoices, icon: FileText, color: 'text-blue-200' },
            { label: 'Paid', value: stats.paidInvoices, icon: CheckCircle2, color: 'text-emerald-200' },
            { label: 'Pending', value: stats.pendingInvoices, icon: Clock, color: 'text-amber-200' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon size={14} className={stat.color} />
                  <span className="text-blue-100 text-xs">{stat.label}</span>
                </div>
                <div className="text-white font-bold text-lg mt-0.5">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Award size={22} className="text-blue-600" />
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, index) => {
            const isCurrent = plan.name === currentPlan;
            return (
              <div
                key={index}
                className={`group bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl border-2 transition-all duration-300 relative overflow-hidden ${
                  plan.highlighted
                    ? 'border-blue-500 dark:border-blue-400 shadow-blue-500/20 md:-translate-y-2'
                    : 'border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1'
                } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-1 -right-1">
                    <div className="relative">
                      <div className="w-20 h-20 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rotate-45 translate-x-8 -translate-y-8"></div>
                        <div className="absolute top-1.5 right-1.5 text-[8px] font-bold text-white rotate-45">
                          POPULAR
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                    Current Plan
                  </div>
                )}

                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                    {getPlanIcon(plan.icon)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-blue-600 dark:text-blue-400" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={isCurrent}
                    className={`w-full h-12 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : plan.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl'
                        : 'border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check size={16} />
                        Current Plan
                      </>
                    ) : (
                      <>
                        {plan.highlighted ? 'Upgrade Now' : 'Choose Plan'}
                        <ChevronRight size={16} className={plan.highlighted ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Payment History
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {paymentHistory.length} transactions
              </p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Download size={16} />
            Export All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CreditCard size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No payment history found</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Your transactions will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paymentHistory.map((payment, index) => (
                  <tr key={payment.id || index} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-lg">
                        {payment.id || `INV-${String(index + 1).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Calendar size={14} className="text-slate-400" />
                        {payment.date || '2024-01-15'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {payment.description || 'Subscription - Monthly'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatAmount(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(payment.status || 'Pending')}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(payment.status || 'Pending')}`}></span>
                        {payment.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => window.open('#', '_blank')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group-hover:gap-2"
                      >
                        <Download size={14} />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Need Help with Billing?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Contact our support team for any billing-related queries</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span>Contact Support</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}