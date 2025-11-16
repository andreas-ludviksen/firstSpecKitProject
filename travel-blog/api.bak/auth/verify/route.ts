/**
 * Next.js API route proxy for session verification
 * Forwards requests to Cloudflare Workers auth service
 */

import { NextRequest, NextResponse } from 'next/server';

const AUTH_WORKER_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8787';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_SESSION',
          message: 'No session cookie found',
        },
        { status: 401 }
      );
    }

    // Forward to auth worker
    const response = await fetch(`${AUTH_WORKER_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        Cookie: `session=${sessionCookie.value}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Verify proxy error:', error);
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
