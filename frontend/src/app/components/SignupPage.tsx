// components/SignupPage.tsx
import { useState } from 'react';
import { Globe, Building2, Mail, Phone, User, Upload, ArrowRight, ArrowLeft, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SignupPageProps {
  onSignup: () => void;
  onBackToLogin: () => void;
  onBackToHome?: () => void;
}

export function SignupPage({ onSignup, onBackToLogin, onBackToHome }: SignupPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    role: 'client' as 'client' | 'vendor',
    companyName: '',
    websiteUrl: '',
    industry: '',
    companySize: '',
    name: '',
    email: '',
    phoneNumber: '',
    designation: '',
    password: '',
    confirmPassword: '',
    otp: '',
    companyProof: null as File | null,
    agreeTerms: false,
  });

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      handleInputChange('phoneNumber', digits);
    }
  };

  const handleEmailChange = (value: string) => {
    handleInputChange('email', value);
    if (error && error.includes('email')) {
      setError('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('companyProof', e.target.files[0]);
    }
  };

  const validateStep1 = () => {
    if (!formData.companyName.trim()) {
      setError('Please enter company name');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address (e.g., name@company.com)');
      return false;
    }
    
    if (!formData.phoneNumber) {
      setError('Please enter your phone number');
      return false;
    }
    
    if (!isValidPhone(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    
    if (!isValidPassword(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms & NDA to continue');
      return false;
    }
    if (formData.otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!validateStep2()) return;

      setLoading(true);
      setError('');
      try {
        const requestBody = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          full_name: formData.name.trim(),
          phone: `+91${formData.phoneNumber}`,
          role: formData.role,
          company_name: formData.companyName.trim(),
          website: formData.websiteUrl.trim() || null,
          industry: formData.industry || null,
          company_size: formData.companySize || null,
          designation: formData.designation || null,
          vendor_name: formData.role === 'vendor' ? formData.companyName.trim() : null,
        };

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (data.detail && Array.isArray(data.detail)) {
            const firstError = data.detail[0];
            setError(firstError.msg || 'Invalid input');
          } else {
            setError(data.detail || 'Sign up failed. Please try again.');
          }
          return;
        }
        
        setCurrentStep(3);
      } catch (err) {
        console.error('Signup error:', err);
        setError('Unable to connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), otp: formData.otp }),
      });
      const data = await response.json();
      if (response.ok) {
        onSignup();
      } else {
        setError(data.detail || 'Invalid or expired OTP. Please try again.');
      }
    } catch {
      setError('Unable to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      
      if (response.ok) {
        alert('OTP resent successfully! Please check your email.');
      } else {
        const data = await response.json();
        setError(data.detail || 'Could not resend OTP. Please try again.');
      }
    } catch {
      setError('Could not resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Bridging the gap between talent and demand.</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            The premium ecosystem for vendor bench management and seamless client engagements.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          {onBackToHome && (
            <button onClick={onBackToHome} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          )}
          <div className={!onBackToHome ? 'ml-auto' : ''}>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-6 px-6">
          {/* Mobile Logo */}
          <div className="lg:hidden absolute top-16 left-0 right-0 flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">BenchBridge</span>
          </div>

          <div className="w-full max-w-md">
            <div className="text-center mb-5">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Create your account</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {(['Company', 'Contact', 'Verify'] as const).map((label, i) => {
                const step = i + 1;
                return (
                  <div key={step} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                    currentStep === step ? 'bg-blue-600 text-white font-semibold' :
                    currentStep > step ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}>
                    {currentStep > step ? <Check size={11} /> : <span>{step}</span>}
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Company Details */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['client', 'vendor'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleInputChange('role', r)}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                            formData.role === r
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                          }`}
                        >
                          {r === 'client' ? '🏢 Client' : '🤝 Vendor'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="url" value={formData.websiteUrl} onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://company.com"
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                      <input type="text" value={formData.industry} onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="e.g., Technology"
                        className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
                      <select value={formData.companySize} onChange={(e) => handleInputChange('companySize', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white">
                        <option value="">Select</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501+">501+</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1.5">
                      {error}
                    </div>
                  )}

                  <button type="button" onClick={handleNext}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Full name"
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={formData.email} onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-gray-400">
                          <Phone size={12} />
                          <span className="text-[10px]">+91</span>
                        </div>
                        <input type="tel" value={formData.phoneNumber} onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="9876543210" maxLength={10}
                          className="w-full pl-12 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)}
                          placeholder="e.g., CEO"
                          className="w-full pl-7 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full pl-8 pr-7 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Repeat password"
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1.5">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleBack} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800">
                      <ArrowLeft size={12} /> Back
                    </button>
                    <button type="button" onClick={handleNext} disabled={loading}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                      {loading ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Continue & Send OTP</span><ArrowRight size={14} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: OTP Verification */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                    <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">OTP sent to:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">{formData.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Enter 6-digit OTP <span className="text-red-500">*</span></label>
                    <input type="text" inputMode="numeric" value={formData.otp} onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••" maxLength={6}
                      className="w-full px-3 py-1.5 text-center text-base tracking-[0.3em] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Company Proof (optional)</label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 text-center hover:border-blue-400 transition-all cursor-pointer">
                      <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" accept=".pdf,.doc,.docx,image/*" />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload size={18} className="mx-auto text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload</p>
                      </label>
                    </div>
                    {formData.companyProof && <p className="text-xs text-green-600 mt-1">Selected: {formData.companyProof.name}</p>}
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">I agree to the Terms of Service & NDA</span>
                  </label>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1.5">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleBack} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800">
                      <ArrowLeft size={12} /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                      {loading ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Verify & Create</span><ArrowRight size={14} /></>}
                    </button>
                  </div>

                  <div className="text-center">
                    <button type="button" onClick={handleResendOtp} className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                      Didn't receive? <span className="font-medium text-blue-600">Resend OTP</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <button type="button" onClick={onBackToLogin} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}