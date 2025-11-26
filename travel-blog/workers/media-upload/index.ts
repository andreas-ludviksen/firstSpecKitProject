/**
 * Media Upload Router
 * Feature: 004-modular-blog-posts
 * 
 * Routes:
 * - POST /api/media/upload-photo
 * - POST /api/media/upload-video-stream
 * - GET /api/media/video/:videoId/:filename (legacy R2 videos)
 * - POST /api/media/validate-url
 */

import { Router } from 'itty-router';
import { handleCORSPreflight, addCORSHeaders } from '../lib/cors';
import { uploadPhoto } from './upload-photo';
import { uploadVideoStream } from './upload-video-stream';
import { getVideo } from './get-video';
import { validateUrl } from './validate-url';
import { errorResponse, handleError } from '../lib/errors';

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_ACCOUNT_HASH: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  CLOUDFLARE_STREAM_API_TOKEN: string;
  JWT_SECRET: string;
}

const router = Router();

// Health check endpoint
router.get('/api/media/health', () => {
  return new Response(JSON.stringify({ status: 'ok', service: 'media-upload' }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Upload photo to Cloudflare Images
router.post('/api/media/upload-photo', uploadPhoto);

// Upload video to Cloudflare Stream (auto-encoding for iOS compatibility)
router.post('/api/media/upload-video-stream', uploadVideoStream);

// Get video from R2 (legacy videos only - new videos use Stream HLS URLs)
router.get('/api/media/video/:videoId/:filename', getVideo);

// Handle HEAD requests for video (Safari requirement)
router.head('/api/media/video/:videoId/:filename', getVideo);

// Validate external media URL
router.post('/api/media/validate-url', validateUrl);

// Handle OPTIONS preflight requests for CORS
router.options('*', (request) => handleCORSPreflight(request));

// 404 handler
router.all('*', () => errorResponse('Not Found', 'The requested resource was not found', 404));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const response = await router.fetch(request, env, ctx);
      return addCORSHeaders(response || new Response('Not Found', { status: 404 }), request);
    } catch (error) {
      console.error('Media worker error:', error);
      const errorResp = handleError(error);
      return addCORSHeaders(errorResp, request);
    }
  },
};
