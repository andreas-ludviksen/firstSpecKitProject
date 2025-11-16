/**
 * Delete Text Content Endpoint
 * Feature: 004-modular-blog-posts
 * DELETE /api/posts/:postId/text/:textId
 * 
 * Deletes a text block from a blog post
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

export const deleteText = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId, textId } = params;

    if (!postId || !textId) {
      throw new NotFoundError('Text block not found');
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
      throw new UnauthorizedError('You do not have permission to delete this text block');
    }

    // Check text exists and belongs to post
    const text = await db.queryOne(
      'SELECT id FROM text_content WHERE id = ? AND post_id = ?',
      [textId, postId]
    );

    if (!text) {
      throw new NotFoundError('Text block not found');
    }

    // Delete text
    await db.execute(
      'DELETE FROM text_content WHERE id = ?',
      [textId]
    );

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Return response
    return successResponse({
      message: 'Text block deleted successfully',
      textId,
    });

  } catch (error) {
    console.error('Delete text error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new ServerError('Failed to delete text block');
  }
});
