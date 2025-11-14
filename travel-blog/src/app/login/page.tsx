/**
 * Login page
 * Displays login form for authentication
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';
  const redirectPath = searchParams.get('redirect') || undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Travel Blog
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your travel blog account
          </p>
          
          {isExpired && (
            <div 
              className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative"
              role="alert"
            >
              <p className="text-sm text-center">
                Your session has expired. Please log in again.
              </p>
            </div>
          )}
        </div>
        
        <LoginForm redirectPath={redirectPath} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
