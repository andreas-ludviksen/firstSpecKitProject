# API Contract: POST /api/auth/logout

**Version**: 1.0  
**Status**: Draft  
**Feature**: 003-user-authentication

## Overview

Ends an authenticated user session by clearing the session cookie.

---

## Endpoint

```
POST /api/auth/logout
```

**Description**: Invalidates the current session and clears authentication cookie

**Authentication Required**: No (works with or without valid session)

---

## Request

### Headers

| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| `Cookie` | No | `session=<JWT_TOKEN>` | Session cookie (if present) |

### Body

**Content-Type**: N/A (no body required)

**Example Request**:
```bash
POST /api/auth/logout
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Response

### Success Response (200 OK)

**Headers**:
```
Set-Cookie: session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/
Content-Type: application/json
```

**Body**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful logout |
| `message` | string | Confirmation message |

**Cookie Details**:
- **Name**: `session`
- **Value**: Empty string
- **Max-Age**: `0` (immediate expiry)
- **HttpOnly**: `true`
- **Secure**: `true`
- **SameSite**: `Strict`
- **Path**: `/` (clears cookie for entire domain)

---

### Error Responses

#### 500 Internal Server Error

**Condition**: Unexpected server error (rare)

**Body**:
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

**Note**: Logout should succeed even on errors (fail open for UX)

---

## Business Logic

### Logout Flow

1. **Cookie Clearing**:
   - Set `session` cookie with `Max-Age=0` (browser deletes immediately)
   - Include all security flags (HttpOnly, Secure, SameSite)
   - Set `Path=/` to ensure full domain scope

2. **Response**:
   - Always return 200 OK (even if no session existed)
   - Return success message for client confirmation

3. **No Server-Side State**:
   - JWT tokens are stateless (no server-side session store to clear)
   - Expired cookie prevents future authentication
   - Client responsible for clearing any cached user data

---

## Security Considerations

- **CSRF**: Not vulnerable (no state change on server, only cookie deletion)
- **No Token Invalidation**: JWT remains valid until expiry (acceptable tradeoff for stateless design)
- **Client-Side Cleanup**: Client should clear any cached user info (username, role)

---

## Performance Requirements

- **Response Time**: < 100ms (no backend processing)
- **Always Succeeds**: Never return error (fail open)

---

## Example Usage

### cURL

```bash
curl -X POST https://travel-blog.pages.dev/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include', // Send cookies
});

const data = await response.json();

if (data.success) {
  console.log('Logged out successfully');
  // Clear client-side user data
  localStorage.removeItem('username');
  // Redirect to login page
  window.location.href = '/login';
}
```

### React Component

```typescript
const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Clear local state
      setUser(null);
      // Redirect
      router.push('/login');
    }
  } catch (error) {
    console.error('Logout failed:', error);
    // Still redirect (fail open)
    router.push('/login');
  }
};
```

---

## Testing Checklist

- [ ] Valid session returns 200 and clears cookie
- [ ] No session returns 200 and sets empty cookie
- [ ] Cookie has Max-Age=0 for immediate expiry
- [ ] Cookie has all security flags (HttpOnly, Secure, SameSite)
- [ ] Cookie Path=/ for full domain clearing
- [ ] Response always succeeds (even on server error)
- [ ] Subsequent requests with cleared cookie fail authentication

---

## Related Contracts

- [POST /api/auth/login](login.md) - Create user session
- [GET /api/auth/verify](verify-session.md) - Validate session token

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial draft |
