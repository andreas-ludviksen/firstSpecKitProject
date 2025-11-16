/**
 * Authentication Middleware for Cloudflare Workers
 * Feature: 004-modular-blog-posts
 * 
 * Verifies JWT tokens and enforces contributor-only access
 */

import { verifyTokenDetailed, type SessionPayload } from './jwt';

export interface AuthenticatedRequest extends Request {
  user?: SessionPayload;
}

export interface AuthMiddlewareOptions {
  requireContributor?: boolean; // Default: true
  optional?: boolean; // Allow unauthenticated requests
}

/**
 * Extract JWT token from request
 */
function extractToken(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    return cookies['session'] || null;
  }

  return null;
}

/**
 * Parse cookies from Cookie header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=').trim();
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

/**
 * Authentication middleware
 */
export async function authenticate(
  request: Request,
  jwtSecret: string,
  options: AuthMiddlewareOptions = {}
): Promise<{ authorized: boolean; user?: SessionPayload; response?: Response }> {
  const { requireContributor = true, optional = false } = options;

  // Extract token
  const token = extractToken(request);
  
  console.log('[Auth Middleware] Token extracted:', token ? `${token.substring(0, 20)}...` : 'null');
  console.log('[Auth Middleware] JWT Secret available:', !!jwtSecret);
  if (jwtSecret) {
    console.log('[Auth Middleware] JWT Secret length:', jwtSecret.length);
  }
  
  if (!token) {
    if (optional) {
      return { authorized: true }; // Allow unauthenticated access
    }
    
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({ error: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Verify token
  const verification = verifyTokenDetailed(token, jwtSecret);
  
  console.log('[Auth Middleware] Token verification result:', verification.valid ? 'valid' : `invalid (${verification.error})`);
  
  if (!verification.valid) {
    const status = verification.error === 'EXPIRED' ? 401 : 401;
    const message = verification.error === 'EXPIRED' ? 'Token expired' : 'Invalid token';
    
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({ error: verification.error, message }),
        { status, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Check role
  if (requireContributor && verification.payload!.role !== 'contributor') {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Contributor role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    authorized: true,
    user: verification.payload,
  };
}

/**
 * Middleware wrapper for route handlers
 */
export function withAuth(
  handler: (request: Request, user: SessionPayload, ...args: any[]) => Promise<Response>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: Request, env: any, ctx: any): Promise<Response> => {
    const jwtSecret = env.JWT_SECRET;
    
    console.log('[withAuth] JWT_SECRET available:', !!jwtSecret);
    console.log('[withAuth] JWT_SECRET length:', jwtSecret?.length || 0);
    console.log('[withAuth] JWT_SECRET first 10 chars:', jwtSecret?.substring(0, 10) || 'N/A');
    
    if (!jwtSecret) {
      return new Response(
        JSON.stringify({ error: 'CONFIGURATION_ERROR', message: 'JWT secret not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const auth = await authenticate(request, jwtSecret, options);
    
    if (!auth.authorized) {
      return auth.response!;
    }

    // Call handler with authenticated user and pass through env and ctx (which contains route params)
    return handler(request, auth.user!, env, ctx);
  };
}

/**
 * Optional auth middleware - allows unauthenticated requests but provides user if authenticated
 */
export function withOptionalAuth(
  handler: (request: Request, user: SessionPayload | undefined, ...args: any[]) => Promise<Response>
) {
  return withAuth(handler, { optional: true, requireContributor: false });
}
