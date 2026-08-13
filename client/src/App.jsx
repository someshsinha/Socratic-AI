import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { registerTokenProvider } from './utils/api';
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
    <div className="min-h-screen" style={{ background: '#fbfaf6', color: '#111827' }}>
      <Navbar />
      <main style={{ position: 'relative' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
