/**
 * Password hashing and verification utilities using bcrypt
 * Cost factor 10 per research decision
 */

import bcrypt from 'bcryptjs';

const COST_FACTOR = 10;

/**
 * Hash a plaintext password using bcrypt
 * @param password - Plaintext password to hash
 * @returns Bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST_FACTOR);
}

/**
 * Compare a plaintext password with a bcrypt hash
 * Uses constant-time comparison to prevent timing attacks
 * @param password - Plaintext password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns True if password matches hash, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Invalid hash format or bcrypt error
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Synchronous version of hashPassword for scripts
 * @param password - Plaintext password to hash
 * @returns Bcrypt hash string
 */
export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, COST_FACTOR);
}
