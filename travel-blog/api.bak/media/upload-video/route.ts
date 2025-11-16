/**
 * Next.js API route proxy for video uploads
 * Forwards requests to Cloudflare Workers media service
 */

import { NextRequest, NextResponse } from 'next/server';

const MEDIA_WORKER_URL = process.env.NEXT_PUBLIC_MEDIA_API_URL || 'http://localhost:8788';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');

    // Get the FormData from the request
    const formData = await request.formData();

    // Forward to media worker
    const headers: HeadersInit = {};

    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`;
    }

    const response = await fetch(`${MEDIA_WORKER_URL}/api/media/upload-video`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Video upload proxy error:', error);
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
