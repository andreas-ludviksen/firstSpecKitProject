/**
 * Validate URL Endpoint
 * Feature: 004-modular-blog-posts
 * POST /api/media/validate-url
 * 
 * Validates external media URLs (YouTube, Vimeo, images, videos)
 */

import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  ValidationError, 
  ServerError,
  successResponse,
  parseJsonBody 
} from '../lib/errors';

interface Env {
  JWT_SECRET: string;
}

interface ValidateUrlRequest {
  url: string;
  type?: 'photo' | 'video';
}

interface ValidateUrlResponse {
  valid: boolean;
  type: 'photo' | 'video' | 'youtube' | 'vimeo' | 'unknown';
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
];

// Vimeo URL patterns
const VIMEO_PATTERNS = [
  /^https?:\/\/(www\.)?vimeo\.com\/(\d+)/,
  /^https?:\/\/player\.vimeo\.com\/video\/(\d+)/,
];

// Image URL patterns
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|heic|bmp)(\?.*)?$/i;

// Video URL patterns
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i;

export const validateUrl = withAuth(async (request: Request, user, env: Env) => {
  try {
    const body = await parseJsonBody<ValidateUrlRequest>(request);

    if (!body.url) {
      throw new ValidationError('url is required');
    }

    let url: URL;
    try {
      url = new URL(body.url);
    } catch {
      return successResponse({
        valid: false,
        type: 'unknown',
        url: body.url,
        error: 'Invalid URL format',
      });
    }

    // Check for YouTube
    for (const pattern of YOUTUBE_PATTERNS) {
      const match = body.url.match(pattern);
      if (match) {
        const videoId = match[2];
        return successResponse({
          valid: true,
          type: 'youtube',
          url: body.url,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        });
      }
    }

    // Check for Vimeo
    for (const pattern of VIMEO_PATTERNS) {
      const match = body.url.match(pattern);
      if (match) {
        const videoId = match[2];
        return successResponse({
          valid: true,
          type: 'vimeo',
          url: body.url,
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
        });
      }
    }

    // Check for image URLs
    if (IMAGE_EXTENSIONS.test(url.pathname)) {
      // Optionally: HEAD request to verify the URL is accessible
      try {
        const headResponse = await fetch(body.url, { method: 'HEAD' });
        if (headResponse.ok) {
          return successResponse({
            valid: true,
            type: 'photo',
            url: body.url,
          });
        }
      } catch {
        return successResponse({
          valid: false,
          type: 'photo',
          url: body.url,
          error: 'URL is not accessible',
        });
      }
    }

    // Check for video URLs
    if (VIDEO_EXTENSIONS.test(url.pathname)) {
      try {
        const headResponse = await fetch(body.url, { method: 'HEAD' });
        if (headResponse.ok) {
          return successResponse({
            valid: true,
            type: 'video',
            url: body.url,
          });
        }
      } catch {
        return successResponse({
          valid: false,
          type: 'video',
          url: body.url,
          error: 'URL is not accessible',
        });
      }
    }

    // Unknown type
    return successResponse({
      valid: false,
      type: 'unknown',
      url: body.url,
      error: 'Unsupported URL type',
    });

  } catch (error) {
    console.error('URL validation error:', error);
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to validate URL');
  }
});
