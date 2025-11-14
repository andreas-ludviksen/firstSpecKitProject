# Tasks: User Authentication with Reader and Contributor Roles

**Input**: Design documents from `/specs/003-user-authentication/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Unit tests are REQUIRED per spec (FR-029 to FR-031) - 60% minimum coverage for critical authentication paths

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md, this is a web application with:
- **Frontend**: `travel-blog/src/` (Next.js App Router)
- **Workers**: `travel-blog/workers/` (Cloudflare Workers)
- **Tests**: `travel-blog/tests/` (Jest with @cloudflare/workers-types)
- **Docs**: `travel-blog/docs/` (Cloudflare setup guide)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Workers project initialization and test infrastructure

- [X] T001 Create Workers directory structure in travel-blog/workers/
- [X] T002 Create wrangler.toml configuration file in travel-blog/workers/
- [X] T003 [P] Install Workers dependencies (bcryptjs, jsonwebtoken, itty-router) in travel-blog/workers/
- [X] T004 [P] Install Workers dev dependencies (@cloudflare/workers-types, typescript) in travel-blog/workers/
- [X] T005 [P] Create TypeScript configuration tsconfig.json in travel-blog/workers/
- [X] T006 [P] Create workers/lib/ directory for shared utilities
- [X] T007 [P] Create workers/auth/ directory for authentication endpoints
- [X] T008 [P] Create tests/workers/ directory for Workers unit tests
- [X] T009 Configure Jest for Workers testing in travel-blog/jest.config.js (extend existing config)
- [X] T010 Create script to generate bcrypt hashes in travel-blog/workers/scripts/generate-hash.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create test users.json file with bcrypt hashes in travel-blog/workers/users.json
- [X] T012 [P] Implement bcrypt password hashing utility in travel-blog/workers/lib/password.ts
- [X] T013 [P] Implement JWT token generation and verification in travel-blog/workers/lib/jwt.ts
- [X] T014 [P] Implement rate limiting logic in travel-blog/workers/lib/rate-limiter.ts
- [X] T015 Implement user lookup function in travel-blog/workers/lib/user-service.ts
- [X] T016 [P] Create main Workers router with itty-router in travel-blog/workers/auth/index.ts
- [X] T017 [P] Configure CORS headers for Workers responses in travel-blog/workers/lib/cors.ts
- [X] T018 Create TypeScript types for User, Session, LoginRequest in travel-blog/workers/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Reader Accesses Protected Blog Content (Priority: P1) 🎯 MVP

**Goal**: Enable readers to authenticate with credentials and access all blog content. Implement login flow, session management, logout, and Next.js middleware protection.

**Independent Test**: Navigate to http://localhost:3000 as unauthenticated visitor, verify redirect to /login, enter valid reader credentials (from users.json), verify successful access to homepage/stories/highlights/tips pages, click logout, verify redirect to /login.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T019 [P] [US1] Unit test for login endpoint with valid credentials in tests/workers/login.test.ts
- [X] T020 [P] [US1] Unit test for login endpoint with invalid credentials in tests/workers/login.test.ts
- [X] T021 [P] [US1] Unit test for JWT token generation in tests/workers/jwt.test.ts
- [X] T022 [P] [US1] Unit test for session verification in tests/workers/verify-session.test.ts
- [X] T023 [P] [US1] Unit test for logout endpoint in tests/workers/logout.test.ts
- [X] T024 [P] [US1] Unit test for bcrypt password comparison in tests/workers/password.test.ts

### Implementation for User Story 1

#### Workers API Endpoints

- [X] T025 [P] [US1] Implement POST /api/auth/login endpoint in travel-blog/workers/auth/login.ts
- [X] T026 [P] [US1] Implement GET /api/auth/verify endpoint in travel-blog/workers/auth/verify-session.ts
- [X] T027 [P] [US1] Implement POST /api/auth/logout endpoint in travel-blog/workers/auth/logout.ts
- [X] T028 [US1] Wire up login, verify, logout routes in travel-blog/workers/auth/index.ts

#### Next.js Frontend

- [X] T029 [P] [US1] Create login page UI component in travel-blog/src/app/login/page.tsx
- [X] T030 [P] [US1] Create LoginForm component with username/password fields in travel-blog/src/components/LoginForm.tsx
- [X] T031 [P] [US1] Create auth API client utility in travel-blog/src/lib/api-client.ts
- [X] T032 [US1] Implement Next.js middleware for authentication check in travel-blog/src/middleware.ts
- [X] T033 [P] [US1] Create logout button component in travel-blog/src/components/LogoutButton.tsx
- [X] T034 [US1] Add logout button to existing blog layout

#### Session Management

- [X] T035 [US1] Implement "remember me" checkbox logic in LoginForm component
- [X] T036 [US1] Handle session expiry with auto-redirect in Next.js middleware
- [X] T037 [US1] Display session expired message on login page when redirected

#### Integration & Validation

- [X] T038 [US1] Test full authentication flow locally (Wrangler dev + Next.js dev)
- [X] T039 [US1] Verify JWT cookie has HttpOnly, Secure, SameSite flags
- [X] T040 [US1] Verify 7-day session persistence with "remember me" enabled
- [X] T041 [US1] Verify 24-hour session expiry without "remember me"
- [X] T042 [US1] Run unit tests and verify 60% coverage for login, logout, verify paths

**Checkpoint**: At this point, User Story 1 should be fully functional - readers can log in, access all blog content, and log out

---

## Phase 4: User Story 2 - Contributor Accesses Blog with Future Upload Privileges (Priority: P2)

**Goal**: Enable contributors to authenticate with elevated credentials. System identifies contributor role in session for future upload features (no upload UI yet).

**Independent Test**: Login with contributor credentials from users.json, verify authentication succeeds, verify role="contributor" in JWT token (inspect cookie or API response), verify full read access to all pages, verify no upload UI visible.

### Tests for User Story 2

- [X] T043 [P] [US2] Unit test for login with contributor role in tests/workers/login.test.ts
- [X] T044 [P] [US2] Unit test for role claim in JWT token in tests/workers/jwt.test.ts

### Implementation for User Story 2

- [X] T045 [US2] Update login endpoint to include role in JWT claims (if not already done in T025)
- [X] T046 [US2] Update verify endpoint to return user role (if not already done in T026)
- [X] T047 [P] [US2] Display user role in UI for debugging (optional - can be removed later)
- [X] T048 [US2] Add contributor test user to users.json (if not already present)

#### Integration & Validation

- [X] T049 [US2] Test contributor login flow locally
- [X] T050 [US2] Verify role="contributor" in JWT token payload
- [X] T051 [US2] Verify contributor has same read access as reader
- [X] T052 [US2] Document role differentiation for future upload feature

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - readers and contributors can both authenticate and access content, with contributor role tracked in session

---

## Phase 5: User Story 3 - Failed Login Attempts and Error Handling (Priority: P3)

**Goal**: Implement rate limiting (5 attempts / 15 minutes), generic error messages, validation errors, and security best practices.

**Independent Test**: Attempt login with non-existent username, verify generic error "Invalid credentials". Attempt login with valid username but wrong password, verify same generic error. Attempt 5+ failed logins with same username, verify rate limit error message. Submit empty credentials, verify validation errors.

### Tests for User Story 3

- [X] T053 [P] [US3] Unit test for generic error on non-existent username in tests/workers/login.test.ts
- [X] T054 [P] [US3] Unit test for generic error on wrong password in tests/workers/login.test.ts
- [ ] T055 [P] [US3] Unit test for rate limiting after 5 failed attempts in tests/workers/rate-limiter.test.ts
- [X] T056 [P] [US3] Unit test for validation errors on empty credentials in tests/workers/login.test.ts

### Implementation for User Story 3

#### Rate Limiting (Cloudflare KV)

- [ ] T057 [US3] Create Cloudflare KV namespace for rate limiting (via wrangler CLI or dashboard)
- [ ] T058 [US3] Bind KV namespace in wrangler.toml configuration
- [X] T059 [US3] Implement rate limit check before password verification in login endpoint
- [X] T060 [US3] Implement failed attempt tracking in KV with 15-minute TTL
- [X] T061 [US3] Return 429 Too Many Requests with retry-after header when rate limited

#### Error Handling

- [X] T062 [P] [US3] Implement generic error response for invalid credentials (don't reveal if username exists)
- [X] T063 [P] [US3] Implement validation for empty username/password fields
- [X] T064 [P] [US3] Add timing-attack prevention (constant-time comparison)
- [X] T065 [US3] Display validation errors in LoginForm component
- [X] T066 [US3] Display rate limit error message in LoginForm component
- [X] T067 [US3] Display generic authentication error in LoginForm component

#### Integration & Validation

- [X] T068 [US3] Test failed login with non-existent username (verify generic error)
- [X] T069 [US3] Test failed login with wrong password (verify generic error matches)
- [ ] T070 [US3] Test 5 consecutive failed logins (verify rate limit triggered)
- [ ] T071 [US3] Test 6th attempt returns 429 error
- [X] T072 [US3] Test empty credentials validation
- [ ] T073 [US3] Wait 15+ minutes, verify rate limit resets (or test with shorter TTL)

**Checkpoint**: All user stories should now be independently functional with comprehensive error handling and security protections

---

## Phase 6: Documentation & Deployment (Required Deliverables)

**Purpose**: Cloudflare setup guide with screenshots per FR-032 to FR-036

- [x] T074 [P] Create docs/cloudflare-setup.md with step-by-step guide structure
- [x] T075 [P] Document prerequisite requirements (Cloudflare account, Wrangler CLI)
- [x] T076 [P] Document Wrangler authentication steps with screenshot
- [x] T077 [P] Document Workers deployment steps with screenshot
- [x] T078 [P] Document KV namespace creation with screenshot
- [x] T079 [P] Document JWT_SECRET environment variable setup with screenshot
- [x] T080 [P] Document Cloudflare Pages deployment with screenshot
- [x] T081 [P] Document Workers route configuration with screenshot
- [x] T082 [P] Document verification steps (test login endpoint)
- [x] T083 Document troubleshooting common issues
- [ ] T084 Add annotated screenshots to docs/cloudflare-setup.md (arrows, highlights)
- [ ] T085 Validate setup guide by following it on clean Cloudflare account (verify 30-minute completion per SC-011)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, code quality, performance, and validation

- [x] T086 [P] Add comprehensive error logging in Workers endpoints
- [x] T087 [P] Optimize Workers bundle size (verify < 1MB per research.md)
- [x] T088 [P] Add input sanitization for username/password fields
- [ ] T089 Code review and refactoring for clarity
- [ ] T090 [P] Performance testing (verify login < 5s, verify < 100ms per SC-002, SC-006)
- [x] T091 [P] Security audit (verify bcrypt cost 10-12, JWT secret secure, cookie flags correct)
- [x] T092 Run full test suite and verify 60% coverage achieved (per FR-030)
- [ ] T093 Test with 50+ concurrent users (per SC-010)
- [ ] T094 Validate quickstart.md instructions work for new developer setup
- [x] T095 Update README.md with authentication feature overview
- [ ] T096 Final end-to-end test of all user stories
- [x] T097 Verify all acceptance criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - No dependencies on other stories (can run in parallel with US1)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (Phase 3) for login endpoint - Extends error handling
- **Documentation (Phase 6)**: Can start after User Story 1 is complete - Independent of US2/US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Fully independent, implements core authentication
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 with role differentiation, but independently testable
- **User Story 3 (P3)**: Depends on User Story 1 (Phase 3) - Adds error handling and rate limiting to existing login flow

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Workers endpoints before Next.js frontend (API-first approach)
- Core logic before UI integration
- Unit tests before integration testing
- Story complete and independently validated before moving to next priority

### Parallel Opportunities

#### Phase 1 (Setup)
All tasks marked [P] can run in parallel:
- T003, T004, T005, T006, T007, T008 can all execute simultaneously

#### Phase 2 (Foundational)
Tasks marked [P] can run in parallel:
- T012, T013, T014, T017 can execute simultaneously
- T018 can run in parallel with utilities

#### Phase 3 (User Story 1)
- **Tests**: T019-T024 can all run in parallel (write all test files first)
- **Workers Endpoints**: T025, T026, T027 can run in parallel (different files)
- **Next.js Components**: T029, T030, T031, T033 can run in parallel (different files)
- **Integration**: T038-T042 must run sequentially after implementation

#### Phase 4 (User Story 2)
- T043, T044 can run in parallel (test files)
- T047, T048 can run in parallel (independent changes)

#### Phase 5 (User Story 3)
- **Tests**: T053-T056 can run in parallel
- **Error Handling**: T062, T063, T064 can run in parallel (different concerns)

#### Phase 6 (Documentation)
- T074-T082 can mostly run in parallel (different doc sections)

#### Phase 7 (Polish)
- T086, T087, T088, T090, T091 can all run in parallel (different files/concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for login endpoint with valid credentials in tests/workers/login.test.ts"
Task: "Unit test for login endpoint with invalid credentials in tests/workers/login.test.ts"
Task: "Unit test for JWT token generation in tests/workers/jwt.test.ts"
Task: "Unit test for session verification in tests/workers/verify-session.test.ts"
Task: "Unit test for logout endpoint in tests/workers/logout.test.ts"
Task: "Unit test for bcrypt password comparison in tests/workers/password.test.ts"

# Launch all Workers endpoints together:
Task: "Implement POST /api/auth/login endpoint in travel-blog/workers/auth/login.ts"
Task: "Implement GET /api/auth/verify endpoint in travel-blog/workers/auth/verify-session.ts"
Task: "Implement POST /api/auth/logout endpoint in travel-blog/workers/auth/logout.ts"

# Launch all Next.js components together:
Task: "Create login page UI component in travel-blog/src/app/login/page.tsx"
Task: "Create LoginForm component with username/password fields in travel-blog/src/components/LoginForm.tsx"
Task: "Create auth API client utility in travel-blog/src/lib/api-client.ts"
Task: "Create logout button component in travel-blog/src/components/LogoutButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Complete Phase 1**: Setup (T001-T010) - ~30 minutes
2. **Complete Phase 2**: Foundational (T011-T018) - ~2 hours
   - **CRITICAL CHECKPOINT**: Foundation must be complete before proceeding
3. **Complete Phase 3**: User Story 1 (T019-T042) - ~8 hours
   - Write all tests first (T019-T024) - tests should FAIL
   - Implement Workers endpoints (T025-T028)
   - Implement Next.js frontend (T029-T034)
   - Implement session management (T035-T037)
   - Validate and test (T038-T042)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Can readers log in with valid credentials?
   - Can they access all blog pages?
   - Can they log out?
   - Does "remember me" work?
   - Are all tests passing with 60% coverage?
5. **Deploy/demo if ready** (optional before continuing)

**MVP Deliverable**: Working authentication for readers with login/logout/session management

### Incremental Delivery

1. **Setup + Foundational** (T001-T018) → Foundation ready
2. **Add User Story 1** (T019-T042) → Test independently → **Deploy/Demo (MVP!)**
3. **Add User Story 2** (T043-T052) → Test independently → Deploy/Demo
4. **Add User Story 3** (T053-T073) → Test independently → Deploy/Demo
5. **Add Documentation** (T074-T085) → Production-ready deployment guide
6. **Polish** (T086-T097) → Production-hardened authentication

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (T001-T018)
2. **Once Foundational is done**:
   - **Developer A**: User Story 1 (T019-T042) - Core authentication
   - **Developer B**: Documentation (T074-T085) - Can start after T042 is in review
   - **Developer C**: User Story 2 (T043-T052) - Can start in parallel with US1 if foundation is solid
3. **After US1 complete**:
   - **Developer A**: User Story 3 (T053-T073) - Error handling
   - **Developer B**: Polish (T086-T097) - Quality improvements
   - **Developer C**: Validate documentation on clean account

Stories complete and integrate independently.

---

## Test Coverage Requirements

**Per FR-030**: Minimum 60% code coverage for authentication logic

**Critical Paths Requiring Tests**:
1. **Login Flow** (FR-029):
   - Valid credentials → success
   - Invalid credentials → generic error
   - Empty fields → validation error
   - Rate limited → 429 error

2. **Logout Flow** (FR-029):
   - Logout clears cookie
   - Logout redirects to login
   - Logout always succeeds (even without session)

3. **Session Validation** (FR-029):
   - Valid JWT → authenticated
   - Expired JWT → redirect to login
   - Invalid signature → unauthorized
   - Missing cookie → redirect to login

4. **Supporting Functions**:
   - bcrypt password hashing
   - bcrypt password verification
   - JWT token generation
   - JWT token verification
   - Rate limit tracking

**Coverage Measurement**:
```bash
cd travel-blog
npm run test:coverage
# Verify coverage >= 60% for workers/ directory
```

---

## Success Criteria Validation

Map tasks to success criteria from spec.md:

- **SC-001** (Redirect < 1s): Validate in T038, T090
- **SC-002** (Login < 5s): Validate in T038, T090
- **SC-003** (95% success rate): Monitor in production
- **SC-004** (Session persistence): Validate in T040, T041
- **SC-005** (Error display < 2s): Validate in T068-T072
- **SC-006** (Page load < 3s): Validate in T090
- **SC-007** (Role identification 100%): Validate in T050
- **SC-008** (Logout < 1s): Validate in T038, T090
- **SC-009** (0% unauthorized access): Validate in T096
- **SC-010** (50+ concurrent users): Validate in T093
- **SC-011** (Setup < 30 min): Validate in T085
- **SC-012** (100% deployment success): Validate in T085

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD Approach**: Write tests FIRST (should FAIL), then implement (tests PASS)
- Commit after each task or logical group of [P] tasks
- Stop at any checkpoint to validate story independently
- **Coverage Goal**: Run `npm run test:coverage` frequently, aim for 60%+ in workers/ directory
- **Local Testing**: Use `wrangler dev` + `npm run dev` to test full stack locally per quickstart.md
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Quick Reference

**Total Tasks**: 97  
**MVP Tasks** (Setup + Foundational + US1): T001-T042 (42 tasks)  
**Test Tasks**: T019-T024, T043-T044, T053-T056 (14 tasks)  
**Parallelizable Tasks**: 45 tasks marked [P]  

**Estimated Time**:
- MVP (Setup + Foundational + US1): ~10-12 hours
- Full Feature (All phases): ~20-25 hours
- Documentation: ~3-4 hours
- Polish & Testing: ~2-3 hours
