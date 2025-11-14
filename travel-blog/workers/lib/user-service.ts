/**
 * User lookup and management service
 * Uses Cloudflare D1 database for user storage
 */

export interface User {
  id?: number;
  username: string;
  passwordHash: string;
  role: 'reader' | 'contributor';
  createdAt?: string;
  displayName?: string;
}

/**
 * Find a user by username (case-insensitive)
 * @param db - D1 database instance
 * @param username - Username to search for
 * @returns User object if found, null otherwise
 */
export async function findUserByUsername(db: any, username: string): Promise<User | null> {
  const normalizedUsername = username.toLowerCase();
  
  const result = await db
    .prepare('SELECT id, username, password_hash as passwordHash, role, display_name as displayName, created_at as createdAt FROM users WHERE LOWER(username) = ?')
    .bind(normalizedUsername)
    .first();
  
  return result || null;
}

/**
 * Get all users (for admin purposes - not exposed via API)
 * @param db - D1 database instance
 * @returns Array of all users
 */
export async function getAllUsers(db: any): Promise<User[]> {
  const result = await db
    .prepare('SELECT id, username, password_hash as passwordHash, role, display_name as displayName, created_at as createdAt FROM users ORDER BY created_at DESC')
    .all();
  
  return result.results || [];
}

/**
 * Check if a user exists
 * @param db - D1 database instance
 * @param username - Username to check
 * @returns True if user exists, false otherwise
 */
export async function userExists(db: any, username: string): Promise<boolean> {
  const user = await findUserByUsername(db, username);
  return user !== null;
}

/**
 * Get user count
 * @param db - D1 database instance
 * @returns Total number of users
 */
export async function getUserCount(db: any): Promise<number> {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM users')
    .first();
  
  return result?.count || 0;
}
