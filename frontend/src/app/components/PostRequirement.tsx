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
        location: "Bangalore", // Add location field
        description: formData.description
      })
    });

    if (response.ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl my-4">
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground dark:text-slate-100 mb-1 flex items-center gap-2">
            Post Requirement <span className="text-xl">🔥</span>
          </h1>
          <p className="text-muted-foreground dark:text-slate-400 text-sm">Define talent need with precision</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
          <X size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {[
          { num: 1, label: 'Basic Info' },
          { num: 2, label: 'Skills' },
          { num: 3, label: 'Budget & Duration' }
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-base transition-all duration-300 ${num === step
                    ? 'bg-primary text-white shadow-xl shadow-blue-600/40 scale-110'
                    : num < step
                      ? 'bg-blue-100 text-primary border-2 border-primary'
                      : 'bg-secondary text-muted-foreground border-2 border-border'
                  }`}
              >
                {num < step ? <CheckCircle2 size={24} /> : num}
              </div>
              <span className={`text-xs font-medium ${num === step ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {num < 3 && (
              <div className={`w-24 h-1 rounded-full transition-all duration-300 ${num < step ? 'bg-primary' : 'bg-border'} mb-6`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border dark:border-slate-700 p-6 md:p-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-6">Basic Info</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role (e.g., DevOps Engineer) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Enter role title"
                    className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Experience Range (e.g., 3-5 yrs) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.experienceMin}
                    onChange={e => setFormData({ ...formData, experienceMin: e.target.value })}
                    placeholder="e.g., 3-5 years"
                    className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    No. of Positions <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.positions}
                    onChange={e => setFormData({ ...formData, positions: e.target.value })}
                    placeholder="1"
                    className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-6">Skills</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
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
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {availableSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        disabled={formData.skills.includes(skill)}
                        className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all ${formData.skills.includes(skill)
                            ? 'bg-secondary border-border text-muted-foreground cursor-not-allowed'
                            : 'bg-white dark:bg-slate-700 border-input hover:border-primary hover:bg-accent dark:hover:bg-slate-600 text-foreground'
                          }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>

                  <button className="w-full mt-3 px-4 py-3 text-sm font-medium bg-primary/10 text-primary rounded-lg border-2 border-dashed border-primary hover:bg-primary/20 transition-all">
                    + Add new skill
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Good to Have Skills
                  </label>
                  <input
                    type="text"
                    placeholder="Python, Ansible, Jenkins"
                    className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Duration */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-6">Budget & Duration</h2>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Min ₹ / month
                    </label>
                    <input
                      type="text"
                      value={formData.budgetMin}
                      onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                      placeholder="100000"
                      className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Max ₹ / month
                    </label>
                    <input
                      type="text"
                      value={formData.budgetMax}
                      onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                      placeholder="150000"
                      className="w-full h-11 px-4 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Duration</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['3 Months', '6 Months', '12 Months', 'Custom'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => setFormData({ ...formData, duration: dur })}
                        className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${formData.duration === dur
                            ? 'bg-primary text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 border-2 border-border text-foreground hover:border-primary hover:bg-blue-50 dark:hover:bg-slate-600'
                          }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Work Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Remote', 'Hybrid', 'Onsite'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setFormData({ ...formData, workMode: mode })}
                        className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${formData.workMode === mode
                            ? 'bg-primary text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 border-2 border-border text-foreground hover:border-primary hover:bg-blue-50 dark:hover:bg-slate-600'
                          }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Start Date</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {['Immediate', 'Pick Date'].map(date => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setFormData({ ...formData, startDate: date })}
                          className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${formData.startDate === date
                              ? 'bg-success text-white shadow-lg shadow-green-500/30'
                              : 'bg-white dark:bg-slate-700 border-2 border-border text-foreground hover:border-success hover:bg-green-50 dark:hover:bg-slate-600'
                            }`}
                        >
                          {date === 'Immediate' && <CheckCircle2 size={16} className="inline mr-2" />}
                          {date}
                        </button>
                      ))}
                    </div>

                    {formData.startDate === 'Pick Date' && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <DatePicker
                          value={formData.customStartDate}
                          onChange={(date) => setFormData({ ...formData, customStartDate: date })}
                          disabled={formData.startDate !== 'Pick Date'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-2.5 text-sm font-semibold text-foreground border-2 border-border rounded-xl hover:bg-secondary transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              POST REQUIREMENT
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
