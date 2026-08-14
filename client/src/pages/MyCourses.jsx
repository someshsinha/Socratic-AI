import React, { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../utils/api';
import siteConfig from '../config/siteConfig';

/* ────────────────────────────────────────────────────────
   DESIGN TOKENS (Matching Editorial template)
──────────────────────────────────────────────────────── */
const T = {
  ink:   '#111827',
  muted: '#5f6673',
  paper: '#fbfaf6',
  panel: '#ffffff',
  line:  '#d8d3c7',
  green: '#2f6f4f',
  accent: '#315f88',
};

// Helper to determine accurate, dynamic course category
function getCourseCategory(course) {
  if (!course) return '[ACADEMIC // CURRICULUM]';
  
  if (Array.isArray(course.tags) && course.tags.length > 0) {
    const validTags = course.tags.filter(t => t && t.trim() && !t.startsWith('[') && t.toLowerCase() !== 'cs');
    if (validTags.length >= 2) {
      return `[${validTags[0].toUpperCase()} // ${validTags[1].toUpperCase()}]`;
    }
    if (validTags.length === 1) {
      const tag = validTags[0].toUpperCase();
      return tag.startsWith('[') ? tag : `[${tag}]`;
    }
  }

  const text = `${course.title || ''} ${course.description || ''}`.toLowerCase();
  if (text.includes('kashmir') || text.includes('hindu') || text.includes('exodus') || text.includes('gita')) {
    return '[HISTORY // SOUTH ASIA]';
  }
  if (text.includes('sharapova') || text.includes('tennis') || text.includes('sport') || text.includes('athlete') || text.includes('champion')) {
    return '[SPORTS // BIOGRAPHY]';
  }
  if (text.includes('hana') || text.includes('hannah') || text.includes('montana') || text.includes('pop') || text.includes('music') || text.includes('entertainment')) {
    return '[CULTURE // MEDIA STUDIES]';
  }
  if (text.includes('trump') || text.includes('presidency') || text.includes('american')) {
    return '[HISTORY // AMERICAN STUDIES]';
  }
  if (text.includes('quantum') || text.includes('physics') || text.includes('mechanics')) {
    return '[PHYSICS // QUANTUM MECHANICS]';
  }
  if (text.includes('distributed') || text.includes('consensus') || text.includes('raft') || text.includes('kernel') || text.includes('cloud')) {
    return '[COMPUTER SCIENCE // DISTRIBUTED SYSTEMS]';
  }
  if (text.includes('algorithm') || text.includes('tree') || text.includes('data structure')) {
    return '[COMPUTER SCIENCE // ALGORITHMS]';
  }
  if (text.includes('microeconomic') || text.includes('macroeconomic') || text.includes('finance')) {
    return '[ECONOMICS // MICROECONOMIC THEORY]';
  }
  if (text.includes('history') || text.includes('civilization') || text.includes('ancient')) {
    return '[HISTORY]';
  }
  return '[ACADEMIC // CURRICULUM]';
}

export default function MyCourses() {
  const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter & Sort state (Sort Order only)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'modules'
  const filterRef = useRef(null);

  // Modal state for generating a new course
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete course state & options menu
  const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState(null);

  // Close filter dropdown and options menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (!event.target.closest('.course-options-menu-container')) {
        setActiveMenuCourseId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteModalError(null);

      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        setAuthToken(token);
      }

      await api.delete(`/courses/${courseToDelete._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseToDelete._id));
      setCourseToDelete(null);
      setActiveMenuCourseId(null);
    } catch (err) {
      console.error('Failed to delete course:', err);
      setDeleteModalError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete course from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch real user courses from MongoDB
  const fetchCourses = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      setAuthToken(token);

      const response = await api.get('/courses/user-courses');
      setCourses(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load courses from DB:', err);
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || err.message || 'Failed to load courses');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchCourses();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  // Handle generating a new course from modal
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: '/my-courses' } });
      return;
    }

    try {
      setIsGenerating(true);
      setModalError(null);

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      setAuthToken(token);

      const res = await api.post('/courses', { topic: newTopic.trim() });
      const createdCourse = res.data?.data;
      setShowNewCourseModal(false);
      setNewTopic('');

      if (createdCourse?._id) {
        navigate(`/course/${createdCourse._id}`);
      } else {
        fetchCourses();
      }
    } catch (err) {
      console.error('Course generation failed:', err);
      setModalError(err.response?.data?.message || err.message || 'Failed to generate course.');
    } finally {
      setIsGenerating(false);
    }
  };

  // If user is not logged in, prompt authentication
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col justify-between" style={{ background: 'transparent', color: T.ink }}>
        <div style={{ maxWidth: 640, margin: '100px auto 60px', padding: '0 24px', width: '100%' }}>
          <div
            className="p-8 sm:p-10 text-center space-y-6"
            style={{
              border: `1px solid ${T.ink}`,
              background: T.panel,
              boxShadow: '0 16px 48px rgba(17,24,39,0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.green,
                margin: 0,
              }}
            >
              [AUTH_REQUIRED // MY_LIBRARY]
            </p>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: T.ink, margin: '8px 0', letterSpacing: '-0.02em' }}>
              Sign in to Access Your Library
            </h2>

            <p style={{ fontSize: '0.94rem', color: T.muted, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
              Log in to view all your previously generated courses, monitor module progression, and export study materials.
            </p>

            <div className="pt-2">
              <button
                onClick={() => loginWithRedirect({ appState: { returnTo: '/my-courses' } })}
                style={{
                  border: `1px solid ${T.ink}`,
                  background: T.ink,
                  color: '#ffffff',
                  padding: '12px 28px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
                className="hover:-translate-y-px active:translate-y-0 transition-transform shadow-sm"
              >
                SIGN IN / START LEARNING →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${T.line}`,
            color: T.muted,
            padding: '24px 0',
            background: 'rgba(251, 250, 246, 0.92)',
            backdropFilter: 'blur(8px)',
            width: '100%',
          }}
          className="mt-auto"
        >
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.82rem', margin: 0, fontFamily: 'ui-monospace,monospace' }}>
              A portfolio project by{' '}
              <a href={siteConfig.creator.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, fontWeight: 700, textDecoration: 'none' }} className="hover:underline">
                {siteConfig.creator.handle}
              </a>
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { label: 'GitHub', href: siteConfig.links.githubRepo, external: true },
                { label: 'About', href: '/about', external: false },
                { label: 'Courses', href: '/my-courses', external: false },
                { label: 'Contact', href: siteConfig.creator.mailtoUrl, external: true },
              ].map(item => (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.80rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                    className="hover:text-[#111827] transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    style={{ fontSize: '0.80rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                    className="hover:text-[#111827] transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Filter & Sort Logic (Search + Sort Order)
  const filteredCourses = courses
    .filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.tags?.some((t) => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'modules') {
        return (b.modules?.length || 0) - (a.modules?.length || 0);
      }
      return 0;
    });

  const isFilterActive = sortBy !== 'newest';

  // Overall Statistics
  const totalCourses = courses.length;
  const totalModules = courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const totalLessons = courses.reduce((acc, c) => {
    return acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0);
  }, 0);

  return (
    <div className="flex-1 flex flex-col justify-between" style={{ background: 'transparent', color: T.ink }}>
      <div className="page-content">
        
        {/* ── Page Header Row ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            {/* Eyebrow */}
            <p
              style={{
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.green,
                margin: '0 0 8px',
              }}
            >
              Socratic-AI v0.1 // My Library
            </p>

            {/* Main H1 */}
            <h1
              style={{
                fontSize: 'clamp(1.85rem, 4.5vw, 3.6rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.08,
                color: T.ink,
                margin: '0 0 8px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              My Course Library.
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: '0.96rem', color: '#4b5563', lineHeight: 1.6, margin: 0, maxWidth: 500 }}>
              All your generated courses, neatly organized and ready to learn.
            </p>
          </div>

          {/* Right: Search, Filter Dropdown, and New Course */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Square Search Input */}
            <div
              className="flex items-center flex-1 lg:w-72 px-3.5 py-2.5 bg-white transition-colors"
              style={{ border: `1px solid ${T.ink}` }}
            >
              <svg className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your courses..."
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-900 text-xs font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Functional Filter Button with Sort Dropdown Panel */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterDropdown(prev => !prev)}
                style={{
                  border: `1px solid ${T.ink}`,
                  background: isFilterActive || showFilterDropdown ? T.ink : T.panel,
                  color: isFilterActive || showFilterDropdown ? '#ffffff' : T.ink,
                  padding: '11px 13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                className="hover:opacity-90 transition-all shadow-xs"
                title="Sort courses"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>

                {/* Active indicator dot */}
                {isFilterActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Sort Order Dropdown Menu */}
              {showFilterDropdown && (
                <div
                  className="absolute right-0 mt-2 w-64 sm:w-72 bg-white border border-[#111827] shadow-xl z-40 p-4 space-y-3.5 animate-in fade-in duration-100"
                  style={{ background: T.panel }}
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#d8d3c7]">
                    <span
                      style={{
                        fontFamily: 'ui-monospace,monospace',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: T.green,
                        textTransform: 'uppercase',
                      }}
                    >
                      [SORT_ORDER // CONTROLS]
                    </span>
                    {isFilterActive && (
                      <button
                        onClick={() => setSortBy('newest')}
                        style={{
                          fontFamily: 'ui-monospace,monospace',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          color: '#dc2626',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        className="hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Sort Options Grid */}
                  <div className="space-y-1.5">
                    <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: 0 }}>
                      Order By
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'newest', label: 'Newest First' },
                        { id: 'oldest', label: 'Oldest First' },
                        { id: 'title', label: 'Title (A–Z)' },
                        { id: 'modules', label: 'Most Modules' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortBy(opt.id);
                          }}
                          style={{
                            border: `1px solid ${sortBy === opt.id ? T.ink : T.line}`,
                            background: sortBy === opt.id ? T.ink : '#ffffff',
                            color: sortBy === opt.id ? '#ffffff' : T.ink,
                            padding: '7px 8px',
                            fontSize: '0.74rem',
                            fontWeight: sortBy === opt.id ? 750 : 600,
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontFamily: 'inherit',
                          }}
                          className="transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dropdown Footer Status */}
                  <div className="pt-2 border-t border-[#d8d3c7] flex items-center justify-between">
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', color: T.muted }}>
                      {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                    </span>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      style={{
                        border: `1px solid ${T.ink}`,
                        background: T.ink,
                        color: '#ffffff',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* + New Course button */}
            <button
              onClick={() => setShowNewCourseModal(true)}
              style={{
                border: `1px solid ${T.ink}`,
                background: T.ink,
                color: '#ffffff',
                padding: '11px 18px',
                fontSize: '0.82rem',
                fontWeight: 750,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
              className="hover:-translate-y-px active:translate-y-0 transition-transform flex items-center gap-1.5 shadow-sm"
            >
              + NEW COURSE
            </button>
          </div>
        </div>

        {/* ── Content Area ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-7 h-7 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', color: T.muted }}>
              Loading persisted courses from database...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 text-sm text-red-700 max-w-lg mx-auto text-center space-y-2 my-8">
            <p className="font-bold">Error connecting to database</p>
            <p className="text-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-red-800 text-white text-xs font-bold mt-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          /* ── Empty State Card ── */
          <div className="py-6 sm:py-8">
            <div
              className="p-12 sm:p-16 text-center space-y-6 max-w-xl mx-auto card-hover-lift"
              style={{ border: `1px solid ${T.line}`, background: T.panel }}
            >
              <p
                style={{
                  fontFamily: 'ui-monospace,monospace',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: T.green,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                [SYS.DB_DASHBOARD // EMPTY_LIBRARY]
              </p>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, margin: 0 }}>
                No Courses Generated Yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: T.muted, lineHeight: 1.65, margin: '0 auto', maxWidth: 420 }}>
                You haven't created any courses yet. Enter any topic to let our AI build your first structured curriculum.
              </p>
              
              <div className="pt-6 pb-2">
                <button
                  onClick={() => setShowNewCourseModal(true)}
                  style={{
                    border: `1px solid ${T.ink}`,
                    background: T.ink,
                    color: '#ffffff',
                    padding: '13px 28px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                    fontFamily: 'inherit',
                  }}
                  className="hover:-translate-y-px active:translate-y-0 transition-transform shadow-sm"
                >
                  + CREATE YOUR FIRST COURSE
                </button>
              </div>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* ── No Filter Results ── */
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.74rem', fontWeight: 700, color: T.muted }}>
              [SYS.FILTER // NO_MATCHING_COURSES]
            </p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: T.ink }}>
              No courses match your active search or filter
            </h3>
            <p style={{ fontSize: '0.86rem', color: T.muted, lineHeight: 1.5 }}>
              Try broadening your search term or reset your subject category and sorting parameters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortBy('newest');
              }}
              style={{
                border: `1px solid ${T.ink}`,
                background: T.ink,
                color: '#ffffff',
                padding: '9px 18px',
                fontSize: '0.80rem',
                fontWeight: 750,
                cursor: 'pointer',
                fontFamily: 'ui-monospace,monospace',
              }}
              className="hover:-translate-y-px active:translate-y-0 transition-transform mt-2"
            >
              [ CLEAR SEARCH & FILTERS ]
            </button>
          </div>
        ) : (
          /* ── Real Courses Grid (3 Columns) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const categoryTag = getCourseCategory(course);
              const modulesCount = course.modules?.length || 0;
              const lessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
              const formattedDate = course.createdAt
                ? new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';

              const firstLesson = course.modules?.[0]?.lessons?.[0];
              const firstLessonId = typeof firstLesson === 'object' ? firstLesson?._id : firstLesson;
              const startUrl = firstLessonId ? `/lesson/${firstLessonId}` : `/course/${course._id}`;

              return (
                <div
                  key={course._id}
                  className="card-hover-lift flex flex-col justify-between"
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                  }}
                >
                  {/* Top card section */}
                  <div className="p-6">
                    {/* Eyebrow & Category */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        style={{
                          fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          color: T.green,
                          textTransform: 'uppercase',
                        }}
                      >
                        {categoryTag}
                      </span>
                      <div className="relative course-options-menu-container">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMenuCourseId(activeMenuCourseId === course._id ? null : course._id);
                          }}
                          className={`w-7 h-7 flex items-center justify-center border transition-all cursor-pointer ${
                            activeMenuCourseId === course._id
                              ? 'border-[#111827] bg-[#111827] text-white'
                              : 'border-transparent text-gray-500 hover:border-[#d8d3c7] hover:bg-white hover:text-black'
                          }`}
                          title="Course options"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.6" />
                            <circle cx="10" cy="10" r="1.6" />
                            <circle cx="10" cy="16" r="1.6" />
                          </svg>
                        </button>

                        {/* Polished Dropdown Menu */}
                        {activeMenuCourseId === course._id && (
                          <div
                            className="absolute right-0 top-full mt-1.5 w-48 z-30 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              border: `1px solid ${T.ink}`,
                              background: '#ffffff',
                              boxShadow: '0 12px 30px rgba(17,24,39,0.15)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1.5 border-b border-[#e5e2d9] bg-gray-50/80">
                              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.62rem', fontWeight: 800, color: T.muted, letterSpacing: '0.06em' }}>
                                OPTIONS
                              </span>
                            </div>
                            <div className="p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuCourseId(null);
                                  setDeleteModalError(null);
                                  setCourseToDelete(course);
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '8px 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 750,
                                  color: '#dc2626',
                                  fontFamily: 'ui-monospace,monospace',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                                className="hover:bg-red-50 hover:text-red-700 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>[ DELETE COURSE ]</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Title */}
                    <Link
                      to={`/course/${course._id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <h2
                        style={{
                          fontSize: '1.22rem',
                          fontWeight: 800,
                          lineHeight: 1.28,
                          color: T.ink,
                          margin: '0 0 12px',
                          letterSpacing: '-0.01em',
                        }}
                        className="hover:underline"
                      >
                        {course.title}
                      </h2>
                    </Link>

                    {/* Metadata line */}
                    <p
                      style={{
                        fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                        fontSize: '0.74rem',
                        color: T.muted,
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      Generated: {formattedDate} <span className="mx-1">•</span> Modules: {modulesCount} <span className="mx-1">•</span> Lessons: {lessonsCount}
                    </p>
                  </div>

                  {/* Bottom Actions Row with clean square divider */}
                  <div
                    className="grid grid-cols-2"
                    style={{
                      borderTop: `1px solid ${T.line}`,
                      background: 'rgba(251,250,246,0.6)',
                    }}
                  >
                    {/* OVERVIEW: Opens the course outline */}
                    <Link
                      to={`/course/${course._id}`}
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        color: T.ink,
                        textDecoration: 'none',
                        borderRight: `1px solid ${T.line}`,
                        fontFamily: 'ui-monospace,monospace',
                      }}
                      className="hover:bg-white transition-colors"
                    >
                      OVERVIEW
                    </Link>

                    {/* START: Directly opens Lesson 1 */}
                    <Link
                      to={startUrl}
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        color: T.ink,
                        textDecoration: 'none',
                        fontFamily: 'ui-monospace,monospace',
                      }}
                      className="hover:bg-white transition-colors"
                    >
                      START →
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* "New Course" Action Card Slot */}
            <div
              onClick={() => setShowNewCourseModal(true)}
              className="card-hover-lift flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[220px]"
              style={{
                border: `1.5px dashed ${T.line}`,
                background: 'rgba(251,250,246,0.5)',
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105"
                style={{ border: `1px solid ${T.line}`, background: T.panel }}
              >
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: T.ink, margin: '0 0 4px' }}>
                New Course
              </h3>
              <p style={{ fontSize: '0.84rem', color: T.muted, margin: 0, maxWidth: 220, lineHeight: 1.5 }}>
                Generate a new course from any topic.
              </p>
            </div>
          </div>
        )}

        {/* ── Proportionate Breathing Gap & 4-Column Stats Strip ── */}
        <div
          className={`${courses.length === 0 ? 'mt-12 sm:mt-16' : 'mt-16 sm:mt-24'} mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0`}
          style={{
            border: `1px solid ${T.line}`,
            background: T.panel,
          }}
        >
          {/* Stat 1: Courses Generated */}
          <div className="flex items-center gap-4 p-5 sm:p-6 border-b sm:border-r border-[#d8d3c7]">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>{totalCourses}</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>Courses Generated</p>
            </div>
          </div>

          {/* Stat 2: Modules Created */}
          <div className="flex items-center gap-4 p-5 sm:p-6 border-b lg:border-r border-[#d8d3c7]">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>{totalModules}</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>Modules Created</p>
            </div>
          </div>

          {/* Stat 3: Lessons Generated */}
          <div className="flex items-center gap-4 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-[#d8d3c7]">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>{totalLessons}</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>Lessons Generated</p>
            </div>
          </div>

          {/* Stat 4: LaTeX Enabled */}
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>100%</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>LaTeX & Math Notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${T.line}`,
          color: T.muted,
          padding: '24px 0',
          background: 'rgba(251, 250, 246, 0.92)',
          backdropFilter: 'blur(8px)',
          width: '100%',
        }}
        className="mt-auto"
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.82rem', margin: 0, fontFamily: 'ui-monospace,monospace' }}>
            A portfolio project by{' '}
            <a href={siteConfig.creator.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, fontWeight: 700, textDecoration: 'none' }} className="hover:underline">
              {siteConfig.creator.handle}
            </a>
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'GitHub', href: siteConfig.links.githubRepo, external: true },
              { label: 'About', href: '/about', external: false },
              { label: 'Courses', href: '/my-courses', external: false },
              { label: 'Contact', href: siteConfig.creator.mailtoUrl, external: true },
            ].map(item => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.80rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                  className="hover:text-[#111827] transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  style={{ fontSize: '0.80rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                  className="hover:text-[#111827] transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </footer>

      {/* ── Generate New Course Modal ── */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg p-6 sm:p-8 bg-white border border-[#111827] shadow-2xl relative"
            style={{ background: T.panel }}
          >
            {/* Close button */}
            <button
              onClick={() => { if (!isGenerating) setShowNewCourseModal(false); }}
              disabled={isGenerating}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 cursor-pointer disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Eyebrow */}
            <p
              style={{
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.green,
                margin: '0 0 6px',
              }}
            >
              [AI_CURRICULUM_ENGINE // V1.0]
            </p>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: T.ink, margin: '0 0 10px' }}>
              Generate New Course
            </h3>
            
            <p style={{ fontSize: '0.86rem', color: T.muted, margin: '0 0 20px', lineHeight: 1.55 }}>
              Enter any topic to let our AI architect a complete multi-module structured syllabus with theoretical rigor and interactive exercises.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  disabled={isGenerating}
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="e.g. Kashmiri Hindus: A Lost Minority, Quantum Computing..."
                  style={{ border: `1px solid ${T.ink}` }}
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-black disabled:opacity-60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setShowNewCourseModal(false)}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.ink,
                    padding: '9px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  className="hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating || !newTopic.trim()}
                  style={{
                    border: `1px solid ${T.ink}`,
                    background: T.ink,
                    color: '#ffffff',
                    padding: '9px 20px',
                    fontSize: '0.8rem',
                    fontWeight: 750,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                  }}
                  className="hover:-translate-y-px active:translate-y-0 transition-transform disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Architecting Curriculum...</span>
                    </>
                  ) : (
                    <span>Generate Course →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {courseToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => !isDeleting && setCourseToDelete(null)}
        >
          <div
            className="w-full max-w-md p-6 relative"
            style={{
              border: `1px solid ${T.ink}`,
              background: T.panel,
              boxShadow: '0 24px 48px rgba(17,24,39,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d8d3c7]">
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.74rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                [CONFIRM // DELETE_COURSE]
              </span>
              <button
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-black font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.94rem', color: T.ink, lineHeight: 1.6, margin: '0 0 12px' }}>
              Are you sure you want to delete <strong style={{ fontWeight: 800 }}>"{courseToDelete.title}"</strong>?
            </p>
            <p style={{ fontSize: '0.78rem', color: T.muted, fontFamily: 'ui-monospace,monospace', margin: '0 0 20px', lineHeight: 1.5 }}>
              This action is permanent. All associated modules, lessons, notes, and quizzes will be completely removed.
            </p>

            {deleteModalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 font-mono">
                ⚠ {deleteModalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d8d3c7]">
              <button
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                style={{
                  fontFamily: 'ui-monospace,monospace',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '8px 16px',
                  border: `1px solid ${T.line}`,
                  background: T.paper,
                  color: T.ink,
                  cursor: 'pointer',
                }}
                className="hover:border-black"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDeleteCourse}
                disabled={isDeleting}
                style={{
                  fontFamily: 'ui-monospace,monospace',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '8px 16px',
                  border: `1px solid #b91c1c`,
                  background: '#b91c1c',
                  color: '#ffffff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
                className="hover:opacity-90 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>DELETING...</span>
                  </>
                ) : (
                  <span>DELETE PERMANENTLY</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
