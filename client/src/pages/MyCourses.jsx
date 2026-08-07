import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import api, { setAuthToken } from '../utils/api';

export default function MyCourses() {
  const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user access token from Auth0
        const token = await getAccessTokenSilently();
        setAuthToken(token);

        // Fetch courses from server
        const response = await api.get('/courses/user-courses');
        setCourses(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserCourses();
    }
  }, [isAuthenticated, authLoading, getAccessTokenSilently]);

  if (authLoading || (loading && courses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-slate-700 border-t-violet-500 animate-spin" />
        <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Loading your library...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-violet-600/10 border border-violet-500/20 rounded-full flex items-center justify-center">
          <svg className="h-8 w-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Private Library</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Please log in to generate and manage your personalized AI learning courses.
          </p>
        </div>
        <button
          onClick={() => loginWithRedirect()}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-violet-500/20 active:scale-95 transition duration-200"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center space-y-4">
        <p className="font-semibold text-red-300">Error loading library</p>
        <p className="text-xs text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold rounded-xl border border-red-500/20 transition duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            My Learning Library
          </h1>
          <p className="text-slate-400 text-sm">
            Access your custom AI-generated courses and curriculums.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition duration-200"
        >
          Generate Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="w-full max-w-lg mx-auto p-12 bg-slate-800/40 border border-slate-700/30 rounded-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-slate-800 border border-slate-700/80 rounded-full flex items-center justify-center text-slate-500">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-300">No courses generated yet</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              Start your learning journey by generating a customized outline on any topic of your choice.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-750 text-violet-400 font-semibold rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition duration-200"
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-2xl hover:border-violet-500/30 hover:scale-[1.01] flex flex-col justify-between overflow-hidden transition-all duration-300"
            >
              <div className="p-6 space-y-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-white hover:text-violet-400 transition-colors duration-200 line-clamp-2">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Modules Count */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/40 border border-slate-900/30 px-3 py-1.5 rounded-lg w-max">
                  <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>{course.modules?.length || 0} Modules</span>
                </div>
              </div>

              {/* Tags and footer */}
              <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-850 flex flex-wrap gap-1.5 items-center">
                {course.tags && course.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded border border-violet-500/10"
                  >
                    {tag}
                  </span>
                ))}
                {course.tags && course.tags.length > 3 && (
                  <span className="text-[10px] font-bold text-slate-500">
                    +{course.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
