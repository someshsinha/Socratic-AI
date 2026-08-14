import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { registerTokenProvider } from './utils/api';
import { REDIRECT_KEY } from './utils/authConstants';
import Navbar from './components/Navbar';

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Register/unregister the token provider when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      registerTokenProvider(getAccessTokenSilently);
    } else {
      registerTokenProvider(null);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // After login completes, redirect to the page the user originally wanted
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const destination = sessionStorage.getItem(REDIRECT_KEY);
      if (destination) {
        sessionStorage.removeItem(REDIRECT_KEY);
        navigate(destination, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fbfaf6', color: '#111827' }}>
      <Navbar />
      <main className="flex-1 flex flex-col" style={{ position: 'relative' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;

