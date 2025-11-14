/**
 * Main Cloudflare Workers entry point
 * Routes authentication requests to appropriate handlers
 */

import { Router, error, json } from 'itty-router';
import { handleCORSPreflight, addCORSHeaders } from '../lib/cors';
import type { Env } from '../types';

// Import route handlers
import { handleLogin } from './login';
import { handleLogout } from './logout';
import { handleVerify } from './verify-session';

// Create router instance
const router = Router();

/**
 * Health check endpoint
 */
router.get('/api/auth/health', () => {
  return json({ status: 'ok', service: 'auth' });
});

/**
 * Authentication endpoints
 */
router.post('/api/auth/login', handleLogin);
router.post('/api/auth/logout', handleLogout);
router.get('/api/auth/verify', handleVerify);

/**
 * Handle OPTIONS preflight requests for CORS
 */
router.options('*', (request) => handleCORSPreflight(request));

/**
 * 404 handler
 */
router.all('*', () => error(404, 'Endpoint not found'));

/**
 * Export as service worker format with CORS wrapper
 */
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    try {
      const response = await router.fetch(request, env, ctx);
      return addCORSHeaders(response, request);
    } catch (err) {
      console.error('Worker error:', err);
      const errorResponse = json({ 
        success: false, 
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred' 
      }, { status: 500 });
      return addCORSHeaders(errorResponse, request);
    }
  },
};
