# Tasks: Public Blog Viewing

**Input**: Design documents from `/specs/005-public-blog-viewing/`
**Prerequisites**: Feature 004 (Modular Blog Posts) must be deployed with posts API and templates

**Tests**: Tests are OPTIONAL per specification clarifications. Testing uses real published post data in development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Project structure extends existing `travel-blog/` directory:
- Frontend: `travel-blog/src/`
- Types: `travel-blog/src/types/`
- Components: `travel-blog/src/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare infrastructure for public blog viewing

**Status**: ✅ COMPLETE

- [x] T001 [P] Create PostCard component type definitions in travel-blog/src/types/post-card.ts
- [x] T002 [P] Create pagination utility types in travel-blog/src/types/pagination.ts
- [x] T003 [P] Update tsconfig to ensure static export compatibility with generateStaticParams
- [x] T004 [P] Add image placeholder assets to travel-blog/public/images/placeholders/
- [x] T005 Create slug-to-postId mapping utility in travel-blog/src/utils/post-url.ts

---

## Phase 2: User Story 1 - Browse Published Blog Posts (Priority: P1) 🎯 MVP

**Goal**: Public visitors can see a list of all published blog posts on the homepage

**Status**: ✅ COMPLETE

**Independent Test**: Access homepage without authentication, verify all published posts appear with preview info, confirm drafts are hidden

### Frontend - Post List Components (US1)

- [x] T006 [P] [US1] Create PostCard component for list view in travel-blog/src/components/blog/PostCard.tsx
- [x] T007 [P] [US1] Create PostGrid component for displaying post cards in travel-blog/src/components/blog/PostGrid.tsx
- [x] T008 [P] [US1] Create Pagination component in travel-blog/src/components/blog/Pagination.tsx
- [x] T009 [US1] Create placeholder component for empty post list in travel-blog/src/components/blog/EmptyPostList.tsx

### Frontend - Blog Homepage (US1)

- [x] T010 [US1] Create blog homepage at travel-blog/src/app/blog/page.tsx with post list
- [x] T011 [US1] Implement client-side data fetching for published posts in travel-blog/src/app/blog/page.tsx
- [x] T012 [US1] Add pagination logic to blog homepage in travel-blog/src/app/blog/page.tsx
- [x] T013 [US1] Implement loading states and error handling in travel-blog/src/app/blog/page.tsx

### Data Utilities (US1)

- [x] T014 [P] [US1] Create post list fetching utility in travel-blog/src/lib/posts-api.ts
- [x] T015 [P] [US1] Create excerpt generation utility (truncate text) in travel-blog/src/utils/excerpt.ts
- [x] T016 [P] [US1] Create date formatting utility for post dates in travel-blog/src/utils/date-format.ts

**Checkpoint**: ✅ At this point, readers can browse all published posts on /blog homepage

---

## Phase 3: User Story 2 - View Individual Blog Post (Priority: P1) 🎯 MVP

**Goal**: Public visitors can click on a post and view full content with selected template

**Status**: ✅ COMPLETE

**Independent Test**: Click post from list, verify full content displays with correct template, navigation works

### Frontend - Post Detail Page (US2)

- [x] T017 [US2] Create dynamic post route at travel-blog/src/app/blog/[slug]/page.tsx
- [x] T018 [US2] Implement generateStaticParams for all published posts in travel-blog/src/app/blog/[slug]/page.tsx
- [x] T019 [US2] Fetch post data with full content in travel-blog/src/app/blog/[slug]/page.tsx
- [x] T020 [US2] Integrate PostRenderer component to display post content in travel-blog/src/app/blog/[slug]/page.tsx
- [x] T021 [US2] Add error handling for non-existent posts (404) in travel-blog/src/app/blog/[slug]/page.tsx
- [x] T022 [US2] Add error handling for unpublished posts (404/redirect) in travel-blog/src/app/blog/[slug]/page.tsx

### Navigation Components (US2)

- [x] T023 [P] [US2] Create BackToList navigation component in travel-blog/src/components/blog/BackToList.tsx
- [x] T024 [P] [US2] Create PostNavigation component (prev/next) in travel-blog/src/components/blog/PostNavigation.tsx
- [x] T025 [US2] Add navigation links to post detail page in travel-blog/src/app/blog/[slug]/page.tsx

### Data Utilities (US2)

- [x] T026 [P] [US2] Create single post fetching utility in travel-blog/src/lib/posts-api.ts
- [x] T027 [P] [US2] Create post URL generation utility (slug-based) in travel-blog/src/utils/post-url.ts
- [x] T028 [US2] Create 404 page for blog routes in travel-blog/src/app/blog/not-found.tsx

### Backend API Enhancement (US2)

- [x] T029 [US2] Create get-post-by-slug endpoint in travel-blog/workers/posts/get-post-by-slug.ts
- [x] T030 [US2] Add slug route to posts worker in travel-blog/workers/posts/index.ts
- [x] T031 [US2] Deploy posts worker with slug endpoint to production

**Checkpoint**: ✅ At this point, readers can browse and view full individual blog posts

---

## Phase 4: User Story 3 - SEO and Social Sharing (Priority: P2)

**Goal**: Blog posts have proper meta tags for SEO and social media

**Status**: Not Started

**Independent Test**: View page source, validate meta tags with social media preview tools

### SEO Implementation (US3)

- [ ] T029 [P] [US3] Create generateMetadata function for blog homepage in travel-blog/src/app/blog/page.tsx
- [ ] T030 [P] [US3] Create generateMetadata function for post detail pages in travel-blog/src/app/blog/[slug]/page.tsx
- [ ] T031 [P] [US3] Add Open Graph image tags for posts in travel-blog/src/app/blog/[slug]/page.tsx
- [ ] T032 [P] [US3] Add Twitter Card tags for posts in travel-blog/src/app/blog/[slug]/page.tsx
- [ ] T033 [US3] Create SEO metadata utility functions in travel-blog/src/utils/seo-meta.ts

### Structured Data (US3)

- [ ] T034 [P] [US3] Add JSON-LD schema for blog posts in travel-blog/src/components/blog/PostSchema.tsx
- [ ] T035 [P] [US3] Add breadcrumb schema for navigation in travel-blog/src/components/blog/BreadcrumbSchema.tsx
- [ ] T036 [US3] Create sitemap generation for blog posts in travel-blog/src/app/sitemap.ts

**Checkpoint**: Posts are optimized for search engines and social sharing

---

## Phase 5: User Story 4 - Filter and Search Posts (Priority: P3)

**Goal**: Readers can filter posts by criteria and search by keywords

**Status**: Not Started

**Independent Test**: Use filters and search, verify correct posts are displayed

### Filter Components (US4)

- [ ] T037 [P] [US4] Create FilterBar component in travel-blog/src/components/blog/FilterBar.tsx
- [ ] T038 [P] [US4] Create TemplateFilter dropdown in travel-blog/src/components/blog/TemplateFilter.tsx
- [ ] T039 [P] [US4] Create DateRangeFilter component in travel-blog/src/components/blog/DateRangeFilter.tsx
- [ ] T040 [US4] Integrate filters into blog homepage in travel-blog/src/app/blog/page.tsx

### Search Implementation (US4)

- [ ] T041 [P] [US4] Create SearchBox component in travel-blog/src/components/blog/SearchBox.tsx
- [ ] T042 [US4] Implement client-side search logic in travel-blog/src/lib/search.ts
- [ ] T043 [US4] Add search highlighting to post cards in travel-blog/src/components/blog/PostCard.tsx
- [ ] T044 [US4] Add "No results" state for empty search in travel-blog/src/components/blog/NoResults.tsx

### Filter/Search Logic (US4)

- [ ] T045 [P] [US4] Create filter utility functions in travel-blog/src/utils/filters.ts
- [ ] T046 [US4] Add URL query param support for filters in travel-blog/src/app/blog/page.tsx
- [ ] T047 [US4] Add filter/search state management in travel-blog/src/app/blog/page.tsx

**Checkpoint**: Readers can efficiently find posts using filters and search

---

## Phase 6: Polish & Performance

**Purpose**: Performance optimization and UX improvements for production readiness

### Performance Optimization

- [ ] T048 [P] Implement lazy loading for post images in travel-blog/src/components/blog/PostCard.tsx
- [ ] T049 [P] Add image optimization with next/image in travel-blog/src/components/blog/PostCard.tsx
- [ ] T050 [P] Implement infinite scroll option for post list in travel-blog/src/components/blog/InfiniteScroll.tsx
- [ ] T051 Add loading skeleton for post list in travel-blog/src/components/blog/PostListSkeleton.tsx

### User Experience Enhancements

- [ ] T052 [P] Add responsive design for mobile/tablet in travel-blog/src/app/blog/page.tsx
- [ ] T053 [P] Create custom 404 page with blog navigation in travel-blog/src/app/blog/not-found.tsx
- [ ] T054 [P] Add breadcrumb navigation component in travel-blog/src/components/blog/Breadcrumbs.tsx
- [ ] T055 Add post reading time estimate in travel-blog/src/utils/reading-time.ts

### Error Handling

- [ ] T056 [P] Add graceful fallback for broken images in travel-blog/src/components/blog/PostCard.tsx
- [ ] T057 [P] Add error boundary for post display in travel-blog/src/components/blog/PostErrorBoundary.tsx
- [ ] T058 Add offline support messaging in travel-blog/src/components/blog/OfflineNotice.tsx

### Documentation

- [ ] T059 [P] Update deployment guide with static generation notes in docs/deployment.md
- [ ] T060 [P] Document SEO best practices for blog posts in docs/seo-guide.md
- [ ] T061 Update quickstart with public viewing workflow in specs/005-public-blog-viewing/quickstart.md

### Testing & Validation

- [ ] T062 Test blog homepage with various post counts (0, 1, 10, 100+) in travel-blog/tests/e2e/blog-list.spec.ts
- [ ] T063 Test individual post pages across all 10 templates in travel-blog/tests/e2e/post-detail.spec.ts
- [ ] T064 Validate SEO meta tags on all pages in travel-blog/tests/seo/meta-tags.spec.ts
- [ ] T065 Test responsive design on mobile/tablet/desktop in travel-blog/tests/e2e/responsive.spec.ts
- [ ] T066 Validate all success criteria (SC-001 through SC-008) in travel-blog/tests/acceptance/success-criteria.spec.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - Core homepage/list view
- **User Story 2 (Phase 3)**: Depends on Setup + Feature 004 templates - Post detail pages
- **User Story 3 (Phase 4)**: Depends on US1 and US2 completion - SEO enhancement
- **User Story 4 (Phase 5)**: Depends on US1 completion - Filter/search enhancement
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories - **MVP CRITICAL**
- **User Story 2 (P1)**: Requires Setup + Feature 004 templates - **MVP CRITICAL**
- **User Story 3 (P2)**: Requires US1 and US2 complete - Enhancement
- **User Story 4 (P3)**: Requires US1 complete - Enhancement

### Parallel Opportunities

#### Within Setup (Phase 1)
```bash
# Can run simultaneously:
T001, T002  # Type definitions
T004  # Assets
```

#### Within User Story 1
```bash
# Can run simultaneously:
T006, T007, T008, T009  # All components
T014, T015, T016  # All utilities
```

#### Within User Story 2
```bash
# Can run simultaneously:
T023, T024  # Navigation components
T026, T027  # Data utilities
```

#### Within User Story 3
```bash
# Can run simultaneously:
T029, T030, T031, T032  # All meta tag implementations
T034, T035  # Structured data
```

#### Within User Story 4
```bash
# Can run simultaneously:
T037, T038, T039  # All filter components
T041, T042, T043, T044  # All search components
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. **Complete Phase 1: Setup** (T001-T005) - ~1 hour
2. **Complete Phase 2: User Story 1** (T006-T016) - ~6 hours
3. **Complete Phase 3: User Story 2** (T017-T028) - ~8 hours
4. **STOP and VALIDATE**: Test with real published posts
   - Can readers access blog homepage? ✓
   - Are all published posts visible? ✓
   - Are draft posts hidden? ✓
   - Can readers click and view full posts? ✓
   - Do posts render with correct templates? ✓
   - Does navigation work? ✓
5. **Deploy MVP**: Cloudflare Pages rebuild with new routes
6. **Demo**: Show working public blog viewing

**MVP Scope**: ~15 hours total, delivers SC-001, SC-002, SC-003, SC-004, SC-007 (core public viewing)

### Incremental Delivery

1. **Foundation + US1 + US2 (MVP)**: ~15 hours → Deploy/Demo
   - Success Criteria Met: SC-001 through SC-004, SC-007
2. **Add User Story 3 (SEO)**: +4 hours → Deploy/Demo
   - Success Criteria Met: SC-005, SC-006
3. **Add User Story 4 (Filter/Search)**: +5 hours → Deploy/Demo
   - Enhanced user experience, better blog navigation
4. **Polish Phase**: +6 hours → Final production release
   - All edge cases handled, performance optimized

**Total Effort**: ~30 hours for complete feature with all user stories

---

## Task Counts

- **Setup**: 5 tasks
- **User Story 1 (MVP)**: 11 tasks (T006-T016)
- **User Story 2 (MVP)**: 12 tasks (T017-T028)
- **User Story 3**: 8 tasks (T029-T036)
- **User Story 4**: 11 tasks (T037-T047)
- **Polish**: 19 tasks (T048-T066)

**Total**: 66 tasks

**Parallelizable**: 31 tasks marked [P] (47% can run in parallel)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Requires Feature 004 deployed with working posts API
- Static export compatible - uses generateStaticParams for post routes
- Rebuild needed when new posts are published
- Constitution compliance: Static-first maintained (public viewing is all static HTML)
