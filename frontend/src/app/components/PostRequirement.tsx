import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface PostRequirementProps {
  onClose: () => void;
}

export function PostRequirement({ onClose }: PostRequirementProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    experienceMin: '',
    experienceMax: '',
    positions: '',
    skills: [] as string[],
    mustHaveSkills: [] as string[],
    budgetMin: '',
    budgetMax: '',
    duration: '6 Months',
    workMode: 'Remote',
    startDate: 'Immediate',
    customStartDate: '',
    description: '',
  });

  const availableSkills = [
    'Terraform', 'Kubernetes', 'AWS', 'Docker', 'Python', 'Ansible', 'Azure', 'Jenkins', 'Git', 'Linux'
  ];

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/requirements/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: formData.role,
        experience_min: parseInt(formData.experienceMin),
        experience_max: parseInt(formData.experienceMax),
        positions: parseInt(formData.positions),
        skills: formData.skills,
        must_have_skills: formData.mustHaveSkills,
        budget_min: parseFloat(formData.budgetMin),
        budget_max: parseFloat(formData.budgetMax),
        duration: formData.duration,
        work_mode: formData.workMode,
        start_date: formData.startDate,
        custom_start_date: formData.customStartDate,
        location: "Bangalore",
        description: formData.description
      })
    });

    if (response.ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      {/* Modal — flex column so header/footer stick, only body scrolls */}
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 1.5rem)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Fixed Header ── */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Post Requirement <span>🔥</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Define talent need with precision</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <X size={18} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Skills' },
              { num: 3, label: 'Budget & Duration' }
            ].map(({ num, label }) => (
              <div key={num} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                      num === step
                        ? 'bg-primary text-white shadow-lg shadow-blue-600/40 scale-110'
                        : num < step
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-primary border-2 border-primary'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {num < step ? <CheckCircle2 size={20} /> : num}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${num === step ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                    {label}
                  </span>
                </div>
                {num < 3 && (
                  <div className={`w-16 sm:w-24 h-1 rounded-full mb-5 transition-all duration-300 ${num < step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-primary">Basic Info</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Role (e.g., DevOps Engineer) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Enter role title"
                    className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Experience Range (e.g., 3-5 yrs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.experienceMin}
                    onChange={e => setFormData({ ...formData, experienceMin: e.target.value })}
                    placeholder="e.g., 3-5 years"
                    className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No. of Positions <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.positions}
                    onChange={e => setFormData({ ...formData, positions: e.target.value })}
                    placeholder="1"
                    className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-primary">Skills</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Must Have Skills (multi-select)
                  </label>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full text-sm font-semibold shadow-md"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    {availableSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        disabled={formData.skills.includes(skill)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                          formData.skills.includes(skill)
                            ? 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <button className="w-full mt-3 px-4 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-lg border-2 border-dashed border-primary hover:bg-primary/20 transition-all">
                    + Add new skill
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Good to Have Skills
                  </label>
                  <input
                    type="text"
                    placeholder="Python, Ansible, Jenkins"
                    className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Budget & Duration */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-primary">Budget & Duration</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min ₹ / month</label>
                    <input
                      type="text"
                      value={formData.budgetMin}
                      onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                      placeholder="100000"
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max ₹ / month</label>
                    <input
                      type="text"
                      value={formData.budgetMax}
                      onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                      placeholder="150000"
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['3 Months', '6 Months', '12 Months', 'Custom'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => setFormData({ ...formData, duration: dur })}
                        className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                          formData.duration === dur
                            ? 'bg-primary text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary hover:bg-blue-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Work Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Remote', 'Hybrid', 'Onsite'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setFormData({ ...formData, workMode: mode })}
                        className={`py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                          formData.workMode === mode
                            ? 'bg-primary text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary hover:bg-blue-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {['Immediate', 'Pick Date'].map(date => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setFormData({ ...formData, startDate: date })}
                          className={`py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                            formData.startDate === date
                              ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                              : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-green-500 hover:bg-green-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          {date === 'Immediate' && <CheckCircle2 size={14} className="inline mr-1.5" />}
                          {date}
                        </button>
                      ))}
                    </div>
                    {formData.startDate === 'Pick Date' && (
                      <DatePicker
                        value={formData.customStartDate}
                        onChange={(date) => setFormData({ ...formData, customStartDate: date })}
                        disabled={formData.startDate !== 'Pick Date'}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={15} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25"
            >
              Next
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              POST REQUIREMENT
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
