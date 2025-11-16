/**
 * Posts API Client
 * Feature: 005-public-blog-viewing
 * 
 * Client-side functions to fetch blog posts from the API
 */

import type { PostListData } from '@/types/post-card';

const POSTS_API_URL = process.env.NEXT_PUBLIC_POSTS_API_URL || 'http://localhost:8788';

// API response types matching worker responses
export interface PostDetailResponse {
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

/**
 * Fetch list of published blog posts
 */
export async function fetchPublishedPosts(
  limit: number = 20,
  offset: number = 0
): Promise<PostListData> {
  try {
    const url = new URL(`${POSTS_API_URL}/api/posts`);
    url.searchParams.set('status', 'published');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data for now
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch posts');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching published posts:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID with full content
 */
export async function fetchPostById(postId: string): Promise<PostDetailResponse> {
  try {
    const url = `${POSTS_API_URL}/api/posts/${postId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch post');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug with full content
 */
export async function fetchPostBySlug(slug: string): Promise<PostDetailResponse> {
  try {
    const url = `${POSTS_API_URL}/api/posts/slug/${slug}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch post');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    throw error;
  }
}
