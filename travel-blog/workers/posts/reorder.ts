/**
 * Reorder Content Endpoint
 * Feature: 004-modular-blog-posts
 * POST /api/posts/:postId/reorder
 * 
 * Reorders photos, videos, and text blocks within a post
 */

import { createDatabaseClient } from '../lib/db';
import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  NotFoundError,
  UnauthorizedError,
  ValidationError, 
  ServerError,
  successResponse,
  parseJsonBody 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface ReorderRequest {
  contentType: 'photo' | 'video' | 'text';
  contentIds: string[];
}

export const reorderContent = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId } = params;

    if (!postId) {
      throw new NotFoundError('Post not found');
    }

    const body = await parseJsonBody<ReorderRequest>(request);

    // Validate required fields
    if (!body.contentType || !['photo', 'video', 'text'].includes(body.contentType)) {
      throw new ValidationError('contentType must be "photo", "video", or "text"');
    }
    if (!Array.isArray(body.contentIds) || body.contentIds.length === 0) {
      throw new ValidationError('contentIds must be a non-empty array');
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
      throw new UnauthorizedError('You do not have permission to reorder this post content');
    }

    // Determine table name
    const tableName = body.contentType === 'photo' 
      ? 'photo_content' 
      : body.contentType === 'video' 
        ? 'video_content' 
        : 'text_content';

    // Verify all content IDs belong to this post
    const existingContent = await db.query(
      `SELECT id FROM ${tableName} WHERE post_id = ?`,
      [postId]
    );

    const existingIds = existingContent.map((c: any) => c.id);
    const missingIds = body.contentIds.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new ValidationError(`Content IDs not found: ${missingIds.join(', ')}`);
    }

    // Update display order for each content item
    const updateQueries = body.contentIds.map((id, index) => ({
      query: `UPDATE ${tableName} SET display_order = ? WHERE id = ?`,
      params: [index, id],
    }));

    await db.batch(updateQueries);

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Return response
    return successResponse({
      message: 'Content reordered successfully',
      contentType: body.contentType,
      contentIds: body.contentIds,
    });

  } catch (error) {
    console.error('Reorder content error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError || 
        error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to reorder content');
  }
});
