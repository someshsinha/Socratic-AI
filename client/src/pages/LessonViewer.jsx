import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LessonRenderer from '../components/LessonRenderer';
import NarrateButton from '../components/NarrateButton';

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
  purple: '#6366f1',
};

export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [tocItems, setTocItems] = useState([]);

  // 1. Fetch lesson & parent course metadata
  useEffect(() => {
    let isMounted = true;

    const loadLessonAndCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const lessonRes = await api.get(`/lessons/${id}`);
        const lessonData = lessonRes.data?.data;
        if (!isMounted) return;
        setLesson(lessonData);

        // Fetch parent course to resolve full module/lesson progression sequence
        const courseId = typeof lessonData?.module === 'object' ? lessonData.module?.course : lessonData?.module;
        if (courseId) {
          try {
            const courseRes = await api.get(`/courses/${courseId}`);
            if (isMounted) {
              setCourse(courseRes.data?.data);
            }
          } catch (e) {
            console.warn('Could not load course sequence', e);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load lesson content');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLessonAndCourse();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => { isMounted = false; };
  }, [id]);

  // 2. Build Table of Contents items from rendered DOM anchors
  useEffect(() => {
    if (!lesson) return;

    const buildToc = () => {
      const items = [];
      const sectionElements = document.querySelectorAll('[data-section-target]');
      
      sectionElements.forEach((el, idx) => {
        const targetId = el.id || `section-${idx}`;
        const title = el.getAttribute('data-section-title') || el.innerText?.slice(0, 40) || `Section ${idx + 1}`;
        items.push({
          id: targetId,
          title: title.trim(),
        });
      });

      if (items.length > 0) {
        setTocItems(items);
        setActiveSectionId(items[0].id);
      }
    };

    // Small timeout to allow DOM to populate after LessonRenderer mounts
    const timeout = setTimeout(buildToc, 100);
    return () => clearTimeout(timeout);
  }, [lesson]);

  // 3. Viewport IntersectionObserver to detect currently visible section
  useEffect(() => {
    if (tocItems.length === 0) return;

    const sectionElements = document.querySelectorAll('[data-section-target]');
    if (!sectionElements.length) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    // Top-biased root margin so heading activates as soon as it nears the top reading zone
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-100px 0px -65% 0px',
      threshold: 0,
    });

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, [tocItems]);

  // 4. Smooth scroll on section click
  const handleScrollTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(targetId);
    }
  };

  // 5. Resolve Sequence Progression (Previous / Next Lesson)
  let prevLesson = null;
  let nextLesson = null;
  let currentModNum = 1;
  let currentLessonIndex = 0;
  let totalLessonsInMod = 1;

  if (course?.modules && lesson) {
    const allCourseLessons = [];
    course.modules.forEach((mod, mIdx) => {
      if (mod.lessons) {
        mod.lessons.forEach((l, lIdx) => {
          const isCurrent = l._id === lesson._id || (typeof l === 'string' && l === lesson._id);
          if (isCurrent) {
            currentModNum = mIdx + 1;
            currentLessonIndex = lIdx;
            totalLessonsInMod = mod.lessons.length;
          }
          allCourseLessons.push({
            ...l,
            modIndex: mIdx + 1,
            lessonIndex: lIdx + 1,
          });
        });
      }
    });

    const currentIndex = allCourseLessons.findIndex(l => l._id === lesson._id);
    if (currentIndex > 0) {
      prevLesson = allCourseLessons[currentIndex - 1];
    }
    if (currentIndex >= 0 && currentIndex < allCourseLessons.length - 1) {
      nextLesson = allCourseLessons[currentIndex + 1];
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }} className="flex flex-col justify-center items-center py-32 space-y-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-950 rounded-full animate-spin" />
        <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', color: T.muted }}>
          Generating & rendering lesson study notes...
        </p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }} className="p-8 flex justify-center items-center">
        <div className="p-6 bg-red-50 border border-red-200 text-center space-y-3 max-w-md">
          <p className="font-bold text-red-900">Error Loading Lesson</p>
          <p className="text-xs text-red-700">{error || 'Lesson not found'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ border: `1px solid ${T.ink}`, background: T.ink, color: '#fff', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = `${lesson.title || 'Lesson'} - Socratic AI Notes`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const courseId = course?._id || (typeof lesson.module === 'object' ? lesson.module?.course : lesson.module);

  // Active section index for vertical progress calculation
  const activeIdx = tocItems.findIndex(item => item.id === activeSectionId);

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: T.ink }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 24px 72px' }}>
        
        {/* Navigation & Header Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Link
            to={courseId ? `/course/${courseId}` : '/my-courses'}
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
            ← [BACK TO COURSE OUTLINE]
          </Link>

          {/* Compact Actions */}
          <div className="flex items-center gap-3">
            <NarrateButton lessonId={lesson._id} />
            <button
              onClick={handleDownloadPdf}
              style={{
                fontFamily: 'ui-monospace,monospace',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: `1px solid ${T.line}`,
                background: T.panel,
                color: T.ink,
                padding: '7px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              className="hover:border-gray-900 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>[ PRINT / PDF ]</span>
            </button>
          </div>
        </div>

        {/* ── 2-Column Responsive Reading Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ════════ MAIN READING COLUMN (Hero Educational Canvas) ════════ */}
          <main className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Lesson Header Title */}
            <div className="border-b border-[#d8d3c7] pb-6 space-y-3">
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
                [LESSON // STUDY_NOTES]
              </p>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 4.2vw, 3.1rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.12,
                  color: T.ink,
                  margin: 0,
                }}
              >
                {lesson.title.endsWith('.') ? lesson.title : `${lesson.title}.`}
              </h1>

              {/* Sub-header meta */}
              {course?.title && (
                <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.76rem', color: T.muted, margin: 0 }}>
                  Course: {course.title} <span className="mx-1">•</span> Module {String(currentModNum).padStart(2, '0')}
                </p>
              )}
            </div>

            {/* Compact Learning Objectives Box */}
            {lesson.objectives && lesson.objectives.length > 0 && (
              <div
                id="section-objectives"
                data-section-target
                data-section-title="Learning Objectives"
                className="p-5 border border-[#d8d3c7] bg-white space-y-2.5 scroll-mt-24"
                style={{ boxShadow: '0 4px 16px rgba(17,24,39,0.02)' }}
              >
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: T.green,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  [LEARNING OBJECTIVES]
                </span>
                <p style={{ fontSize: '0.86rem', color: '#4b5563', margin: '0 0 6px', fontWeight: 600 }}>
                  By the end of this lesson, you should be able to:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-[#1f2937] m-0 pl-1">
                  {lesson.objectives.map((obj, i) => (
                    <li key={i} className="leading-relaxed">{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Educational Content Stream (Paragraphs, Headings, LaTeX, Code, MCQs) */}
            <div className="pt-2">
              <LessonRenderer content={lesson.content} />
            </div>

            {/* ── Lesson Navigation Bar (Previous / Sequence / Next) ── */}
            <nav
              className="mt-14 pt-8 border-t border-[#d8d3c7] flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden"
            >
              {/* Previous Lesson Link */}
              <div className="w-full sm:w-auto text-left">
                {prevLesson ? (
                  <button
                    onClick={() => navigate(`/lesson/${prevLesson._id}`)}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.78rem',
                      fontWeight: 750,
                      border: `1px solid ${T.line}`,
                      background: T.panel,
                      color: T.ink,
                      padding: '10px 16px',
                      cursor: 'pointer',
                    }}
                    className="hover:border-gray-950 transition-colors w-full sm:w-auto text-left flex items-center gap-2"
                  >
                    <span>←</span>
                    <span>PREVIOUS LESSON</span>
                  </button>
                ) : (
                  <div style={{ height: 40 }} />
                )}
              </div>

              {/* Progress Dots Indicator */}
              <div className="text-center space-y-1.5">
                <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', fontWeight: 700, color: T.muted, margin: 0 }}>
                  MODULE {String(currentModNum).padStart(2, '0')} · LESSON {String(currentLessonIndex + 1).padStart(2, '0')} OF {String(totalLessonsInMod).padStart(2, '0')}
                </p>
                {/* Dots sequence */}
                <div className="flex items-center justify-center gap-1.5">
                  {Array.from({ length: Math.min(8, totalLessonsInMod) }).map((_, dIdx) => (
                    <React.Fragment key={dIdx}>
                      <span
                        className={`w-2 h-2 rounded-full transition-all ${
                          dIdx <= currentLessonIndex
                            ? 'bg-[#111827]'
                            : 'bg-gray-200 border border-gray-300'
                        }`}
                      />
                      {dIdx < Math.min(8, totalLessonsInMod) - 1 && (
                        <span className="w-2.5 h-px bg-[#d8d3c7]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Next Lesson Link */}
              <div className="w-full sm:w-auto text-right">
                {nextLesson ? (
                  <button
                    onClick={() => navigate(`/lesson/${nextLesson._id}`)}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      border: `1px solid ${T.ink}`,
                      background: T.ink,
                      color: '#ffffff',
                      padding: '10px 18px',
                      cursor: 'pointer',
                    }}
                    className="hover:-translate-y-px active:translate-y-0 transition-transform w-full sm:w-auto text-right flex items-center justify-end gap-2 shadow-sm"
                  >
                    <span>NEXT LESSON</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(courseId ? `/course/${courseId}` : '/my-courses')}
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      border: `1px solid ${T.green}`,
                      background: T.green,
                      color: '#ffffff',
                      padding: '10px 18px',
                      cursor: 'pointer',
                    }}
                    className="hover:-translate-y-px active:translate-y-0 transition-transform w-full sm:w-auto text-right flex items-center justify-end gap-2"
                  >
                    <span>COURSE COMPLETED ✓</span>
                  </button>
                )}
              </div>
            </nav>
          </main>

          {/* ════════ RIGHT COLUMN (Quiet Sticky Table of Contents) ════════ */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-4 print:hidden pl-2">
              <div className="space-y-3">
                {/* Quiet Header Label */}
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: T.muted,
                    }}
                  >
                    ON THIS LESSON
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {tocItems.length} sections
                  </span>
                </div>

                {/* Vertical Progress Line & Dots Visual */}
                <div className="relative border-l border-[#d8d3c7] ml-2 pl-4 py-1 space-y-3">
                  {tocItems.map((item, idx) => {
                    const isActive = item.id === activeSectionId;
                    const isPast = activeIdx !== -1 && idx < activeIdx;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleScrollTo(item.id)}
                        className="relative w-full text-left transition-all group flex items-start cursor-pointer select-none"
                      >
                        {/* Progress Dot positioned right on the vertical line */}
                        <span
                          className={`absolute -left-[21px] top-1.5 transition-all duration-200 rounded-full ${
                            isActive
                              ? 'w-2.5 h-2.5 bg-[#111827] ring-4 ring-[#e5e7eb]'
                              : isPast
                                ? 'w-2 h-2 bg-[#111827]'
                                : 'w-2 h-2 bg-white border border-[#d8d3c7] group-hover:border-[#111827]'
                          }`}
                        />

                        {/* Section Title */}
                        <span
                          className={`text-xs transition-colors truncate block leading-snug ${
                            isActive
                              ? 'font-extrabold text-[#111827]'
                              : isPast
                                ? 'text-[#374151] group-hover:text-[#111827]'
                                : 'text-[#6b7280] group-hover:text-[#111827]'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-gray-400 mr-1.5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}
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
