'use client';

/**
 * Login form component with username, password, and remember me checkbox
 */

import { useState, FormEvent } from 'react';
import { login } from '@/lib/auth-api';

interface LoginFormProps {
  redirectPath?: string;
}

export default function LoginForm({ redirectPath }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login({ username, password, rememberMe });

      if (result.success) {
        // Login successful - force full page reload to update auth state
        const destination = redirectPath || '/';
        window.location.href = destination;
      } else {
        // Login failed - display error
        if (result.error === 'RATE_LIMITED' && result.retryAfter) {
          const minutes = Math.ceil(result.retryAfter / 60);
          setError(`Too many failed attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
        } else {
          setError(result.message);
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {error && (
        <div 
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" 
          role="alert"
          aria-live="polite"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label 
          htmlFor="username" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your username"
          disabled={isLoading}
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your password"
          disabled={isLoading}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label 
          htmlFor="rememberMe" 
          className="ml-2 block text-sm text-gray-700"
        >
          Remember me for 7 days
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
