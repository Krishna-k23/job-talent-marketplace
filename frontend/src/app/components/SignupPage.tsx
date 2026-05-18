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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('companyProof', e.target.files[0]);
    }
  };

  // Step 1 → 2: just advance
  // Step 2 → 3: call /signup API (creates user + sends OTP automatically)
  const handleNext = async () => {
    if (currentStep === 2) {
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.name,
            phone: formData.phoneNumber,
            role: formData.role,
            company_name: formData.companyName,
            website: formData.websiteUrl,
            industry: formData.industry,
            company_size: formData.companySize,
            vendor_name: formData.role === 'vendor' ? formData.companyName : undefined,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.detail || 'Sign up failed. Please try again.');
          return;
        }
        // OTP was already sent by the backend — move to verification step
        setCurrentStep(3);
      } catch {
        setError('Unable to connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setError('');
  };

  // Step 3: verify OTP then complete signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms & NDA to continue.');
      return;
    }
    if (formData.otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
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
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
    } catch {
      setError('Could not resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-12 animate-rotate-slow-cw"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 -rotate-6 animate-rotate-slow-ccw animate-float-1"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to BenchBridge</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Join thousands of companies connecting with top talent worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-background relative overflow-y-auto">
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          {onBackToHome && (
            <button onClick={onBackToHome} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} />
              Back to Home
            </button>
          )}
          <div className={!onBackToHome ? 'ml-auto' : ''}>
            <ThemeToggle variant="auth" />
          </div>
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center py-16 px-6">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">BenchBridge</span>
          </div>

          <p className="text-foreground text-center mb-6 font-medium">Create your account</p>

          {/* Progress Steps */}
          <div className="flex items-center gap-3 mb-8">
            {(['Company', 'Contact', 'Verify'] as const).map((label, i) => {
              const step = i + 1;
              return (
                <div key={step} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  currentStep === step ? 'bg-primary text-white font-semibold shadow-lg' :
                  currentStep > step ? 'bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300 border border-primary/30' :
                  'bg-secondary text-muted-foreground border border-border'
                }`}>
                  {currentStep > step ? <Check size={14} /> : <span>{step}</span>}
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl border border-border p-8">
            <form onSubmit={handleSubmit}>

              {/* Step 1: Company Details */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">Company Details</h2>

                  {/* Role selection */}
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Account Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['client', 'vendor'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleInputChange('role', r)}
                          className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2 ${
                            formData.role === r
                              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                              : 'bg-white dark:bg-slate-800 text-foreground border-border hover:border-primary/50'
                          }`}
                        >
                          {r === 'client' ? '🏢 Client (Hiring)' : '🤝 Vendor (Staffing)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name" required
                      className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Website URL</label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="url" value={formData.websiteUrl} onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://company.com"
                        className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-card-foreground mb-2">Industry</label>
                      <input type="text" value={formData.industry} onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="e.g., Technology"
                        className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-card-foreground mb-2">Company Size</label>
                      <select value={formData.companySize} onChange={(e) => handleInputChange('companySize', e.target.value)}
                        className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>
                  </div>

                  <button type="button" onClick={handleNext}
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 2: Contact Details + Password */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">Contact Details</h2>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Full name" required
                        className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="you@company.com" required
                        className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-card-foreground mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="+91 XXXXX XXXXX" required
                          className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-card-foreground mb-2">Designation</label>
                      <div className="relative">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)}
                          placeholder="e.g., CEO, HR Manager"
                          className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Min. 8 characters" required
                        className="w-full h-11 pl-11 pr-12 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Repeat your password" required
                        className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">{error}</p>}

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="button" onClick={handleNext} disabled={loading}
                      className="flex-1 h-11 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Continue & Send OTP</span><ArrowRight size={18} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: OTP Verification */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">Verify Your Email</h2>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">OTP sent to:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">{formData.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Check your inbox. If no email arrives, check the backend terminal — the OTP is printed to console when SMTP is not configured.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Enter 6-digit OTP <span className="text-red-500">*</span></label>
                    <input type="text" inputMode="numeric" value={formData.otp} onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •" maxLength={6}
                      className="w-full h-14 px-4 text-center text-2xl font-bold tracking-[0.5em] bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Upload Company Proof (optional)</label>
                    <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-all cursor-pointer">
                      <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" accept=".pdf,.doc,.docx,image/*" />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload size={28} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-foreground mb-1">Click to upload</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, or image</p>
                      </label>
                    </div>
                    {formData.companyProof && <p className="text-sm text-green-600 mt-2">Selected: {formData.companyProof.name}</p>}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary cursor-pointer" />
                    <div>
                      <span className="text-sm text-foreground font-medium">I agree to the Terms of Service & NDA</span>
                      <p className="text-xs text-muted-foreground mt-1">Required to create your account</p>
                    </div>
                  </label>

                  {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">{error}</p>}

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 h-11 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Verify & Create Account</span><ArrowRight size={18} /></>}
                    </button>
                  </div>

                  <div className="text-center">
                    <button type="button" onClick={handleResendOtp} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Didn't receive the code? <span className="font-medium text-primary">Resend OTP</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={onBackToLogin} className="text-primary hover:text-primary/80 font-medium transition-colors">
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
