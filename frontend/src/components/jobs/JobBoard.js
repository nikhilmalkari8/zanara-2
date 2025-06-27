import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Star, Bookmark, Eye, Users, Calendar, ArrowRight, Briefcase, Globe, TrendingUp } from 'lucide-react';

const JobBoard = ({ user, onLogout, setCurrentPage }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    jobType: 'all',
    workFormat: 'all',
    location: 'all',
    compensation: 'all',
    experience: 'all',
    targetType: 'all',
    featured: false,
    urgent: false,
    salaryMin: '',
    salaryMax: '',
    skills: '',
    sort: 'relevance'
  });
  const [currentPage, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({});
  const [savedJobs, setSavedJobs] = useState(new Set());

  // Filter options
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'fashion-design', label: 'Fashion Design' },
    { value: 'photography', label: 'Photography' },
    { value: 'modeling', label: 'Modeling' },
    { value: 'styling', label: 'Styling' },
    { value: 'makeup-artistry', label: 'Makeup Artistry' },
    { value: 'creative-direction', label: 'Creative Direction' },
    { value: 'production', label: 'Production' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'technical', label: 'Technical' }
  ];

  const jobTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'project-based', label: 'Project-based' },
    { value: 'gig', label: 'Gig' }
  ];

  const workFormatOptions = [
    { value: 'all', label: 'All Formats' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'travel-required', label: 'Travel Required' }
  ];

  const compensationOptions = [
    { value: 'all', label: 'All Compensation' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily Rate' },
    { value: 'project', label: 'Project-based' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  const experienceOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'expert', label: 'Expert' }
  ];

  const targetTypeOptions = [
    { value: 'all', label: 'All Professionals' },
    { value: 'model', label: 'Models' },
    { value: 'photographer', label: 'Photographers' },
    { value: 'fashion-designer', label: 'Fashion Designers' },
    { value: 'stylist', label: 'Stylists' },
    { value: 'makeup-artist', label: 'Makeup Artists' },
    { value: 'fashion-student', label: 'Fashion Students' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'deadline', label: 'Deadline Soon' },
    { value: 'salary-high', label: 'Highest Salary' },
    { value: 'salary-low', label: 'Lowest Salary' }
  ];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: filters.sort,
        userId: user?.id || ''
      });

      // Add filters to query
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all' && filters[key] !== false && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`http://localhost:8001/api/jobs/browse?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
        setStats(prev => ({ ...prev, ...data.categoryBreakdown }));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, user?.id]);

  const fetchSavedJobs = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/jobs/user/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const savedJobIds = new Set(data.savedJobs.map(job => job._id));
        setSavedJobs(savedJobIds);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPageNum(1);
  };

  const handleSaveJob = async (jobId) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/jobs/${jobId}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.saved) {
          setSavedJobs(prev => new Set([...prev, jobId]));
        } else {
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const getCompensationDisplay = (compensation) => {
    if (compensation.type === 'negotiable') return 'Negotiable';
    if (compensation.amount?.min && compensation.amount?.max) {
      return `$${compensation.amount.min.toLocaleString()} - $${compensation.amount.max.toLocaleString()}`;
    }
    if (compensation.amount?.min) {
      return `$${compensation.amount.min.toLocaleString()}+`;
    }
    return compensation.type.charAt(0).toUpperCase() + compensation.type.slice(1);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const renderJobCard = (job) => {
    const isUrgent = job.urgent;
    const isFeatured = job.featured;
    const isSaved = savedJobs.has(job._id);
    const daysLeft = job.daysUntilDeadline;

    return (
      <div
        key={job._id}
        className={`glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer relative ${
          isFeatured ? 'ring-2 ring-yellow-500/30' : ''
        }`}
        onClick={() => setCurrentPage(`job-detail-${job._id}`)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {job.company?.companyName?.charAt(0) || job.postedBy?.firstName?.charAt(0) || 'J'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{job.title}</h3>
              <p className="text-white/60 text-sm">
                {job.company?.companyName || `${job.postedBy?.firstName} ${job.postedBy?.lastName}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isFeatured && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs">
                <Star className="w-3 h-3" />
                <span>Featured</span>
              </div>
            )}
            {isUrgent && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs">
                <Clock className="w-3 h-3" />
                <span>Urgent</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveJob(job._id);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-blue-500/20 text-blue-500' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <p className="text-white/70 text-sm line-clamp-2">{job.shortDescription || job.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
              {categoryOptions.find(cat => cat.value === job.category)?.label || job.category}
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
              {jobTypeOptions.find(type => type.value === job.jobType)?.label || job.jobType}
            </span>
            {job.workFormat && (
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                {workFormatOptions.find(format => format.value === job.workFormat)?.label || job.workFormat}
              </span>
            )}
          </div>
        </div>

        {/* Job Meta */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center space-x-2 text-white/70">
            <MapPin className="w-4 h-4" />
            <span>{job.location?.city || 'Remote'}</span>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <DollarSign className="w-4 h-4" />
            <span>{getCompensationDisplay(job.compensation)}</span>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <Users className="w-4 h-4" />
            <span>{job.applicationCount || 0} applicants</span>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <Eye className="w-4 h-4" />
            <span>{job.views || 0} views</span>
          </div>
        </div>

        {/* Match Score & Deadline */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4">
            {job.matchScore && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-white/60" />
                <span className={`text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
                  {job.matchScore}% match
                </span>
              </div>
            )}
            {daysLeft !== null && (
              <div className="flex items-center space-x-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
            <span className="text-sm">View Details</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Bidding indicator */}
        {job.bidding?.enabled && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs">
            Bidding
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              Fashion Job Board 💼
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Discover fashion opportunities from top brands and agencies
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => setCurrentPage('post-job')}
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Briefcase className="w-4 h-4" />
              Post Job
            </button>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 45px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* Category Filter */}
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#2a2a2a' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Type Filter */}
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                  Job Type
                </label>
                <select
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {jobTypeOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#2a2a2a' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Format Filter */}
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                  Work Format
                </label>
                <select
                  value={filters.workFormat}
                  onChange={(e) => handleFilterChange('workFormat', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {workFormatOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#2a2a2a' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                  Experience Level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {experienceOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#2a2a2a' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#2a2a2a' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Filters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    style={{ accentColor: '#667eea' }}
                  />
                  Featured Jobs Only
                </label>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.urgent}
                    onChange={(e) => handleFilterChange('urgent', e.target.checked)}
                    style={{ accentColor: '#667eea' }}
                  />
                  Urgent Jobs Only
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Results */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '1.2rem' }}>Loading amazing opportunities...</div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '15px 20px',
              borderRadius: '15px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ color: 'white' }}>
                Found {jobs.length} opportunities
              </div>
              <div style={{ color: 'white/60', fontSize: '0.9rem' }}>
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Job Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {jobs.map(renderJobCard)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <button
                  onClick={() => setCurrentPageNum(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: currentPage === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: currentPage === 1 ? 'rgba(255, 255, 255, 0.5)' : 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPageNum(pageNum)}
                      style={{
                        background: pageNum === currentPage ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPageNum(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.5)' : 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobBoard; 