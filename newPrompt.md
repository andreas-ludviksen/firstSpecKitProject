# SpecKit Travel Blog Project Template

Complete prompts to recreate this Travel Blog project from scratch using SpecKit.

---

## 🚀 Complete Project Setup

### Step 1: Specify the Travel Blog

```
/speckit.specify

I want to build a travel blog website called "Family Adventures Around the World" where our family can share travel experiences, photos, and tips with friends and family.

**Core Features Needed**:

1. **Landing Page** (Feature 001):
   - Hero section with family photo and welcome message
   - Highlight section showing 6 featured travel photos in a responsive grid
   - Navigation to other sections
   - Fully responsive design (mobile to desktop)
   - Fast loading with optimized images

2. **User Authentication** (Feature 003):
   - Two user roles: Readers (view content) and Contributors (can also upload/edit)
   - Login page with username/password authentication
   - Secure session management
   - Protected routes (some pages only for authenticated users)
   - Logout functionality
   - Sessions persist for 7 days (readers) or 24 hours (contributors)

3. **Future Features** (to plan for):
   - Travel stories page (blog posts by location)
   - Family tips page (advice for traveling with kids)
   - Photo gallery with filtering and sorting
   - Contributor upload functionality

**Technical Requirements**:
- Must be a static website (no database) for free hosting
- Fast performance (< 3 second load times)
- Mobile-first responsive design (320px to 1920px screens)
- Modern, clean UI with good accessibility
- Deployable to Cloudflare Pages (free tier)
- Exception: Authentication can use Cloudflare Workers for API endpoints

**Constraints**:
- Budget: Free hosting only (Cloudflare free tier)
- No server-side rendering (static export)
- User credentials stored in JSON files (not a real database)
- Sessions can use Cloudflare KV or encrypted cookies
- Must work on latest 2 versions of major browsers (Chrome, Firefox, Safari, Edge)

**Success Criteria**:
- Lighthouse score 90+ for performance, accessibility, best practices
- Load time under 3 seconds on 3G connection
- Works on phones (320px) to large desktops (1920px)
- Authentication works reliably with proper security
- Can be deployed in under 30 minutes following documentation

Please create a comprehensive specification following this structure:
1. Clarifications section (ask questions about unknowns)
2. User stories with priorities (P1, P2, P3) for Features 001 and 003
3. Acceptance scenarios in Given/When/Then format
4. Functional requirements (FR-XXX) grouped by concern
5. Success criteria (measurable)
6. Edge cases and error handling
7. Dependencies
8. Out of scope items
```

---

### Step 2: Plan the Implementation

```
/speckit.plan

Based on the specification in specs/[feature-number]-[feature-name]/spec.md

**Framework and Technology Stack**:

Frontend:
- Next.js 14.x with App Router (configured for static export - no SSR)
- React 18.x
- TypeScript 5.x (strict mode)
- TailwindCSS 3.x for styling
- next/image for optimized image loading

Authentication Backend:
- Cloudflare Workers for API endpoints (login, logout, verify-session)
- Cloudflare D1 (SQLite) for user storage
- Wrangler CLI for Workers deployment
- itty-router 5.x for routing in Workers
- bcryptjs 3.x for password hashing (cost factor 10)
- jsonwebtoken 9.x for JWT session tokens (HS256 algorithm)
- HTTP-only cookies for session storage (secure, SameSite=None for cross-site)

Storage:
- Cloudflare D1 database for user credentials (replaces static JSON)
- Cloudflare KV for rate limiting (failed login attempts)
- Future-ready for blog posts and media metadata

Testing:
- Jest 29.x as test runner
- React Testing Library 14.x for component tests
- @testing-library/jest-dom for DOM matchers
- @testing-library/user-event for interaction testing
- ts-jest for TypeScript support
- Coverage target: 60% minimum, 80%+ on critical paths

Deployment:
- Cloudflare Pages for static frontend (free tier)
- Cloudflare Workers for authentication endpoints (free tier: 100k requests/day)
- Cloudflare KV for rate limiting (optional)
- GitHub for version control and CI/CD

Development Tools:
- ESLint for linting
- Prettier for code formatting (if desired)
- Node.js 18+ / npm

**Project Structure**:
```
travel-blog/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── data/             # Static data (travels, highlights, tips)
│   ├── types/            # TypeScript type definitions
│   └── middleware.ts     # Route protection middleware
├── workers/              # Cloudflare Workers (auth APIs)
│   ├── auth/
│   │   ├── index.ts      # Main router
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── verify-session.ts
│   ├── lib/              # Shared utilities (JWT, bcrypt, D1 queries)
│   ├── migrations/       # D1 database migrations
│   │   ├── 0001_create_users_table.sql
│   │   └── 0002_seed_test_users.sql
│   └── types.ts
├── tests/                # Test files
│   └── workers/          # Workers unit tests
├── public/
│   └── images/           # Static images
├── docs/                 # Documentation
├── jest.config.js
├── next.config.js        # Configure static export
├── tailwind.config.ts
├── tsconfig.json
└── wrangler.toml         # Cloudflare Workers config
```

**Constitution to Follow**:

Create a `.specify/memory/constitution.md` file with these principles:

1. **Static-First Architecture**: All pages must be statically generated (next export). No server-side rendering except Cloudflare Workers for authentication APIs only.

2. **Performance**: 
   - Page load time < 3 seconds on 3G
   - Lighthouse performance score 90+
   - Optimize images with next/image
   - Minimize bundle size

3. **Responsive Design**:
   - Mobile-first approach
   - Support 320px (small phones) to 1920px (large desktops)
   - Touch-friendly on mobile
   - Readable text sizes

4. **Browser Compatibility**:
   - Support latest 2 versions of Chrome, Firefox, Safari, Edge
   - Graceful degradation for older browsers
   - No experimental features without fallbacks

5. **Build and Deployment**:
   - Automated builds via npm scripts
   - Zero-config deployment to Cloudflare
   - Environment variables for secrets (JWT_SECRET)
   - Clear deployment documentation

Please create an implementation plan with:
1. Technical context summary
2. Constitution check (flag any violations with justification)
3. Architecture decisions with rationale
4. Research phase outcomes
5. Implementation phases (Research, Foundation, Features, Testing, Documentation, Polish)
6. Risk assessment and mitigations
```

---

### Step 3: Generate Tasks

```
/speckit.task

Based on the plan in specs/[feature-number]-[feature-name]/plan.md

Create a comprehensive task breakdown following these principles:

**Task Structure**:
- Sequential numbering: T001, T002, T003...
- Production-critical tasks flagged with [P]
- Grouped by implementation phases
- Each task: 1-3 hours of estimated work
- Test-Driven Development: Write tests BEFORE implementation

**Required Phases**:

Phase 0: Research & Decisions
- Research Next.js static export configuration
- Decide on authentication approach (JWT vs sessions)
- Document bcrypt cost factor decision
- Choose cookie settings (httpOnly, secure, sameSite)
- Create research.md with all decisions and rationale

Phase 1: Foundation
- Initialize Next.js project with TypeScript
- Configure TailwindCSS
- Set up Jest and React Testing Library
- Create TypeScript interfaces for User, Session
- Set up project structure (folders)
- Create wrangler.toml for Workers

Phase 2: Feature Implementation (TDD Approach)
- For EACH user story:
  1. Write unit tests first
  2. Write component tests
  3. Implement to pass tests
  4. Verify all tests pass
- Landing page components and tests
- Authentication flow components and tests
- Workers endpoints with tests
- Route protection middleware with tests

Phase 3: Testing & Quality
- Run full test suite (aim for 60%+ coverage)
- Performance testing (Lighthouse)
- Security audit (if authentication included)
- Cross-browser testing
- Accessibility audit

Phase 4: Documentation
- README.md with setup instructions
- Deployment guide (Cloudflare Pages + Workers)
- Architecture documentation
- Code comments for complex logic
- Test credentials documentation

Phase 5: Polish
- Code review and refactoring
- Error logging improvements
- Input validation and sanitization
- Final validation against acceptance criteria
- Bundle size optimization

**Key Requirements**:
- Document dependencies between tasks
- Identify tasks that can run in parallel
- Include rollback steps for risky changes
- Define validation criteria for each task
```

---

## 📝 Usage Instructions

1. **Copy Step 1 prompt** → Paste into Copilot → Run `/speckit.specify`
2. **Wait for spec.md to be generated** in `specs/001-travel-blog-website/spec.md`
3. **Copy Step 2 prompt** → Paste into Copilot → Run `/speckit.plan`
4. **Wait for plan.md to be generated** in `specs/001-travel-blog-website/plan.md`
5. **Copy Step 3 prompt** → Paste into Copilot → Run `/speckit.task`
6. **Wait for tasks.md to be generated** in `specs/001-travel-blog-website/tasks.md`
7. **Start implementation** by executing tasks in order

For Feature 003 (Authentication), repeat the process with feature-specific requirements.
