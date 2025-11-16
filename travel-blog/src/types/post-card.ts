/**
 * Post Card Types for Public Blog Viewing
 * Feature: 005-public-blog-viewing
 * 
 * Types for displaying blog post previews in lists
 */

export interface PostCardData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  templateId: string;
  templateName: string;
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  photoCount: number;
  videoCount: number;
}

export interface PostListData {
  posts: PostCardData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
