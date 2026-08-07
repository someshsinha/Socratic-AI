import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner message="Retrieving course modules..." />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ErrorMessage message={error || 'Course not found'} onRetry={fetchCourse} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button and breadcrumbs */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition duration-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl shadow-xl space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-slate-350 text-sm max-w-3xl leading-relaxed">
            {course.description}
          </p>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {course.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 bg-slate-900/60 text-violet-300 rounded-full border border-violet-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Course Curriculum
        </h2>

        {course.modules?.length === 0 ? (
          <div className="p-8 bg-slate-800/20 border border-slate-750 rounded-2xl text-center">
            <p className="text-slate-400 text-sm">No modules registered for this course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod, modIdx) => (
              <div
                key={mod._id}
                className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-md"
              >
                {/* Module title header */}
                <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-650/15 border border-violet-500/25 text-violet-300 text-xs font-bold">
                      {modIdx + 1}
                    </span>
                    <h3 className="font-bold text-white text-base">
                      {mod.title || `Module ${modIdx + 1}`}
                    </h3>
                  </div>
                  <span className="text-slate-450 text-xs font-medium">
                    {mod.lessons?.length || 0} lessons
                  </span>
                </div>

                {/* Lessons in module */}
                <div className="divide-y divide-slate-800/40">
                  {mod.lessons && mod.lessons.length > 0 ? (
                    mod.lessons.map((lesson, lessonIdx) => (
                      <Link
                        key={lesson._id}
                        to={`/lesson/${lesson._id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 group transition duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 group-hover:text-slate-350 text-xs font-medium w-4">
                            {lessonIdx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition duration-150">
                            {lesson.title || 'Untitled Lesson'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {lesson.isEnriched ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded">
                              Enriched
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-800 text-slate-450 border border-slate-700/60 rounded">
                              Pending AI
                            </span>
                          )}
                          <svg
                            className="h-4 w-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition duration-150"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-slate-500 text-xs italic">
                      No lessons under this module.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
