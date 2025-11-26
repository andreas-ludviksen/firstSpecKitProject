/**
 * Get Video Endpoint
 * GET /api/media/video/:videoId/:filename
 * 
 * Serves video files from Cloudflare R2
 */

import { createR2Client } from '../lib/cloudflare-r2';
import { NotFoundError } from '../lib/errors';

interface Env {
  MEDIA_BUCKET: R2Bucket;
}

export async function getVideo(request: Request, env: Env, params: any): Promise<Response> {
  try {
    // Handle OPTIONS for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Extract params from URL
    const routeParams = (request as any).params || params;
    const { videoId, filename } = routeParams;

    if (!videoId || !filename) {
      throw new NotFoundError('Video not found');
    }

    // Construct R2 key
    const objectKey = `videos/${videoId}/${filename}`;
    
    console.log(`[GET VIDEO] Looking for object: ${objectKey}`);
    console.log(`[GET VIDEO] VideoId: ${videoId}, Filename: ${filename}`);

    // Handle HEAD requests - Safari sends these before GET
    if (request.method === 'HEAD') {
      console.log(`[GET VIDEO] HEAD request for: ${objectKey}`);
      const object = await env.MEDIA_BUCKET.head(objectKey);
      if (!object) {
        console.log(`[GET VIDEO] HEAD - Object not found: ${objectKey}`);
        throw new NotFoundError('Video not found in storage');
      }
      
      console.log(`[GET VIDEO] HEAD - Object found, size: ${object.size}`);
      const headers = new Headers();
      headers.set('Content-Type', 'video/mp4');
      headers.set('Content-Length', object.size.toString());
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Range');
      headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
      
      return new Response(null, { status: 200, headers });
    }
    
    // Get video from R2
    console.log(`[GET VIDEO] GET request for: ${objectKey}`);
    const r2Client = createR2Client(env.MEDIA_BUCKET);
    const object = await r2Client.get(objectKey);

    if (!object) {
      console.log(`[GET VIDEO] GET - Object not found: ${objectKey}`);
      throw new NotFoundError('Video not found in storage');
    }
    
    console.log(`[GET VIDEO] GET - Object found, size: ${object.size}`);

    // Return video with appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Length', object.size.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    
    // Support range requests for video streaming
    const range = request.headers.get('range');
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const endPart = parts[1];
      const end = endPart ? parseInt(endPart, 10) : object.size - 1;
      const chunkSize = end - start + 1;

      headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
      headers.set('Content-Length', chunkSize.toString());

      // Return partial content
      return new Response(object.body, {
        status: 206,
        headers,
      });
    }

    // Return full video
    return new Response(object.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Get video error:', error);
    
    if (error instanceof NotFoundError) {
      return new Response('Video not found', { status: 404 });
    }
    
    return new Response('Failed to retrieve video', { status: 500 });
  }
}
