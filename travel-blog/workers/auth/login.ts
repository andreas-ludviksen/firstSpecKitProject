/**
 * POST /api/auth/login endpoint
 * Authenticates users and creates session tokens
 */

import { verifyPassword } from '../lib/password';
import { generateToken } from '../lib/jwt';
import { findUserByUsername } from '../lib/user-service';
import { checkRateLimit, recordFailedAttempt } from '../lib/rate-limiter';
import { 
  sanitizeUsername, 
  sanitizePassword, 
  isValidUsername, 
  isValidPassword as validatePasswordFormat 
} from '../lib/sanitize';
import type { Env, LoginRequest, ErrorResponse, LoginSuccessResponse } from '../types';

const SEVEN_DAYS = 7 * 24 * 60 * 60; // 7 days in seconds
const TWENTY_FOUR_HOURS = 24 * 60 * 60; // 24 hours in seconds

/**
 * Handle login request
 * @param request - HTTP request
 * @param env - Cloudflare Workers environment bindings
 * @returns HTTP response with JWT cookie or error
 */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    // Parse request body
    let body: LoginRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.error('[LOGIN] Invalid JSON in request body:', {
        error: error instanceof Error ? error.message : String(error),
        contentType: request.headers.get('content-type'),
      });
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Invalid request body',
        },
        400
      );
    }

    // Validate required fields
    const { username: rawUsername, password: rawPassword, rememberMe = false } = body;

    if (!rawUsername || !rawPassword) {
      console.error('[LOGIN] Missing required fields:', {
        hasUsername: !!rawUsername,
        hasPassword: !!rawPassword,
      });
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Username and password are required',
        },
        400
      );
    }

    // Sanitize inputs
    const username = sanitizeUsername(rawUsername);
    const password = sanitizePassword(rawPassword);

    // Validate formats
    if (!isValidUsername(username)) {
      console.error('[LOGIN] Invalid username format:', { username });
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Username must be 3-50 characters and contain only letters, numbers, and underscores',
        },
        400
      );
    }

    if (!validatePasswordFormat(password)) {
      console.error('[LOGIN] Invalid password format');
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Password must be 8-72 characters',
        },
        400
      );
    }

    // Check rate limiting (if KV configured)
    const rateLimitResult = await checkRateLimit(env.RATE_LIMIT_KV || null, username);

    if (!rateLimitResult.allowed) {
      console.warn('[LOGIN] Rate limit exceeded:', {
        username,
        retryAfter: rateLimitResult.retryAfter,
      });
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'RATE_LIMITED',
          message: 'Too many failed login attempts. Please try again in 15 minutes.',
          retryAfter: rateLimitResult.retryAfter,
        },
        429
      );
    }

    // Look up user
    const user = await findUserByUsername(env.DB, username);

    // Timing attack prevention: verify password even if user doesn't exist
    // This ensures both paths take similar time
    if (!user) {
      console.warn('[LOGIN] User not found (generic error returned):', { username });
      // Simulate bcrypt delay for non-existent users
      await verifyPassword(password, '$2a$10$invalidhashfornonexistentusersimulation');

      // Record failed attempt
      await recordFailedAttempt(env.RATE_LIMIT_KV || null, username, request.headers.get('CF-Connecting-IP') || undefined);

      // Return generic error (don't reveal if username exists)
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
        401
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      console.warn('[LOGIN] Invalid password (generic error returned):', { username });
      // Record failed attempt
      await recordFailedAttempt(env.RATE_LIMIT_KV || null, username, request.headers.get('CF-Connecting-IP') || undefined);

      // Return generic error (same as non-existent user)
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
        401
      );
    }

    // Authentication successful - generate JWT
    const token = generateToken(user.username, user.role, rememberMe, env.JWT_SECRET);

    console.log('[LOGIN] JWT_SECRET available:', !!env.JWT_SECRET);
    console.log('[LOGIN] JWT_SECRET length:', env.JWT_SECRET?.length || 0);
    console.log('[LOGIN] Token generated, length:', token.length);
    console.log('[LOGIN] Successful authentication:', {
      role: user.role,
      rememberMe,
      expiresIn: rememberMe ? '7 days' : '24 hours',
    });

    // Calculate expiry timestamp
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = rememberMe ? SEVEN_DAYS : TWENTY_FOUR_HOURS;
    const expiresAt = new Date((now + expiresIn) * 1000).toISOString();

    // Prepare success response (include token for cross-domain auth)
    const responseData: LoginSuccessResponse = {
      success: true,
      user: {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
      expiresAt,
      token, // Include token in response body for cross-domain scenarios
    };

    // Create response with JWT cookie
    const response = jsonResponse(responseData, 200);

    // Set session cookie (different settings for dev vs production)
    const isDevelopment = env.NODE_ENV === 'development';
    
    const cookieValue = isDevelopment
      ? [
          `session=${token}`,
          'HttpOnly',
          'SameSite=Lax', // Lax for local development (no Secure needed)
          `Max-Age=${expiresIn}`,
          'Path=/',
        ].join('; ')
      : [
          `session=${token}`,
          'HttpOnly',
          'Secure',
          'SameSite=None', // Allow cross-site cookies for Pages <-> Workers in production
          `Max-Age=${expiresIn}`,
          'Path=/',
        ].join('; ');

    response.headers.set('Set-Cookie', cookieValue);

    return response;
  } catch (error) {
    console.error('[LOGIN] Unexpected error in login handler:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return jsonResponse<ErrorResponse>(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      500
    );
  }
}

/**
 * Helper function to create JSON responses
 */
function jsonResponse<T>(data: T, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
