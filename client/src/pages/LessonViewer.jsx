import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LessonRenderer from '../components/LessonRenderer';

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

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back to course / outline */}
      <div>
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

      {/* Lesson Header */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {lesson.title || 'Untitled Lesson'}
        </h1>

        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="p-5 bg-violet-950/10 border border-violet-500/10 rounded-2xl space-y-2">
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
  );
}
