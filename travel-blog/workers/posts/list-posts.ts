/**
 * List Blog Posts Endpoint
 * Feature: 004-modular-blog-posts
 * GET /api/posts
 * 
 * Lists blog posts with pagination and filtering
 */

import { createDatabaseClient } from '../lib/db';
import { withOptionalAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  ValidationError,
  ServerError,
  successResponse 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface ListPostsQuery {
  status?: 'draft' | 'published';
  authorId?: string;
  limit?: number;
  offset?: number;
}

interface ListPostsResponse {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    templateId: string;
    templateName: string;
    authorId: string;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    photoCount: number;
    videoCount: number;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const listPosts = withOptionalAuth(async (request: Request, user, env: Env) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'draft' | 'published' | null;
    const authorId = url.searchParams.get('authorId');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Validate parameters
    if (status && !['draft', 'published'].includes(status)) {
      throw new ValidationError('status must be either "draft" or "published"');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new ValidationError('offset must be non-negative');
    }

    const db = createDatabaseClient(env.DB);

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    // Only show published posts to non-authenticated users
    // or posts not belonging to the current user
    if (!user) {
      conditions.push('p.status = ?');
      params.push('published');
    } else if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    } else {
      // Authenticated users see their drafts + all published
      conditions.push('(p.status = ? OR p.author_id = ?)');
      params.push('published', user.sub);
    }

    if (authorId) {
      conditions.push('p.author_id = ?');
      params.push(authorId);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    // Get total count
    const countResult = await db.queryOne(
      `SELECT COUNT(*) as total
      FROM blog_posts p
      ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    // Get posts with content counts
    const posts = await db.query(
      `SELECT 
        p.id, p.slug, p.title, p.description, p.cover_image,
        p.template_id, t.name as template_name,
        p.author_id, p.status, p.published_at, p.created_at, p.updated_at,
        (SELECT COUNT(*) FROM photo_content WHERE post_id = p.id) as photo_count,
        (SELECT COUNT(*) FROM video_content WHERE post_id = p.id) as video_count
      FROM blog_posts p
      JOIN design_templates t ON p.template_id = t.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Return response
    return successResponse({
      posts: posts.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        coverImage: p.cover_image,
        templateId: p.template_id,
        templateName: p.template_name,
        authorId: p.author_id,
        status: p.status,
        publishedAt: p.published_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        photoCount: p.photo_count,
        videoCount: p.video_count,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('List posts error:', error);
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to list blog posts');
  }
});
