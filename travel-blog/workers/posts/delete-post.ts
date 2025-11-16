/**
 * Delete Blog Post Endpoint
 * Feature: 004-modular-blog-posts
 * DELETE /api/posts/:postId
 * 
 * Deletes a blog post and all its content
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
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  JWT_SECRET: string;
}

export const deletePost = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId } = params;

    if (!postId) {
      throw new NotFoundError('Post not found');
    }

    const db = createDatabaseClient(env.DB);

    // Get post to check ownership
    const post = await db.queryOne(
      'SELECT id, author_id FROM blog_posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if user is the author (or admin in the future)
    if (post.author_id !== user.sub) {
      throw new UnauthorizedError('You do not have permission to delete this post');
    }

    // Get video content to delete from R2
    const videos = await db.query(
      'SELECT r2_object_key FROM video_content WHERE post_id = ?',
      [postId]
    );

    // Get photo content to delete from Cloudflare Images
    // Note: We're NOT deleting from Cloudflare Images here because they may be reused
    // In a production system, you'd want to track usage and delete unused images

    // Delete all content (cascade through foreign keys)
    await db.batch([
      { query: 'DELETE FROM photo_content WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM video_content WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM text_content WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM post_template_history WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM blog_posts WHERE id = ?', params: [postId] },
    ]);

    // Delete videos from R2 (best effort)
    if (videos.length > 0) {
      const r2Client = createR2Client(env.MEDIA_BUCKET);
      for (const video of videos) {
        try {
          await r2Client.delete(video.r2_object_key);
        } catch (error) {
          console.error(`Failed to delete video from R2: ${video.r2_object_key}`, error);
          // Continue deleting other videos even if one fails
        }
      }
    }

    // Return response
    return successResponse({
      message: 'Post deleted successfully',
      postId,
    });

  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new ServerError('Failed to delete blog post');
  }
});
