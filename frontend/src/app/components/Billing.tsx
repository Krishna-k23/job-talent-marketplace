import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Billing() {
  const [plans, setPlans] = useState<any[]>([]);

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // Fetch subscription plans and invoices
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          '/api/billing/plans'
        );

        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          '/api/billing/invoices',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setPaymentHistory(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchPlans();
    fetchInvoices();
  }, []);

  // Upgrade subscription
  const handleUpgrade = async (planName: string) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        '/api/subscriptions/upgrade',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: planName,
          }),
        }
      );

      alert(`Successfully upgraded to ${planName}`);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your subscription plan and payment history</p>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-8 shadow-lg border-2 transition-all duration-300 ${plan.highlighted
                ? 'border-primary shadow-xl shadow-blue-500/20 md:scale-105'
                : 'border-border hover:border-primary/50'
                }`}
            >
              {plan.highlighted && (
                <div className="inline-flex px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full h-11 font-semibold rounded-xl transition-all duration-200 ${plan.highlighted
                  ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-blue-600/25'
                  : 'border-2 border-border hover:border-primary text-foreground hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-700">
          <h2 className="text-2xl font-bold text-foreground">Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40 dark:bg-slate-700/60">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-all duration-150">
                  <td className="px-6 py-4 text-sm font-semibold text-primary">{payment.id}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{payment.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-sm font-semibold text-primary hover:text-success transition-colors">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
