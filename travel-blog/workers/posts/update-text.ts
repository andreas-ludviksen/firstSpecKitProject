/**
 * Update Text Content Endpoint
 * Feature: 004-modular-blog-posts
 * PUT /api/posts/:postId/text/:textId
 * 
 * Updates text block content and display order
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

interface UpdateTextRequest {
  content?: string;
  displayOrder?: number;
}

export const updateText = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId, textId } = params;

    if (!postId || !textId) {
      throw new NotFoundError('Text block not found');
    }

    const body = await parseJsonBody<UpdateTextRequest>(request);

    // Validate at least one field is being updated
    if (body.content === undefined && body.displayOrder === undefined) {
      throw new ValidationError('No fields to update');
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
      throw new UnauthorizedError('You do not have permission to update this post');
    }

    // Check text exists and belongs to post
    const text = await db.queryOne(
      'SELECT id FROM text_content WHERE id = ? AND post_id = ?',
      [textId, postId]
    );

    if (!text) {
      throw new NotFoundError('Text block not found');
    }

    // Build update query
    const updates: string[] = [];
    const updateParams: any[] = [];

    if (body.content !== undefined) {
      if (body.content.trim().length === 0) {
        throw new ValidationError('content cannot be empty');
      }
      updates.push('content = ?');
      updateParams.push(body.content);
    }

    if (body.displayOrder !== undefined) {
      if (typeof body.displayOrder !== 'number' || body.displayOrder < 0) {
        throw new ValidationError('displayOrder must be a non-negative number');
      }
      updates.push('display_order = ?');
      updateParams.push(body.displayOrder);
    }

    // Execute update
    updateParams.push(textId);
    await db.execute(
      `UPDATE text_content SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Fetch updated text
    const updatedText = await db.queryOne(
      'SELECT id, post_id, content, display_order FROM text_content WHERE id = ?',
      [textId]
    );

    // Return response
    return successResponse({
      text: {
        id: updatedText.id,
        postId: updatedText.post_id,
        content: updatedText.content,
        displayOrder: updatedText.display_order,
      },
    });

  } catch (error) {
    console.error('Update text error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError || 
        error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to update text block');
  }
});
