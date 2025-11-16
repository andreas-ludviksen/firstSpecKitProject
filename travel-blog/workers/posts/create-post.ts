/**
 * Create Blog Post Endpoint
 * Feature: 004-modular-blog-posts
 * POST /api/posts/create
 * 
 * Creates a new blog post with title and template
 */

import { createDatabaseClient } from '../lib/db';
import { generateUUID } from '../lib/uuid';
import { generateSlug, generateUniqueSlug } from '../lib/slug';
import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  ValidationError, 
  ServerError,
  successResponse,
  parseJsonBody 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface CreatePostRequest {
  title: string;
  templateId: string;
  slug?: string;
}

interface CreatePostResponse {
  postId: string;
  title: string;
  slug: string;
  templateId: string;
  status: string;
  createdAt: string;
}

export const createPost = withAuth(async (request: Request, user, env: Env) => {
  try {
    const body = await parseJsonBody<CreatePostRequest>(request);

    console.log('[CREATE POST] Request body:', body);
    console.log('[CREATE POST] User:', user);

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      throw new ValidationError('title is required and cannot be empty');
    }
    if (!body.templateId) {
      throw new ValidationError('templateId is required');
    }

    const db = createDatabaseClient(env.DB);

    // Verify template exists
    const template = await db.queryOne(
      'SELECT id FROM design_templates WHERE id = ?',
      [body.templateId]
    );
    
    console.log('[CREATE POST] Template lookup result:', template);
    
    if (!template) {
      throw new ValidationError('Template not found');
    }

    // Generate or validate slug
    let slug: string;
    if (body.slug) {
      // Check if slug is available
      const existing = await db.exists('blog_posts', 'slug', body.slug);
      if (existing) {
        throw new ValidationError('Slug already in use');
      }
      slug = body.slug;
    } else {
      // Generate unique slug from title
      const baseSlug = generateSlug(body.title);
      slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
        return await db.exists('blog_posts', 'slug', testSlug);
      });
    }

    // Create post
    const postId = generateUUID();
    const now = new Date().toISOString();
    const status = 'draft';

    await db.execute(
      `INSERT INTO blog_posts (
        id, slug, title, design_template_id, author_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [postId, slug, body.title, body.templateId, user.sub, status, now, now]
    );

    // Return response
    return successResponse({
      postId,
      title: body.title,
      slug,
      templateId: body.templateId,
      status,
      createdAt: now,
    }, 201);

  } catch (error) {
    console.error('Create post error:', error);
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServerError('Failed to create blog post');
  }
});
