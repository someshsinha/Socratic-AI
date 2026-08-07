import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { registerTokenProvider } from './utils/api';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
