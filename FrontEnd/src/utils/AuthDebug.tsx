// client/src/components/debug/AuthDebug.tsx
/**
 * AuthContext Debug Component
 * Add this temporarily to your app to see exactly what's happening with auth state
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiBaseUrl } from '../services/api';

const AuthDebug: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    login, 
    logout, 
    checkAuth 
  } = useAuth();

  const [testCredentials, setTestCredentials] = useState({
    username: '',
    password: ''
  });

  const handleTestLogin = async () => {
    try {
      await login(testCredentials);
      console.log('✅ Login test completed');
    } catch (error) {
      console.error('❌ Login test failed:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      await logout();
      console.log('✅ Logout test completed');
    } catch (error) {
      console.error('❌ Logout test failed:', error);
    }
  };

  const handleCheckAuth = async () => {
    try {
      await checkAuth();
      console.log('✅ Auth check completed');
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    }
  };

  const handleDirectApiTest = async () => {
    try {
      console.log('🧪 Testing direct API call...');
      const response = await fetch(`${apiBaseUrl('auth')}/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('📥 Direct API response:', data);
    } catch (error) {
      console.error('❌ Direct API test failed:', error);
    }
  };

  const handleCookieTest = () => {
    console.log('🍪 Cookie test:');
    console.log('All cookies:', document.cookie);
    const sessionCookie = document.cookie.split(';').find(c => c.includes('qc.sid'));
    console.log('Session cookie:', sessionCookie);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'white',
      border: '2px solid #333',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '400px',
      fontSize: '14px',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Auth Debug Panel</h3>
      
      {/* Current Auth State */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Current State:</strong>
        <div>✅ Authenticated: {isAuthenticated ? 'YES' : 'NO'}</div>
        <div>👤 User: {user ? user.username : 'None'}</div>
        <div>⏳ Loading: {loading ? 'YES' : 'NO'}</div>
        <div>❌ Error: {error || 'None'}</div>
      </div>

      {/* Test Controls */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Test Login:</strong>
        <div style={{ margin: '5px 0' }}>
          <input
            type="text"
            placeholder="Username"
            value={testCredentials.username}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, username: e.target.value }))}
            style={{ width: '100%', padding: '4px', marginBottom: '4px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={testCredentials.password}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            style={{ width: '100%', padding: '4px' }}
          />
        </div>
        <button onClick={handleTestLogin} style={{ marginRight: '5px', padding: '4px 8px' }}>
          Test Login
        </button>
        <button onClick={handleTestLogout} style={{ padding: '4px 8px' }}>
          Test Logout
        </button>
      </div>

      {/* Diagnostic Buttons */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Diagnostics:</strong>
        <div style={{ margin: '5px 0' }}>
          <button onClick={handleCheckAuth} style={{ marginRight: '5px', padding: '4px 8px', fontSize: '12px' }}>
            Check Auth
          </button>
          <button onClick={handleDirectApiTest} style={{ marginRight: '5px', padding: '4px 8px', fontSize: '12px' }}>
            Direct API Test
          </button>
          <button onClick={handleCookieTest} style={{ padding: '4px 8px', fontSize: '12px' }}>
            Cookie Test
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        <strong>Instructions:</strong>
        <ol style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li>Check browser console for detailed logs</li>
          <li>Test login with valid credentials</li>
          <li>Verify session cookie is created</li>
          <li>Check if auth state updates correctly</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebug;

 