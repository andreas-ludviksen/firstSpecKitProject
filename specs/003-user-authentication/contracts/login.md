# API Contract: POST /api/auth/login

**Version**: 1.0  
**Status**: Draft  
**Feature**: 003-user-authentication

## Overview

Authenticates a user with username and password, returning a session token on success.

---

## Endpoint

```
POST /api/auth/login
```

**Description**: Verifies user credentials and creates an authenticated session

**Authentication Required**: No (public endpoint)

---

## Request

### Headers

| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| `Content-Type` | Yes | `application/json` | Request body format |

### Body

**Content-Type**: `application/json`

**Schema**:
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```

**Field Definitions**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | Yes | 3-20 chars, alphanumeric + underscore | User's login identifier |
| `password` | string | Yes | 1-128 chars | User's plaintext password |
| `rememberMe` | boolean | No | Default: false | Whether to persist session beyond browser close |

**Example Request**:
```json
{
  "username": "reader1",
  "password": "securePassword123",
  "rememberMe": true
}
```

---

## Response

### Success Response (200 OK)

**Headers**:
```
Set-Cookie: session=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Max-Age=<seconds>
Content-Type: application/json
```

**Body**:
```json
{
  "success": true,
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
| `success` | boolean | Always `true` for successful login |
| `user.username` | string | Authenticated username |
| `user.role` | string | User role (`"reader"` or `"contributor"`) |
| `user.displayName` | string | Human-readable name (optional) |
| `expiresAt` | ISO 8601 | Session expiration timestamp |

**Cookie Details**:
- **Name**: `session`
- **Value**: JWT token (HS256 signed)
- **HttpOnly**: `true` (prevents JavaScript access)
- **Secure**: `true` (HTTPS only)
- **SameSite**: `Strict` (CSRF protection)
- **Max-Age**: 
  - 604800 seconds (7 days) if `rememberMe` is true
  - 86400 seconds (24 hours) if `rememberMe` is false

---

### Error Responses

#### 400 Bad Request (Invalid Input)

**Condition**: Missing required fields or validation failure

**Body**:
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "Username and password are required"
}
```

**Possible Error Codes**:
- `INVALID_INPUT`: Missing username or password
- `VALIDATION_ERROR`: Username/password format invalid

---

#### 401 Unauthorized (Invalid Credentials)

**Condition**: Username doesn't exist OR password is incorrect

**Body**:
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid username or password"
}
```

**Note**: Generic error message prevents username enumeration (per FR-019)

---

#### 429 Too Many Requests (Rate Limited)

**Condition**: 5 or more failed login attempts in 15-minute window

**Body**:
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many failed login attempts. Please try again in 15 minutes.",
  "retryAfter": 900
}
```

**Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| `retryAfter` | number | Seconds until rate limit resets (max 900) |

---

#### 500 Internal Server Error

**Condition**: Unexpected server error (bcrypt failure, KV unavailable)

**Body**:
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## Business Logic

### Authentication Flow

1. **Input Validation**:
   - Verify `username` and `password` present
   - Return 400 if missing

2. **Rate Limit Check**:
   - Query KV for `ratelimit:{username}:*` keys
   - If count ≥ 5, return 429 with retry time

3. **User Lookup**:
   - Load `users.json` (cached in Worker)
   - Find user by username (case-insensitive)
   - If not found: proceed to step 4 (don't reveal)

4. **Password Verification**:
   - If user exists: `bcrypt.compare(password, user.passwordHash)`
   - If user doesn't exist: simulate bcrypt delay (timing attack prevention)

5. **Handle Invalid Credentials**:
   - Create LoginAttempt in KV: `ratelimit:{username}:{timestamp}` with 900s TTL
   - Return 401 with generic error

6. **Handle Valid Credentials**:
   - Generate JWT with claims: `{ sub, role, iat, exp, rememberMe }`
   - Set HTTP-only cookie with JWT
   - Return 200 with user info

---

## Security Considerations

- **Password Handling**: Never log or store plaintext passwords
- **Timing Attacks**: Use constant-time comparison, simulate bcrypt on invalid users
- **Cookie Security**: HttpOnly + Secure + SameSite prevent XSS and CSRF
- **Rate Limiting**: Applied BEFORE password verification (prevents brute-force)
- **Generic Errors**: 401 response identical whether username or password is wrong

---

## Performance Requirements

- **Response Time**: < 2 seconds (includes bcrypt hashing ~100ms)
- **Bcrypt Cost**: Factor 10 (balances security and performance)
- **KV Latency**: < 50ms for rate limit check

---

## Example Usage

### cURL

```bash
curl -X POST https://travel-blog.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "reader1",
    "password": "securePassword123",
    "rememberMe": true
  }' \
  -c cookies.txt
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'reader1',
    password: 'securePassword123',
    rememberMe: true,
  }),
  credentials: 'include', // Send/receive cookies
});

const data = await response.json();

if (data.success) {
  console.log('Logged in as:', data.user.username);
  // Cookie automatically stored by browser
} else {
  console.error('Login failed:', data.message);
}
```

---

## Testing Checklist

- [ ] Valid credentials return 200 with JWT cookie
- [ ] Invalid password returns 401 (generic message)
- [ ] Non-existent username returns 401 (generic message)
- [ ] Missing username/password returns 400
- [ ] 5 failed attempts trigger 429 rate limit
- [ ] 6th attempt within 15 minutes returns 429
- [ ] Successful login after rate limit returns 200
- [ ] `rememberMe: true` sets 7-day cookie expiry
- [ ] `rememberMe: false` sets 24-hour cookie expiry
- [ ] Cookie has HttpOnly, Secure, SameSite flags
- [ ] JWT contains correct claims (sub, role, iat, exp)
- [ ] Password verification uses bcrypt (not plaintext)

---

## Related Contracts

- [POST /api/auth/logout](logout.md) - End user session
- [GET /api/auth/verify](verify-session.md) - Validate session token

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial draft |
