'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems } from '@/data/navigation';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from './LogoutButton';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              Travel Blog
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems
                .filter((item) => item.isActive)
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <span className="text-sm text-gray-600">
                      Welcome, {user.displayName || user.username}
                      {user.role === 'contributor' && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Contributor
                        </span>
                      )}
                    </span>
                    <LogoutButton />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
