/**
 * Next.js API route proxy for auth logout
 * Forwards requests to Cloudflare Workers auth service
 */

import { NextRequest, NextResponse } from 'next/server';

const AUTH_WORKER_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8787';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    // Forward to auth worker
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${AUTH_WORKER_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
    });

    const data = await response.json();

    // Create Next.js response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie header from auth worker (should clear the cookie)
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) {
      nextResponse.headers.set('Set-Cookie', setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'PROXY_ERROR',
        message: 'Failed to communicate with auth service',
      },
      { status: 500 }
    );
  }
}
