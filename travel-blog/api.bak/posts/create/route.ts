/**
 * Next.js API route proxy for creating posts
 * Forwards requests to Cloudflare Workers posts service
 */

import { NextRequest, NextResponse } from 'next/server';

const POSTS_WORKER_URL = process.env.NEXT_PUBLIC_POSTS_API_URL || 'http://localhost:8789';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    console.log('[Posts Proxy] Session cookie:', sessionCookie ? 'present' : 'missing');
    if (sessionCookie) {
      console.log('[Posts Proxy] Cookie value length:', sessionCookie.value.length);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    // Forward to posts worker
    const response = await fetch(`${POSTS_WORKER_URL}/api/posts/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('[Posts Proxy] Response status:', response.status);
    console.log('[Posts Proxy] Response data:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Posts create proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'PROXY_ERROR',
        message: 'Failed to communicate with posts service',
      },
      { status: 500 }
    );
  }
}
