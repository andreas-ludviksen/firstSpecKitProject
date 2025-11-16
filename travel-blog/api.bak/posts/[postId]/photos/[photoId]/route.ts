/**
 * Next.js API route proxy for photo operations
 * Forwards PUT and DELETE requests to Cloudflare Workers media service
 */

import { NextRequest, NextResponse } from 'next/server';

const MEDIA_WORKER_URL = process.env.NEXT_PUBLIC_MEDIA_API_URL || 'http://localhost:8788';

export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string; photoId: string } }
) {
  try {
    const { postId, photoId } = params;
    const body = await request.json();
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${MEDIA_WORKER_URL}/api/posts/${postId}/photos/${photoId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Photo update proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'PROXY_ERROR',
        message: 'Failed to communicate with media service',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string; photoId: string } }
) {
  try {
    const { postId, photoId } = params;
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    const headers: HeadersInit = {};

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${MEDIA_WORKER_URL}/api/posts/${postId}/photos/${photoId}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Photo delete proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'PROXY_ERROR',
        message: 'Failed to communicate with media service',
      },
      { status: 500 }
    );
  }
}
