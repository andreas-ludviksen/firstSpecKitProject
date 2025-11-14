/**
 * POST /api/auth/logout endpoint
 * Clears session cookies
 */

import type { LogoutResponse } from '../types';

/**
 * Handle logout request
 * @returns HTTP response clearing session cookie
 */
export async function handleLogout(): Promise<Response> {
  try {
    console.log('[LOGOUT] Processing logout request');

    // Prepare success response
    const responseData: LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    // Create response
    const response = new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear session cookie by setting Max-Age=0
    // Path=/ ensures it clears the cookie for the entire domain
    // SameSite=None to match the login cookie setting (cross-site cookies)
    const cookieValue = [
      'session=',
      'HttpOnly',
      'Secure',
      'SameSite=None',
      'Max-Age=0',
      'Path=/',
    ].join('; ');

    response.headers.set('Set-Cookie', cookieValue);

    return response;
  } catch (error) {
    // Fail open - always succeed for better UX
    // Even if something goes wrong, we can return success
    // The worst case is the cookie isn't cleared properly
    console.error('[LOGOUT] Unexpected error in logout handler:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const responseData: LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    const response = new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Try to clear cookie even on error
    const cookieValue = [
      'session=',
      'HttpOnly',
      'Secure',
      'SameSite=None',
      'Max-Age=0',
      'Path=/',
    ].join('; ');

    response.headers.set('Set-Cookie', cookieValue);

    return response;
  }
}
