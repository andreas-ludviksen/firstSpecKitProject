/**
 * Update Photo Content Endpoint
 * Feature: 004-modular-blog-posts
 * PUT /api/posts/:postId/photos/:photoId
 * 
 * Updates photo caption, alt text, and display order
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

interface UpdatePhotoRequest {
  caption?: string;
  altText?: string;
  displayOrder?: number;
}

export const updatePhoto = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId, photoId } = params;

    if (!postId || !photoId) {
      throw new NotFoundError('Photo not found');
    }

    const body = await parseJsonBody<UpdatePhotoRequest>(request);

    // Validate at least one field is being updated
    if (body.caption === undefined && body.altText === undefined && body.displayOrder === undefined) {
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

    // Check photo exists and belongs to post
    const photo = await db.queryOne(
      'SELECT id FROM photo_content WHERE id = ? AND post_id = ?',
      [photoId, postId]
    );

    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    // Build update query
    const updates: string[] = [];
    const updateParams: any[] = [];

    if (body.caption !== undefined) {
      updates.push('caption = ?');
      updateParams.push(body.caption || null);
    }

    if (body.altText !== undefined) {
      if (body.altText.trim().length === 0) {
        throw new ValidationError('altText cannot be empty (required for accessibility)');
      }
      updates.push('alt_text = ?');
      updateParams.push(body.altText);
    }

    if (body.displayOrder !== undefined) {
      if (typeof body.displayOrder !== 'number' || body.displayOrder < 0) {
        throw new ValidationError('displayOrder must be a non-negative number');
      }
      updates.push('display_order = ?');
      updateParams.push(body.displayOrder);
    }

    // Execute update
    updateParams.push(photoId);
    await db.execute(
      `UPDATE photo_content SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Fetch updated photo
    const updatedPhoto = await db.queryOne(
      `SELECT 
        id, post_id, url, cloudflare_image_id, caption, alt_text,
        display_order, source, width, height, uploaded_at
      FROM photo_content
      WHERE id = ?`,
      [photoId]
    );

    // Return response
    return successResponse({
      photo: {
        id: updatedPhoto.id,
        postId: updatedPhoto.post_id,
        url: updatedPhoto.url,
        cloudflareImageId: updatedPhoto.cloudflare_image_id,
        caption: updatedPhoto.caption,
        altText: updatedPhoto.alt_text,
        displayOrder: updatedPhoto.display_order,
        source: updatedPhoto.source,
        width: updatedPhoto.width,
        height: updatedPhoto.height,
        uploadedAt: updatedPhoto.uploaded_at,
      },
    });

  } catch (error) {
    console.error('Update photo error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError || 
        error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to update photo');
  }
});
