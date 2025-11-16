/**
 * Post URL Utilities
 * Feature: 005-public-blog-viewing
 * 
 * Generate URLs for blog posts
 */

/**
 * Generate blog post URL from slug
 */
export function getPostUrl(slug: string): string {
  return `/blog/${slug}`;
}

/**
 * Extract slug from post URL path
 */
export function getSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/blog\/([^/]+)$/);
  return match ? match[1] : null;
}

/**
 * Generate blog list URL with optional pagination
 */
export function getBlogListUrl(page?: number): string {
  if (!page || page === 1) {
    return '/blog';
  }
  return `/blog?page=${page}`;
}
