import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginPage: React.FC = () => {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  const handleLogin = async () => {
    try {
      console.log('🔐 Login initiated');
      await loginWithRedirect();
    } catch (error) {
      console.error('❌ Login failed', error);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-page">
      <h1>Login Page</h1>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Log In with Auth0</button>
      ) : (
        <button onClick={handleLogout}>Log Out</button>
      )}
    </div>
  );
};

export default LoginPage;