/**
 * Blog Post Entity Types
 * Feature: 004-modular-blog-posts
 * 
 * Core types for blog posts with modular content and interchangeable templates
 */

import type { PhotoContent, VideoContent, TextContent } from './media-content';
import type { DesignTemplateMetadata } from './design-template';

export type PostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  designTemplateId: string;
  status: PostStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  publishedAt?: string; // ISO 8601
  version: number; // Optimistic concurrency version
}

export interface BlogPostWithContent extends BlogPost {
  photos: PhotoContent[];
  videos: VideoContent[];
  text: TextContent[];
  template?: DesignTemplateMetadata;
}

export interface BlogPostCreateRequest {
  title: string;
  designTemplateId: string;
  slug?: string;
  status?: PostStatus;
}

export interface BlogPostUpdateRequest {
  title?: string;
  slug?: string;
  status?: PostStatus;
  version?: number; // Optional for last-save-wins
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  designTemplateId: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  preview: {
    firstPhoto?: string;
    textPreview?: string;
  };
}

export interface BlogPostListResponse {
  posts: BlogPostListItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Re-export related types for convenience
export type { PhotoContent, VideoContent, TextContent } from './media-content';
export type { DesignTemplate, DesignTemplateMetadata } from './design-template';
