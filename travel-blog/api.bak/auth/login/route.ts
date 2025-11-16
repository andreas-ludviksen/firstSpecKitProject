/**
 * Next.js API route proxy for auth login
 * Forwards requests to Cloudflare Workers auth service
 */

import { NextRequest, NextResponse } from 'next/server';

const AUTH_WORKER_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8787';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Auth Login Proxy] Forwarding login request to auth worker');
    console.log('[Auth Login Proxy] Target URL:', `${AUTH_WORKER_URL}/api/auth/login`);

    // Forward to auth worker
    const response = await fetch(`${AUTH_WORKER_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[Auth Login Proxy] Received response from auth worker');
    const data = await response.json();
    
    console.log('[Auth Login Proxy] Response status:', response.status);
    console.log('[Auth Login Proxy] Response success:', data.success);

    // Create Next.js response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie header from auth worker
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) {
      console.log('[Auth Login Proxy] Setting cookie from auth worker');
      nextResponse.headers.set('Set-Cookie', setCookie);
    } else {
      console.log('[Auth Login Proxy] WARNING: No Set-Cookie header from auth worker');
    }

    return nextResponse;
  } catch (error) {
    console.error('Auth proxy error:', error);
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
