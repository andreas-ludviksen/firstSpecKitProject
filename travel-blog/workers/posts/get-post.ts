/**
 * Get Blog Post Endpoint
 * Feature: 004-modular-blog-posts
 * GET /api/posts/:postId
 * 
 * Retrieves a single blog post with all its content
 */

import { createDatabaseClient } from '../lib/db';
import { withOptionalAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  NotFoundError, 
  ServerError,
  successResponse 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface GetPostResponse {
  post: {
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
  };
  content: {
    photos: Array<{
      id: string;
      url: string;
      cloudflareImageId: string;
      caption: string | null;
      altText: string;
      displayOrder: number;
      width: number | null;
      height: number | null;
    }>;
    videos: Array<{
      id: string;
      url: string;
      r2ObjectKey: string;
      caption: string | null;
      displayOrder: number;
      thumbnailUrl: string | null;
      durationSeconds: number | null;
    }>;
    textBlocks: Array<{
      id: string;
      content: string;
      displayOrder: number;
    }>;
  };
}

export const getPost = withOptionalAuth(async (request: Request, user, env: Env, params: any) => {
  try {
    const { postId } = params;

    if (!postId) {
      throw new NotFoundError('Post not found');
    }

    const db = createDatabaseClient(env.DB);

    // Get post with template info
    const post = await db.queryOne(
      `SELECT 
        p.id, p.slug, p.title, p.description, p.cover_image,
        p.design_template_id as template_id, t.name as template_name,
        p.author_id, p.status, p.published_at, p.created_at, p.updated_at
      FROM blog_posts p
      JOIN design_templates t ON p.design_template_id = t.id
      WHERE p.id = ?`,
      [postId]
    );

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if user has access to draft posts
    if (post.status === 'draft' && (!user || user.sub !== post.author_id)) {
      throw new NotFoundError('Post not found');
    }

    // Get photos
    const photos = await db.query(
      `SELECT 
        id, url, cloudflare_image_id, caption, alt_text,
        display_order, width, height
      FROM photo_content
      WHERE post_id = ?
      ORDER BY display_order ASC`,
      [postId]
    );

    // Get videos
    const videos = await db.query(
      `SELECT 
        id, url, r2_key, caption, display_order,
        thumbnail_url, duration_seconds
      FROM video_content
      WHERE post_id = ?
      ORDER BY display_order ASC`,
      [postId]
    );

    // Get text blocks
    const textBlocks = await db.query(
      `SELECT id, content, display_order
      FROM text_content
      WHERE post_id = ?
      ORDER BY display_order ASC`,
      [postId]
    );

    // Return response
    return successResponse({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        coverImage: post.cover_image,
        templateId: post.template_id,
        templateName: post.template_name,
        authorId: post.author_id,
        status: post.status,
        publishedAt: post.published_at,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
      },
      content: {
        photos: photos.map((p: any) => ({
          id: p.id,
          url: p.url,
          cloudflareImageId: p.cloudflare_image_id,
          caption: p.caption,
          altText: p.alt_text,
          displayOrder: p.display_order,
          width: p.width,
          height: p.height,
        })),
        videos: videos.map((v: any) => ({
          id: v.id,
          url: v.url,
          r2Key: v.r2_key,
          caption: v.caption,
          displayOrder: v.display_order,
          thumbnailUrl: v.thumbnail_url,
          durationSeconds: v.duration_seconds,
        })),
        textBlocks: textBlocks.map((t: any) => ({
          id: t.id,
          content: t.content,
          displayOrder: t.display_order,
        })),
      },
    });

  } catch (error) {
    console.error('Get post error:', error);
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw new ServerError('Failed to retrieve blog post');
  }
});
