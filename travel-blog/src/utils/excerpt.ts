/**
 * Excerpt Generation Utility
 * Feature: 005-public-blog-viewing
 * 
 * Truncate text for post previews
 */

import striptags from 'striptags';
/**
 * Generate excerpt from text
 * @param text - Full text content
 * @param maxLength - Maximum character length (default: 150)
 * @returns Truncated text with ellipsis if needed
 */
export function generateExcerpt(text: string | null | undefined, maxLength: number = 150): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  const trimmed = text.trim();
  
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  // Find last complete word within limit
  const truncated = trimmed.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }
  return striptags(html);
}

/**
 * Generate excerpt from HTML content
 */
export function generateExcerptFromHtml(html: string | null | undefined, maxLength: number = 150): string {
  const plainText = stripHtml(html);
  return generateExcerpt(plainText, maxLength);
}
