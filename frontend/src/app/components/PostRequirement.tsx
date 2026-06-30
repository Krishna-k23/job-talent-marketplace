// PostRequirement.tsx - Enhanced with Experience Dropdown & Role-Based Skills
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, X, Plus, ChevronDown, Sparkles, Briefcase, Clock, DollarSign, MapPin, Calendar, Users, Tag, FileText } from 'lucide-react';
import { DatePicker } from './DatePicker';
import React from 'react';
import { createPortal } from 'react-dom';

interface PostRequirementProps {
  onClose: () => void;
}

interface FormErrors {
  role?: string;
  experience?: string;
  positions?: string;
  skills?: string;
  budgetMin?: string;
  budgetMax?: string;
  description?: string;
}

// Role-Skills mapping
const roleSkillsMap: Record<string, string[]> = {
  'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'Git', 'Ansible'],
  'Software Engineer': ['Python', 'Java', 'Git', 'Linux', 'SQL', 'Data Structures', 'Algorithms'],
  'Senior Software Engineer': ['Python', 'Java', 'Git', 'Linux', 'SQL', 'System Design', 'Microservices', 'AWS'],
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Express', 'HTML', 'CSS'],
  'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Redux', 'Next.js'],
  'Backend Developer': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'Express', 'Django', 'Spring Boot'],
  'React Developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'Next.js', 'Tailwind'],
  'Angular Developer': ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'RxJS', 'Redux'],
  'Vue.js Developer': ['Vue.js', 'JavaScript', 'HTML', 'CSS', 'Vuex', 'Nuxt.js', 'Pinia'],
  'Node.js Developer': ['Node.js', 'Express', 'JavaScript', 'MongoDB', 'SQL', 'REST API', 'GraphQL'],
  'Python Developer': ['Python', 'Django', 'Flask', 'SQL', 'Pandas', 'NumPy', 'FastAPI', 'Git'],
  'Java Developer': ['Java', 'Spring Boot', 'Hibernate', 'SQL', 'Microservices', 'Maven', 'Git'],
  'C# Developer': ['C#', '.NET Core', 'SQL', 'Entity Framework', 'ASP.NET', 'Azure', 'Git'],
  'PHP Developer': ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'Git'],
  'Mobile Developer': ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript', 'Dart', 'Swift', 'Kotlin'],
  'iOS Developer': ['Swift', 'iOS SDK', 'Xcode', 'Objective-C', 'UIKit', 'CoreData', 'Git'],
  'Android Developer': ['Kotlin', 'Android SDK', 'Java', 'Android Studio', 'Jetpack', 'Git'],
  'Flutter Developer': ['Flutter', 'Dart', 'Android', 'iOS', 'Firebase', 'REST API', 'Git'],
  'React Native Developer': ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'iOS', 'Android', 'Git'],
  'Data Engineer': ['Python', 'SQL', 'Pyspark', 'Hadoop', 'Kafka', 'Airflow', 'AWS', 'Snowflake'],
  'Data Scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'Pandas', 'NumPy', 'Scikit-learn'],
  'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Docker', 'AWS', 'MongoDB'],
  'AI Engineer': ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Deep Learning', 'AWS'],
  'Cloud Engineer': ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'Linux', 'Git'],
  'AWS Engineer': ['AWS', 'EC2', 'S3', 'Lambda', 'CloudFormation', 'Terraform', 'Docker', 'Kubernetes'],
  'Azure Engineer': ['Azure', 'Azure DevOps', 'ARM Templates', 'Docker', 'Kubernetes', 'PowerShell'],
  'GCP Engineer': ['GCP', 'Compute Engine', 'Kubernetes', 'Terraform', 'Docker', 'Python', 'Linux'],
  'Kubernetes Engineer': ['Kubernetes', 'Docker', 'Helm', 'AWS', 'Azure', 'GCP', 'Linux', 'Git'],
  'Docker Engineer': ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Linux', 'Git', 'Python'],
  'Security Engineer': ['Network Security', 'AWS Security', 'Azure Security', 'Kubernetes Security', 'Linux', 'Python'],
  'Network Engineer': ['Cisco', 'Network Security', 'Linux', 'AWS', 'Azure', 'TCP/IP', 'DNS', 'Firewalls'],
  'System Administrator': ['Linux', 'Windows Server', 'VMware', 'AWS', 'Azure', 'Networking', 'Active Directory'],
  'Database Administrator': ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Oracle', 'Performance Tuning', 'Backup Recovery'],
  'DBA': ['SQL', 'PostgreSQL', 'MySQL', 'Oracle', 'Performance Tuning', 'Data Modeling', 'ETL'],
  'Business Analyst': ['SQL', 'Excel', 'Tableau', 'Power BI', 'Agile', 'Scrum', 'Communication'],
  'Product Manager': ['Agile', 'Scrum', 'Product Strategy', 'Market Research', 'User Stories', 'Roadmap', 'Communication'],
  'Project Manager': ['Agile', 'Scrum', 'Project Planning', 'Risk Management', 'Communication', 'JIRA', 'MS Project'],
  'Scrum Master': ['Agile', 'Scrum', 'JIRA', 'Confluence', 'Communication', 'Facilitation', 'Coaching'],
  'Agile Coach': ['Agile', 'Scrum', 'Kanban', 'Lean', 'Coaching', 'Mentoring', 'JIRA', 'Confluence'],
  'UX Designer': ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing', 'Usability Testing'],
  'UI Designer': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'CSS', 'Prototyping', 'Design Systems'],
  'Product Designer': ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'UX Research', 'Wireframing', 'Design Systems'],
  'Graphic Designer': ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Branding', 'Typography', 'Print Design'],
  'Technical Writer': ['Technical Writing', 'Documentation', 'API Documentation', 'Markdown', 'Confluence', 'Git'],
  'QA Engineer': ['Manual Testing', 'Automation', 'Selenium', 'JIRA', 'Test Cases', 'Regression Testing', 'Agile'],
  'Test Automation Engineer': ['Selenium', 'Cypress', 'Python', 'Java', 'Jenkins', 'Docker', 'Git', 'API Testing'],
  'Performance Test Engineer': ['LoadRunner', 'JMeter', 'Performance Testing', 'Scalability', 'Python', 'Java', 'AWS'],
  'SRE': ['Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'Python', 'Linux', 'Terraform', 'Prometheus'],
  'Site Reliability Engineer': ['Kubernetes', 'Docker', 'AWS', 'Azure', 'Python', 'Linux', 'Terraform', 'Grafana'],
  'DevSecOps Engineer': ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Security Scanning', 'Python', 'Jenkins', 'Git'],
  'Platform Engineer': ['Kubernetes', 'Docker', 'AWS', 'Azure', 'Terraform', 'Python', 'Linux', 'Helm'],
  'Infrastructure Engineer': ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Docker', 'Linux', 'Networking', 'Git'],
  'Solutions Architect': ['AWS', 'Azure', 'GCP', 'System Design', 'Microservices', 'Cloud Architecture', 'Communication'],
  'Enterprise Architect': ['Architecture Design', 'Microservices', 'Cloud Computing', 'Digital Transformation', 'TOGAF'],
  'Technical Architect': ['System Design', 'Microservices', 'Cloud Architecture', 'AWS', 'Azure', 'Java', 'Python'],
  'Other': []
};

// Experience options
const experienceOptions = [
  { label: '0-1 years', min: 0, max: 1 },
  { label: '1-2 years', min: 1, max: 2 },
  { label: '2-3 years', min: 2, max: 3 },
  { label: '3-4 years', min: 3, max: 4 },
  { label: '4-5 years', min: 4, max: 5 },
  { label: '5-6 years', min: 5, max: 6 },
  { label: '6-7 years', min: 6, max: 7 },
  { label: '7-8 years', min: 7, max: 8 },
  { label: '8-9 years', min: 8, max: 9 },
  { label: '9-10 years', min: 9, max: 10 },
  { label: '10-12 years', min: 10, max: 12 },
  { label: '12-15 years', min: 12, max: 15 },
  { label: '15+ years', min: 15, max: 30 },
];

export function PostRequirement({ onClose }: PostRequirementProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);

  // Predefined roles list
  const predefinedRoles = Object.keys(roleSkillsMap);

  const [formData, setFormData] = useState({
    role: '',
    roleCustom: '',
    experience: '',
    experienceMin: 0,
    experienceMax: 0,
    positions: '',
    skills: [] as string[],
    mustHaveSkills: [] as string[],
    budgetMin: '',
    budgetMax: '',
    duration: '6 Months',
    customDuration: '',
    workMode: 'Remote',
    startDate: 'Immediate',
    customStartDate: '',
    description: '',
  });

  const availableSkills = [
    'Terraform', 'Kubernetes', 'AWS', 'Docker', 'Python', 'Ansible', 'Azure', 'Jenkins', 'Git', 'Linux'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target as Node)) {
        setShowExperienceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-populate skills when role changes
  useEffect(() => {
    if (formData.role && formData.role !== 'Other') {
      const skills = roleSkillsMap[formData.role] || [];
      // Only auto-populate if no skills are selected yet or if the user wants to auto-populate
      // We'll merge with existing skills to avoid removing manually added ones
      setFormData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...skills])]
      }));
    }
  }, [formData.role]);

  // Helper function to validate number is positive
  const isValidPositiveNumber = (value: string): boolean => {
    if (!value) return false;
    const num = Number(value);
    return !isNaN(num) && num >= 0 && Number.isFinite(num);
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (stepNumber === 1) {
      const selectedRole = formData.role === 'Other' ? formData.roleCustom : formData.role;
      if (!selectedRole.trim()) {
        newErrors.role = 'Role is required';
        isValid = false;
      }
      
      if (!formData.experience) {
        newErrors.experience = 'Experience is required';
        isValid = false;
      }
      
      if (!formData.positions.trim()) {
        newErrors.positions = 'Number of positions is required';
        isValid = false;
      } else {
        const posNum = Number(formData.positions);
        if (isNaN(posNum) || posNum < 1) {
          newErrors.positions = 'Please enter a valid number (1 or greater)';
          isValid = false;
        }
      }
    }

    if (stepNumber === 2) {
      if (formData.skills.length === 0) {
        newErrors.skills = 'Please select at least one skill';
        isValid = false;
      }
    }

    if (stepNumber === 3) {
      if (!formData.budgetMin.trim()) {
        newErrors.budgetMin = 'Minimum budget is required';
        isValid = false;
      } else if (!isValidPositiveNumber(formData.budgetMin)) {
        newErrors.budgetMin = 'Please enter a valid amount (0 or greater)';
        isValid = false;
      }
      
      if (!formData.budgetMax.trim()) {
        newErrors.budgetMax = 'Maximum budget is required';
        isValid = false;
      } else if (!isValidPositiveNumber(formData.budgetMax)) {
        newErrors.budgetMax = 'Please enter a valid amount (0 or greater)';
        isValid = false;
      }
      
      if (formData.budgetMin && formData.budgetMax && 
          isValidPositiveNumber(formData.budgetMin) && 
          isValidPositiveNumber(formData.budgetMax)) {
        if (Number(formData.budgetMin) > Number(formData.budgetMax)) {
          newErrors.budgetMax = 'Max budget must be greater than or equal to min';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill) && skill.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skill.trim()] });
      setErrors({ ...errors, skills: undefined });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleAddNewSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      addSkill(newSkill.trim());
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    setErrors({});
  };

  const handleDateSelect = (date: string) => {
    if (date) {
      const parsedDate = new Date(date + 'T00:00:00');
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setFormData({ ...formData, customStartDate: formattedDate });
        setShowDatePicker(false);
      } else {
        setFormData({ ...formData, customStartDate: date });
        setShowDatePicker(false);
      }
    }
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ 
      ...formData, 
      role: role,
      roleCustom: role === 'Other' ? '' : formData.roleCustom,
      skills: role !== 'Other' ? roleSkillsMap[role] || [] : []
    });
    setShowRoleDropdown(false);
    if (errors.role) {
      setErrors({ ...errors, role: undefined });
    }
  };

  const handleExperienceSelect = (experience: string, min: number, max: number) => {
    setFormData({
      ...formData,
      experience: experience,
      experienceMin: min,
      experienceMax: max
    });
    setShowExperienceDropdown(false);
    if (errors.experience) {
      setErrors({ ...errors, experience: undefined });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    const finalRole = formData.role === 'Other' ? formData.roleCustom : formData.role;

    try {
      const response = await fetch('/api/requirements/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: finalRole,
          experience_min: formData.experienceMin,
          experience_max: formData.experienceMax,
          positions: parseInt(formData.positions),
          skills: formData.skills,
          must_have_skills: formData.mustHaveSkills,
          budget_min: parseFloat(formData.budgetMin),
          budget_max: parseFloat(formData.budgetMax),
          duration: formData.duration === 'Custom' ? formData.customDuration : formData.duration,
          work_mode: formData.workMode,
          start_date: formData.startDate,
          custom_start_date: formData.customStartDate || null,
          location: "Bangalore",
          description: formData.description
        })
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        console.error('Submission error:', error);
        alert('Failed to post requirement. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDurationDisplay = () => {
    if (formData.duration === 'Custom') {
      return formData.customDuration ? `${formData.customDuration} Months` : 'Custom';
    }
    return formData.duration;
  };

  const handlePickDateClick = () => {
    setFormData({ ...formData, startDate: 'Pick Date' });
    setShowDatePicker(true);
  };

  const handleImmediateClick = () => {
    setShowDatePicker(false);
    setFormData({ ...formData, startDate: 'Immediate', customStartDate: '' });
  };

  const handleNumberChange = (field: keyof typeof formData, value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, [field]: value });
      const errorKey = field as keyof FormErrors;
      if (errors[errorKey]) {
        setErrors({ ...errors, [errorKey]: undefined });
      }
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getDisplayRole = () => {
    if (formData.role === 'Other' && formData.roleCustom) {
      return formData.roleCustom;
    }
    return formData.role || 'Select a role';
  };

  const getDisplayExperience = () => {
    return formData.experience || 'Select experience';
  };

  // Step icons
  const stepIcons = [
    { icon: Briefcase, label: 'Basic Info' },
    { icon: Tag, label: 'Skills' },
    { icon: DollarSign, label: 'Budget & Duration' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200/60 dark:border-slate-700/50"
        style={{ maxHeight: 'calc(100vh - 1.5rem)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed Header - Enhanced */}
        <div className="flex-shrink-0 relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 sm:px-8 pt-5 pb-4 rounded-t-3xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                <span className="text-blue-100 text-[10px] font-medium">Post Requirement</span>
              </div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Create New Requirement
              </h1>
              <p className="text-blue-100 text-xs mt-0.5">Define talent need with precision</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Step Indicator - Enhanced */}
        <div className="flex-shrink-0 px-6 sm:px-8 pt-4 pb-3 border-b border-slate-200/60 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-center gap-2">
            {stepIcons.map(({ icon: Icon, label }, index) => {
              const num = index + 1;
              const isActive = num === step;
              const isCompleted = num < step;
              return (
                <React.Fragment key={num}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/40 scale-105 ring-2 ring-blue-400/50'
                          : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                    </div>
                    <span
                      className={`text-[9px] font-medium mt-0.5 whitespace-nowrap ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-10 h-0.5 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-600'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content - Enhanced */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5">
          <div className="bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/30 dark:to-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Basic Information</h2>
                  <span className="text-xs text-slate-400 ml-2">Step 1 of 3</span>
                </div>

                {/* Role Dropdown - Enhanced */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Briefcase size={14} className="inline mr-1.5 text-blue-600" />
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={roleDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className={`w-full h-11 px-4 bg-white dark:bg-slate-800 border-2 ${
                        errors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600`}
                    >
                      <span className={!formData.role ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}>
                        {getDisplayRole()}
                      </span>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showRoleDropdown && (
                      <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700">
                          <input
                            type="text"
                            placeholder="Search roles..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => {
                              const searchTerm = e.target.value.toLowerCase();
                              const items = roleDropdownRef.current?.querySelectorAll('.role-item');
                              items?.forEach((item) => {
                                const text = item.textContent?.toLowerCase() || '';
                                (item as HTMLElement).style.display = text.includes(searchTerm) ? 'block' : 'none';
                              });
                            }}
                          />
                        </div>
                        <div className="py-1">
                          {predefinedRoles.map((role) => (
                            <button
                              key={role}
                              type="button"
                              className={`role-item w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                formData.role === role 
                                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                              onClick={() => handleRoleSelect(role)}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.role === 'Other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={formData.roleCustom}
                        onChange={(e) => {
                          setFormData({ ...formData, roleCustom: e.target.value });
                          if (errors.role) setErrors({ ...errors, role: undefined });
                        }}
                        placeholder="Enter custom role"
                        className={`w-full h-10 px-4 bg-white dark:bg-slate-800 border-2 ${
                          errors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm`}
                      />
                    </div>
                  )}
                  {errors.role && (
                    <p className="text-xs text-red-500 mt-1">{errors.role}</p>
                  )}
                </div>

                {/* Experience Dropdown - NEW */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Clock size={14} className="inline mr-1.5 text-blue-600" />
                    Experience Required <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={experienceDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
                      className={`w-full h-11 px-4 bg-white dark:bg-slate-800 border-2 ${
                        errors.experience ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600`}
                    >
                      <span className={!formData.experience ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}>
                        {getDisplayExperience()}
                      </span>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${showExperienceDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showExperienceDropdown && (
                      <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        <div className="py-1">
                          {experienceOptions.map((exp) => (
                            <button
                              key={exp.label}
                              type="button"
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                formData.experience === exp.label 
                                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                              onClick={() => handleExperienceSelect(exp.label, exp.min, exp.max)}
                            >
                              {exp.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.experience && (
                    <p className="text-xs text-red-500 mt-1">{errors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Users size={14} className="inline mr-1.5 text-blue-600" />
                    No. of Positions <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.positions}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 1 && !value.includes('-'))) {
                        handleNumberChange('positions', value);
                      }
                    }}
                    placeholder="1"
                    className={`w-full h-10 px-4 bg-white dark:bg-slate-800 border-2 ${
                      errors.positions ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm`}
                  />
                  {errors.positions && (
                    <p className="text-xs text-red-500 mt-1">{errors.positions}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Skills - Enhanced with auto-population note */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Skills</h2>
                  <span className="text-xs text-slate-400 ml-2">Step 2 of 3</span>
                </div>

                {formData.role && formData.role !== 'Other' && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-500" />
                    Skills for <span className="font-semibold">{formData.role}</span> have been auto-populated. You can add or remove skills as needed.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Tag size={14} className="inline mr-1.5 text-blue-600" />
                    Must Have Skills <span className="text-red-500">*</span>
                  </label>

                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {formData.skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-medium shadow-md shadow-blue-500/30"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    {availableSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        disabled={formData.skills.includes(skill)}
                        className={`px-3 py-2 cursor-pointer text-xs font-medium rounded-lg border-2 transition-all ${
                          formData.skills.includes(skill)
                            ? 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 hover:shadow-md'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>

                  {/* Add New Skill */}
                  {showSkillInput ? (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Enter new skill"
                        className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewSkill();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddNewSkill}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowSkillInput(false);
                          setNewSkill('');
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSkillInput(true)}
                      className="w-full cursor-pointer mt-3 px-3 py-2 text-xs font-medium bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-lg border-2 border-dashed border-blue-600 hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Add new skill
                    </button>
                  )}

                  {errors.skills && (
                    <p className="text-xs text-red-500 mt-1">{errors.skills}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Sparkles size={14} className="inline mr-1.5 text-blue-600" />
                    Good to Have Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Python, Ansible, Jenkins"
                    className="w-full h-10 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Budget & Duration - Enhanced */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Budget & Duration</h2>
                  <span className="text-xs text-slate-400 ml-2">Step 3 of 3</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <DollarSign size={14} className="inline mr-1.5 text-blue-600" />
                      Min Budget (₹/Month) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.budgetMin}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) >= 0 && !value.includes('-'))) {
                          handleNumberChange('budgetMin', value);
                        }
                      }}
                      placeholder="100000"
                      className={`w-full h-10 px-4 bg-white dark:bg-slate-800 border-2 ${
                        errors.budgetMin ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm`}
                    />
                    {errors.budgetMin && (
                      <p className="text-xs text-red-500 mt-1">{errors.budgetMin}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <DollarSign size={14} className="inline mr-1.5 text-blue-600" />
                      Max Budget (₹/Month) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.budgetMax}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) >= 0 && !value.includes('-'))) {
                          handleNumberChange('budgetMax', value);
                        }
                      }}
                      placeholder="150000"
                      className={`w-full h-10 px-4 bg-white dark:bg-slate-800 border-2 ${
                        errors.budgetMax ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm`}
                    />
                    {errors.budgetMax && (
                      <p className="text-xs text-red-500 mt-1">{errors.budgetMax}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Clock size={14} className="inline mr-1.5 text-blue-600" />
                    Duration
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['3 Months', '6 Months', '12 Months', 'Custom'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            duration: dur,
                            customDuration: dur === 'Custom' ? formData.customDuration : ''
                          });
                        }}
                        className={`py-2 cursor-pointer text-xs font-semibold rounded-lg transition-all duration-200 ${
                          formData.duration === dur
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>

                  {formData.duration === 'Custom' && (
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.customDuration}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (Number(value) >= 1 && !value.includes('-'))) {
                            setFormData({ ...formData, customDuration: value });
                          }
                        }}
                        placeholder="Enter months"
                        className="flex-1 h-10 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Months</span>
                    </div>
                  )}

                  <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    Selected: <span className="font-medium text-blue-600 dark:text-blue-400">{getDurationDisplay()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <MapPin size={14} className="inline mr-1.5 text-blue-600" />
                    Work Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Remote', 'Hybrid', 'Onsite'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setFormData({ ...formData, workMode: mode })}
                        className={`py-2 cursor-pointer text-sm font-semibold rounded-lg transition-all duration-200 ${
                          formData.workMode === mode
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Calendar size={14} className="inline mr-1.5 text-blue-600" />
                    Start Date
                  </label>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleImmediateClick}
                      className={`py-2 cursor-pointer text-sm font-semibold rounded-lg transition-all duration-200 ${
                        formData.startDate === 'Immediate'
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-500/30'
                          : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-green-500 hover:bg-green-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <CheckCircle2 size={14} className="inline mr-1" />
                      Immediate
                    </button>
                    <button
                      type="button"
                      onClick={handlePickDateClick}
                      className={`py-2 cursor-pointer text-sm font-semibold rounded-lg transition-all duration-200 ${
                        formData.startDate === 'Pick Date'
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-500/30'
                          : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-green-500 hover:bg-green-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      Pick Date
                    </button>
                  </div>

                  {formData.startDate === 'Pick Date' && formData.customStartDate && (
                    <div className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Selected: {formatDateForDisplay(formData.customStartDate)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer - Enhanced */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-slate-200/60 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-5 py-2 text-sm cursor-pointer font-semibold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm cursor-pointer font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl"
            >
              Next
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm cursor-pointer font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Post Requirement</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Date Picker Portal - Centered Overlay */}
      {showDatePicker && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            ref={datePickerRef}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Date</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <DatePicker
              value={formData.customStartDate}
              onChange={(date) => {
                handleDateSelect(date);
              }}
              disabled={formData.startDate !== 'Pick Date'}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}