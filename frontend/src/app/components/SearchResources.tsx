// SearchResources.tsx - Ultra Premium Enhanced Version
import { useState, useEffect } from 'react';
import React from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Calendar, DollarSign, 
  Eye, X, FileSearch, Sparkles, Zap, Award, Star, 
  Clock, Users, Briefcase, ChevronDown, Filter, 
  CheckCircle, TrendingUp, UserCheck, Layers
} from 'lucide-react';
import { ResourceDetailModal } from './ResourceDetailModal';
import { Pagination } from './Pagination';

interface SearchResourcesProps {
  preFilteredJobId?: string;
  preFilteredCount?: number;
}

export function SearchResources({ preFilteredJobId, preFilteredCount }: SearchResourcesProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showFilterBanner, setShowFilterBanner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const itemsPerPage = 6;

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  const allSkills = ['DevOps', 'Java', 'Azure', 'Terraform', 'AWS', 'Docker', 'Kubernetes', 'Python', 'Jenkins', 'Ansible', 'React', 'Node.js', 'MongoDB'];

  // Fetch resources with filters
  const fetchResources = async () => {
    const token = getToken();
    if (!token) {
      console.log('No token found');
      return;
    }

    setLoading(true);
    try {
      let url = '/api/resources/?';
      const params: string[] = [];

      if (searchKeyword) {
        params.push(`search=${encodeURIComponent(searchKeyword)}`);
      }
      if (selectedSkills.length) {
        params.push(`skills=${selectedSkills.join(',')}`);
      }
      if (selectedExperience.length) {
        params.push(`experience=${selectedExperience.join(',')}`);
      }
      if (selectedAvailability.length) {
        params.push(`availability=${selectedAvailability.join(',')}`);
      }
      if (selectedBudget.length) {
        params.push(`budget=${selectedBudget.join(',')}`);
      }

      url += params.join('&');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((resource: any) => ({
          id: resource.id,
          resource_id: resource.resource_id,
          name: resource.name,
          role: resource.skill_domain || resource.name,
          experience: resource.experience || `${resource.experience_years || 0} yrs`,
          experience_years: resource.experience_years || 0,
          availability: resource.availability || 'Available',
          availability_days: resource.availability_days || 0,
          base_rate: resource.base_rate || 0,
          rate: resource.base_rate ? `₹${resource.base_rate.toLocaleString()}/mo` : '₹0/mo',
          location: resource.location || 'Unknown',
          skills: resource.skills || [],
          match: Math.floor(Math.random() * 30) + 70,
          status: resource.status || 'Active',
          email: resource.email || 'contact@vendor.com',
          phone: resource.phone || '+91 98765 43210',
          summary: resource.summary || `Experienced professional with ${resource.experience || '5+'} years of experience.`
        }));
        setResources(formattedData);
        setTotalResults(formattedData.length);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchResources();
  }, [selectedSkills, selectedExperience, selectedAvailability, selectedBudget, searchKeyword]);

  // Update active filter count
  useEffect(() => {
    const count = selectedSkills.length + selectedExperience.length + selectedAvailability.length + selectedBudget.length;
    setActiveFilterCount(count);
  }, [selectedSkills, selectedExperience, selectedAvailability, selectedBudget]);

  // Handle pre-filtered job matches
  useEffect(() => {
    if (preFilteredJobId) {
      setShowFilterBanner(true);
      fetchMatchesForJob(preFilteredJobId);
    }
  }, [preFilteredJobId]);

  const fetchMatchesForJob = async (jobId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const reqResponse = await fetch('/api/requirements/?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (reqResponse.ok) {
        const requirements = await reqResponse.json();
        const requirement = requirements.find((r: any) => r.requirement_id === jobId);

        if (requirement) {
          const response = await fetch(`/api/requirements/${requirement.id}/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            const formattedData = data.map((match: any) => ({
              id: match.id,
              resource_id: match.resource_id,
              name: match.resource_name,
              role: match.requirement_role,
              experience: match.resource_experience,
              availability: match.resource_availability,
              rate: match.resource_rate ? `₹${match.resource_rate.toLocaleString()}/mo` : '₹0/mo',
              location: 'Various',
              skills: match.resource_skills || [],
              match: match.match_score,
              status: 'Available'
            }));
            setResources(formattedData);
            setTotalResults(formattedData.length);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setCurrentPage(1);
  };

  const toggleExperience = (exp: string) => {
    setSelectedExperience(prev =>
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    );
    setCurrentPage(1);
  };

  const toggleAvailability = (avail: string) => {
    setSelectedAvailability(prev =>
      prev.includes(avail) ? prev.filter(a => a !== avail) : [...prev, avail]
    );
    setCurrentPage(1);
  };

  const toggleBudget = (budget: string) => {
    setSelectedBudget(prev =>
      prev.includes(budget) ? prev.filter(b => b !== budget) : [...prev, budget]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedSkills([]);
    setSelectedExperience([]);
    setSelectedAvailability([]);
    setSelectedBudget([]);
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const matchesExperienceFilter = (exp: string) => {
    if (selectedExperience.length === 0) return true;
    const years = parseInt(exp);
    return selectedExperience.some(filter => {
      if (filter === '1-3 yrs') return years >= 1 && years <= 3;
      if (filter === '4-6 yrs') return years >= 4 && years <= 6;
      if (filter === '7-10 yrs') return years >= 7 && years <= 10;
      if (filter === '10+ yrs') return years > 10;
      return false;
    });
  };

  const matchesBudgetFilter = (rate: string) => {
    if (selectedBudget.length === 0) return true;
    const amount = parseInt(rate.replace(/[^\d]/g, ''));
    return selectedBudget.some(filter => {
      if (filter === '< 80K') return amount < 80000;
      if (filter === '80K-1.2L') return amount >= 80000 && amount < 120000;
      if (filter === '1.2L-1.5L') return amount >= 120000 && amount <= 150000;
      if (filter === '> 1.5L') return amount > 150000;
      return false;
    });
  };

  const filteredResources = resources.filter(resource => {
    const skillMatch = selectedSkills.length === 0 || selectedSkills.some(skill =>
      resource.skills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))
    );
    const expMatch = matchesExperienceFilter(resource.experience);
    const availMatch = selectedAvailability.length === 0 || selectedAvailability.includes(resource.availability);
    const budgetMatch = matchesBudgetFilter(resource.rate);
    const searchMatch = searchKeyword === '' ||
      resource.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      resource.role?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      resource.skills?.some((s: string) => s.toLowerCase().includes(searchKeyword.toLowerCase()));

    return skillMatch && expMatch && availMatch && budgetMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = preFilteredJobId
    ? filteredResources.slice(0, preFilteredCount || 6)
    : filteredResources.slice(startIndex, endIndex);

  // Get match color
  const getMatchColor = (match: number) => {
    if (match >= 90) return 'from-emerald-500 to-green-600';
    if (match >= 80) return 'from-blue-500 to-indigo-600';
    if (match >= 70) return 'from-amber-500 to-orange-600';
    return 'from-slate-400 to-slate-500';
  };

  const getMatchBadgeColor = (match: number) => {
    if (match >= 90) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
    if (match >= 80) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
    if (match >= 70) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-yellow-300 animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Talent Discovery</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Search Resources
            </h1>
            <p className="text-blue-100 mt-1 flex items-center gap-2 text-sm">
              <Users size={14} /> 
              <span>Find the perfect talent for your requirements</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
              <Zap size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">{filteredResources.length} results</span>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                <Filter size={12} />
                {activeFilterCount} filters
              </div>
            )}
          </div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="relative mt-6">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search by name, role, skills, or location... (e.g., DevOps, Bangalore, Python)"
              value={searchKeyword}
              onChange={handleSearch}
              className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder:text-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button
              onClick={resetFilters}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all text-sm font-medium backdrop-blur-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Panel - Enhanced */}
        <div className={`w-full md:w-80 md:flex-shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-blue-600" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              <button
                onClick={resetFilters}
                className="text-sm cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-6">
              {/* Skill Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 cursor-pointer text-xs font-semibold rounded-full transition-all duration-200 ${
                        selectedSkills.includes(skill)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Experience</label>
                <div className="space-y-2">
                  {['1-3 yrs', '4-6 yrs', '7-10 yrs', '10+ yrs'].map(exp => (
                    <label key={exp} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedExperience.includes(exp)}
                        onChange={() => toggleExperience(exp)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                        {exp}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Availability</label>
                <div className="space-y-2">
                  {['Immediate', '< 15 days', '< 30 days', '60+ days'].map(avail => (
                    <label key={avail} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(avail)}
                        onChange={() => toggleAvailability(avail)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                        {avail}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Budget (₹/mo)</label>
                <div className="space-y-2">
                  {['< 80K', '80K-1.2L', '1.2L-1.5L', '> 1.5L'].map(budget => (
                    <label key={budget} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBudget.includes(budget)}
                        onChange={() => toggleBudget(budget)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                        {budget}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md transition-all"
            >
              <SlidersHorizontal size={16} className="text-blue-600" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {filteredResources.length} results
            </span>
          </div>

          {/* Filter Banner */}
          {showFilterBanner && preFilteredJobId && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-500/30 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Eye size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    Matches for {preFilteredJobId}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {preFilteredCount} matching profiles
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterBanner(false)}
                className="p-2 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-700/50 rounded-xl transition-all"
              >
                <X size={18} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Loading resources...</p>
            </div>
          ) : currentResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl flex items-center justify-center mb-4">
                <FileSearch size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No matching profiles found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search keywords</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {currentResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative"
                  >
                    {/* Match Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full ${getMatchBadgeColor(resource.match)}`}>
                        <Award size={12} />
                        {resource.match}% Match
                      </span>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getMatchColor(resource.match)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                        {resource.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                            {resource.resource_id || resource.id}
                          </span>
                          {resource.status === 'Booked Soon' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                              Booked Soon
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                          {resource.role}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-blue-500" />
                            {resource.experience}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-purple-500" />
                            {resource.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar size={16} className="text-amber-500" />
                        <span className="font-medium">{resource.availability}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <DollarSign size={16} />
                        <span>{resource.rate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {resource.skills?.slice(0, 4).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {resource.skills?.length > 4 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                          +{resource.skills.length - 4}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedResource(resource)}
                      className="w-full h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 group-hover:shadow-xl"
                    >
                      <Eye size={16} />
                      View Profile
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {!preFilteredJobId && totalPages > 1 && (
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredResources.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={{
            id: selectedResource.resource_id || selectedResource.id,
            name: selectedResource.name,
            role: selectedResource.role,
            experience: selectedResource.experience,
            availability: selectedResource.availability,
            rate: selectedResource.rate,
            location: selectedResource.location,
            email: selectedResource.email || 'contact@vendor.com',
            phone: selectedResource.phone || '+91 98765 43210',
            skills: selectedResource.skills || [],
            summary: selectedResource.summary || `Experienced professional with ${selectedResource.experience} of experience.`,
            match: selectedResource.match || 85,
          }}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}