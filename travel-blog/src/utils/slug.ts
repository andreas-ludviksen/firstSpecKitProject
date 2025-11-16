/**
 * Slug Generation Utility
 * Feature: 004-modular-blog-posts
 * 
 * Converts titles to URL-friendly slugs
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove accents, diacritics, etc.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 2;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitize a slug to ensure it's valid
 */
export function sanitizeSlug(slug: string): string {
  const generated = generateSlug(slug);
  
  // If the generated slug is empty, return a default
  if (!generated) {
    return 'untitled';
  }
  
  // Ensure it doesn't exceed reasonable length
  const maxLength = 100;
  if (generated.length > maxLength) {
    return generated.substring(0, maxLength).replace(/-+$/, '');
  }
  
  return generated;
}
