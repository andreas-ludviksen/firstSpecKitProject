# Tasks: Modular Blog Posts with Interchangeable Design Templates

**Input**: Design documents from `/specs/004-modular-blog-posts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per specification clarifications. Testing uses mocked media with production text/design format as documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Project structure extends existing `travel-blog/` directory:
- Frontend: `travel-blog/src/`
- Workers: `travel-blog/workers/`
- Tests: `travel-blog/tests/`
- Types: `travel-blog/src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database setup

- [X] T001 Create database migration for blog post schema in travel-blog/migrations/004-blog-posts.sql
- [X] T002 Run migration to create tables: blog_posts, design_templates, photo_content, video_content, text_content, post_template_history
- [X] T003 [P] Install Cloudflare Workers dependencies: @cloudflare/workers-types, wrangler in travel-blog/workers/package.json
- [X] T004 [P] Configure Cloudflare Images API credentials in travel-blog/workers/.dev.vars
- [X] T005 [P] Configure Cloudflare R2 bucket for video storage in travel-blog/wrangler.toml
- [X] T006 [P] Create TypeScript types for blog post entities in travel-blog/src/types/blog-post.ts
- [X] T007 [P] Create TypeScript types for design-templates in travel-blog/src/types/design-template.ts
- [X] T008 [P] Create TypeScript types for media content in travel-blog/src/types/media-content.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Implement D1 database client wrapper in travel-blog/workers/lib/db.ts
- [X] T010 [P] Implement Cloudflare Images upload helper in travel-blog/workers/lib/cloudflare-images.ts
- [X] T011 [P] Implement Cloudflare R2 upload helper in travel-blog/workers/lib/cloudflare-r2.ts
- [X] T012 [P] Create slug generation utility in travel-blog/src/utils/slug.ts
- [X] T013 [P] Create UUID generation utility in travel-blog/src/utils/uuid.ts
- [X] T014 Implement authentication middleware for Workers in travel-blog/workers/lib/auth-middleware.ts
- [X] T015 [P] Create base error handling utilities in travel-blog/workers/lib/errors.ts
- [X] T016 [P] Seed design templates data (10 templates) in travel-blog/migrations/004-seed-templates.sql
- [X] T017 Create placeholder image component in travel-blog/src/components/blog/PlaceholderImage.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Blog Post with Content and Design (Priority: P1) 🎯 MVP

**Goal**: Contributors can log in, upload photos/videos, write text, select a design template, and publish a complete blog post

**Independent Test**: Log in as contributor, upload test photos (placeholders) and videos (test URLs), enter text content (production Markdown), select design template, publish post, verify post displays correctly at public URL with all content elements

### Implementation for User Story 1

#### Workers API - Media Upload (US1)

- [ ] T018 [P] [US1] Implement POST /api/media/upload-photo endpoint in travel-blog/workers/media-upload/upload-photo.ts
- [ ] T019 [P] [US1] Implement POST /api/media/upload-video endpoint in travel-blog/workers/media-upload/upload-video.ts
- [ ] T020 [P] [US1] Implement POST /api/media/validate-url endpoint in travel-blog/workers/media-upload/validate-media.ts
- [ ] T021 [US1] Create media upload router in travel-blog/workers/media-upload/index.ts (depends on T018, T019, T020)

#### Workers API - Post Creation (US1)

- [X] T022 [P] [US1] Implement POST /api/posts/create endpoint in travel-blog/workers/posts/create.ts
- [X] T023 [P] [US1] Implement GET /api/posts/{postId} endpoint in travel-blog/workers/posts/get.ts
- [X] T024 [P] [US1] Implement GET /api/posts list endpoint in travel-blog/workers/posts/list.ts
- [X] T025 [P] [US1] Implement DELETE /api/posts/{postId} endpoint in travel-blog/workers/posts/delete.ts
- [X] T026 [US1] Create posts router in travel-blog/workers/posts/index.ts (depends on T022-T025)

#### Workers API - Post Content Updates (US1)

- [X] T027 [P] [US1] Implement PATCH /api/posts/{postId} metadata update in travel-blog/workers/posts/update-metadata.ts
- [X] T028 [P] [US1] Implement PUT /api/posts/{postId}/photos/{photoId} in travel-blog/workers/posts/update-photo.ts
- [X] T029 [P] [US1] Implement DELETE /api/posts/{postId}/photos/{photoId} in travel-blog/workers/posts/delete-photo.ts
- [X] T030 [P] [US1] Implement PUT /api/posts/{postId}/videos/{videoId} in travel-blog/workers/posts/update-video.ts
- [X] T031 [P] [US1] Implement DELETE /api/posts/{postId}/videos/{videoId} in travel-blog/workers/posts/delete-video.ts
- [X] T032 [P] [US1] Implement PUT /api/posts/{postId}/text/{textId} in travel-blog/workers/posts/update-text.ts
- [X] T033 [P] [US1] Implement DELETE /api/posts/{postId}/text/{textId} in travel-blog/workers/posts/delete-text.ts
- [X] T034 [P] [US1] Implement POST /api/posts/{postId}/reorder endpoint in travel-blog/workers/posts/reorder.ts
- [X] T035 [US1] Create content update router in travel-blog/workers/posts/update.ts (depends on T027-T034)

#### Frontend - Post Editor UI (US1)

- [X] T036 [P] [US1] Create MediaUploader component with drag-drop in travel-blog/src/components/blog/MediaUploader.tsx
- [X] T037 [P] [US1] Create PhotoList component with reordering in travel-blog/src/components/blog/PhotoList.tsx
- [X] T038 [P] [US1] Create VideoList component with reordering in travel-blog/src/components/blog/VideoList.tsx
- [X] T039 [P] [US1] Create TextEditor component with Markdown support in travel-blog/src/components/blog/TextEditor.tsx
- [X] T040 [US1] Create PostEditor page in travel-blog/src/app/posts/create/page.tsx (depends on T036-T039)
- [X] T041 [US1] Implement post creation form logic with API integration in travel-blog/src/app/posts/create/page.tsx
- [X] T042 [US1] Add upload progress tracking and error handling in travel-blog/src/components/blog/UploadProgress.tsx

#### Frontend - Template Selection (US1)

- [X] T043 [P] [US1] Create TemplateSelector component in travel-blog/src/components/blog/TemplateSelector.tsx
- [X] T044 [P] [US1] Create TemplateCard component with preview in travel-blog/src/components/blog/TemplateCard.tsx
- [X] T045 [US1] Load template metadata from design-templates.ts in travel-blog/src/data/design-templates.ts

#### Frontend - Post Display (US1)

- [X] T046 [US1] Create dynamic post page route in travel-blog/src/app/posts/[slug]/page.tsx
- [X] T047 [US1] Implement post data fetching with content in travel-blog/src/app/posts/[slug]/page.tsx
- [X] T048 [US1] Create PostRenderer component that loads appropriate template in travel-blog/src/components/blog/PostRenderer.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - contributors can create and publish blog posts with photos, videos, text, and design selection

---

## Phase 4: Design Templates (User Story 1 Continuation)

**Purpose**: Implement 10 design template components (required for US1 to be complete)

**Template Requirements**: Each template implements FR-016 (placeholders for missing content) and FR-017 (hide excess content)

- [X] T049 [P] [US1] Create Template01 "Classic Grid" component in travel-blog/src/components/templates/Template01.tsx
- [X] T050 [P] [US1] Create Template02 "Story Layout" component in travel-blog/src/components/templates/Template02.tsx
- [X] T051 [P] [US1] Create Template03 "Photo Grid Showcase" component in travel-blog/src/components/templates/Template03.tsx
- [X] T052 [P] [US1] Create Template04 "Video-First Layout" component in travel-blog/src/components/templates/Template04.tsx
- [X] T053 [P] [US1] Create Template05 "Masonry Layout" component in travel-blog/src/components/templates/Template05.tsx
- [X] T054 [P] [US1] Create Template06 "Minimal Clean" component in travel-blog/src/components/templates/Template06.tsx
- [X] T055 [P] [US1] Create Template07 "Magazine Style" component in travel-blog/src/components/templates/Template07.tsx
- [X] T056 [P] [US1] Create Template08 "Timeline Journey" component in travel-blog/src/components/templates/Template08.tsx
- [X] T057 [P] [US1] Create Template09 "Split Screen" component in travel-blog/src/components/templates/Template09.tsx
- [X] T058 [P] [US1] Create Template10 "Collage Mix" component in travel-blog/src/components/templates/Template10.tsx
- [X] T059 [US1] Create template registry mapping IDs to components in travel-blog/src/components/templates/index.ts

**Checkpoint**: All 10 templates implemented, User Story 1 MVP complete and deployable

---

## Phase 5: User Story 2 - Change Design Template for Existing Post (Priority: P2)

**Goal**: Contributors can change the design template of an existing post, preserving all content while re-rendering in the new layout

**Independent Test**: Select an existing blog post with content, navigate to template change UI, select a different template from gallery, apply change, verify content displays in new layout while all photos/videos/text remain unchanged in database, verify template history shows the change

### Workers API - Template Changes (US2)

- [ ] T060 [P] [US2] Implement PUT /api/posts/{postId}/template endpoint in travel-blog/workers/posts/change-template.ts
- [ ] T061 [P] [US2] Implement GET /api/posts/{postId}/template/history endpoint in travel-blog/workers/posts/template-history.ts
- [ ] T062 [P] [US2] Implement POST /api/posts/{postId}/template/preview endpoint in travel-blog/workers/posts/template-preview.ts
- [ ] T063 [US2] Add template change routes to posts router in travel-blog/workers/posts/index.ts

### Frontend - Template Change UI (US2)

- [ ] T064 [P] [US2] Create ChangeTemplateModal component in travel-blog/src/components/blog/ChangeTemplateModal.tsx
- [ ] T065 [P] [US2] Create TemplateHistory component in travel-blog/src/components/blog/TemplateHistory.tsx
- [ ] T066 [US2] Add template change button to post editor in travel-blog/src/app/posts/[id]/edit/page.tsx
- [ ] T067 [US2] Implement template change flow with content preservation warnings in travel-blog/src/components/blog/ChangeTemplateModal.tsx
- [ ] T068 [US2] Display template change history timeline in travel-blog/src/components/blog/TemplateHistory.tsx

### Content Preservation Logic (US2)

- [ ] T069 [US2] Implement content overflow/underflow detection in travel-blog/workers/lib/template-validator.ts
- [ ] T070 [US2] Add warning messages for content mismatches in travel-blog/src/components/blog/ContentWarnings.tsx
- [ ] T071 [US2] Create PostTemplateHistory audit trail writer in travel-blog/workers/lib/template-history.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - posts can be created and templates changed freely

---

## Phase 6: User Story 3 - Browse and Preview Available Design Templates (Priority: P3)

**Goal**: Contributors can view all available templates with examples, understand differences, and preview their content in each template before selecting

**Independent Test**: Access template gallery from post editor, view all 10 templates with visual examples and descriptions, select "Preview in Template X" with test content, verify preview shows actual content in that template layout without saving changes, compare multiple templates side-by-side

### Frontend - Template Gallery (US3)

- [ ] T072 [P] [US3] Create TemplateGallery page in travel-blog/src/app/templates/page.tsx
- [ ] T073 [P] [US3] Create TemplateDetailView component in travel-blog/src/components/blog/TemplateDetailView.tsx
- [ ] T074 [US3] Generate template preview examples with sample content in travel-blog/src/data/template-examples.ts
- [ ] T075 [US3] Add template comparison feature to gallery in travel-blog/src/components/blog/TemplateComparison.tsx

### Frontend - Preview Functionality (US3)

- [ ] T076 [P] [US3] Create TemplatePreview component in travel-blog/src/components/blog/TemplatePreview.tsx
- [ ] T077 [US3] Implement preview URL generation with signed tokens in travel-blog/workers/lib/preview-token.ts
- [ ] T078 [US3] Create preview page route in travel-blog/src/app/preview/[postId]/page.tsx
- [ ] T079 [US3] Add "Preview in Template" buttons to template gallery in travel-blog/src/components/blog/TemplateGallery.tsx

### Template Metadata Enhancement (US3)

- [ ] T080 [P] [US3] Add template preview screenshots to public/images/templates/ directory
- [ ] T081 [US3] Update design-templates.ts with descriptions and preview URLs in travel-blog/src/data/design-templates.ts

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional - complete template browsing and preview experience

---

## Phase 7: User Story 4 - Manage External Media References (Priority: P3)

**Goal**: Contributors can provide external URLs for photos/videos instead of uploading files directly, with validation and error handling for broken links

**Independent Test**: Create a post using only external media URLs (YouTube video link, Imgur photo URL), verify URLs are validated and stored correctly, confirm media displays in published post, test broken URL scenario (404) shows placeholder or error indicator

### Workers API - External URL Validation (US4)

- [ ] T082 [US4] Enhance POST /api/media/validate-url with comprehensive checks in travel-blog/workers/media-upload/validate-media.ts
- [ ] T083 [US4] Add external URL support to photo creation in travel-blog/workers/posts/create-photo-from-url.ts
- [ ] T084 [US4] Add external URL support to video creation in travel-blog/workers/posts/create-video-from-url.ts

### Frontend - External URL Input (US4)

- [ ] T085 [P] [US4] Create ExternalUrlInput component in travel-blog/src/components/blog/ExternalUrlInput.tsx
- [ ] T086 [US4] Add "Add from URL" button to MediaUploader in travel-blog/src/components/blog/MediaUploader.tsx
- [ ] T087 [US4] Implement URL validation UI with real-time feedback in travel-blog/src/components/blog/UrlValidator.tsx
- [ ] T088 [US4] Add batch URL import feature (paste multiple URLs) in travel-blog/src/components/blog/BatchUrlImport.tsx

### Error Handling (US4)

- [ ] T089 [P] [US4] Create broken media placeholder component in travel-blog/src/components/blog/BrokenMediaPlaceholder.tsx
- [ ] T090 [US4] Implement client-side URL accessibility check in templates in travel-blog/src/components/templates/MediaErrorBoundary.tsx
- [ ] T091 [US4] Add error indicators for invalid URLs in post editor in travel-blog/src/components/blog/MediaErrorIndicator.tsx

**Checkpoint**: All user stories 1-4 should now be independently functional - complete external media support

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Performance Optimization

- [ ] T092 [P] Implement image lazy loading in all templates in travel-blog/src/components/templates/LazyImage.tsx
- [ ] T093 [P] Add Cloudflare Images variants configuration for responsive images in travel-blog/workers/lib/cloudflare-images.ts
- [ ] T094 [P] Implement CDN cache invalidation on post updates in travel-blog/workers/lib/cache.ts
- [ ] T095 Optimize R2 video delivery with CDN caching in travel-blog/workers/lib/cloudflare-r2.ts

### User Experience Enhancements

- [ ] T096 [P] Add drag-and-drop reordering to photo/video lists in travel-blog/src/components/blog/DraggableMediaList.tsx
- [ ] T097 [P] Implement auto-save for draft posts in travel-blog/src/app/posts/create/page.tsx
- [ ] T098 [P] Add keyboard shortcuts for editor actions in travel-blog/src/components/blog/EditorKeyboardShortcuts.tsx
- [ ] T099 Create mobile-responsive post editor layout in travel-blog/src/app/posts/create/mobile.module.css

### Error Handling & Validation

- [ ] T100 [P] Implement comprehensive form validation in travel-blog/src/utils/validation.ts
- [ ] T101 [P] Add user-friendly error messages for upload failures in travel-blog/src/components/blog/UploadErrorMessages.tsx
- [ ] T102 Add rate limiting to upload endpoints in travel-blog/workers/lib/rate-limit.ts

### Security Hardening

- [ ] T103 [P] Implement file type validation with magic byte checking in travel-blog/workers/lib/file-validator.ts
- [ ] T104 [P] Add CORS configuration for upload endpoints in travel-blog/workers/lib/cors.ts
- [ ] T105 Implement storage quota monitoring and alerts in travel-blog/workers/lib/quota-monitor.ts

### Documentation

- [ ] T106 [P] Update API documentation with all endpoints in docs/api-reference.md
- [ ] T107 [P] Create deployment guide for Cloudflare Workers in docs/deployment.md
- [ ] T108 [P] Document template creation guidelines for admins in docs/template-guide.md
- [ ] T109 Update quickstart.md with final workflow screenshots in specs/004-modular-blog-posts/quickstart.md

### Testing & Validation

- [ ] T110 Run quickstart.md validation with mocked media and production text in travel-blog/tests/e2e/quickstart.spec.ts
- [ ] T111 Validate all success criteria (SC-001 through SC-008) in travel-blog/tests/acceptance/success-criteria.spec.ts
- [ ] T112 Test content overflow/underflow scenarios (FR-016, FR-017) in travel-blog/tests/integration/template-content-handling.spec.ts
- [ ] T113 Test concurrent edit scenarios (FR-018 last-save-wins) in travel-blog/tests/integration/concurrent-edits.spec.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3 + 4)**: Depends on Foundational phase completion - Core MVP functionality
- **User Story 2 (Phase 5)**: Depends on Foundational phase completion - Independent of US1 but logically builds on it
- **User Story 3 (Phase 6)**: Depends on Foundational phase + templates from Phase 4 - Preview requires templates to exist
- **User Story 4 (Phase 7)**: Depends on Foundational phase completion - Independent of other stories
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP CRITICAL**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Requires templates from Phase 4 - Preview functionality needs templates to preview
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

#### User Story 1 (MVP)
1. Workers API endpoints can be built in parallel (T018-T035)
2. Frontend components can be built in parallel after types exist (T036-T045)
3. Post display page requires template components (T046-T048 after T049-T059)
4. Templates can all be built in parallel (T049-T058)

#### User Story 2
1. Workers API endpoints can be built in parallel (T060-T062)
2. Frontend components can be built in parallel (T064-T065)
3. Integration requires API endpoints complete (T066-T068 after T060-T063)

#### User Story 3
1. Gallery pages can be built in parallel (T072-T073)
2. Preview components parallel to gallery (T076-T079)
3. Metadata updates can happen in parallel (T080-T081)

#### User Story 4
1. API enhancements sequential (T082-T084)
2. Frontend components can be built in parallel (T085-T088)
3. Error handling can be built in parallel (T089-T091)

### Parallel Opportunities

#### Within Setup (Phase 1)
```bash
# Can run simultaneously:
T003, T004, T005  # All dependency installations and configs
T006, T007, T008  # All TypeScript type definitions
```

#### Within Foundational (Phase 2)
```bash
# Can run simultaneously:
T010, T011  # Cloudflare Images and R2 helpers
T012, T013  # Utility functions (slug, UUID)
T015, T016  # Error handling and template seeding
```

#### Within User Story 1 - API Layer
```bash
# Can run simultaneously:
T018, T019, T020  # All media upload endpoints
T022, T023, T024, T025  # All post CRUD endpoints
T027-T034  # All content update endpoints (8 endpoints in parallel)
```

#### Within User Story 1 - Frontend Layer
```bash
# Can run simultaneously:
T036, T037, T038, T039  # All editor components
T043, T044  # Template selector components
```

#### Within User Story 1 - Templates
```bash
# All 10 templates in parallel:
T049-T058  # Template01 through Template10
```

#### Within User Story 2
```bash
# Can run simultaneously:
T060, T061, T062  # All template change API endpoints
T064, T065  # UI components (modal and history)
```

#### Within User Story 3
```bash
# Can run simultaneously:
T072, T073  # Gallery and detail view
T076, T077, T078, T079  # All preview components
T080, T081  # Metadata enhancements
```

#### Within User Story 4
```bash
# Can run simultaneously:
T085, T086, T087, T088  # All frontend URL input components
T089, T090, T091  # All error handling components
```

#### Within Polish Phase
```bash
# Can run simultaneously:
T092, T093, T094, T095  # All performance optimizations
T096, T097, T098  # All UX enhancements
T100, T101  # Validation and error messages
T103, T104  # Security features
T106, T107, T108  # All documentation updates
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Complete Phase 1: Setup** (T001-T008) - ~2 hours
2. **Complete Phase 2: Foundational** (T009-T017) - ~4 hours - **CRITICAL BLOCKER**
3. **Complete Phase 3: User Story 1 API** (T018-T035) - ~8 hours
4. **Complete Phase 3: User Story 1 Frontend** (T036-T048) - ~6 hours
5. **Complete Phase 4: Design Templates** (T049-T059) - ~10 hours
6. **STOP and VALIDATE**: Test User Story 1 independently with quickstart.md
   - Can contributors log in? ✓
   - Can they upload photos (placeholders work)? ✓
   - Can they upload videos (test URLs work)? ✓
   - Can they write text (Markdown works)? ✓
   - Can they select template? ✓
   - Can they publish? ✓
   - Does post display correctly? ✓
7. **Deploy MVP**: Cloudflare Pages + Workers
8. **Demo**: Show working blog post creation end-to-end

**MVP Scope**: ~30 hours total, delivers SC-001, SC-003, SC-008 (core post creation functionality)

### Incremental Delivery

1. **Foundation + US1 (MVP)**: ~30 hours → Deploy/Demo
   - Success Criteria Met: SC-001 (post creation < 10 min), SC-003 (10 templates), SC-008 (90%+ success rate)
2. **Add User Story 2**: +8 hours → Deploy/Demo
   - Success Criteria Met: SC-002 (template change < 30s), SC-004 (100% content preservation)
3. **Add User Story 3**: +6 hours → Deploy/Demo
   - Success Criteria Met: SC-007 (template preview available)
4. **Add User Story 4**: +5 hours → Deploy/Demo
   - Success Criteria Met: SC-005 (95%+ URL validation), SC-006 (cross-device compatibility)
5. **Polish Phase**: +8 hours → Final production release
   - All edge cases handled, performance optimized, comprehensive documentation

**Total Effort**: ~57 hours for complete feature with all user stories

### Parallel Team Strategy

With 3 developers available:

**Week 1: Foundation (Together)**
- All: Complete Setup + Foundational (T001-T017) - 6 hours
- **Checkpoint**: Foundation ready for parallel story development

**Week 2-3: Parallel Story Development**
- **Developer A (MVP Owner)**: User Story 1 (T018-T059) - 24 hours
  - API layer → Frontend → Templates
  - **Deliverable**: Working blog post creation (MVP)
- **Developer B**: User Story 2 + User Story 3 (T060-T081) - 14 hours
  - Template changes → Template preview
  - **Deliverable**: Enhanced template experience
- **Developer C**: User Story 4 + Polish (T082-T105) - 13 hours
  - External URLs → Performance/Security
  - **Deliverable**: External media + production hardening

**Week 4: Integration & Polish (Together)**
- All: Testing, documentation, deployment (T106-T113) - 8 hours
- **Deliverable**: Production-ready feature

**Timeline**: ~4 weeks with 3 developers, 2 weeks with 6 developers (more parallelization)

---

## Task Counts

- **Setup**: 8 tasks
- **Foundational**: 9 tasks (CRITICAL BLOCKER)
- **User Story 1 (MVP)**: 42 tasks (T018-T059)
- **User Story 2**: 12 tasks (T060-T071)
- **User Story 3**: 10 tasks (T072-T081)
- **User Story 4**: 10 tasks (T082-T091)
- **Polish**: 23 tasks (T092-T113)

**Total**: 113 tasks

**Parallelizable**: 67 tasks marked [P] (59% can run in parallel with proper coordination)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests use mocked media (placeholders/test URLs) with production text/design format per quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Verify all Success Criteria (SC-001 through SC-008) before final deployment
- Constitution compliance: Static-first maintained (all viewing is static, APIs only for contributor uploads)
