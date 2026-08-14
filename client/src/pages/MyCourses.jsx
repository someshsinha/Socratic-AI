import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../utils/api';

/* ────────────────────────────────────────────────────────
   DESIGN TOKENS (Identical to Landing Page template)
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

export default function MyCourses() {
  const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading, user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user access token from Auth0 & set for API
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        setAuthToken(token);

        // Pull preexisting real courses from database
        const response = await api.get('/courses/user-courses');
        setCourses(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load courses from DB:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (isAuthenticated) {
        fetchUserCourses();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, getAccessTokenSilently]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: '/my-courses' } });
      return;
    }

    setGenerating(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      setAuthToken(token);

      const res = await api.post('/courses', { topic: newTopic.trim() });
      if (res.data?.success && res.data?.data?._id) {
        navigate(`/course/${res.data.data._id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error generating course');
    } finally {
      setGenerating(false);
    }
  };

  // If user is not logged in, prompt authentication
  if (!authLoading && !isAuthenticated) {
    return (
      <div style={{ background: T.paper, minHeight: '100vh', color: T.ink, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                className="hover:-translate-y-px active:translate-y-0 transition-transform"
              >
                SIGN IN / START LEARNING →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${T.line}`, color: T.muted, padding: '22px 0 32px', background: T.paper }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              A portfolio project by{' '}
              <a href="https://github.com/someshsinha" style={{ color: T.ink, fontWeight: 700 }}>@someshsinha</a>
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {['GitHub', 'About', 'Contact'].map(l => (
                <a
                  key={l}
                  href="#"
                  style={{ fontSize: '0.85rem', color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                  className="hover:text-[#111827]"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.tags && c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const totalCourses = courses.length;
  const totalModules = courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0), 0);
  const totalLearningHours = Math.max(1, Math.round(totalLessons * 15 / 60));

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }}>
      {/* ── Main Container ── */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 24px 16px' }}>
        
        {/* ── Title & Search Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            {/* Eyebrow in Green Monospace */}
            <p
              style={{
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.green,
                margin: '0 0 12px',
              }}
            >
              Socratic-AI v0.1 // My Library
            </p>

            {/* Main H1 */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: T.ink,
                margin: '0 0 8px',
              }}
            >
              My Course Library.
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.6, margin: 0, maxWidth: 480 }}>
              All your generated courses, neatly organized and ready to learn.
            </p>
          </div>

          {/* Right: Search, Filter, and New Course */}
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
            </div>

            {/* Square Filter button */}
            <button
              style={{
                border: `1px solid ${T.ink}`,
                background: T.panel,
                padding: '11px 13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-50 transition-colors"
              title="Filter"
            >
              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

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
              className="hover:-translate-y-px active:translate-y-0 transition-transform flex items-center gap-1.5"
            >
              + NEW COURSE
            </button>
          </div>
        </div>

        {/* ── Loading State ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-7 h-7 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', color: T.muted }}>
              Loading persisted courses from database...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 text-sm text-red-700 max-w-lg mx-auto text-center space-y-2">
            <p className="font-bold">Error connecting to database</p>
            <p className="text-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-red-800 text-white text-xs font-bold mt-2"
            >
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          /* ── Empty State ── */
          <div
            className="p-12 text-center space-y-5 max-w-xl mx-auto"
            style={{ border: `1px solid ${T.line}`, background: T.panel }}
          >
            <p
              style={{
                fontFamily: 'ui-monospace,monospace',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: T.muted,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              [SYS.DB_DASHBOARD // EMPTY_LIBRARY]
            </p>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, margin: 0 }}>
              No Courses Generated Yet
            </h3>
            <p style={{ fontSize: '0.9rem', color: T.muted, lineHeight: 1.6, margin: '0 auto', maxWidth: 420 }}>
              You haven't created any courses yet. Enter any topic to let our AI build your first structured curriculum.
            </p>
            <button
              onClick={() => setShowNewCourseModal(true)}
              style={{
                border: `1px solid ${T.ink}`,
                background: T.ink,
                color: '#ffffff',
                padding: '11px 22px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              className="hover:-translate-y-px active:translate-y-0 transition-transform"
            >
              + CREATE YOUR FIRST COURSE
            </button>
          </div>
        ) : (
          /* ── Real Courses Grid (3 Columns) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const categoryTag = course.tags?.[0]
                ? `[CS // ${course.tags[0].toUpperCase()}]`
                : '[ACADEMIC // CURRICULUM]';
              const modulesCount = course.modules?.length || 0;
              const lessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
              const formattedDate = course.createdAt
                ? new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';

              return (
                <div
                  key={course._id}
                  className="card-hover-lift flex flex-col justify-between"
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                  }}
                >
                  {/* Top content */}
                  <div style={{ padding: '24px 24px 20px' }}>
                    {/* Category tag & More menu */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        style={{
                          fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: T.muted,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {categoryTag}
                      </span>

                      <button className="text-gray-400 hover:text-gray-900 p-0.5" title="Options">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Course Title */}
                    <Link
                      to={`/course/${course._id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <h2
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          lineHeight: 1.28,
                          color: T.ink,
                          margin: '0 0 14px',
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
                        fontSize: '0.75rem',
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
                    {/* Open Course */}
                    <Link
                      to={`/course/${course._id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 18px',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        color: T.ink,
                        textDecoration: 'none',
                        borderRight: `1px solid ${T.line}`,
                        fontFamily: 'ui-monospace,monospace',
                        letterSpacing: '0.04em',
                      }}
                      className="hover:bg-white transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      [OPEN COURSE]
                    </Link>

                    {/* Download PDF */}
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 18px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: T.muted,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace,monospace',
                        letterSpacing: '0.04em',
                      }}
                      className="hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      [DOWNLOAD PDF]
                    </button>
                  </div>
                </div>
              );
            })}

            {/* ── New Course Generator Card ── */}
            <div
              onClick={() => setShowNewCourseModal(true)}
              className="card-hover-lift flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[220px]"
              style={{
                border: `1px dashed ${T.line}`,
                background: 'rgba(255,255,255,0.6)',
              }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center mb-3.5 transition-transform hover:scale-105"
                style={{
                  border: `1px solid ${T.line}`,
                  background: T.panel,
                }}
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

        {/* ── Responsive Breathing Gap & Mobile-Friendly 4-Column Stats Strip ── */}
        <div
          className="mt-28 sm:mt-40 md:mt-52 lg:mt-64 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
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

      {/* ── Footer (Compact separation) ── */}
      <footer style={{ borderTop: `1px solid ${T.line}`, color: T.muted, padding: '22px 0 32px', background: T.paper }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            A portfolio project by{' '}
            <a href="https://github.com/someshsinha" style={{ color: T.ink, fontWeight: 700 }}>@someshsinha</a>
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['GitHub', 'About', 'Contact'].map(l => (
              <a
                key={l}
                href="#"
                style={{ fontSize: '0.85rem', color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                className="hover:text-[#111827]"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── New Course Generator Modal (Clean & Open prompt) ── */}
      {showNewCourseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowNewCourseModal(false)}
        >
          <div
            className="w-full max-w-lg p-7 bg-white shadow-2xl"
            style={{ border: `1px solid ${T.ink}` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: T.green }}>
                [NEW_COURSE_GENERATOR]
              </span>
              <button onClick={() => setShowNewCourseModal(false)} className="text-gray-400 hover:text-gray-900 text-lg font-bold">
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: T.ink, margin: '0 0 6px' }}>
              What would you like to master?
            </h3>
            <p style={{ fontSize: '0.88rem', color: T.muted, margin: '0 0 20px', lineHeight: 1.55 }}>
              Enter any topic or concept you want to learn, and our engine will structure a rigorous, first-principles curriculum.
            </p>

            <form onSubmit={handleCreateCourse}>
              <input
                type="text"
                autoFocus
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                placeholder="Enter any topic, e.g. 'Distributed Consensus' or 'Quantum Optics'"
                style={{
                  width: '100%',
                  border: `1px solid ${T.ink}`,
                  padding: '12px 14px',
                  fontSize: '0.92rem',
                  outline: 'none',
                  marginBottom: 18,
                  background: T.paper,
                  fontFamily: 'inherit',
                }}
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: 'transparent',
                    padding: '9px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !newTopic.trim()}
                  style={{
                    border: `1px solid ${T.ink}`,
                    background: generating || !newTopic.trim() ? T.line : T.ink,
                    color: '#ffffff',
                    padding: '9px 20px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: generating || !newTopic.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {generating ? 'Generating Curriculum...' : 'GENERATE COURSE →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
