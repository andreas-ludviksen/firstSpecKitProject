/**
 * Update Video Content Endpoint
 * Feature: 004-modular-blog-posts
 * PUT /api/posts/:postId/videos/:videoId
 * 
 * Updates video caption, thumbnail, and display order
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

interface UpdateVideoRequest {
  caption?: string;
  displayOrder?: number;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export const updateVideo = withAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId, videoId } = params;

    if (!postId || !videoId) {
      throw new NotFoundError('Video not found');
    }

    const body = await parseJsonBody<UpdateVideoRequest>(request);

    // Validate at least one field is being updated
    if (body.caption === undefined && body.displayOrder === undefined && 
        body.thumbnailUrl === undefined && body.durationSeconds === undefined) {
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

    // Check video exists and belongs to post
    const video = await db.queryOne(
      'SELECT id FROM video_content WHERE id = ? AND post_id = ?',
      [videoId, postId]
    );

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Build update query
    const updates: string[] = [];
    const updateParams: any[] = [];

    if (body.caption !== undefined) {
      updates.push('caption = ?');
      updateParams.push(body.caption || null);
    }

    if (body.displayOrder !== undefined) {
      if (typeof body.displayOrder !== 'number' || body.displayOrder < 0) {
        throw new ValidationError('displayOrder must be a non-negative number');
      }
      updates.push('display_order = ?');
      updateParams.push(body.displayOrder);
    }

    if (body.thumbnailUrl !== undefined) {
      updates.push('thumbnail_url = ?');
      updateParams.push(body.thumbnailUrl || null);
    }

    if (body.durationSeconds !== undefined) {
      if (typeof body.durationSeconds !== 'number' || body.durationSeconds < 0) {
        throw new ValidationError('durationSeconds must be a non-negative number');
      }
      updates.push('duration_seconds = ?');
      updateParams.push(body.durationSeconds);
    }

    // Execute update
    updateParams.push(videoId);
    await db.execute(
      `UPDATE video_content SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Update post's updated_at
    await db.execute(
      'UPDATE blog_posts SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), postId]
    );

    // Fetch updated video
    const updatedVideo = await db.queryOne(
      `SELECT 
        id, post_id, url, r2_key, caption, display_order,
        source, thumbnail_url, duration_seconds, uploaded_at
      FROM video_content
      WHERE id = ?`,
      [videoId]
    );

    // Return response
    return successResponse({
      video: {
        id: updatedVideo.id,
        postId: updatedVideo.post_id,
        url: updatedVideo.url,
        r2Key: updatedVideo.r2_key,
        caption: updatedVideo.caption,
        displayOrder: updatedVideo.display_order,
        source: updatedVideo.source,
        thumbnailUrl: updatedVideo.thumbnail_url,
        durationSeconds: updatedVideo.duration_seconds,
        uploadedAt: updatedVideo.uploaded_at,
      },
    });

  } catch (error) {
    console.error('Update video error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError || 
        error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to update video');
  }
});
