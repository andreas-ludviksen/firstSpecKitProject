# Implementation Plan: User Authentication with Reader and Contributor Roles

**Branch**: `003-user-authentication` | **Date**: 2025-11-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-user-authentication/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement password-based authentication for a Cloudflare Pages-hosted travel blog with two user roles: Reader (read-only access) and Contributor (read access + future upload privileges). Authentication uses Cloudflare Workers for server-side credential verification with bcrypt password hashing. Sessions persist for 7 days with "remember me" option or expire on browser close. Rate limiting enforces 5 failed attempts before 15-minute account lockout. Includes comprehensive Cloudflare deployment documentation and 60% unit test coverage for critical authentication paths.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14.x (static export)  
**Primary Dependencies**: Cloudflare Workers Runtime, bcrypt.js, HTTP-only cookies for session management  
**Storage**: Static JSON files for user credentials (hashed), Cloudflare KV for session storage (optional) or encrypted cookies  
**Testing**: Jest 29.x with @cloudflare/workers-types for Workers testing, 60% minimum coverage  
**Target Platform**: Cloudflare Pages (static hosting) + Cloudflare Workers (authentication logic), modern browsers with JavaScript/cookies  
**Project Type**: Web application (static frontend + serverless backend)  
**Performance Goals**: Login redirect < 1 second, authentication complete < 5 seconds, 50+ concurrent users  
**Constraints**: Cloudflare Pages free tier (no server-side rendering), Workers free tier (100k requests/day), bcrypt cost factor 10-12  
**Scale/Scope**: Small user base (readers + contributors), 3 user stories, 31 functional requirements, comprehensive documentation deliverable

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**⚠️ VIOLATION**: Static-First Architecture - Authentication requires server-side logic (Cloudflare Workers) for secure password hashing and session management

**Justification**: While the constitution mandates static-first architecture, authentication is fundamentally incompatible with pure static hosting due to security requirements:
- Password verification must happen server-side to prevent credential exposure
- Session tokens must be generated and validated securely
- Cloudflare Workers provides minimal server-side logic while maintaining static hosting for content
- This is the minimal deviation required for secure authentication on Cloudflare Pages

**Mitigation**: 
- Core blog content remains static (HTML/CSS/JS)
- Workers used ONLY for authentication endpoints
- All authenticated pages still served as static files after authentication
- Maintains performance goals (login < 5s, content load < 3s)

**✅ PASS**: Performance Standards - Static content delivery maintains < 3s load time, Lighthouse 90+ target preserved  
**✅ PASS**: Responsive Design - Existing travel blog is mobile-first, login page will follow same patterns  
**✅ PASS**: Browser Compatibility - Modern browser requirements (JavaScript, cookies) align with existing blog  
**✅ PASS**: Build and Deployment - Next.js static export process unchanged, Workers deployment documented  
**✅ PASS**: Technology Constraints - TypeScript/Next.js already in use, no new frontend dependencies  
**✅ PASS**: Development Workflow - Git workflow, branch protection, automated builds all maintained

---

### Post-Design Re-Evaluation (Phase 1 Complete)

**Date**: 2025-11-13

**Workers Endpoints Review**:
- ✅ **Minimal API Surface**: Only 3 endpoints (login, logout, verify-session)
- ✅ **Stateless Design**: JWT tokens eliminate need for session database
- ✅ **Static Content Preserved**: All blog pages remain static HTML/CSS/JS
- ✅ **Performance Maintained**: 
  - Login endpoint: < 2s (bcrypt cost 10 = ~100ms)
  - Verify endpoint: < 100ms (JWT validation, no external calls)
  - Static pages: < 3s load time (unchanged)

**Data Model Review**:
- ✅ **User credentials**: Static JSON (2-10 KB) deployed with Worker
- ✅ **Sessions**: Stateless JWT in HTTP-only cookies (no server storage)
- ✅ **Rate limiting**: Optional KV usage (~10 writes/day << 1000/day limit)

**Architecture Integrity**:
- ✅ Next.js static export unchanged (output to `out/` directory)
- ✅ No server-side rendering introduced
- ✅ Cloudflare Workers isolated to `/api/auth/*` routes
- ✅ Blog content delivery remains CDN-based (Cloudflare Pages)

**Conclusion**: Constitution violation justified and minimal. Design maintains static-first principles for all content while adding necessary authentication layer. **APPROVED for implementation.**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
travel-blog/                          # Existing Next.js static blog
├── src/
│   ├── app/                          # Next.js App Router pages (existing)
│   ├── components/                   # React components (existing)
│   │   ├── LoginForm.tsx             # NEW: Login page component
│   │   └── AuthGuard.tsx             # NEW: Authentication wrapper
│   ├── lib/                          # NEW: Client-side utilities
│   │   ├── auth.ts                   # Session management, cookie handling
│   │   └── api-client.ts             # Workers API calls
│   └── middleware.ts                 # NEW: Next.js middleware for auth check
├── workers/                          # NEW: Cloudflare Workers
│   ├── auth/
│   │   ├── login.ts                  # Login endpoint
│   │   ├── logout.ts                 # Logout endpoint
│   │   ├── verify-session.ts         # Session validation
│   │   └── __tests__/                # Worker unit tests
│   ├── lib/
│   │   ├── bcrypt-worker.ts          # Password hashing
│   │   ├── session-manager.ts        # Session token generation
│   │   └── rate-limiter.ts           # Rate limiting logic
│   ├── users.json                    # Static user credentials (hashed)
│   └── wrangler.toml                 # Workers configuration
├── docs/                             # NEW: Cloudflare setup documentation
│   └── cloudflare-setup.md           # Step-by-step deployment guide
└── tests/
    ├── unit/                         # Component and utility tests
    │   ├── LoginForm.test.tsx
    │   └── auth.test.ts
    └── workers/                      # Worker function tests
        ├── login.test.ts
        └── session-manager.test.ts
```

**Structure Decision**: Web application with separation of concerns - static Next.js frontend (existing `travel-blog/src`) + new serverless Workers backend (`travel-blog/workers`). This maintains the existing static blog structure while adding minimal server-side authentication logic in Workers. Documentation added to `docs/` directory for Cloudflare deployment guidance.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Server-side logic (Cloudflare Workers) | Secure password hashing and session management cannot be performed client-side without exposing credentials | Client-side authentication would expose hashed passwords in browser code, enabling offline brute-force attacks. Static hosting alone cannot verify credentials securely. |
| Additional build/deployment target (Workers) | Authentication endpoints require runtime execution environment | Cloudflare Pages supports only static files. Authentication requires dynamic request processing for credential verification and session token generation. |

**Mitigation Strategy**:
- Keep Workers endpoints minimal (3 endpoints: login, logout, verify-session)
- Maintain static-first approach for all content pages
- Document Workers deployment clearly to minimize operational complexity
- Use Cloudflare's integrated Workers platform to avoid separate infrastructure
