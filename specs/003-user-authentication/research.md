# Research: User Authentication with Reader and Contributor Roles

**Feature**: 003-user-authentication  
**Date**: 2025-11-13  
**Status**: Complete

## Overview

Research conducted to resolve technical unknowns and establish best practices for implementing password-based authentication on Cloudflare Pages with Workers.

---

## Decision 1: Session Storage Strategy

**Question**: Where should session tokens be stored - Cloudflare KV, Durable Objects, or encrypted cookies?

**Decision**: HTTP-only encrypted cookies with JWT

**Rationale**:
- Cloudflare Pages free tier includes Workers but KV storage has write limits (1000 writes/day on free tier)
- HTTP-only cookies prevent XSS attacks
- JWT tokens can be stateless, reducing dependency on external storage
- Session expiry handled via JWT exp claim
- Suitable for small user base (readers + contributors)

**Alternatives Considered**:
1. **Cloudflare KV**: Pros: Distributed storage, server-side session control. Cons: Free tier write limits (1000/day), added latency (~milliseconds), requires cleanup for expired sessions.
2. **Durable Objects**: Pros: Strong consistency, stateful. Cons: Not available on free tier, overkill for authentication.
3. **Cookies only (no JWT)**: Pros: Simplest. Cons: Requires server-side session lookup on every request, no payload storage.

**Selected**: JWT in HTTP-only cookies balances security, performance, and free tier constraints.

---

## Decision 2: Password Hashing Implementation

**Question**: Should we use bcrypt.js (JavaScript) or native bcrypt via WASM in Cloudflare Workers?

**Decision**: bcrypt.js with cost factor 10

**Rationale**:
- bcrypt.js is pure JavaScript, works natively in Cloudflare Workers runtime
- No WASM compilation complexity
- Cost factor 10 provides ~100ms hashing time, acceptable for login flow
- Widely tested and maintained npm package
- Spec clarification confirmed bcrypt with cost 10-12

**Alternatives Considered**:
1. **WASM bcrypt**: Pros: Potentially faster. Cons: Requires WASM bundling, less mature in Workers environment, debugging complexity.
2. **Argon2**: Pros: More modern algorithm. Cons: Limited JavaScript implementations, WASM dependency, spec specified bcrypt.
3. **PBKDF2**: Pros: Native Web Crypto API support. Cons: Less resistant to GPU attacks than bcrypt, spec specified bcrypt.

**Implementation Note**: Use `bcryptjs` npm package (not `bcrypt` which requires native bindings).

---

## Decision 3: Rate Limiting Implementation

**Question**: How to implement rate limiting (5 attempts / 15 minutes) without persistent storage?

**Decision**: Cloudflare KV with TTL for failed attempt tracking

**Rationale**:
- Failed login attempts are write-light (only on failures)
- KV TTL automatically expires records after 15 minutes (no cleanup needed)
- Key structure: `ratelimit:username:timestamp` with 15-minute TTL
- Check count of keys matching `ratelimit:username:*` before allowing login
- Free tier limit (1000 writes/day) sufficient for reasonable attack scenarios

**Alternatives Considered**:
1. **In-memory cache in Worker**: Pros: No KV dependency. Cons: Lost on Worker restart/cold start, not shared across regions.
2. **Client-side tracking**: Pros: No server storage. Cons: Trivially bypassable, insecure.
3. **Cloudflare Rate Limiting Rules**: Pros: Built-in Cloudflare feature. Cons: Requires paid plan, less granular control.

**Fallback**: If KV writes exceed free tier, implement progressive delays without persistence (accept minor security tradeoff).

---

## Decision 4: User Credential Storage

**Question**: Where to store hashed user credentials - KV, static JSON, or environment variables?

**Decision**: Static JSON file (`workers/users.json`) with bcrypt hashes, deployed with Worker

**Rationale**:
- Small user base (readers + contributors) doesn't require database
- Static file deployed with Worker code (no runtime reads from KV)
- Fast lookups (in-memory after Worker initialization)
- User management out of scope (pre-configured accounts)
- Version controlled alongside code for auditability

**Format**:
```json
{
  "users": [
    {
      "username": "reader1",
      "passwordHash": "$2a$10$...",
      "role": "reader"
    },
    {
      "username": "contributor1",
      "passwordHash": "$2a$10$...",
      "role": "contributor"
    }
  ]
}
```

**Alternatives Considered**:
1. **Cloudflare KV**: Pros: Can update without redeployment. Cons: Read latency, unnecessary for static user list.
2. **Environment Variables**: Pros: Secure secret storage. Cons: JSON parsing overhead, less maintainable for multiple users.
3. **Separate auth service**: Pros: Scalable. Cons: Out of scope, added complexity, costs.

---

## Decision 5: Next.js Middleware vs Client-Side Auth Check

**Question**: Should authentication checks happen in Next.js middleware or client-side?

**Decision**: Next.js middleware for initial redirect, client-side for UI state

**Rationale**:
- Next.js middleware runs at edge before page render (during static export serves as redirect logic)
- Middleware checks for valid session cookie, redirects unauthenticated users to `/login`
- Client-side JavaScript validates session and manages UI (logout button, user info display)
- Hybrid approach: Middleware for security, client-side for UX

**Implementation**:
- `middleware.ts` checks cookie presence/validity, redirects to `/login` if missing
- Protected pages call Workers `/verify-session` endpoint on mount
- Expired sessions auto-logout with message (per spec clarification)

**Alternatives Considered**:
1. **Client-side only**: Pros: Simpler. Cons: Flash of unauthenticated content, weaker security.
2. **Server-side only**: Pros: Most secure. Cons: Incompatible with Next.js static export (no SSR).

---

## Decision 6: Cloudflare Workers Routing

**Question**: Should we use a single Worker with routing or multiple Workers (one per endpoint)?

**Decision**: Single Worker with internal routing using `itty-router` library

**Rationale**:
- Cloudflare free tier allows 100k requests/day total across all Workers
- Single Worker reduces deployment complexity
- `itty-router` is lightweight (<1KB), designed for Cloudflare Workers
- Easier to share authentication logic and error handling

**Routes**:
```
POST /api/auth/login       → Login endpoint
POST /api/auth/logout      → Logout endpoint
GET  /api/auth/verify      → Session verification
```

**Alternatives Considered**:
1. **Multiple Workers**: Pros: Cleaner separation. Cons: More complex deployment, route management overhead.
2. **No routing library**: Pros: Fewer dependencies. Cons: Manual URL parsing, error-prone.

---

## Decision 7: JWT Secret Management

**Question**: How to securely manage JWT signing secret in Cloudflare Workers?

**Decision**: Cloudflare Workers Environment Variables (Secrets)

**Rationale**:
- Cloudflare provides encrypted secret storage in Workers dashboard
- Secrets injected at runtime, not in code
- Rotation supported via dashboard without code changes
- Free tier includes secret management

**Setup Process** (for documentation):
```bash
# Via Wrangler CLI
wrangler secret put JWT_SECRET

# Or via Cloudflare Dashboard
# Workers & Pages → [worker] → Settings → Variables → Add Secret
```

**Alternatives Considered**:
1. **Hardcoded in code**: Rejected - insecure, violates best practices.
2. **KV storage**: Possible but secrets feature is purpose-built.

---

## Decision 8: Testing Strategy for Workers

**Question**: How to unit test Cloudflare Workers code (bcrypt, sessions, endpoints)?

**Decision**: Jest with `@cloudflare/workers-types` and manual mocking

**Rationale**:
- Existing Jest setup in project (from feature 002-unit-test-runner)
- `@cloudflare/workers-types` provides TypeScript types for Workers runtime
- Mock Workers environment (Request/Response, KV namespaces)
- Spec requires 60% coverage for critical paths

**Test Structure**:
```typescript
// Mock Cloudflare Workers environment
const mockEnv = {
  RATE_LIMIT_KV: mockKV,
  JWT_SECRET: 'test-secret-key'
};

// Test login endpoint
describe('POST /api/auth/login', () => {
  it('returns JWT token for valid credentials', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'reader1', password: 'pass123' })
    });
    
    const response = await handleLogin(request, mockEnv);
    
    expect(response.status).toBe(200);
    // ... verify JWT cookie set
  });
});
```

**Alternatives Considered**:
1. **Miniflare**: Pros: Full Workers environment simulation. Cons: Heavier dependency, learning curve.
2. **Integration tests only**: Pros: Test real behavior. Cons: Slower, doesn't meet unit test requirement.

---

## Decision 9: Documentation Format for Cloudflare Setup

**Question**: How should the Cloudflare setup guide be structured (spec requires screenshots)?

**Decision**: Markdown file with embedded screenshot references and step-by-step sections

**Structure**:
```markdown
# Cloudflare Setup Guide for Authentication

## Prerequisites
- Cloudflare account (free tier)
- wrangler CLI installed
- Travel blog deployed to Cloudflare Pages

## Part 1: Workers Deployment
1. Install Wrangler (screenshot: terminal)
2. Authenticate Wrangler (screenshot: browser auth flow)
3. Deploy Worker (screenshot: successful deployment)

## Part 2: Environment Variables
1. Navigate to Workers dashboard (screenshot: highlighted menu)
2. Add JWT_SECRET (screenshot: secrets modal)
3. Verify configuration (screenshot: saved secrets)

## Part 3: Routes Configuration
... (step-by-step with screenshots)

## Verification
- Test login endpoint (screenshot: successful response)
- Test authentication flow (screenshot: redirect working)
```

**Screenshot Tool**: Built-in OS screenshot tools, annotated with arrows/highlights using basic image editor.

**Alternatives Considered**:
1. **Video walkthrough**: Spec option A included this, but Option B (selected) is more maintainable.
2. **No screenshots**: Violates spec requirement (FR-033).

---

## Best Practices Summary

### Cloudflare Workers

- **Cold Start Optimization**: Keep Worker bundle small (<1MB), minimize imports
- **Error Handling**: Return consistent JSON error format: `{ error: string, message: string }`
- **CORS**: Configure CORS headers for frontend-to-Worker communication
- **Logging**: Use `console.log` for Cloudflare dashboard logs (free tier includes basic logging)

### Security

- **HTTPS Only**: Cloudflare Pages enforces HTTPS automatically
- **Cookie Flags**: Set `HttpOnly`, `Secure`, `SameSite=Strict` on session cookies
- **Generic Errors**: Never reveal if username exists (per spec FR-019)
- **Rate Limiting**: Implement before password verification to prevent brute-force

### Testing

- **Mock Workers APIs**: Mock KV, Request, Response objects for unit tests
- **Critical Path Coverage**: Focus on login, logout, session verification (per spec)
- **Edge Cases**: Test expired sessions, invalid tokens, rate limit triggers

---

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|----------|---------|---------|
| Frontend | Next.js | 14.x | Static blog (existing) |
| Language | TypeScript | 5.x | Type safety |
| Runtime | Cloudflare Workers | Latest | Serverless authentication |
| Router | itty-router | ^4.0 | Worker endpoint routing |
| Password Hashing | bcryptjs | ^2.4 | Credential verification |
| Session Tokens | jsonwebtoken | ^9.0 | JWT generation/verification |
| Storage | Cloudflare KV | - | Rate limiting (optional) |
| Testing | Jest | 29.x | Unit tests (existing) |
| Workers Types | @cloudflare/workers-types | Latest | TypeScript definitions |
| CLI | Wrangler | ^3.0 | Workers deployment |

---

## Next Steps

✅ Research Complete  
→ Proceed to Phase 1: Data Model & Contracts
