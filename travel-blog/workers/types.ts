/**
 * TypeScript type definitions for authentication system
 */

// User entity from data model
export interface User {
  username: string;
  passwordHash: string;
  role: 'reader' | 'contributor';
  createdAt?: string;
  displayName?: string;
}

// Session JWT payload
export interface SessionPayload {
  sub: string; // username
  role: 'reader' | 'contributor';
  iat: number; // issued at timestamp
  exp: number; // expiration timestamp
  rememberMe: boolean;
}

// Login request body
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Login success response
export interface LoginSuccessResponse {
  success: true;
  user: {
    username: string;
    role: 'reader' | 'contributor';
    displayName?: string;
  };
  expiresAt: string; // ISO 8601 timestamp
}

// Logout response
export interface LogoutResponse {
  success: true;
  message: string;
}

// Session verification response
export interface VerifySessionResponse {
  authenticated: true;
  user: {
    username: string;
    role: 'reader' | 'contributor';
    displayName?: string;
  };
  expiresAt: string; // ISO 8601 timestamp
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string; // Error code
  message: string; // User-friendly error message
  retryAfter?: number; // For rate limiting (seconds)
}

// API response types (union types)
export type LoginResponse = LoginSuccessResponse | ErrorResponse;
export type VerifyResponse = VerifySessionResponse | ErrorResponse;

// Cloudflare Workers environment bindings
// Using 'any' for KVNamespace to avoid build issues with Next.js
export interface Env {
  JWT_SECRET: string;
  RATE_LIMIT_KV?: any; // Optional KV for rate limiting
  NODE_ENV?: string;
}

// Login attempt entity for rate limiting
export interface LoginAttempt {
  username: string;
  attemptTime: number; // Unix timestamp
  ipAddress?: string;
}
