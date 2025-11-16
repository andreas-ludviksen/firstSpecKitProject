/**
 * CORS configuration for Workers responses
 * Allows frontend to communicate with Workers endpoints
 */

export interface CORSConfig {
  allowedOrigins: string[];
  allowCredentials: boolean;
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
}

const DEFAULT_CONFIG: CORSConfig = {
  // In development: localhost, in production: add your Cloudflare Pages domain
  allowedOrigins: [
    '*', // Allow all origins temporarily for debugging
  ],
  allowCredentials: true, // Required for cookies
  allowedMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

/**
 * Add CORS headers to a Response
 * @param response - Response object to add headers to
 * @param request - Request object to check origin
 * @param config - Optional CORS configuration (uses defaults if not provided)
 * @returns Response with CORS headers
 */
export function addCORSHeaders(
  response: Response,
  request: Request,
  config: CORSConfig = DEFAULT_CONFIG
): Response {
  const origin = request.headers.get('Origin');
  
  // Clone the response headers
  const headers = new Headers(response.headers);
  
  // Debug logging
  console.log('[CORS] Origin:', origin);
  console.log('[CORS] Allowed origins:', config.allowedOrigins);
  
  // Check if origin is allowed (including wildcard matching for Pages deployments)
  if (origin) {
    const isAllowed = config.allowedOrigins.includes(origin) || 
                     config.allowedOrigins.includes('*') ||
                     origin.endsWith('.travel-blog-4my.pages.dev'); // Allow all deployment URLs
    
    console.log('[CORS] Is allowed:', isAllowed);
    
    if (isAllowed) {
      headers.set('Access-Control-Allow-Origin', origin);
    }
  } else if (config.allowedOrigins.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  if (config.allowCredentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  headers.set('Access-Control-Max-Age', config.maxAge.toString());

  // Create new response with updated headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle OPTIONS preflight request
 * @param request - Request object
 * @param config - Optional CORS configuration
 * @returns Response for preflight request
 */
export function handleCORSPreflight(
  request: Request,
  config: CORSConfig = DEFAULT_CONFIG
): Response {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    'Access-Control-Max-Age': config.maxAge.toString(),
  };

  if (origin) {
    const isAllowed = config.allowedOrigins.includes(origin) || 
                     config.allowedOrigins.includes('*') ||
                     origin.endsWith('.travel-blog-4my.pages.dev'); // Allow all deployment URLs
    
    if (isAllowed) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  } else if (config.allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  if (config.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return new Response(null, {
    status: 204,
    headers,
  });
}
