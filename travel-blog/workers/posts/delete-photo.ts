/**
 * Delete Photo Content Endpoint
 * Feature: 004-modular-blog-posts
 * DELETE /api/posts/:postId/photos/:photoId
 * 
 * Deletes a photo from a blog post
 */

import { createDatabaseClient } from '../lib/db';
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
  JWT_SECRET: string;
}

export const deletePhoto = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId, photoId } = params;

    if (!postId || !photoId) {
      throw new NotFoundError('Photo not found');
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
      throw new UnauthorizedError('You do not have permission to delete this photo');
    }

    // Check photo exists and belongs to post
    const photo = await db.queryOne(
      'SELECT id FROM photo_content WHERE id = ? AND post_id = ?',
      [photoId, postId]
    );

    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    // Delete photo
    await db.execute(
      'DELETE FROM photo_content WHERE id = ?',
      [photoId]
    );

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Note: We're not deleting from Cloudflare Images since images may be reused

    // Return response
    return successResponse({
      message: 'Photo deleted successfully',
      photoId,
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new ServerError('Failed to delete photo');
  }
});
