/**
 * Next.js API route proxy for post operations
 * Forwards GET, PATCH, DELETE requests to Cloudflare Workers posts service
 */

import { NextRequest, NextResponse } from 'next/server';

const POSTS_WORKER_URL = process.env.NEXT_PUBLIC_POSTS_API_URL || 'http://localhost:8789';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    const headers: HeadersInit = {};

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${POSTS_WORKER_URL}/api/posts/${postId}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Posts GET proxy error:', error);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const body = await request.json();
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${POSTS_WORKER_URL}/api/posts/${postId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Posts PATCH proxy error:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    const headers: HeadersInit = {};

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${POSTS_WORKER_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Posts DELETE proxy error:', error);
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
