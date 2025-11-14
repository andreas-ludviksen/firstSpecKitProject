/**
 * JWT token generation and verification utilities
 * Uses HS256 algorithm for signing
 */

import jwt from 'jsonwebtoken';

export interface SessionPayload {
  sub: string; // username
  role: 'reader' | 'contributor';
  iat: number; // issued at
  exp: number; // expiration time
  rememberMe: boolean;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: SessionPayload;
  error?: 'EXPIRED' | 'INVALID';
}

const SEVEN_DAYS = 7 * 24 * 60 * 60; // 7 days in seconds
const TWENTY_FOUR_HOURS = 24 * 60 * 60; // 24 hours in seconds

/**
 * Generate a JWT session token
 * @param username - User's username
 * @param role - User's role (reader or contributor)
 * @param rememberMe - Whether to persist session for 7 days
 * @param secret - JWT signing secret
 * @returns Signed JWT token string
 */
export function generateToken(
  username: string,
  role: 'reader' | 'contributor',
  rememberMe: boolean,
  secret: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = rememberMe ? SEVEN_DAYS : TWENTY_FOUR_HOURS;

  const payload: SessionPayload = {
    sub: username,
    role,
    iat: now,
    exp: now + expiresIn,
    rememberMe,
  };

  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @param secret - JWT signing secret
 * @returns Decoded session payload if valid, null otherwise
 */
export function verifyToken(token: string, secret: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as SessionPayload;
    
    // Additional expiry check (redundant with jwt.verify but explicit)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return null;
    }
    
    return decoded;
  } catch (error: any) {
    // Log error for debugging
    console.error('Token verification error:', error);
    
    // Return null for all errors (caller checks for null)
    return null;
  }
}

/**
 * Verify and decode a JWT token with detailed error information
 * @param token - JWT token string to verify
 * @param secret - JWT signing secret
 * @returns TokenVerificationResult with payload or error details
 */
export function verifyTokenDetailed(token: string, secret: string): TokenVerificationResult {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as SessionPayload;
    
    // Additional expiry check (redundant but explicit)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return { valid: false, error: 'EXPIRED' };
    }
    
    return { valid: true, payload: decoded };
  } catch (error: any) {
    // Check if token is expired
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'EXPIRED' };
    }
    
    // Invalid signature or malformed JWT
    console.error('Token verification error:', error);
    return { valid: false, error: 'INVALID' };
  }
}

/**
 * Extract JWT token from Authorization header or cookie
 * @param cookieHeader - Cookie header string
 * @param cookieName - Name of the session cookie (default: 'session')
 * @returns JWT token string or null if not found
 */
export function extractTokenFromCookie(cookieHeader: string | null, cookieName = 'session'): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(cookie => cookie.startsWith(`${cookieName}=`));
  
  if (!sessionCookie) {
    return null;
  }

  return sessionCookie.substring(cookieName.length + 1);
}
