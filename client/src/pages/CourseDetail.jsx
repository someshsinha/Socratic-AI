import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import siteConfig from '../config/siteConfig';

/* ────────────────────────────────────────────────────────
   DESIGN TOKENS (Socratic AI Editorial Template)
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

// Helper to determine subject-accurate course category
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
  
  if (text.includes('kashmir') || text.includes('hindu') || text.includes('exodus') || text.includes('gita') || text.includes('vedic')) {
    return '[HISTORY // SOUTH ASIA]';
  }
  if (text.includes('trump') || text.includes('presidency') || text.includes('america') || text.includes('revolution')) {
    return '[HISTORY // AMERICAN STUDIES]';
  }
  if (text.includes('jesus') || text.includes('theology') || text.includes('bible') || text.includes('religion')) {
    return '[HISTORY // THEOLOGY]';
  }
  if (text.includes('history') || text.includes('ancient') || text.includes('medieval') || text.includes('civilization')) {
    return '[HISTORY]';
  }
  if (text.includes('quantum') || text.includes('physics') || text.includes('mechanics') || text.includes('optics') || text.includes('tensor')) {
    return '[PHYSICS // QUANTUM MECHANICS]';
  }
  if (text.includes('distributed') || text.includes('consensus') || text.includes('kubernetes') || text.includes('docker') || text.includes('cloud') || text.includes('kernel') || text.includes('operating system')) {
    return '[COMPUTER SCIENCE // DISTRIBUTED SYSTEMS]';
  }
  if (text.includes('algorithm') || text.includes('dynamic programming') || text.includes('data structure') || text.includes('compiler') || text.includes('tree')) {
    return '[COMPUTER SCIENCE // ALGORITHMS]';
  }
  if (text.includes('microeconomic') || text.includes('macroeconomic') || text.includes('economy') || text.includes('finance')) {
    return '[ECONOMICS // MICROECONOMIC THEORY]';
  }
  if (text.includes('goggins') || text.includes('mental lab') || text.includes('mindset') || text.includes('discipline')) {
    return '[PERSONAL DEVELOPMENT // PSYCHOLOGY]';
  }
  if (text.includes('media') || text.includes('culture') || text.includes('feminism') || text.includes('film')) {
    return '[MEDIA STUDIES // CULTURE]';
  }
  if (text.includes('system design') || text.includes('architecture')) {
    return '[COMPUTER SCIENCE // SYSTEM ARCHITECTURE]';
  }
  if (text.includes('react') || text.includes('javascript') || text.includes('web')) {
    return '[COMPUTER SCIENCE // WEB ENGINEERING]';
  }
  
  return '[ACADEMIC // CURRICULUM]';
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track open/collapsed state: Module 1 expanded by default
  const [expanded, setExpanded] = useState({ 0: true });

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data?.data;
      setCourse(courseData);
      // Default: only Module 1 expanded
      setExpanded({ 0: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course?.topic) {
      document.title = `${course.topic} • Socratic AI`;
    }
  }, [course]);

  const toggle = (idx) => {
    setExpanded(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleExpandAll = () => {
    if (!course?.modules) return;
    const allOpen = {};
    course.modules.forEach((_, idx) => {
      allOpen[idx] = true;
    });
    setExpanded(allOpen);
  };

  const handleCollapseAll = () => {
    setExpanded({});
  };

  if (loading) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }} className="flex flex-col justify-center items-center py-32 space-y-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-950 rounded-full animate-spin" />
        <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', color: T.muted }}>
          Retrieving course modules from database...
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }} className="p-8 flex justify-center items-center">
        <div className="p-6 bg-red-50 border border-red-200 text-center space-y-3 max-w-md">
          <p className="font-bold text-red-900">Error Loading Course</p>
          <p className="text-xs text-red-700">{error || 'Course not found'}</p>
          <button
            onClick={fetchCourse}
            style={{ border: `1px solid ${T.ink}`, background: T.ink, color: '#fff', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalModules = course.modules?.length || 0;
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const categoryLabel = getCourseCategory(course);
  const firstLessonId = course.modules?.[0]?.lessons?.[0]?._id;

  return (
    <div className="flex-1 flex flex-col justify-between" style={{ background: 'transparent', color: T.ink }}>
      <div className="page-content">
        
        {/* Breadcrumb Back Link */}
        <div className="mb-5 sm:mb-6">
          <Link
            to="/my-courses"
            style={{
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: T.muted,
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
            className="hover:text-gray-950 flex items-center gap-1.5 py-1"
          >
            ← [BACK TO LIBRARY]
          </Link>
        </div>

        {/* ── 2-Column Responsive Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ════════ LEFT COLUMN (Course Overview & Clear Actions) ════════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div>
              {/* 1. Category label above title */}
              <p
                style={{
                  fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: T.green,
                  margin: '0 0 10px',
                }}
              >
                {categoryLabel}
              </p>

              {/* 2. Course Title */}
              <h1
                style={{
                  fontSize: 'clamp(1.45rem, 4.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  color: T.ink,
                  margin: '0 0 10px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {course.title.endsWith('.') ? course.title : `${course.title}.`}
              </h1>

              {/* 3. Real Course Description */}
              <p
                style={{
                  fontSize: '0.84rem',
                  color: '#4b5563',
                  lineHeight: 1.55,
                  margin: '0 0 16px',
                }}
              >
                {course.description || `A complete structured academic curriculum covering the principles, core topics, and analysis of ${course.title}.`}
              </p>

              {/* 4. Metadata Chips (Pure scope metrics, no time estimations) */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5">
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.ink,
                  }}
                >
                  [{totalModules} MODULES]
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.ink,
                  }}
                >
                  [{totalLessons} LESSONS]
                </span>
              </div>

              {/* 5. Course Actions Stack */}
              <div className="space-y-2.5">
                {/* PRIMARY CTA: START / CONTINUE COURSE */}
                <button
                  onClick={() => {
                    if (firstLessonId) {
                      navigate(`/lesson/${firstLessonId}`);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: `1px solid ${T.ink}`,
                    background: T.ink,
                    color: '#ffffff',
                    fontSize: 'clamp(0.72rem, 2.5vw, 0.82rem)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'ui-monospace,monospace',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  className="hover:-translate-y-px active:translate-y-0 transition-transform shadow-sm"
                >
                  [ START COURSE → ]
                </button>

                {/* SECONDARY ACTION: Audio Narration */}
                <button
                  onClick={() => {
                    if (firstLessonId) {
                      navigate(`/lesson/${firstLessonId}?autoplay=narration`);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: `1px solid ${T.ink}`,
                    background: '#ffffff',
                    color: T.ink,
                    fontSize: 'clamp(0.70rem, 2.4vw, 0.78rem)',
                    fontWeight: 750,
                    cursor: 'pointer',
                    fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                    letterSpacing: '0.03em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  className="hover:-translate-y-px active:translate-y-0 hover:bg-[#fbfaf6] hover:border-black transition-all shadow-xs group"
                >
                  <svg
                    className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  <span>[ LISTEN TO AUDIO NARRATION ]</span>
                </button>
              </div>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN (Curriculum Modules Accordion) ════════ */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Outline Card Container */}
            <div
              className="card-hover-lift"
              style={{
                border: `1px solid ${T.line}`,
                background: T.panel,
              }}
            >
              {/* Header Bar with subtle [CURRICULUM // MODULES] & Expand/Collapse */}
              <div
                className="px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5"
                style={{
                  borderBottom: `1px solid ${T.line}`,
                  background: T.paper,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e05244' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f0a842' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#2ea843' }} />
                  </div>
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: T.green,
                      letterSpacing: '0.04em',
                    }}
                  >
                    [CURRICULUM // MODULES]
                  </span>
                </div>

                {/* Subtle Expand All / Collapse All with Icons */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={handleExpandAll}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: T.muted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    className="hover:text-gray-950 py-1"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Expand All</span>
                  </button>
                  <span style={{ color: T.line }}>|</span>
                  <button
                    onClick={handleCollapseAll}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: T.muted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    className="hover:text-gray-950 py-1"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>

              {/* Modules Accordion List */}
              <div className="divide-y divide-[#d8d3c7]">
                {course.modules?.length === 0 ? (
                  <div className="p-8 text-center">
                    <p style={{ fontSize: '0.88rem', color: T.muted, margin: 0 }}>No modules found for this course.</p>
                  </div>
                ) : (
                  course.modules.map((mod, modIdx) => {
                    const isOpen = !!expanded[modIdx];
                    const lessonCount = mod.lessons?.length || 0;

                    return (
                      <div key={mod._id || modIdx}>
                        {/* Module header button */}
                        <button
                          onClick={() => toggle(modIdx)}
                          className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-black/[0.015] cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 mr-4">
                            {/* Square Number Badge */}
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                fontFamily: 'ui-monospace,monospace',
                                flexShrink: 0,
                                background: isOpen ? T.ink : T.paper,
                                color: isOpen ? 'white' : T.muted,
                                border: `1px solid ${isOpen ? T.ink : T.line}`,
                              }}
                            >
                              {String(modIdx + 1).padStart(2, '0')}
                            </span>

                            <div className="min-w-0">
                              <h3
                                style={{
                                  fontSize: '0.98rem',
                                  fontWeight: 800,
                                  color: T.ink,
                                  lineHeight: 1.3,
                                  margin: '0 0 2px',
                                  letterSpacing: '-0.01em',
                                }}
                                className="truncate"
                              >
                                {mod.title || `Module ${modIdx + 1}`}
                              </h3>
                              <p style={{ fontSize: '0.74rem', color: T.muted, margin: 0, fontFamily: 'ui-monospace,monospace' }}>
                                {lessonCount} Lessons
                              </p>
                            </div>
                          </div>

                          {/* Subtle Chevron indicator */}
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${T.line}`,
                              background: T.paper,
                            }}
                            className="shrink-0"
                          >
                            <svg
                              className={`w-3.5 h-3.5 text-gray-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Sub-lessons list: Pure & Clean without noise */}
                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 space-y-2" style={{ background: 'rgba(251,250,246,0.75)' }}>
                            {mod.lessons && mod.lessons.length > 0 ? (
                              mod.lessons.map((lesson, lessonIdx) => (
                                <Link
                                  key={lesson._id}
                                  to={`/lesson/${lesson._id}`}
                                  className="flex items-center justify-between p-3 transition-all hover:bg-white group"
                                  style={{
                                    border: `1px solid ${T.line}`,
                                    background: 'rgba(255,255,255,0.92)',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <div className="flex items-center gap-3 min-w-0 mr-3">
                                    <span
                                      style={{
                                        fontFamily: 'ui-monospace,monospace',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: T.muted,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {String(modIdx + 1).padStart(2, '0')}.{String(lessonIdx + 1).padStart(2, '0')}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.84rem',
                                        fontWeight: 700,
                                        color: T.ink,
                                      }}
                                      className="truncate group-hover:underline"
                                    >
                                      {lesson.title || 'Untitled Lesson'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      style={{
                                        fontFamily: 'ui-monospace,monospace',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        color: T.ink,
                                        whiteSpace: 'nowrap',
                                      }}
                                      className="group-hover:translate-x-0.5 transition-transform"
                                    >
                                      START →
                                    </span>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <p style={{ padding: '12px', fontSize: '0.8rem', color: T.muted, margin: 0 }}>
                                No lessons registered in this module.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Subtle Status Strip */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{
                  borderTop: `1px solid ${T.line}`,
                  background: T.paper,
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full animate-soft-pulse shrink-0" style={{ background: T.accent }} />
                  <span style={{ fontSize: '0.72rem', color: T.muted, fontStyle: 'italic', fontFamily: 'ui-monospace,monospace' }} className="truncate">
                    Structured academic curriculum
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.68rem',
                    color: T.green,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    marginLeft: 8,
                  }}
                  className="shrink-0"
                >
                  100% LATEX READY
                </span>
              </div>
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
            A project by{' '}
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
