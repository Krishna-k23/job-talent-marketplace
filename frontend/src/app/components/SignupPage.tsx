import { useState } from 'react';
import { Globe, Building2, Mail, Phone, User, Upload, ArrowRight, ArrowLeft, Check, Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SignupPageProps {
  onSignup: () => void;
  onBackToLogin: () => void;
  onBackToHome?: () => void;
}

export function SignupPage({ onSignup, onBackToLogin, onBackToHome }: SignupPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    websiteUrl: '',
    industry: '',
    companySize: '',
    name: '',
    email: '',
    phoneNumber: '',
    designation: '',
    otp: '',
    companyProof: null as File | null,
    agreeTerms: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('companyProof', e.target.files[0]);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // In handleSubmit function (step 3)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: 'tempPassword123', // Add password field to form
          full_name: formData.name,
          phone: formData.phoneNumber,
          role: 'client', // or 'vendor' based on selection
          company_name: formData.companyName,
          website: formData.websiteUrl,
          industry: formData.industry,
          company_size: formData.companySize,
          vendor_name: formData.companyName
        })
      });
      const data = await response.json();
      if (response.ok) {
        // After signup, send OTP
        await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        onSignup();
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background with Animation */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden items-center justify-center p-12">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        {/* Animated floating elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-12 animate-rotate-slow-cw"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 -rotate-6 animate-rotate-slow-ccw animate-float-1"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 rotate-45 animate-rotate-slow-cw animate-float-2" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 -rotate-12 animate-rotate-slow-ccw" style={{ animationDelay: '4s' }}></div>

        {/* Logo */}
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
        {/* Back to Home & Theme toggle */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          )}
          <div className={!onBackToHome ? 'ml-auto' : ''}>
            <ThemeToggle variant="auth" />
          </div>
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6">
          {/* Mobile Logo */}
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

          <p className="text-foreground text-center mb-8">Create your account</p>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'bg-primary text-white font-medium shadow-lg'
                    : currentStep > step
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300 border border-primary/30'
                    : 'bg-secondary text-muted-foreground border border-border'
                }`}
              >
                <span className="text-sm">
                  {step === 1 ? 'Company Details' : step === 2 ? 'Contact Details' : 'Verification'}
                </span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl border border-border p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-6">Company Details</h2>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                    className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">Website URL</label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="https://company.com"
                      className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology"
                      className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Company Size</label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                >
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-6">Contact Details</h2>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Full name"
                      className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="eswar@email.com"
                      className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">Designation</label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        placeholder="e.g., CEO, HR Manager"
                        className="w-full h-11 pl-11 pr-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                  >
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-6">Verification</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-medium">OTP sent to:</p>
                      <p className="text-sm text-blue-700">{formData.email}</p>
                    </div>
                    <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                      Edit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Domain OTP (email) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => handleInputChange('otp', e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="flex-1 h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <span className="text-sm text-primary font-medium">1:53</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Upload Company Proof (optional)
                  </label>
                  <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-all cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,image/*"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-foreground mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, or image up to 10MB</p>
                    </label>
                  </div>
                  {formData.companyProof && (
                    <p className="text-sm text-green-600 mt-2">File uploaded: {formData.companyProof.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                        className="w-5 h-5 rounded border-input text-primary focus:ring-primary cursor-pointer"
                        required
                      />
                      {formData.agreeTerms && (
                        <Check size={14} className="absolute text-white pointer-events-none" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-foreground font-medium">Agree to Terms & NDA</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        By signing up, you agree to our Terms of Service and NDA
                      </p>
                    </div>
                  </label>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-foreground font-medium">Email domain verified automatically</span>
                      <p className="text-xs text-muted-foreground mt-1">Your company email has been verified</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                  >
                    <span>Submit & Verify Account</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
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
