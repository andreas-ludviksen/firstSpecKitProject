/**
 * Blog Posts Router
 * Feature: 004-modular-blog-posts
 * 
 * Routes:
 * - POST /api/posts/create
 * - GET /api/posts/:postId
 * - GET /api/posts
 * - DELETE /api/posts/:postId
 * - PATCH /api/posts/:postId
 * - PUT /api/posts/:postId/photos/:photoId
 * - DELETE /api/posts/:postId/photos/:photoId
 * - PUT /api/posts/:postId/videos/:videoId
 * - DELETE /api/posts/:postId/videos/:videoId
 * - PUT /api/posts/:postId/text/:textId
 * - DELETE /api/posts/:postId/text/:textId
 * - POST /api/posts/:postId/reorder
 */

import { Router } from 'itty-router';
import { handleCORSPreflight, addCORSHeaders } from '../lib/cors';
import { createPost } from './create-post';
import { getPost } from './get-post';
import { getPostBySlug } from './get-post-by-slug';
import { listPosts } from './list-posts';
import { deletePost } from './delete-post';
import { updateMetadata } from './update-metadata';
import { updatePhoto } from './update-photo';
import { deletePhoto } from './delete-photo';
import { updateVideo } from './update-video';
import { deleteVideo } from './delete-video';
import { updateText } from './update-text';
import { deleteText } from './delete-text';
import { reorderContent } from './reorder';
import { errorResponse, handleError } from '../lib/errors';

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  JWT_SECRET: string;
}

const router = Router();

// Health check endpoint
router.get('/api/posts/health', () => {
  return new Response(JSON.stringify({ status: 'ok', service: 'posts' }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Create new blog post
router.post('/api/posts/create', createPost);

// List blog posts
router.get('/api/posts', listPosts);

// Get single blog post by slug
router.get('/api/posts/slug/:slug', getPostBySlug);

// Get single blog post by ID
router.get('/api/posts/:postId', getPost);

// Update post metadata
router.patch('/api/posts/:postId', updateMetadata);

// Delete blog post
router.delete('/api/posts/:postId', deletePost);

// Reorder content
router.post('/api/posts/:postId/reorder', reorderContent);

// Photo content management
router.put('/api/posts/:postId/photos/:photoId', updatePhoto);
router.delete('/api/posts/:postId/photos/:photoId', deletePhoto);

// Video content management
router.put('/api/posts/:postId/videos/:videoId', updateVideo);
router.delete('/api/posts/:postId/videos/:videoId', deleteVideo);

// Text content management
router.put('/api/posts/:postId/text/:textId', updateText);
router.delete('/api/posts/:postId/text/:textId', deleteText);

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
      console.error('Posts worker error:', error);
      const errorResp = handleError(error);
      return addCORSHeaders(errorResp, request);
    }
  },
};
