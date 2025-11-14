/**
 * Input sanitization utilities for authentication
 */

/**
 * Sanitize username input
 * - Trim whitespace
 * - Convert to lowercase for consistent comparison
 * - Remove null bytes
 * - Limit length to prevent buffer overflow
 */
export function sanitizeUsername(username: string | undefined | null): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  return username
    .trim()
    .toLowerCase()
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 100); // Limit to 100 characters
}

/**
 * Sanitize password input
 * - Trim whitespace
 * - Remove null bytes
 * - Limit length to prevent DoS attacks via bcrypt
 */
export function sanitizePassword(password: string | undefined | null): string {
  if (!password || typeof password !== 'string') {
    return '';
  }

  return password
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 72); // bcrypt max length is 72 bytes
}

/**
 * Validate username format
 * - Must be alphanumeric or underscore
 * - Must be between 3-50 characters
 */
export function isValidUsername(username: string): boolean {
  const sanitized = sanitizeUsername(username);
  
  if (sanitized.length < 3 || sanitized.length > 50) {
    return false;
  }

  // Allow alphanumeric and underscore only
  return /^[a-z0-9_]+$/.test(sanitized);
}

/**
 * Validate password format
 * - Must be at least 8 characters
 * - Must be no more than 72 characters (bcrypt limit)
 */
export function isValidPassword(password: string): boolean {
  const sanitized = sanitizePassword(password);
  
  if (sanitized.length < 8 || sanitized.length > 72) {
    return false;
  }

  return true;
}
