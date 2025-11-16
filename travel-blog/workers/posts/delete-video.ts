/**
 * Delete Video Content Endpoint
 * Feature: 004-modular-blog-posts
 * DELETE /api/posts/:postId/videos/:videoId
 * 
 * Deletes a video from a blog post and R2 storage
 */

import { createDatabaseClient } from '../lib/db';
import { createR2Client } from '../lib/cloudflare-r2';
import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  NotFoundError,
  UnauthorizedError,
  ServerError,
  successResponse 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  JWT_SECRET: string;
}

export const deleteVideo = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId, videoId } = params;

    if (!postId || !videoId) {
      throw new NotFoundError('Video not found');
    }

    const db = createDatabaseClient(env.DB);

    // Check post ownership
    const post = await db.queryOne(
      'SELECT author_id FROM blog_posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.author_id !== user.sub) {
      throw new UnauthorizedError('You do not have permission to delete this video');
    }

    // Get video info to delete from R2
    const video = await db.queryOne(
      'SELECT id, r2_object_key FROM video_content WHERE id = ? AND post_id = ?',
      [videoId, postId]
    );

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Delete video from database
    await db.execute(
      'DELETE FROM video_content WHERE id = ?',
      [videoId]
    );

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Delete from R2 (best effort)
    try {
      const r2Client = createR2Client(env.MEDIA_BUCKET);
      await r2Client.delete(video.r2_object_key);
    } catch (error) {
      console.error(`Failed to delete video from R2: ${video.r2_object_key}`, error);
      // Continue - video is already removed from database
    }

    // Return response
    return successResponse({
      message: 'Video deleted successfully',
      videoId,
    });

  } catch (error) {
    console.error('Delete video error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new ServerError('Failed to delete video');
  }
});
