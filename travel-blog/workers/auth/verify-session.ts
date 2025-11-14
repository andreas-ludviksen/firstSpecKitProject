/**
 * GET /api/auth/verify endpoint
 * Verifies session tokens and returns user information
 */

import { verifyTokenDetailed, extractTokenFromCookie } from '../lib/jwt';
import { findUserByUsername } from '../lib/user-service';
import type { Env, ErrorResponse, VerifySessionResponse } from '../types';

/**
 * Handle session verification request
 * @param request - HTTP request
 * @param env - Cloudflare Workers environment bindings
 * @returns HTTP response with user info or error
 */
export async function handleVerify(request: Request, env: Env): Promise<Response> {
  try {
    // Extract token from cookie
    const cookieHeader = request.headers.get('Cookie');

    if (!cookieHeader) {
      console.warn('[VERIFY] No cookie header present');
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'NO_SESSION',
          message: 'No session found',
        },
        401
      );
    }

    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      console.warn('[VERIFY] No session token found in cookie');
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'NO_SESSION',
          message: 'No session found',
        },
        401
      );
    }

    // Verify JWT token
    const result = verifyTokenDetailed(token, env.JWT_SECRET);

    if (!result.valid) {
      // Check if expired or invalid
      if (result.error === 'EXPIRED') {
        console.warn('[VERIFY] Session expired:', { 
          error: result.error 
        });
        return jsonResponse<ErrorResponse>(
          {
            success: false,
            error: 'SESSION_EXPIRED',
            message: 'Session has expired',
          },
          401
        );
      }
      
      console.warn('[VERIFY] Invalid session:', { 
        error: result.error 
      });
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_SESSION',
          message: 'Invalid or expired session',
        },
        401
      );
    }

    const payload = result.payload!;

    // Look up user to get displayName
    const user = await findUserByUsername(env.DB, payload.sub);

    if (!user) {
      console.error('[VERIFY] User not found after session verification:', { 
        username: payload.sub 
      });
      // User was deleted after session creation
      return jsonResponse<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_SESSION',
          message: 'Invalid or expired session',
        },
        401
      );
    }

    console.log('[VERIFY] Session verified successfully:', {
      username: user.username,
      role: user.role,
    });

    // Prepare success response
    const responseData: VerifySessionResponse = {
      authenticated: true,
      user: {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    };

    return jsonResponse(responseData, 200);
  } catch (error) {
    console.error('[VERIFY] Unexpected error in verify handler:', {
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
}/**
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
