'use client';

/**
 * Logout button component
 * Calls logout API and redirects to home page
 */

import { useState } from 'react';
import { logout } from '@/lib/auth-api';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await logout();
      
      // Force full page reload to clear auth state
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      
      // Even if logout fails, redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
