// client/src/components/LoginForm.tsx
// Example of how to use the new unified API

import React, { useState } from 'react';
import { authService, type LoginData, type User } from '../../services/api';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.login(formData);
      setUser(userData);
      console.log('Logged in user:', userData);
      // Redirect or update app state here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (user) {
    return (
      <div className="p-4 bg-green-50 rounded">
        <h2>Welcome, {user.first_name} {user.last_name}!</h2>
        <p>Role: {user.role}</p>
        <button 
          onClick={handleLogout}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Login</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2">Username:</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded text-white ${
          loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

/*
=== SIMPLE USAGE PATTERN ===

Import what you need:
import { authService, userService, siteService } from '../services/api';

Use the services:
- authService.login(credentials)
- authService.logout()
- userService.getUsers()
- siteService.getSites()

All services handle errors and return consistent responses.
*/