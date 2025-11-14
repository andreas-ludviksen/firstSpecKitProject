/**
 * Custom hook to check authentication status
 */

'use client';

import { useState, useEffect } from 'react';
import { verifySession } from '@/lib/auth-api';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    role: 'reader' | 'contributor';
    displayName?: string;
  } | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await verifySession();

        if ('authenticated' in result && result.authenticated) {
          setAuthState({
            isAuthenticated: true,
            user: result.user,
            isLoading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    }

    checkAuth();
  }, []);

  return authState;
}
