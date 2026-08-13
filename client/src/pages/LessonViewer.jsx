import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LessonRenderer from '../components/LessonRenderer';
import NarrateButton from '../components/NarrateButton';

export default function LessonViewer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner message="AI is generating detailed lesson content..." />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ErrorMessage message={error || 'Lesson not found'} onRetry={fetchLesson} />
      </div>
    );
  }

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    // Temporarily set a clean document title so the browser header looks professional
    document.title = "Socratic-AI Lesson Study Notes"; 
    
    window.print();
    
    // Restore original title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div id="lesson-viewer-container" className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back to course / outline */}
      <div className="print:hidden">
        {lesson.module && (
          <Link
            to={`/course/${typeof lesson.module === 'object' ? lesson.module.course : ''}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Course Outline
          </Link>
        )}
      </div>

      {/* Printable Lesson Card Container */}
      <div id="lesson-content-card" className="space-y-8">
        {/* Lesson Header */}
        <div className="space-y-4 border-b border-slate-800 pb-6 print:border-none print:pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lesson.title || 'Untitled Lesson'}
            </h1>
            <div className="flex items-center gap-3 flex-shrink-0 print:hidden">
              <NarrateButton lessonId={lesson._id} />
              <button
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2.5 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                title="Download Lesson PDF"
              >
                <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Learning Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="learning-objectives-block p-5 bg-violet-950/10 border border-violet-500/10 rounded-2xl space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-violet-400">
                Learning Objectives
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                {lesson.objectives.map((obj, index) => (
                  <li key={index} className="leading-relaxed">
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Render Content Blocks */}
        <LessonRenderer content={lesson.content} />
      </div>
    </div>
  );
}
