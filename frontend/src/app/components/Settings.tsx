import { useEffect, useState } from 'react';
import { Bell, Shield, CreditCard, User, Building2 } from 'lucide-react';

export function Settings() {

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // Fetch user data on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
        });

      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Update user profile
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      alert('Profile updated successfully');

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Company Profile</h2>
                <p className="text-sm text-muted-foreground">Update your company information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="Infosys Ltd"
                  className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Website</label>
                <input
                  type="url"
                  defaultValue="https://infosys.com"
                  className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Industry</label>
                <select className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200">
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>E-commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  rows={4}
                  defaultValue="Leading global technology services company"
                  className="w-full px-4 py-3 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-foreground dark:text-slate-200"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">User Profile</h2>
                <p className="text-sm text-muted-foreground">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full h-11 px-4 bg-secondary/30 dark:bg-slate-700 border border-input dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground dark:text-slate-200"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-6">
          {/* Billing Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <CreditCard size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Billing Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <span className="text-sm font-semibold text-foreground">Premium</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Billing Cycle</span>
                <span className="text-sm font-semibold text-foreground">Monthly</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Next Billing</span>
                <span className="text-sm font-semibold text-foreground">15 Apr 2024</span>
              </div>

              <button className="w-full h-10 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-all duration-200">
                Manage Billing
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
            </div>

            <div className="space-y-4">
              {[
                'Email notifications',
                'New candidate matches',
                'Application updates',
                'Weekly digest',
              ].map((item, idx) => (
                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {item}
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked={idx < 2}
                    className="w-11 h-6 rounded-full appearance-none bg-gray-300 dark:bg-slate-600 checked:bg-primary relative cursor-pointer transition-colors
                      before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5
                      before:transition-transform checked:before:translate-x-5"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Security</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full h-10 text-sm font-semibold text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left px-4">
                Change Password
              </button>
              <button className="w-full h-10 text-sm font-semibold text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left px-4">
                Enable Two-Factor Auth
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
