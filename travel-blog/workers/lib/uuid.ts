/**
 * UUID Generation Utility (Workers version)
 * Feature: 004-modular-blog-posts
 */

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

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
