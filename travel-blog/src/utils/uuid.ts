/**
 * UUID Generation Utility
 * Feature: 004-modular-blog-posts
 * 
 * Generates UUIDs for entity identification
 */

/**
 * Generate a UUID v4
 * Uses crypto.randomUUID() if available, otherwise falls back to random generation
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers and Node.js 16.7+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a short ID (not a full UUID, but unique enough for most use cases)
 * Useful for prefixed IDs like "photo-abc123"
 */
export function generateShortId(prefix?: string): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let result = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += characters[randomValues[i] % characters.length];
  }
  
  return prefix ? `${prefix}-${result}` : result;
}
