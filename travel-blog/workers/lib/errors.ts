/**
 * Error Handling Utilities for Cloudflare Workers
 * Feature: 004-modular-blog-posts
 * 
 * Standardized error responses and error handling
 */

export interface ApiError {
  error: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export class ApiErrorResponse extends Error {
  constructor(
    public error: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiErrorResponse';
  }

  toJSON(): ApiError {
    return {
      error: this.error,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }

  toResponse(): Response {
    return new Response(
      JSON.stringify({
        error: this.error,
        message: this.message,
        ...(this.details && { details: this.details }),
      }),
      {
        status: this.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Common Error Types

export class ValidationError extends ApiErrorResponse {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends ApiErrorResponse {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends ApiErrorResponse {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends ApiErrorResponse {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends ApiErrorResponse {
  constructor(message: string, details?: any) {
    super('CONFLICT', message, 409, details);
  }
}

export class TooLargeError extends ApiErrorResponse {
  constructor(message: string, maxSize?: number) {
    super('PAYLOAD_TOO_LARGE', message, 413, maxSize ? { maxSizeBytes: maxSize } : undefined);
  }
}

export class ServerError extends ApiErrorResponse {
  constructor(message: string = 'Internal server error', details?: any) {
    super('SERVER_ERROR', message, 500, details);
  }
}

// Utility Functions

/**
 * Create a success response
 */
export function successResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  message: string,
  status: number = 400,
  details?: any
): Response {
  return new Response(
    JSON.stringify({
      error,
      message,
      ...(details && { details }),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle errors in route handlers
 */
export function handleError(error: unknown): Response {
  console.error('Error in handler:', error);

  if (error instanceof ApiErrorResponse) {
    return error.toResponse();
  }

  if (error instanceof Error) {
    return errorResponse('SERVER_ERROR', error.message, 500);
  }

  return errorResponse('SERVER_ERROR', 'An unexpected error occurred', 500);
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<Response>
): (...args: any[]) => Promise<Response> {
  return async (...args: any[]): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Validate request body
 */
export async function parseJsonBody<T = any>(request: Request): Promise<T> {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    
    if (!contentType.includes('application/json')) {
      throw new ValidationError('Content-Type must be application/json');
    }

    const body = await request.json();
    return body as T;
  } catch (error) {
    if (error instanceof ApiErrorResponse) {
      throw error;
    }
    throw new ValidationError('Invalid JSON in request body');
  }
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', {
      missing,
    });
  }
}

/**
 * Validate field types
 */
export function validateTypes(
  data: Record<string, any>,
  fieldTypes: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>
): void {
  const errors: { field: string; expected: string; actual: string }[] = [];

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      continue; // Skip undefined/null values (use validateRequired for that)
    }

    let actualType: string = typeof value;
    if (expectedType === 'array' && Array.isArray(value)) {
      actualType = 'array';
    }

    if (actualType !== expectedType) {
      errors.push({
        field,
        expected: expectedType,
        actual: actualType,
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid field types', { errors });
  }
}
