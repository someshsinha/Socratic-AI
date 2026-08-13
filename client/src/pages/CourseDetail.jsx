import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

/* ────────────────────────────────────────────────────────
   DESIGN TOKENS (Exact Landing Page template)
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

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track open/collapsed state for each module
  const [expanded, setExpanded] = useState({});

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data?.data;
      setCourse(courseData);

      // Default: expand first two modules
      if (courseData?.modules?.length > 0) {
        const initialOpen = {};
        courseData.modules.forEach((mod, idx) => {
          if (idx < 2) initialOpen[idx] = true;
        });
        setExpanded(initialOpen);
      }
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

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const estimatedHours = Math.max(1, Math.round(totalLessons * 15 / 60));
  const categoryTag = course.tags?.[0] ? `[CS // ${course.tags[0].toUpperCase()}]` : '[CS // DISTRIBUTED SYSTEMS]';

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 72px' }}>
        
        {/* Breadcrumb Back Link */}
        <div className="mb-6">
          <Link
            to="/my-courses"
            style={{
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: T.muted,
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}
            className="hover:text-gray-950 flex items-center gap-1.5"
          >
            ← [BACK TO LIBRARY]
          </Link>
        </div>

        {/* ── 2-Column Responsive Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ════════ LEFT COLUMN (Overview, Badges & Actions) ════════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
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
                  margin: '0 0 10px',
                }}
              >
                Socratic-AI v0.1 // Course Overview
              </p>

              {/* Main H1 Title with Period */}
              <h1
                style={{
                  fontSize: 'clamp(2.3rem, 4.5vw, 3.4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.06,
                  color: T.ink,
                  margin: '0 0 14px',
                }}
              >
                {course.title}.
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '0.96rem',
                  color: '#4b5563',
                  lineHeight: 1.65,
                  margin: '0 0 20px',
                }}
              >
                {course.description || 'Understand how modern systems communicate, replicate, and reach consensus in the presence of failures.'}
              </p>

              {/* Square Scope Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.ink,
                  }}
                >
                  [{course.modules?.length || 0} MODULES]
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.ink,
                  }}
                >
                  [{totalLessons} LESSONS]
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.ink,
                  }}
                >
                  [~{estimatedHours}H TOTAL]
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    border: `1px solid ${T.ink}`,
                    background: T.ink,
                    color: '#ffffff',
                  }}
                >
                  {categoryTag}
                </span>
              </div>
            </div>

            {/* AI Summary Box & Actions Card */}
            <div
              className="card-hover-lift p-6 space-y-4"
              style={{
                border: `1px solid ${T.line}`,
                background: T.panel,
              }}
            >
              <p style={{ fontSize: '0.86rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                This is your complete AI-generated curriculum for <strong>{course.title}</strong>. It covers fundamental theory, architecture patterns, and first-principles mathematical rigor.
              </p>

              <div className="space-y-2.5 pt-2">
                {/* Generate Final LaTeX PDF Button */}
                <button
                  onClick={() => alert('LaTeX PDF generated for this course.')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 16px',
                    border: `1px solid ${T.ink}`,
                    background: T.panel,
                    fontSize: '0.8rem',
                    fontWeight: 750,
                    color: T.ink,
                    cursor: 'pointer',
                    fontFamily: 'ui-monospace,monospace',
                    letterSpacing: '0.03em',
                  }}
                  className="hover:bg-[#fbfaf6] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>[GENERATE FINAL LATEX PDF]</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 border border-[#d8d3c7] bg-[#fbfaf6] text-gray-700">
                    PDF
                  </span>
                </button>

                {/* Listen in Hinglish Audio Button */}
                <button
                  onClick={() => {
                    const firstLesson = course.modules?.[0]?.lessons?.[0];
                    if (firstLesson?._id) {
                      window.location.href = `/lesson/${firstLesson._id}`;
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 16px',
                    border: `1px solid ${T.ink}`,
                    background: T.ink,
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    fontFamily: 'ui-monospace,monospace',
                    letterSpacing: '0.03em',
                  }}
                  className="hover:-translate-y-px active:translate-y-0 transition-transform"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    <span>[LISTEN IN HINGLISH AUDIO]</span>
                  </div>
                  <span className="flex items-center gap-0.5 text-white">
                    <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" />
                    <span className="w-0.5 h-4 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                  </span>
                </button>
              </div>
            </div>

            {/* Isometric Mathematical Node SVG Graphic */}
            <div className="hidden lg:flex justify-center pt-2 select-none opacity-80">
              <svg width="220" height="140" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M110 70L50 40M110 70L170 40M110 70L110 115M50 40L50 85M170 40L170 85" stroke="#d8d3c7" strokeWidth="1.2" strokeDasharray="3 3" />
                <polygon points="110,45 140,60 110,75 80,60" fill="#fbfaf6" stroke="#111827" strokeWidth="1.5" />
                <polygon points="80,60 110,75 110,105 80,90" fill="#e5e7eb" stroke="#111827" strokeWidth="1.5" />
                <polygon points="140,60 110,75 110,105 140,90" fill="#d1d5db" stroke="#111827" strokeWidth="1.5" />
                <polygon points="50,25 68,35 50,45 32,35" fill="#fbfaf6" stroke="#5f6673" strokeWidth="1.2" />
                <polygon points="32,35 50,45 50,63 32,53" fill="#e5e7eb" stroke="#5f6673" strokeWidth="1.2" />
                <polygon points="68,35 50,45 50,63 68,53" fill="#d1d5db" stroke="#5f6673" strokeWidth="1.2" />
                <polygon points="170,25 188,35 170,45 152,35" fill="#fbfaf6" stroke="#5f6673" strokeWidth="1.2" />
                <polygon points="152,35 170,45 170,63 152,53" fill="#e5e7eb" stroke="#5f6673" strokeWidth="1.2" />
                <polygon points="188,35 170,45 170,63 188,53" fill="#d1d5db" stroke="#5f6673" strokeWidth="1.2" />
              </svg>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN (Curriculum Modules Outline) ════════ */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Outline Card Container (Matching WorkspacePanel from Landing Page) */}
            <div
              className="card-hover-lift"
              style={{
                border: `1px solid ${T.line}`,
                background: T.panel,
              }}
            >
              {/* Header Bar with 3 Window Dots & Actions */}
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{
                  borderBottom: `1px solid ${T.line}`,
                  background: T.paper,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e05244' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f0a842' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#2ea843' }} />
                  </div>
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: T.green,
                      letterSpacing: '0.04em',
                    }}
                  >
                    [CURRICULUM_ENGINE // STRUCTURED_MODULES]
                  </span>
                </div>

                {/* Expand / Collapse All */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExpandAll}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: T.muted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    className="hover:text-gray-950"
                  >
                    [EXPAND ALL]
                  </button>
                  <span style={{ color: T.line }}>|</span>
                  <button
                    onClick={handleCollapseAll}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: T.muted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    className="hover:text-gray-950"
                  >
                    [COLLAPSE ALL]
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
                    const estimatedModTime = lessonCount * 12;

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
                                {lessonCount} lessons • ~{estimatedModTime}m
                              </p>
                            </div>
                          </div>

                          {/* Chevron icon */}
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

                        {/* Sub-lessons list */}
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

                                  <div className="flex items-center gap-2.5 shrink-0">
                                    {lesson.isEnriched && (
                                      <span
                                        style={{
                                          fontFamily: 'ui-monospace,monospace',
                                          fontSize: '0.64rem',
                                          fontWeight: 700,
                                          padding: '1px 6px',
                                          border: `1px solid ${T.line}`,
                                          color: T.green,
                                          background: T.paper,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        [✓ ENRICHED]
                                      </span>
                                    )}
                                    <span
                                      style={{
                                        fontFamily: 'ui-monospace,monospace',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        color: T.accent,
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

              {/* Bottom Live Status Strip */}
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
                    Interactive curriculum loaded from database
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
                  100% LATEX & MCQ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
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
