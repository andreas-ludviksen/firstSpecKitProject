/**
 * Next.js middleware for authentication
 * Protects routes and redirects unauthenticated users to login
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

// API routes (if any) that should be public
const PUBLIC_API_ROUTES: string[] = [];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    // No session - redirect to login
    const loginUrl = new URL('/login', request.url);
    
    // Add redirect parameter to return to original page after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // Session exists - verify it's valid by checking with auth API
  try {
    const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 
                       (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : '');
    
    const verifyResponse = await fetch(`${authApiUrl}/api/auth/verify`, {
      method: 'GET',
      headers: {
        Cookie: `session=${sessionCookie.value}`,
      },
    });

    if (!verifyResponse.ok) {
      // Session invalid or expired - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('expired', 'true');
      
      if (pathname !== '/') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      
      return NextResponse.redirect(loginUrl);
    }

    // Session valid - allow request
    return NextResponse.next();
  } catch (error) {
    console.error('Session verification failed:', error);
    
    // On error, fail open and allow request
    // (Better UX than blocking users due to network issues)
    return NextResponse.next();
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
