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
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://travel-blog-4my.pages.dev', // Production Cloudflare Pages URL
  ],
  allowCredentials: true, // Required for cookies
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
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
  const newResponse = new Response(response.body, response);

  // Check if origin is allowed (including wildcard matching for Pages deployments)
  if (origin) {
    const isAllowed = config.allowedOrigins.includes(origin) || 
                     config.allowedOrigins.includes('*') ||
                     origin.endsWith('.travel-blog-4my.pages.dev'); // Allow all deployment URLs
    
    if (isAllowed) {
      newResponse.headers.set('Access-Control-Allow-Origin', origin);
    }
  } else if (config.allowedOrigins.includes('*')) {
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
  }

  if (config.allowCredentials) {
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  newResponse.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  newResponse.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  newResponse.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  return newResponse;
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
