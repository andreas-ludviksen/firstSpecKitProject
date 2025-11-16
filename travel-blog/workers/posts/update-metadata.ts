/**
 * Update Post Metadata Endpoint
 * Feature: 004-modular-blog-posts
 * PATCH /api/posts/:postId
 * 
 * Updates blog post title, description, cover image, and status
 */

import { createDatabaseClient } from '../lib/db';
import { generateSlug, generateUniqueSlug, isValidSlug } from '../lib/slug';
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

interface UpdateMetadataRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  status?: 'draft' | 'published';
  slug?: string;
}

export const updateMetadata = withAuth(async (request: Request, user, env: Env, ctx: any) => {
  try {
    console.log('[UPDATE METADATA] ctx:', ctx);
    console.log('[UPDATE METADATA] request:', request);
    console.log('[UPDATE METADATA] request params:', (request as any).params);
    
    // In itty-router v5, params are on the request object
    const postId = (request as any).params?.postId || ctx?.postId;

    console.log('[UPDATE METADATA] postId:', postId);

    if (!postId) {
      throw new NotFoundError('Post not found');
    }

    const body = await parseJsonBody<UpdateMetadataRequest>(request);

    // Validate at least one field is being updated
    if (!body.title && !body.status && !body.slug) {
      throw new ValidationError('No fields to update');
    }

    const db = createDatabaseClient(env.DB);

    // Get post to check ownership
    const post = await db.queryOne(
      'SELECT id, author_id, slug, status FROM blog_posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if user is the author
    if (post.author_id !== user.sub) {
      throw new UnauthorizedError('You do not have permission to update this post');
    }

    // Build update query dynamically
    const updates: string[] = [];
    const updateParams: any[] = [];

    if (body.title !== undefined) {
      if (body.title.trim().length === 0) {
        throw new ValidationError('title cannot be empty');
      }
      updates.push('title = ?');
      updateParams.push(body.title);
    }

    if (body.status !== undefined) {
      if (!['draft', 'published'].includes(body.status)) {
        throw new ValidationError('status must be either "draft" or "published"');
      }
      updates.push('status = ?');
      updateParams.push(body.status);
      
      // Set published_at when transitioning to published
      if (body.status === 'published' && post.status !== 'published') {
        updates.push('published_at = ?');
        updateParams.push(new Date().toISOString());
      }
    }

    if (body.slug !== undefined) {
      if (!isValidSlug(body.slug)) {
        throw new ValidationError('Invalid slug format');
      }
      // Check if slug is different and available
      if (body.slug !== post.slug) {
        const existing = await db.exists('blog_posts', 'slug', body.slug);
        if (existing) {
          throw new ValidationError('Slug already in use');
        }
      }
      updates.push('slug = ?');
      updateParams.push(body.slug);
    }

    // Add updated_at timestamp
    updates.push('updated_at = ?');
    updateParams.push(new Date().toISOString());

    // Execute update
    updateParams.push(postId);
    await db.execute(
      `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Fetch updated post
    const updatedPost = await db.queryOne(
      `SELECT 
        id, slug, title, design_template_id as template_id,
        author_id, status, published_at, created_at, updated_at
      FROM blog_posts
      WHERE id = ?`,
      [postId]
    );

    // Return response
    return successResponse({
      post: {
        id: updatedPost.id,
        slug: updatedPost.slug,
        title: updatedPost.title,
        templateId: updatedPost.template_id,
        authorId: updatedPost.author_id,
        status: updatedPost.status,
        publishedAt: updatedPost.published_at,
        createdAt: updatedPost.created_at,
        updatedAt: updatedPost.updated_at,
      },
    });

  } catch (error) {
    console.error('Update metadata error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError || 
        error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to update blog post metadata');
  }
});
