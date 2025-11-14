/**
 * Authentication API client for Next.js frontend
 * Communicates with Cloudflare Workers auth endpoints
 */

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginSuccessResponse {
  success: true;
  user: {
    username: string;
    role: 'reader' | 'contributor';
    displayName?: string;
  };
  expiresAt: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  retryAfter?: number;
}

export type LoginResponse = LoginSuccessResponse | ErrorResponse;

export interface VerifySessionResponse {
  authenticated: true;
  user: {
    username: string;
    role: 'reader' | 'contributor';
    displayName?: string;
  };
  expiresAt: string;
}

export type VerifyResponse = VerifySessionResponse | ErrorResponse;

export interface LogoutResponse {
  success: true;
  message: string;
}

/**
 * Get the base URL for auth API endpoints
 * In production, this will be the Cloudflare Workers URL
 * In development, use the Workers dev server or a proxy
 */
function getAuthApiUrl(): string {
  // In production, use environment variable
  if (process.env.NEXT_PUBLIC_AUTH_API_URL) {
    return process.env.NEXT_PUBLIC_AUTH_API_URL;
  }
  
  // In development, use localhost Workers dev server
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8787';
  }
  
  // Fallback to same origin (assumes Workers deployed on same domain)
  return '';
}

/**
 * Login with username and password
 * @param credentials - Login credentials
 * @returns Login response with user info or error
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${getAuthApiUrl()}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login request failed:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to connect to authentication server. Please try again.',
    };
  }
}

/**
 * Verify current session
 * @returns Session verification response with user info or error
 */
export async function verifySession(): Promise<VerifyResponse | ErrorResponse> {
  try {
    const response = await fetch(`${getAuthApiUrl()}/api/auth/verify`, {
      method: 'GET',
      credentials: 'include', // Include cookies in request
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session verification failed:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to verify session. Please try again.',
    };
  }
}

/**
 * Logout and clear session
 * @returns Logout response
 */
export async function logout(): Promise<LogoutResponse | ErrorResponse> {
  try {
    const response = await fetch(`${getAuthApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in request
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Logout request failed:', error);
    
    // Fail open - logout should always succeed for UX
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
