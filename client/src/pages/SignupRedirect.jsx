import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SignupRedirect() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <LoadingSpinner message="Redirecting to secure signup..." />
    </div>
  );
}
