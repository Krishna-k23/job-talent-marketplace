// SearchResources.tsx - Fixed with Shared Match Score Utility
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import {
  Search, SlidersHorizontal, MapPin, Calendar, DollarSign,
  Eye, X, FileSearch, Sparkles, Zap, Award, Star,
  Clock, Users, Briefcase, ChevronDown, Filter,
  CheckCircle, TrendingUp, UserCheck, Layers, Download,
  FileText, Mail, Phone, User, Activity, Tag, Bookmark, BookmarkCheck
} from 'lucide-react';
import { Pagination } from './Pagination';
import { generateConsistentMatchScore } from '../../config/matchScore';
import { useToast } from '../contexts/ToastContext';
import { ResourceDetailModal } from './ResourceDetailModal';

interface SearchResourcesProps {
  preFilteredJobId?: string;
  preFilteredCount?: number;
}

interface Resource {
  id: number;
  resource_id: string;
  name: string;
  role: string;
  experience: string;
  experience_years: number;
  availability: string;
  availability_days: number;
  base_rate: number;
  rate: string;
  location: string;
  skills: string[];
  match: number;
  status: string;
  email: string;
  phone: string;
  summary: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function SearchResources({ preFilteredJobId, preFilteredCount }: SearchResourcesProps) {
  const { showSuccess, showError } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showFilterBanner, setShowFilterBanner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [isPreFiltered, setIsPreFiltered] = useState(false);
  const itemsPerPage = 6;

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // API call with token refresh
  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = getToken();

    if (!token) {
      window.location.href = '/login';
      throw new Error('No token found');
    }

    const makeRequest = async (retryToken?: string) => {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${retryToken || token}`
      };

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      return response;
    };

    let response = await makeRequest();

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = getToken();
        response = await makeRequest(newToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    return response;
  };

  // Download resume/CV
  const handleDownloadResume = async (resumeUrl: string, resourceName: string) => {
    if (!resumeUrl) {
      showError('No resume available for this resource');
      return;
    }

    try {
      console.log('📥 Downloading resume from:', resumeUrl);
      
      const response = await fetchWithAuth(resumeUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to download resume: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = resumeUrl.split('/').pop() || `${resourceName}_resume.pdf`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      showError('Failed to download resume. Please try again.');
    }
  };

  // Fetch all skills from resources
  const fetchAllSkills = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetchWithAuth('/api/resources/?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const skillsSet = new Set<string>();
        data.forEach((resource: any) => {
          if (resource.skills && Array.isArray(resource.skills)) {
            resource.skills.forEach((skill: string) => {
              if (skill && skill.trim()) {
                skillsSet.add(skill.trim());
              }
            });
          }
        });
        setAllSkills(Array.from(skillsSet).sort());
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  }, []);

  // Fetch all resources
  const fetchAllResources = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log('No token found');
      return;
    }

    setLoading(true);
    try {
      let url = '/api/resources/?limit=1000';

      const response = await fetchWithAuth(url);

      if (response.ok) {
        const data = await response.json();
        const formattedData: Resource[] = data.map((resource: any) => {
          let expString = resource.experience || '';
          if (!expString && resource.experience_years) {
            expString = `${resource.experience_years} yrs`;
          }
          if (!expString) {
            expString = '0 yrs';
          }

          const rateAmount = resource.base_rate || 0;
          const rateString = rateAmount > 0 ? `₹${rateAmount.toLocaleString()}/mo` : '₹0/mo';

          let availability = resource.availability || 'Available';
          if (availability === 'Available' && resource.availability_days) {
            if (resource.availability_days <= 0) {
              availability = 'Immediate';
            } else if (resource.availability_days <= 15) {
              availability = '< 15 days';
            } else if (resource.availability_days <= 30) {
              availability = '< 30 days';
            } else {
              availability = '60+ days';
            }
          }

          const resourceId = resource.resource_id || `RES-${resource.id}`;
          let matchScore;
          if (resource.match_score && resource.match_score > 0) {
            matchScore = resource.match_score;
          } else {
            matchScore = generateConsistentMatchScore(resourceId, resource.skills || []);
          }

          return {
            id: resource.id,
            resource_id: resource.resource_id || `RES${String(resource.id).padStart(4, '0')}`,
            name: resource.name || 'Unknown',
            role: resource.skill_domain || resource.name || 'Unknown Role',
            experience: expString,
            experience_years: resource.experience_years || 0,
            availability: availability,
            availability_days: resource.availability_days || 0,
            base_rate: rateAmount,
            rate: rateString,
            location: resource.location || 'Unknown',
            skills: resource.skills || [],
            match: matchScore,
            status: resource.status || 'Available',
            email: resource.email || '',
            phone: resource.phone || '',
            summary: resource.summary || `Experienced professional with ${expString} of experience.`,
            resume_url: resource.resume_url || null,
            created_at: resource.created_at,
            updated_at: resource.updated_at
          };
        });

        setAllResources(formattedData);
        setTotalResults(formattedData.length);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply ALL filters
  const filteredResources = allResources.filter(resource => {
    // SEARCH FILTER
    if (searchKeyword && searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase().trim();
      const searchMatch = (
        resource.name?.toLowerCase().includes(keyword) ||
        resource.role?.toLowerCase().includes(keyword) ||
        resource.location?.toLowerCase().includes(keyword) ||
        resource.resource_id?.toLowerCase().includes(keyword) ||
        resource.skills?.some(s => s.toLowerCase().includes(keyword))
      );
      if (!searchMatch) return false;
    }

    // SKILL FILTER
    if (selectedSkills.length > 0) {
      const resourceSkills = resource.skills?.map(s => s.toLowerCase()) || [];
      const hasSkill = selectedSkills.some(skill =>
        resourceSkills.some(rs => rs.includes(skill.toLowerCase()))
      );
      if (!hasSkill) return false;
    }

    // EXPERIENCE FILTER
    if (selectedExperience.length > 0) {
      const years = resource.experience_years || 0;
      const matchesExp = selectedExperience.some(filter => {
        if (filter === '1-3 yrs') return years >= 1 && years <= 3;
        if (filter === '4-6 yrs') return years >= 4 && years <= 6;
        if (filter === '7-10 yrs') return years >= 7 && years <= 10;
        if (filter === '10+ yrs') return years > 10;
        return false;
      });
      if (!matchesExp) return false;
    }

    // AVAILABILITY FILTER
    if (selectedAvailability.length > 0) {
      const avail = resource.availability || 'Available';
      let availCategory = '';
      if (avail.toLowerCase() === 'immediate' || (avail.toLowerCase() === 'available' && resource.availability_days === 0)) {
        availCategory = 'Immediate';
      } else if (avail.toLowerCase().includes('15') || (resource.availability_days > 0 && resource.availability_days <= 15)) {
        availCategory = '< 15 days';
      } else if (avail.toLowerCase().includes('30') || (resource.availability_days > 15 && resource.availability_days <= 30)) {
        availCategory = '< 30 days';
      } else {
        availCategory = '60+ days';
      }

      const matchesAvail = selectedAvailability.some(filter => {
        if (filter === 'Immediate') return availCategory === 'Immediate';
        if (filter === '< 15 days') return availCategory === '< 15 days';
        if (filter === '< 30 days') return availCategory === '< 30 days';
        if (filter === '60+ days') return availCategory === '60+ days';
        return false;
      });
      if (!matchesAvail) return false;
    }

    // BUDGET FILTER
    if (selectedBudget.length > 0) {
      const amount = resource.base_rate || 0;
      const matchesBudget = selectedBudget.some(filter => {
        if (filter === '< 80K') return amount < 80000;
        if (filter === '80K-1.2L') return amount >= 80000 && amount < 120000;
        if (filter === '1.2L-1.5L') return amount >= 120000 && amount <= 150000;
        if (filter === '> 1.5L') return amount > 150000;
        return false;
      });
      if (!matchesBudget) return false;
    }

    return true;
  });

  // Initial load
  useEffect(() => {
    fetchAllSkills();

    if (preFilteredJobId && preFilteredJobId.trim() !== '' && preFilteredJobId !== 'undefined' && preFilteredJobId !== 'null') {
      setIsPreFiltered(true);
      setShowFilterBanner(true);
      fetchMatchesForJob(preFilteredJobId);
    } else {
      setIsPreFiltered(false);
      setShowFilterBanner(false);
      fetchAllResources();
    }
  }, []);

  // Update active filter count
  useEffect(() => {
    const count = selectedSkills.length + selectedExperience.length +
      selectedAvailability.length + selectedBudget.length;
    setActiveFilterCount(count);
  }, [selectedSkills, selectedExperience, selectedAvailability, selectedBudget]);

  const fetchMatchesForJob = async (jobId: string) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const reqResponse = await fetchWithAuth('/api/requirements/?limit=100');
      if (reqResponse.ok) {
        const requirements = await reqResponse.json();
        const requirement = requirements.find((r: any) =>
          r.requirement_id === jobId || String(r.id) === jobId
        );

        if (requirement) {
          const response = await fetchWithAuth(`/api/requirements/${requirement.id}/matches`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const formattedData: Resource[] = data.map((match: any) => {
                const resourceId = match.resource_id || `MATCH${String(Math.random()).substring(2, 6)}`;
                return {
                  id: match.id || Math.random(),
                  resource_id: resourceId,
                  name: match.resource_name || 'Unknown',
                  role: match.requirement_role || match.resource_name || 'Unknown Role',
                  experience: match.resource_experience || '0 yrs',
                  experience_years: parseInt(match.resource_experience) || 0,
                  availability: match.resource_availability || 'Available',
                  availability_days: 0,
                  base_rate: match.resource_rate || 0,
                  rate: match.resource_rate ? `₹${match.resource_rate.toLocaleString()}/mo` : '₹0/mo',
                  location: match.location || 'Various',
                  skills: match.resource_skills || [],
                  match: match.match_score || generateConsistentMatchScore(resourceId, match.resource_skills || []),
                  status: match.status || 'Available',
                  email: match.resource_email || '',
                  phone: match.resource_phone || '',
                  summary: match.resource_summary || `Experienced professional with ${match.resource_experience || '5+'} years of experience.`,
                  resume_url: match.resume_url || null
                };
              });
              setAllResources(formattedData);
              setTotalResults(formattedData.length);
              setShowFilterBanner(true);
            } else {
              setAllResources([]);
              setTotalResults(0);
              setShowFilterBanner(true);
            }
          } else {
            setAllResources([]);
            setTotalResults(0);
          }
        } else {
          console.log('Requirement not found:', jobId);
          setIsPreFiltered(false);
          setShowFilterBanner(false);
          fetchAllResources();
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setIsPreFiltered(false);
      setShowFilterBanner(false);
      fetchAllResources();
    } finally {
      setLoading(false);
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

  const clearPreFilteredView = () => {
    setIsPreFiltered(false);
    setShowFilterBanner(false);
    setAllResources([]);
    fetchAllResources();
  };

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = isPreFiltered
    ? filteredResources.slice(0, preFilteredCount || itemsPerPage)
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

  const getStatusColor = (status: string) => {
    if (status === 'Available') return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (status === 'Busy') return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (status === 'On Leave') return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  const getStatusDot = (status: string) => {
    if (status === 'Available') return 'bg-emerald-500';
    if (status === 'Busy') return 'bg-amber-500';
    if (status === 'On Leave') return 'bg-red-500';
    return 'bg-slate-400';
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

        {/* Search Bar */}
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
        {/* Filters Panel */}
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
                {allSkills.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500">Loading skills...</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {allSkills.slice(0, 30).map(skill => (
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
                    {allSkills.length > 30 && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        +{allSkills.length - 30} more
                      </span>
                    )}
                  </div>
                )}
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
          {showFilterBanner && preFilteredJobId && preFilteredJobId.trim() !== '' && (
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
                    Showing {filteredResources.length} matching profiles
                  </p>
                </div>
              </div>
              <button
                onClick={clearPreFilteredView}
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
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {isPreFiltered ? 'No matches found for this requirement' : 'Try adjusting your filters or search keywords'}
              </p>
              <button
                onClick={isPreFiltered ? clearPreFilteredView : resetFilters}
                className="px-6 py-2.5 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30"
              >
                {isPreFiltered ? 'View All Resources' : 'Clear All Filters'}
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
                    {/* Top Row - Badges */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Avatar and Name Section */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getMatchColor(resource.match)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                          {resource.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                              {resource.resource_id || resource.id}
                            </span>
                            {resource.resume_url && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FileText size={10} />
                                Resume
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                            {resource.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Briefcase size={14} className="text-blue-500" />
                              {resource.role}
                            </span>
                            <span>•</span>
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

                      {/* Badges Container - Right Side */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full ${getMatchBadgeColor(resource.match)}`}>
                          <Award size={12} />
                          {resource.match}% Match
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(resource.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(resource.status)}`}></span>
                          {resource.status}
                        </span>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar size={16} className="text-amber-500" />
                        <span className="font-medium">{resource.availability}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <DollarSign size={16} />
                        <span>{resource.rate}</span>
                      </div>
                      {resource.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Mail size={14} />
                          <span className="text-xs truncate max-w-[120px]">{resource.email}</span>
                        </div>
                      )}
                      {resource.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Phone size={14} />
                          <span className="text-xs truncate max-w-[100px]">{resource.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedResource(resource)}
                        className="flex-1 h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 group-hover:shadow-xl"
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                      {resource.resume_url && (
                        <button
                          onClick={() => handleDownloadResume(resource.resume_url!, resource.name)}
                          className="h-11 px-4 cursor-pointer bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                          title="Download Resume"
                        >
                          <Download size={16} />
                          <span className="hidden sm:inline">CV</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {!isPreFiltered && totalPages > 1 && (
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

      {/* Enhanced Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={{
            id: selectedResource.resource_id || String(selectedResource.id),
            name: selectedResource.name,
            role: selectedResource.role,
            experience: selectedResource.experience,
            availability: selectedResource.availability,
            rate: selectedResource.rate,
            location: selectedResource.location,
            email: selectedResource.email || '',
            phone: selectedResource.phone || '',
            skills: selectedResource.skills || [],
            summary: selectedResource.summary || `Experienced professional with ${selectedResource.experience} of experience.`,
            match: selectedResource.match || 85,
            status: selectedResource.status || 'Available',
            resume_url: selectedResource.resume_url || null,
          }}
          onClose={() => setSelectedResource(null)}
          onDownloadResume={handleDownloadResume}
        />
      )}
    </div>
  );
}