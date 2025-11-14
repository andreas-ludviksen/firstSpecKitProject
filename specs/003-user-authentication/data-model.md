# Data Model: User Authentication

**Feature**: 003-user-authentication  
**Date**: 2025-11-13  
**Status**: Design Complete

## Overview

This document defines the data structures for password-based authentication with Reader and Contributor roles on Cloudflare Pages.

---

## Entity 1: User

**Purpose**: Represents an authenticated user account with credentials and role

**Storage**: Static JSON file (`workers/users.json`) deployed with Cloudflare Worker

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | Yes | 3-20 chars, alphanumeric + underscore | Unique user identifier for login |
| `passwordHash` | string | Yes | bcrypt hash format `$2a$10$...` | bcrypt-hashed password (cost factor 10) |
| `role` | enum | Yes | `"reader"` or `"contributor"` | User permission level |
| `createdAt` | ISO 8601 | No | Valid date string | Account creation timestamp |
| `displayName` | string | No | 1-50 chars | Human-readable name for UI display |

**Validation Rules**:
- Username must be unique across all users
- Password hash must be valid bcrypt format (verified during user file initialization)
- Role must be one of the defined enum values
- Username is case-insensitive for lookups (stored in lowercase)

**Example**:
```json
{
  "username": "reader1",
  "passwordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "role": "reader",
  "createdAt": "2025-11-13T00:00:00Z",
  "displayName": "Reader One"
}
```

**Relationships**:
- One-to-Many with Session (one user can have multiple active sessions)
- One-to-Many with LoginAttempt (one user can have multiple failed login attempts)

**Indexes**:
- Primary: `username` (unique identifier for lookups)

---

## Entity 2: Session

**Purpose**: Represents an authenticated user session with expiry

**Storage**: JWT token stored in HTTP-only cookie (client-side), optionally mirrored in Cloudflare KV for server-side validation

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `sub` | string | Yes | Matches User.username | Subject (username) claim |
| `role` | enum | Yes | `"reader"` or `"contributor"` | User role claim for authorization |
| `iat` | number | Yes | Unix timestamp | Issued At time |
| `exp` | number | Yes | Unix timestamp > iat | Expiration time |
| `rememberMe` | boolean | Yes | true or false | Whether session persists beyond browser close |

**JWT Payload Example**:
```json
{
  "sub": "reader1",
  "role": "reader",
  "iat": 1699900800,
  "exp": 1700505600,
  "rememberMe": true
}
```

**Validation Rules**:
- `exp` must be after `iat`
- If `rememberMe` is true: `exp` = `iat` + 7 days
- If `rememberMe` is false: `exp` = `iat` + 24 hours (expires on typical browser close)
- JWT signature must be valid using server-side secret (HS256 algorithm)

**State Transitions**:
1. **Created**: Session generated on successful login
2. **Active**: Session valid (current time < `exp`)
3. **Expired**: Session invalid (current time ≥ `exp`)
4. **Revoked**: Session invalidated on logout (removed from client cookie)

**Relationships**:
- Many-to-One with User (many sessions belong to one user)

**Indexes**:
- None (JWT is self-contained, validated cryptographically)

---

## Entity 3: LoginAttempt

**Purpose**: Tracks failed login attempts for rate limiting

**Storage**: Cloudflare KV with TTL (15 minutes auto-expiry)

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | Yes | Matches attempt username | Username that failed login |
| `attemptTime` | number | Yes | Unix timestamp | When the failed attempt occurred |
| `ipAddress` | string | No | Valid IP format | Client IP for forensic tracking |

**KV Key Structure**:
```
ratelimit:{username}:{attemptTime}
```

**KV Value Example**:
```json
{
  "username": "reader1",
  "attemptTime": 1699900800,
  "ipAddress": "192.168.1.1"
}
```

**Validation Rules**:
- Keys automatically expire after 15 minutes (KV TTL = 900 seconds)
- Maximum 5 keys per username prefix allowed before lockout
- Lookups check count of `ratelimit:{username}:*` keys

**State Transitions**:
1. **Created**: Failed login attempt recorded
2. **Active**: Within 15-minute window (contributes to rate limit count)
3. **Expired**: TTL reached, key auto-deleted by KV (no longer counted)

**Cleanup Strategy**:
- Automatic via KV TTL (no manual cleanup required)
- Successful login does NOT clear failed attempts (security best practice)

**Relationships**:
- Many-to-One with User (conceptually, many attempts for one username)

**Indexes**:
- Primary: KV key pattern `ratelimit:{username}:*` for count queries

---

## Supporting Types

### UserRole Enum

```typescript
enum UserRole {
  Reader = "reader",
  Contributor = "contributor"
}
```

**Permissions Matrix**:

| Action | Reader | Contributor |
|--------|--------|-------------|
| View content | ✅ | ✅ |
| Upload photos | ❌ | ❌ (future) |
| Manage users | ❌ | ❌ |

*Note: Current phase treats Reader and Contributor identically. Upload privileges deferred to future work.*

---

## Data Flow Diagrams

### Login Flow
```
1. User submits username/password → Workers /login endpoint
2. Worker looks up User by username in users.json
3. Worker verifies passwordHash with bcrypt.compare()
4. If valid:
   a. Check LoginAttempt count in KV (rate limit)
   b. Generate Session JWT with user role
   c. Set HTTP-only cookie with JWT
   d. Return success
5. If invalid:
   a. Create LoginAttempt in KV with 15-min TTL
   b. Return generic error (don't reveal username validity)
```

### Session Verification Flow
```
1. Client sends request with session cookie → Next.js middleware
2. Middleware extracts JWT from cookie
3. Middleware verifies JWT signature and expiry
4. If valid:
   a. Extract role from JWT
   b. Allow request to protected page
5. If invalid/expired:
   a. Redirect to /login with session expired message
   b. Clear cookie client-side
```

### Logout Flow
```
1. User clicks logout → Workers /logout endpoint
2. Worker clears session cookie (Set-Cookie with Max-Age=0)
3. Redirect to login page
```

---

## Schema Evolution

**V1 (Current)**:
- User, Session, LoginAttempt entities as defined
- Static user list (no user registration)
- Single-tenant (one blog, multiple readers)

**Future Considerations** (Out of Scope):
- V2: Add `User.permissions` array for granular access control
- V3: Add `Photo` entity with `uploadedBy` field linking to User
- V4: Add `AuditLog` entity for security tracking (who accessed what)

---

## Storage Size Estimates

**users.json**:
- Typical size: 10 users × ~200 bytes = 2 KB
- Max expected: 50 users × 200 bytes = 10 KB
- Impact: Negligible (deployed with Worker code)

**Cloudflare KV (LoginAttempt)**:
- Write frequency: Only on failed logins
- Typical volume: <10 failed attempts/day = <10 KV writes/day
- Free tier limit: 1000 writes/day
- Headroom: 100x capacity

**Session Tokens (JWT in cookies)**:
- Cookie size: ~500 bytes (JWT header + payload + signature)
- Browser limit: 4 KB per cookie (safe margin)
- No server-side storage (stateless JWT)

---

## Security Considerations

1. **Password Storage**: Never store plaintext passwords, only bcrypt hashes
2. **Session Tokens**: HTTP-only cookies prevent XSS theft, Secure flag requires HTTPS
3. **Rate Limiting**: Username-based (not IP-based) prevents distributed attacks
4. **Generic Errors**: Login failures never reveal if username exists (FR-019)
5. **Token Expiry**: Short-lived tokens (7 days max) limit compromise window

---

## Testing Implications

**Unit Tests Required** (per spec 60% coverage):
- User lookup by username (case-insensitive)
- Password verification with bcrypt
- Session JWT generation with correct claims
- Session expiry validation
- Rate limit counting (mock KV with 5+ failed attempts)
- Logout cookie clearing

**Test Data**:
```json
{
  "users": [
    {
      "username": "testuser",
      "passwordHash": "$2a$10$<test-hash-for-password-'test123'>",
      "role": "reader"
    },
    {
      "username": "testcontributor",
      "passwordHash": "$2a$10$<test-hash-for-password-'contrib456'>",
      "role": "contributor"
    }
  ]
}
```

---

## Next Steps

✅ Data Model Complete  
→ Proceed to contracts/ (API endpoint definitions)
