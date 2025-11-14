# Implementation Plan: Modular Blog Posts with Interchangeable Design Templates

**Branch**: `004-modular-blog-posts` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-modular-blog-posts/spec.md`

## Summary

This feature implements a modular blog post system where content (photos from Apple Photos, videos from GoPro Cloud, and text) is stored separately from presentation design templates (~10 admin-managed templates). Contributors upload media and text, select a design template, and the system generates blog posts by combining content with the chosen template's layout. Design templates can be changed post-publication without affecting stored content. The system uses optimistic concurrency (last-save-wins) for concurrent edits and displays placeholders for missing content or hides excess content beyond template limits.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14.x (App Router, static export)  
**Primary Dependencies**: React 18.x, TailwindCSS 3.x for UI; Cloudflare Workers for media upload API  
**Storage**: 
- Cloudflare D1 (SQLite) for blog post metadata, content references, design template mappings
- Cloudflare R2 for uploaded photos/videos (object storage, S3-compatible)
- NEEDS CLARIFICATION: Cloudflare Stream vs R2 for video storage/delivery
- NEEDS CLARIFICATION: Cloudflare Images vs R2 for photo storage/optimization
- Apple Photos integration approach (API, manual export, sync mechanism)
- GoPro Cloud integration approach (API, webhooks, sync mechanism)

**Testing**: Jest 29.x, React Testing Library 14.x, ts-jest for TypeScript; mocked media in tests  
**Target Platform**: Static web app (Cloudflare Pages) + Cloudflare Workers for upload/media handling APIs  
**Project Type**: Web application (frontend + backend APIs)  
**Performance Goals**: 
- Post creation < 10 minutes (SC-001)
- Design template switch < 30 seconds (SC-002)
- Page load < 3 seconds on 3G (Constitution requirement)
- Support responsive display 320px to 1920px

**Constraints**: 
- Existing authentication system (from feature 003-user-authentication)
- Free/low-cost Cloudflare tier (Pages, Workers, R2/Stream/Images limits)
- Apple Photos and GoPro Cloud as primary media sources
- Static export for blog post display
- ~10 admin-managed design templates (no contributor creation)

**Scale/Scope**: 
- ~10 design templates
- Typical blog post: 5-10 photos, 1-2 videos, text content
- Edge case: up to 50 photos per post
- Multi-contributor environment (concurrent edits handled)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Static-First Architecture** | ⚠️ PARTIAL VIOLATION | Blog post **display** is fully static (HTML/CSS/JS). **Upload functionality** requires Cloudflare Workers API for media handling. **Justification**: Constitution allows "no backend for core functionality" - viewing posts is core and static; uploading is contributor-only feature requiring API. |
| **II. Performance Standards** | ✅ COMPLIANT | Target < 3 seconds on 3G (SC-002: 30s template switch; SC-001: 10min creation). Image optimization via Cloudflare Images/R2 with variants. Lighthouse 90+ target maintained. |
| **III. Responsive Design** | ✅ COMPLIANT | Mobile-first design templates. SC-006 requires cross-device compatibility. Testing on 320px-1920px viewports. |
| **IV. Browser Compatibility** | ✅ COMPLIANT | Next.js 14 transpilation ensures latest 2 browser versions. Modern CSS Grid/Flexbox with polyfills. |
| **V. Build and Deployment** | ✅ COMPLIANT | Automated build via npm scripts. Static export to Cloudflare Pages. Cloudflare Workers for upload APIs versioned separately. |

**Constitution Compliance Summary**: One justified partial violation (upload API required for media handling). All core functionality (viewing blog posts) remains fully static per constitution.

### Final Check (After Phase 1 Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Static-First Architecture** | ✅ COMPLIANT WITH JUSTIFICATION | **Core viewing**: Fully static - blog posts rendered as HTML/CSS/JS at build time or on-demand. **Contributor upload**: Cloudflare Workers API endpoints for media upload and post CRUD (justified as non-core contributor feature). **Decision**: Use Next.js static export for all blog post pages; Workers only for authenticated contributor actions. |
| **II. Performance Standards** | ✅ COMPLIANT | **Images**: Cloudflare Images with automatic optimization, WebP/AVIF conversion, responsive variants. **Videos**: R2 direct serving with CDN caching. **Page Load**: Static pages load <3s on 3G. **Template Switch**: Client-side re-render <30s (SC-002). **Lighthouse**: 90+ achievable with optimized images and lazy loading. |
| **III. Responsive Design** | ✅ COMPLIANT | **Templates**: All 10 design templates built with mobile-first TailwindCSS. **Breakpoints**: 320px (mobile), 768px (tablet), 1024px (desktop), 1920px (large). **Testing**: Automated responsive tests in Jest/React Testing Library. **Images**: Cloudflare Images variants for different screen sizes. |
| **IV. Browser Compatibility** | ✅ COMPLIANT | **Next.js transpilation**: ES6+ → ES5 for compatibility. **CSS**: Grid/Flexbox with autoprefixer. **Video**: HTML5 `<video>` tag works in all modern browsers. **Testing**: Latest 2 versions of Chrome, Firefox, Safari, Edge. |
| **V. Build and Deployment** | ✅ COMPLIANT | **Static Build**: `npm run build` generates static HTML/CSS/JS. **Deployment**: Cloudflare Pages auto-deploys from Git. **Workers**: Separate `wrangler publish` for API endpoints. **Environment Config**: Build-time injection for Cloudflare credentials. **Versioning**: Git tags for releases. |

**Final Compliance**: ✅ **APPROVED**

- Static-first principle maintained for all public content
- Contributors upload via API (justified as non-core admin feature)
- All performance, responsive, compatibility, and deployment requirements met
- Architecture aligns with existing travel-blog structure

**Re-check Complete**: Architecture approved for implementation. Ready for `/speckit.task` command.

## Project Structure

### Documentation (this feature)

```text
specs/004-modular-blog-posts/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (media storage decisions)
├── data-model.md        # Phase 1 output (entities, relationships)
├── quickstart.md        # Phase 1 output (getting started guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── upload-media.md
│   ├── create-post.md
│   ├── update-post.md
│   └── change-template.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
travel-blog/                    # Existing project root
├── src/
│   ├── app/
│   │   ├── posts/             # Blog post display pages
│   │   │   ├── [id]/          # Individual post page
│   │   │   └── create/        # NEW: Post creation flow
│   │   └── admin/             # NEW: Admin template management
│   ├── components/
│   │   ├── blog/              # NEW: Blog-specific components
│   │   │   ├── PostEditor.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── MediaUploader.tsx
│   │   │   └── TemplatePreview.tsx
│   │   └── templates/         # NEW: Design template components
│   │       ├── Template01.tsx
│   │       ├── Template02.tsx
│   │       └── ...Template10.tsx
│   ├── data/
│   │   └── design-templates.ts # NEW: Template metadata
│   ├── lib/
│   │   └── media-upload.ts    # NEW: Upload utilities
│   └── types/
│       ├── blog-post.ts       # NEW: Blog post types
│       ├── design-template.ts # NEW: Template types
│       └── media-content.ts   # NEW: Media types
├── workers/
│   ├── media-upload/          # NEW: Media upload API
│   │   ├── index.ts
│   │   ├── upload-photo.ts
│   │   ├── upload-video.ts
│   │   └── validate-media.ts
│   └── posts/                 # NEW: Post management API
│       ├── create.ts
│       ├── update.ts
│       └── change-template.ts
├── tests/
│   ├── components/blog/       # NEW: Blog component tests
│   └── workers/media-upload/  # NEW: Upload API tests
└── public/
    └── placeholders/          # NEW: Placeholder images for missing content
```

**Structure Decision**: Extending existing travel-blog web application structure. Adding new blog post creation/management functionality alongside existing features (001-travel-blog-website, 003-user-authentication). Design templates implemented as React components for static rendering. Cloudflare Workers handle media upload and post CRUD operations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Upload API (Cloudflare Workers) | Media upload from Apple Photos/GoPro Cloud requires server-side handling: file size validation, format conversion, storage orchestration, progress tracking | Client-side-only upload insufficient: cannot securely manage R2/Stream credentials, cannot validate large files (50+ photos), cannot handle video transcoding for GoPro content |

---

## Phase 0: Research & Decisions

**Objective**: Resolve all NEEDS CLARIFICATION items from Technical Context and establish architecture decisions.

### Research Tasks

1. **Media Storage Strategy**
   - **Question**: Cloudflare Stream vs R2 for video storage and delivery
   - **Context**: Videos from GoPro Cloud (likely MP4, varying sizes)
   - **Research**: Compare Stream (video platform, HLS/DASH, $5/1000 mins) vs R2 (object storage, $0.015/GB-month, direct file hosting)
   
2. **Image Storage & Optimization**
   - **Question**: Cloudflare Images vs R2 for photo storage and optimization
   - **Context**: Photos from Apple Photos (HEIC/JPEG, high resolution)
   - **Research**: Compare Images (automatic optimization, variants, $5/100k images) vs R2 + manual optimization (sharp/jimp libraries)

3. **Apple Photos Integration**
   - **Question**: How to import photos from Apple Photos to blog
   - **Context**: User wants to upload "selected photos" from Apple Photos library
   - **Research**: iCloud Photos API (requires Apple Developer), manual export workflow, PhotoKit (iOS only), or simple file upload after export

4. **GoPro Cloud Integration**
   - **Question**: How to import videos from GoPro Cloud
   - **Context**: Some videos from GoPro Cloud
   - **Research**: GoPro Plus API (if available), direct upload after download, webhook integration possibilities

5. **Content-Template Rendering**
   - **Question**: How to dynamically render blog posts with different templates at build/run time
   - **Research**: React component mapping, static generation with dynamic data, template engine vs component-based approach

### Expected Outcomes (research.md)

For each research task:
- **Decision**: [Chosen approach]
- **Rationale**: [Why this approach]
- **Alternatives Considered**: [What else evaluated]
- **Implementation Notes**: [Key technical details]
- **Cost/Limits**: [Pricing/quota implications if applicable]

---

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete with all decisions made

### 1. Data Model (data-model.md)

Extract entities from spec and research decisions:

**Core Entities**:
- **BlogPost**: id, title, slug, authorId, createdAt, updatedAt, publishedAt, status (draft/published), designTemplateId
- **DesignTemplate**: id, name, description, component, maxPhotos, maxVideos, requiredTextSections, preview image
- **PhotoContent**: id, postId, url, caption, altText, displayOrder, source (apple-photos/upload), cloudflareImageId (if using CF Images)
- **VideoContent**: id, postId, url, caption, displayOrder, source (gopro/upload), cloudflareStreamId (if using CF Stream)
- **TextContent**: id, postId, sectionName, content (markdown/HTML), displayOrder
- **PostTemplateHistory**: id, postId, templateId, changedAt, changedBy (audit trail for template changes)

**Relationships**:
- BlogPost 1:N PhotoContent, VideoContent, TextContent
- BlogPost N:1 DesignTemplate (current template)
- BlogPost 1:N PostTemplateHistory (audit trail)

**Validation Rules** (from FR):
- FR-016: Allow publishing with partial content (no minimum content enforcement)
- FR-017: Template rendering limits excess content (enforced at display, not storage)
- FR-011: Validate external URLs before accepting

**State Transitions**:
- BlogPost: draft → published (manual trigger)
- MediaContent: uploading → processing → ready → failed

### 2. API Contracts (contracts/ directory)

Generate OpenAPI/contract specs for each Workers endpoint:

**upload-media.md** (Media Upload API):
```
POST /api/media/upload-photo
Request: multipart/form-data (file, postId, caption, altText, displayOrder)
Response: { photoId, url, cloudflareImageId, status }

POST /api/media/upload-video  
Request: multipart/form-data (file, postId, caption, displayOrder)
Response: { videoId, url, cloudflareStreamId, status }

POST /api/media/validate-url
Request: { url, mediaType: 'photo'|'video' }
Response: { valid, accessible, contentType, size }
```

**create-post.md** (Post Creation API):
```
POST /api/posts/create
Request: { title, designTemplateId, authorId }
Response: { postId, slug, status, createdAt }
```

**update-post.md** (Post Update API):
```
PATCH /api/posts/{postId}
Request: { title?, content?, photos?, videos?, text? }
Response: { postId, updatedAt, conflicts? }
Note: Optimistic concurrency - last-save-wins (FR-018)
```

**change-template.md** (Template Change API):
```
PUT /api/posts/{postId}/template
Request: { newTemplateId }
Response: { postId, previousTemplateId, newTemplateId, changedAt }
Note: Content preserved (FR-009), new history record created
```

### 3. Quickstart Guide (quickstart.md)

Step-by-step contributor workflow:
1. Authentication (existing feature 003)
2. Navigate to "Create Post"
3. Upload photos/videos or provide URLs
4. Write text content
5. Select design template
6. Preview with different templates
7. Publish
8. (Optional) Change template later

Include testing instructions with mocked media.

### 4. Agent Context Update

Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`

Add to `.github/copilot-instructions.md`:
- Cloudflare R2/Stream/Images (based on research decision)
- Apple Photos integration approach (based on research)
- GoPro Cloud integration approach (based on research)
- Blog post data model
- Design template component pattern

---

## Phase 2: Planning Complete - Ready for Tasks

After Phase 1 completes:
1. Re-run Constitution Check with final architecture
2. Validate all NEEDS CLARIFICATION resolved
3. Report completion with paths to artifacts
4. Suggest next command: `/speckit.task`

**Artifacts Generated**:
- ✅ plan.md (this file)
- ✅ research.md (Phase 0 - all decisions made)
- ✅ data-model.md (Phase 1 - complete entity model)
- ✅ contracts/upload-media.md (Phase 1 - photo/video upload APIs)
- ✅ contracts/create-post.md (Phase 1 - post creation/retrieval APIs)
- ✅ contracts/update-post.md (Phase 1 - post update/content management APIs)
- ✅ contracts/change-template.md (Phase 1 - template switching API)
- ✅ quickstart.md (Phase 1 - contributor guide)
- ✅ Updated .github/copilot-instructions.md (Phase 1 - agent context)

---

## Planning Summary

### Architecture Decisions Made

**Media Storage**:
- Photos: **Cloudflare Images** ($5/month for 100k images)
  - Automatic optimization, WebP/AVIF conversion
  - Flexible variants (thumbnail, mobile, desktop)
- Videos: **Cloudflare R2** (~$0.23/month for 15GB)
  - S3-compatible object storage
  - Direct MP4 hosting with HTML5 video
- Database: **Cloudflare D1** (SQLite, free tier)

**External Integrations**:
- Apple Photos: Manual export → web upload (Phase 1)
  - Future: iOS Shortcuts for auto-upload (Phase 2)
- GoPro Cloud: Manual download → web upload (Phase 1)
  - Future: Evaluate GoPro Plus API (Phase 2)

**Rendering Strategy**:
- Design templates as React components
- Next.js static export for blog post pages
- Content-template separation via database references
- Client-side template preview without backend calls

**Total Monthly Cost**: ~$5.25 (well within budget)

### Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 14.x (App Router, static export) + React 18.x | Blog post display |
| Styling | TailwindCSS 3.x | Mobile-first responsive design |
| Language | TypeScript 5.x | Type safety across frontend/backend |
| Database | Cloudflare D1 (SQLite) | Blog post metadata, content references |
| Photo Storage | Cloudflare Images | Optimized image delivery with variants |
| Video Storage | Cloudflare R2 | Object storage for MP4 files |
| Upload API | Cloudflare Workers | Media upload, post CRUD endpoints |
| Testing | Jest 29.x + React Testing Library 14.x | Component and integration tests |
| Deployment | Cloudflare Pages (frontend) + Workers (APIs) | Free tier hosting |

### Key Features Implemented

✅ **User Story 1 (P1)**: Create blog post with photos, videos, text, and design selection
- Upload photos from Apple Photos (manual export workflow)
- Upload videos from GoPro Cloud (manual download workflow)
- Select from 10 pre-defined design templates
- Preview content in selected template
- Publish or save as draft

✅ **User Story 2 (P2)**: Change design template for existing post
- Switch templates without content modification (FR-009)
- Content preserved 100% (FR-004, SC-004)
- Template change history tracked (audit trail)
- Content overflow/underflow handled (FR-016, FR-017)

✅ **User Story 3 (P3)**: Browse and preview design templates
- Gallery of 10 templates with visual examples
- Preview own content in different templates
- Compare template layouts side-by-side

✅ **User Story 4 (P3)**: Manage external media references
- Validate external photo/video URLs (FR-011)
- Store references to external media
- Display placeholder for broken URLs

### Data Model Summary

**6 Core Entities**:
1. BlogPost - Post metadata and template selection
2. DesignTemplate - Layout rules and constraints (admin-managed)
3. PhotoContent - Individual photos with Cloudflare Images IDs
4. VideoContent - Individual videos with R2 keys
5. TextContent - Markdown/HTML text sections
6. PostTemplateHistory - Audit trail for template changes

**Relationships**: Content entities reference BlogPost, BlogPost references DesignTemplate

### API Contracts Defined

**4 Contract Files**:
1. **upload-media.md**: Photo/video upload, external URL validation
2. **create-post.md**: Post creation, retrieval, listing, deletion
3. **update-post.md**: Metadata updates, content CRUD, reordering
4. **change-template.md**: Template switching, history, preview

**Total Endpoints**: 15+ REST API endpoints across 4 contract domains

### Testing Strategy

**Component Tests**:
- All 10 design template components tested with React Testing Library
- Mock photo/video content (placeholders, test URLs)
- Production format for text and design logic

**Integration Tests**:
- Upload flow (media → Cloudflare Images/R2 → database)
- Template switching (content preservation validation)
- Content overflow/underflow scenarios

**Coverage Target**: 60% minimum, 80%+ on critical paths

### Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Cloudflare quota exceeded | Monitor usage, alerts at 80%, upgrade plan if needed |
| Large upload timeouts | Chunked upload for videos >100MB, progress UI |
| Manual workflow too slow | Phase 2: iOS Shortcuts, GoPro API integration |
| Template rebuild performance | Incremental regeneration, cache static pages |

### Compliance Status

✅ **Constitution**: All principles met with justified exceptions
✅ **Functional Requirements**: All 18 FRs addressed in design
✅ **Success Criteria**: All 8 SCs measurable and achievable
✅ **Edge Cases**: 6 scenarios resolved with clear behaviors

---

## Next Steps

### Immediate Action

Run `/speckit.task` command to generate implementation task breakdown based on this plan.

### Implementation Phases (Preview)

The task breakdown will follow these phases:

1. **Phase 0: Research** ✅ Complete (decisions in research.md)
2. **Phase 1: Foundation** - Set up project structure, database schema, Workers scaffolding
3. **Phase 2: Media Upload** - Implement Cloudflare Images/R2 upload APIs
4. **Phase 3: Blog Post CRUD** - Create, read, update, delete endpoints
5. **Phase 4: Design Templates** - Build 10 React template components
6. **Phase 5: Template Switching** - Implement template change logic and preview
7. **Phase 6: Testing** - Component tests, integration tests, E2E scenarios
8. **Phase 7: Documentation** - Update docs, deployment guide
9. **Phase 8: Polish** - Performance optimization, error handling, UX improvements

### Expected Deliverables

After task execution:
- Fully functional blog post creation and management system
- 10 design templates with responsive layouts
- Media upload system integrated with Cloudflare Images/R2
- Comprehensive test suite (60%+ coverage)
- Deployment-ready static site + Workers APIs

### Success Validation

Validate against Success Criteria:
- SC-001: Post creation < 10 minutes ✓
- SC-002: Template change < 30 seconds ✓
- SC-003: 10 distinct templates ✓
- SC-004: 100% content preservation ✓
- SC-005: 95%+ URL validation success ✓
- SC-006: Cross-device compatibility ✓
- SC-007: Template preview available ✓
- SC-008: 90%+ first-time success rate ✓

---

**Planning Phase Complete**: All unknowns resolved, architecture defined, contracts specified, ready for task breakdown and implementation.

**Next Command**: `/speckit.task` to generate detailed implementation tasks.
