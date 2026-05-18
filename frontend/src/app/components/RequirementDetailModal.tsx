import { useEffect, useState } from 'react';
import { X, Edit2, Save, MapPin, Briefcase, DollarSign } from 'lucide-react';

interface RequirementDetailModalProps {
  requirement: {
    id: string;
    role: string;
    experience: string;
    budget: string;
    status: string;
    matches: number;
    location?: string;
    skills?: string[];
    description?: string;
  };
  onClose: () => void;
  mode?: 'view' | 'edit';
}

export function RequirementDetailModal({ requirement, onClose, mode = 'view' }: RequirementDetailModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState({
    role: requirement.role,
    experience: requirement.experience,
    budget: requirement.budget,
    location: requirement.location || 'Bangalore',
    skills: requirement.skills || ['DevOps', 'AWS', 'Docker'],
    description: requirement.description || 'Looking for experienced professional with strong technical background.',
  });

  // Fetch requirement details
  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `/api/requirements/${requirement.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setFormData({
          role: data.role,
          experience: data.experience,
          budget: data.budget,
          location: data.location || '',
          skills: data.skills || [],
          description: data.description || '',
        });

      } catch (error) {
        console.error('Error fetching requirement:', error);
      }
    };

    fetchRequirement();

  }, [requirement.id]);

  // Update requirement
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        `/api/requirements/${requirement.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      setIsEditing(false);

      alert('Requirement updated successfully');

    } catch (error) {
      console.error('Error updating requirement:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card dark:bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 px-8 py-6 border-b border-border flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-foreground">{requirement.id}</h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${requirement.status === 'Open'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                }`}>
                {requirement.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Requirement Details</p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25"
              >
                <Edit2 size={16} />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25"
              >
                <Save size={16} />
                Save Changes
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-all"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Briefcase size={16} className="text-primary" />
                Role / Position
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              ) : (
                <div className="text-lg font-medium text-foreground bg-secondary/30 px-4 py-3 rounded-xl">
                  {formData.role}
                </div>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Experience Required</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="text-base text-foreground bg-secondary/30 px-4 py-3 rounded-xl">
                    {formData.experience}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <DollarSign size={16} className="text-primary" />
                  Budget Range
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="text-base text-foreground bg-secondary/30 px-4 py-3 rounded-xl">
                    {formData.budget}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              ) : (
                <div className="text-base text-foreground bg-secondary/30 px-4 py-3 rounded-xl">
                  {formData.location}
                </div>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 text-sm font-medium bg-green-50 dark:bg-green-950/30 text-primary rounded-full border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
                {isEditing && (
                  <button className="px-4 py-2 text-sm font-medium border-2 border-dashed border-primary/40 text-primary rounded-full hover:bg-primary/5 transition-all">
                    + Add Skill
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Job Description</label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              ) : (
                <div className="text-base text-foreground bg-secondary/30 px-4 py-3 rounded-xl leading-relaxed">
                  {formData.description}
                </div>
              )}
            </div>

            {/* Matching Profiles */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Matching Profiles</h4>
                  <p className="text-sm text-muted-foreground">Profiles that match this requirement</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1">{requirement.matches}</div>
                  <button className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors">
                    View All →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
