import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { registerTokenProvider } from './utils/api';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginRedirect from './pages/LoginRedirect';
import SignupRedirect from './pages/SignupRedirect';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';

function App() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      registerTokenProvider(getAccessTokenSilently);
    } else {
      registerTokenProvider(null);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Persistent Sidebar (hidden on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar (handles navigation on mobile + user identity) */}
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/signup" element={<SignupRedirect />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/lesson/:id" element={<LessonViewer />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
