# API Contract: GET /api/auth/verify

**Version**: 1.0  
**Status**: Draft  
**Feature**: 003-user-authentication

## Overview

Validates a session token and returns the authenticated user's information.

---

## Endpoint

```
GET /api/auth/verify
```

**Description**: Verifies session cookie and returns user identity and role

**Authentication Required**: Yes (requires valid session cookie)

---

## Request

### Headers

| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| `Cookie` | Yes | `session=<JWT_TOKEN>` | Session cookie from login |

### Query Parameters

None

**Example Request**:
```bash
GET /api/auth/verify
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Response

### Success Response (200 OK)

**Condition**: Valid, non-expired session token

**Body**:
```json
{
  "authenticated": true,
  "user": {
    "username": "reader1",
    "role": "reader",
    "displayName": "Reader One"
  },
  "expiresAt": "2025-11-20T00:00:00Z"
}
```

**Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| `authenticated` | boolean | Always `true` for successful verification |
| `user.username` | string | Authenticated username |
| `user.role` | string | User role (`"reader"` or `"contributor"`) |
| `user.displayName` | string | Human-readable name (optional) |
| `expiresAt` | ISO 8601 | Session expiration timestamp |

---

### Error Responses

#### 401 Unauthorized (No Session)

**Condition**: No session cookie present

**Body**:
```json
{
  "authenticated": false,
  "error": "NO_SESSION",
  "message": "No authentication session found"
}
```

---

#### 401 Unauthorized (Invalid Token)

**Condition**: Session cookie present but JWT signature invalid

**Body**:
```json
{
  "authenticated": false,
  "error": "INVALID_TOKEN",
  "message": "Invalid authentication token"
}
```

**Causes**:
- JWT signature verification failed (wrong secret)
- JWT malformed (corrupt cookie)
- Token tampered with by client

---

#### 401 Unauthorized (Expired Session)

**Condition**: Valid JWT but current time ≥ expiry time

**Body**:
```json
{
  "authenticated": false,
  "error": "SESSION_EXPIRED",
  "message": "Your session has expired. Please log in again."
}
```

**Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Specific error code for expired session |
| `message` | string | User-friendly message for display |

---

#### 500 Internal Server Error

**Condition**: Unexpected server error (JWT library failure)

**Body**:
```json
{
  "authenticated": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Business Logic

### Verification Flow

1. **Cookie Extraction**:
   - Read `session` cookie from request
   - If missing: return 401 NO_SESSION

2. **JWT Validation**:
   - Verify JWT signature using server secret (HS256)
   - If invalid: return 401 INVALID_TOKEN

3. **Expiry Check**:
   - Compare JWT `exp` claim with current timestamp
   - If expired: return 401 SESSION_EXPIRED

4. **User Lookup** (optional):
   - Extract `sub` claim (username) from JWT
   - Load user details from users.json for displayName
   - If user deleted: return 401 INVALID_TOKEN

5. **Success Response**:
   - Return 200 with user info and expiry time

---

## Security Considerations

- **Stateless Validation**: No database lookup required (JWT is self-contained)
- **Signature Verification**: Prevents token forgery
- **Expiry Enforcement**: Auto-logout on expired sessions (per spec clarification)
- **No Refresh Tokens**: Expired sessions require re-login (per spec)

---

## Performance Requirements

- **Response Time**: < 100ms (JWT verification is CPU-bound, very fast)
- **No External Calls**: No KV or external service dependencies

---

## Example Usage

### cURL

```bash
curl -X GET https://travel-blog.pages.dev/api/auth/verify \
  -b cookies.txt
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('/api/auth/verify', {
  method: 'GET',
  credentials: 'include', // Send cookies
});

const data = await response.json();

if (data.authenticated) {
  console.log('User:', data.user.username);
  console.log('Role:', data.user.role);
  console.log('Expires:', new Date(data.expiresAt));
} else {
  console.error('Not authenticated:', data.message);
  // Redirect to login
  window.location.href = '/login';
}
```

### React Hook

```typescript
import { useEffect, useState } from 'react';

interface User {
  username: string;
  role: string;
  displayName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
          // Optionally redirect on expired session
          if (data.error === 'SESSION_EXPIRED') {
            alert(data.message);
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  return { user, loading };
}
```

### Next.js Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get session cookie
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify session (call Workers endpoint)
  const verifyResponse = await fetch('https://travel-blog.pages.dev/api/auth/verify', {
    headers: {
      Cookie: `session=${sessionCookie.value}`,
    },
  });
  
  const data = await verifyResponse.json();
  
  if (!data.authenticated) {
    // Redirect to login with error message
    const loginUrl = new URL('/login', request.url);
    if (data.error === 'SESSION_EXPIRED') {
      loginUrl.searchParams.set('error', 'expired');
    }
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow request to proceed
  return NextResponse.next();
}

// Apply to protected routes
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## Testing Checklist

- [ ] Valid session returns 200 with user info
- [ ] Missing session cookie returns 401 NO_SESSION
- [ ] Invalid JWT signature returns 401 INVALID_TOKEN
- [ ] Expired JWT returns 401 SESSION_EXPIRED
- [ ] Tampered JWT returns 401 INVALID_TOKEN
- [ ] Response includes correct user role
- [ ] Response includes session expiry time
- [ ] Verification completes in < 100ms
- [ ] No database/KV calls required

---

## Related Contracts

- [POST /api/auth/login](login.md) - Create user session
- [POST /api/auth/logout](logout.md) - End user session

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial draft |
