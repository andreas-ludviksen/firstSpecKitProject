/**
 * Rate limiting logic using Cloudflare KV
 * Tracks failed login attempts with 15-minute TTL
 */

// Type alias for KV namespace to avoid import issues with Next.js build
type KVNamespace = any;

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  retryAfter?: number; // seconds until rate limit resets
}

/**
 * Check if a user is rate limited
 * @param kv - Cloudflare KV namespace binding
 * @param username - Username to check
 * @returns Rate limit result with allowed status and remaining attempts
 */
export async function checkRateLimit(
  kv: KVNamespace | null,
  username: string
): Promise<RateLimitResult> {
  // If KV is not configured, allow all requests (graceful degradation)
  if (!kv) {
    console.warn('Rate limiting disabled: KV namespace not configured');
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS };
  }

  try {
    // List all failed attempt keys for this username
    const listResult = await kv.list({ prefix: `ratelimit:${username}:` });
    const attemptCount = listResult.keys.length;

    if (attemptCount >= MAX_ATTEMPTS) {
      // User is rate limited
      return {
        allowed: false,
        attemptsRemaining: 0,
        retryAfter: LOCKOUT_DURATION,
      };
    }

    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS - attemptCount,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request (fail open)
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS };
  }
}

/**
 * Record a failed login attempt
 * @param kv - Cloudflare KV namespace binding
 * @param username - Username that failed login
 * @param ipAddress - Optional IP address for forensic tracking
 */
export async function recordFailedAttempt(
  kv: KVNamespace | null,
  username: string,
  ipAddress?: string
): Promise<void> {
  if (!kv) {
    console.warn('Failed attempt not recorded: KV namespace not configured');
    return;
  }

  try {
    const timestamp = Date.now();
    const key = `ratelimit:${username}:${timestamp}`;
    const value = JSON.stringify({
      username,
      attemptTime: timestamp,
      ipAddress,
    });

    // Store with 15-minute TTL (auto-expiry)
    await kv.put(key, value, { expirationTtl: LOCKOUT_DURATION });
  } catch (error) {
    console.error('Failed to record failed attempt:', error);
    // Non-critical error, continue
  }
}

/**
 * Clear all failed attempts for a user (optional, not used per spec)
 * Kept for potential future use
 * @param kv - Cloudflare KV namespace binding
 * @param username - Username to clear attempts for
 */
export async function clearFailedAttempts(
  kv: KVNamespace | null,
  username: string
): Promise<void> {
  if (!kv) {
    return;
  }

  try {
    const listResult = await kv.list({ prefix: `ratelimit:${username}:` });
    
    // Delete all keys for this username
    await Promise.all(
      listResult.keys.map((key: any) => kv.delete(key.name))
    );
  } catch (error) {
    console.error('Failed to clear attempts:', error);
  }
}
