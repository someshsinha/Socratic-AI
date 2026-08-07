import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import PromptForm from '../components/PromptForm';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/courses/user-courses');
      setCourses(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCourses();
    }
  }, [isAuthenticated, authLoading]);

  // When a new course is successfully generated, redirect to the course details page
  const handleCourseGenerated = (course) => {
    if (course?._id) {
      navigate(`/course/${course._id}`);
    } else {
      fetchCourses();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Section: Hero and Course Generator */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            Socratic Learning System
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Generate highly structured curriculum pathways dynamically powered by advanced AI guidance.
          </p>
        </div>

        {/* Reuse PromptForm with a callback */}
        <PromptForm onCourseGenerated={handleCourseGenerated} />
      </div>

      {/* Bottom Section: Course Library */}
      <div className="border-t border-slate-800/60 pt-10 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            Your Curriculum Library
          </h2>
          <p className="text-slate-400 text-sm">
            Resume your progress or browse previously generated courses.
          </p>
        </div>

        {authLoading ? (
          <LoadingSpinner message="Checking authentication status..." />
        ) : !isAuthenticated ? (
          <div className="w-full max-w-lg mx-auto p-8 bg-slate-800/30 border border-slate-700/30 rounded-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-violet-650/10 border border-violet-500/20 rounded-full flex items-center justify-center text-violet-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-350">Sign In to Save Courses</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                Connect your account to save generated courses, track your lesson progression, and view your private library.
              </p>
            </div>
            <button
              onClick={() => loginWithRedirect()}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition duration-200 cursor-pointer"
            >
              Log In
            </button>
          </div>
        ) : loading && courses.length === 0 ? (
          <LoadingSpinner message="Loading courses..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : courses.length === 0 ? (
          <div className="w-full max-w-md mx-auto p-8 bg-slate-800/20 border border-slate-700/20 rounded-2xl text-center">
            <p className="text-slate-400 text-sm">No courses generated yet. Enter a topic above to begin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/course/${course._id}`}
                className="group bg-slate-850 border border-slate-800 hover:border-violet-500/30 rounded-2xl overflow-hidden hover:scale-[1.01] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors duration-250 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg w-max border border-slate-800">
                    <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>{course.modules?.length || 0} Modules</span>
                  </div>
                </div>
                {course.tags && course.tags.length > 0 && (
                  <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-900/40 flex flex-wrap gap-1.5">
                    {course.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded border border-violet-500/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
