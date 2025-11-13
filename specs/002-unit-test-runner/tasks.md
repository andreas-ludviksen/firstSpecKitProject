# Tasks: Unit Test Suite with Continuous Runner

**Input**: Design documents from `/specs/002-unit-test-runner/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/test-patterns.md ✅

**Tests**: This feature IS ABOUT testing infrastructure - no separate tests needed, the feature validates itself by running

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project root is `C:\git\speckit\firstSpecKitProject\`  
Source code in `src/` (Next.js App Router structure)  
Tests co-located in `__tests__/` directories next to source files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install testing dependencies and create configuration files

- [x] T001 Install Jest and React Testing Library dependencies: `npm install --save-dev jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest`
- [x] T002 [P] Create Jest configuration file `jest.config.js` with next/jest integration
- [x] T003 [P] Create Jest setup file `jest.setup.js` with global test configuration and Next.js mocks
- [x] T004 [P] Update `package.json` with test scripts: test, test:watch, test:coverage
- [x] T005 [P] Update `.gitignore` to exclude coverage/ directory and .next/ test artifacts
- [x] T006 [P] Update `.eslintrc.json` to recognize Jest globals (describe, it, expect, jest)
- [x] T007 [P] Create test utilities directory `__tests__/utils/` for shared test helpers
- [x] T008 Verify Jest configuration by running `npm test` (should show "no tests found")

**Checkpoint**: Testing infrastructure configured and ready for test files

---

## Phase 2: User Story 1 - Developer Runs Tests on Demand (Priority: P1) 🎯 MVP

**Goal**: Enable developers to execute all tests on demand with clear pass/fail results

**Independent Test**: Run `npm test` and verify it executes tests, displays results, and exits with appropriate code

### Implementation for User Story 1

- [x] T009 [P] [US1] Create sample component test `src/components/__tests__/Navigation.test.tsx` testing Navigation component rendering
- [x] T010 [P] [US1] Create sample utility test `src/data/__tests__/travels.test.ts` testing data array structure
- [x] T011 [US1] Run `npm test` and verify both tests execute successfully with clear output
- [x] T012 [US1] Verify test output shows total tests, passed tests, and execution time
- [x] T013 [US1] Intentionally break a test, run `npm test`, and verify failure message includes file location and stack trace
- [x] T014 [US1] Fix broken test and verify `npm test` passes again
- [x] T015 [US1] Verify exit code is 0 for passing tests and non-zero for failing tests

**Checkpoint**: At this point, User Story 1 should be fully functional - developers can run tests on demand

---

## Phase 3: User Story 3 - Developer Writes Component Tests (Priority: P1)

**Goal**: Enable developers to write and run tests for React components with DOM queries and user interactions

**Independent Test**: Create a new component test file, write assertions for rendering and user events, run it successfully

**Note**: US3 promoted to Phase 3 because it's P1 priority (equally critical as US1) and can be developed in parallel with US2

### Implementation for User Story 3

- [x] T016 [P] [US3] Create comprehensive Navigation component test in `src/components/__tests__/Navigation.test.tsx` testing all links render
- [x] T017 [P] [US3] Add test for Navigation active link highlighting based on pathname (mock usePathname)
- [x] T018 [P] [US3] Create Footer component test in `src/components/__tests__/Footer.test.tsx` testing copyright and links
- [x] T019 [P] [US3] Create PhotoGrid component test in `src/components/__tests__/PhotoGrid.test.tsx` testing image rendering
- [x] T020 [US3] Add PhotoGrid test for hover effects using userEvent (simulate mouse interactions)
- [x] T021 [US3] Mock next/image in test and verify images render with correct src/alt attributes
- [x] T022 [US3] Run `npm test` and verify all component tests pass with detailed assertions
- [x] T023 [US3] Update `contracts/test-patterns.md` examples with actual working test code from Navigation/Footer/HighlightPhotoCard

**Checkpoint**: At this point, User Story 3 should be fully functional - developers can write and run component tests ✅

---

## Phase 4: User Story 4 - Developer Writes Data/Logic Unit Tests (Priority: P1)

**Goal**: Enable developers to write and run tests for TypeScript utilities and data transformations

**Independent Test**: Create a utility function test file, write assertions for inputs/outputs, verify edge cases are handled

**Note**: US4 is P1 priority but comes after US3 because component testing is more complex and should be validated first

### Implementation for User Story 4

- [x] T024 [P] [US4] Create test for travels data array in `src/data/__tests__/travels.test.ts` verifying structure and required fields (3 tests passing)
- [x] T025 [P] [US4] Create test for highlightPhotos data in `src/data/__tests__/highlights.test.ts` verifying photo metadata (7 tests passing - date format, unique IDs, image URLs, alt text, optional story)
- [x] T026 [P] [US4] Create utility function `src/utils/formatDate.ts` with test in `src/utils/__tests__/formatDate.test.ts` for date formatting (6 tests - standard format, custom separator, padding, invalid dates, null, undefined)
- [x] T027 [P] [US4] Create utility function `src/utils/filterTravels.ts` with test in `src/utils/__tests__/filterTravels.test.ts` for filtering by country/companion (16 tests - case-insensitive, "All" filter, empty arrays, no matches)
- [x] T028 [US4] Add edge case tests for formatDate (invalid dates, null, undefined) - completed in T026
- [x] T029 [US4] Add edge case tests for filterTravels (empty array, no matches, case sensitivity) - completed in T027
- [x] T030 [US4] Run `npm test` and verify all utility tests pass including edge cases (45 tests passing across 7 test suites)
- [x] T031 [US4] Update `contracts/test-patterns.md` examples with actual utility test code (added formatDate, filterTravels, travels.test.ts, highlights.test.ts examples with source code)

**Checkpoint**: At this point, User Story 4 should be fully functional - developers can write and run utility/logic tests ✅

---

## Phase 5: User Story 2 - Developer Uses Watch Mode During Development (Priority: P2)

**Goal**: Enable developers to run tests continuously with automatic re-runs on file changes

**Independent Test**: Start watch mode with `npm run test:watch`, modify a file, save it, verify tests auto-rerun within 2 seconds

**Note**: US2 is P2 because watch mode enhances productivity but requires working tests first (US1, US3, US4)

### Implementation for User Story 2

- [x] T032 [US2] Verify `npm run test:watch` starts Jest in watch mode with interactive menu
- [x] T033 [US2] Test file change detection: modify `src/components/Navigation.tsx` and verify related tests auto-rerun
- [x] T034 [US2] Test test file change detection: modify `src/components/__tests__/Navigation.test.tsx` and verify only that test reruns
- [x] T035 [US2] Verify watch mode shows re-run within 2 seconds of file save (performance requirement)
- [x] T036 [US2] Test interactive controls: press 'a' to run all tests, verify full suite executes
- [x] T037 [US2] Test interactive controls: press 'f' to run failed tests (intentionally break a test first)
- [x] T038 [US2] Test interactive controls: press 'p' to filter by filename pattern, verify filtering works
- [x] T039 [US2] Test interactive controls: press 't' to filter by test name pattern, verify filtering works
- [x] T040 [US2] Test interactive controls: press 'q' to quit, verify watch mode exits cleanly
- [x] T041 [US2] Verify watch mode stays stable for 10+ minutes with multiple file changes (stability requirement)
- [x] T042 [US2] Update `quickstart.md` with watch mode instructions and keyboard shortcuts

**Checkpoint**: At this point, User Story 2 should be fully functional - developers can use watch mode for continuous testing

---

## Phase 6: User Story 5 - Developer Views Test Coverage (Priority: P3)

**Goal**: Enable developers to generate and view code coverage reports showing tested vs untested code

**Independent Test**: Run `npm run test:coverage`, verify coverage report is generated with statement/branch/function/line metrics

**Note**: US5 is P3 because coverage is helpful but not essential for basic testing workflow

### Implementation for User Story 5

- [x] T043 [US5] Run `npm run test:coverage` and verify coverage report generates in coverage/ directory
- [x] T044 [US5] Verify coverage summary displays in terminal with percentages for statements, branches, functions, lines
- [x] T045 [US5] Open `coverage/lcov-report/index.html` in browser and verify interactive HTML report works
- [x] T046 [US5] Verify coverage report shows uncovered lines highlighted in red for each file
- [x] T047 [US5] Add coverage thresholds to `jest.config.js` (optional - 80% statements, 70% branches, 80% functions, 80% lines)
- [x] T048 [US5] Test threshold enforcement: set unrealistically high thresholds, verify tests fail with coverage warning
- [x] T049 [US5] Reset thresholds to reasonable defaults or remove enforcement (project decision)
- [x] T050 [US5] Verify coverage/ directory is gitignored (should not be committed)
- [x] T051 [US5] Add coverage badge placeholder to README.md (can integrate with CI later)
- [x] T052 [US5] Update `quickstart.md` with coverage instructions and report interpretation guide

**Checkpoint**: At this point, User Story 5 should be fully functional - developers can view test coverage metrics

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cross-platform validation, and final touches

- [x] T053 [P] Verify all tests pass on Windows (PowerShell terminal)
- [x] T054 [P] Add example test for async operations in `src/components/__tests__/AsyncExample.test.tsx` (if any async components exist)
- [x] T055 [P] Add example snapshot test in `src/components/__tests__/Footer.test.tsx` demonstrating snapshot usage (optional)
- [x] T056 [P] Document mocking patterns for Next.js modules (next/navigation, next/image, next/router) in `contracts/test-patterns.md`
- [x] T057 [P] Create shared test utility `__tests__/utils/mockNextImage.ts` for reusable Next.js image mocking
- [x] T058 [P] Create shared test utility `__tests__/utils/renderWithProviders.ts` for components that need context providers (if applicable)
- [x] T059 Update `quickstart.md` with troubleshooting section for common test errors
- [x] T060 Update `.github/copilot-instructions.md` to ensure testing patterns are documented (verify already done in Phase 1)
- [x] T061 Run full test suite `npm test` and verify all tests pass with execution time <10 seconds (performance goal for 50 tests)
- [x] T062 Test suite scalability: ensure tests can scale to 200+ tests with <30s execution (run performance benchmark)
- [x] T063 Validate `quickstart.md` by following it step-by-step as a new developer would
- [x] T064 Create example test demonstrating all common patterns (render, user events, async, mocking, coverage) in `__tests__/examples/AllPatterns.test.tsx`
- [x] T065 Final validation: Run all test commands (test, test:watch, test:coverage) and verify no errors

**Checkpoint**: Feature complete - all user stories implemented and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup - MUST complete for basic test execution
- **User Story 3 (Phase 3)**: Depends on Setup - can run in parallel with US1 (different files)
- **User Story 4 (Phase 4)**: Depends on Setup - can run in parallel with US1/US3 (different files)
- **User Story 2 (Phase 5)**: Depends on US1/US3/US4 having tests to watch - sequential after earlier phases
- **User Story 5 (Phase 6)**: Depends on US1/US3/US4 having tests to measure coverage - sequential after earlier phases
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Setup (Phase 1) - Independent, can run parallel with US1
- **User Story 4 (P1)**: Can start after Setup (Phase 1) - Independent, can run parallel with US1/US3
- **User Story 2 (P2)**: Requires US1/US3/US4 to have test files created (watch mode needs tests to watch)
- **User Story 5 (P3)**: Requires US1/US3/US4 to have test files created (coverage needs tests to measure)

### Within Each User Story

- **US1**: Tasks are sequential (create tests → run → verify → test failures → fix)
- **US3**: Tasks T016-T019 are parallel (different test files), then T020-T023 sequential
- **US4**: Tasks T024-T027 are parallel (different test files), then T028-T031 sequential
- **US2**: Tasks are mostly sequential (test different watch mode features)
- **US5**: Tasks are sequential (generate coverage → verify → configure thresholds)

### Parallel Opportunities

- **Phase 1 (Setup)**: Tasks T002-T007 can all run in parallel (different files)
- **Phase 3 (US3)**: Tasks T016-T019 can run in parallel (4 different test files)
- **Phase 4 (US4)**: Tasks T024-T027 can run in parallel (4 different test files)
- **Phase 7 (Polish)**: Tasks T053-T058 can run in parallel (different documentation/utility files)

---

## Parallel Example: Phase 3 - User Story 3 (Component Tests)

```bash
# Launch all component test files together:
Task T016: "Create Navigation.test.tsx testing all links render"
Task T017: "Add Navigation test for active link highlighting"
Task T018: "Create Footer.test.tsx testing copyright and links"
Task T019: "Create PhotoGrid.test.tsx testing image rendering"

# These 4 tasks create different test files - no conflicts, can run in parallel
```

---

## Parallel Example: Phase 4 - User Story 4 (Utility Tests)

```bash
# Launch all utility test files together:
Task T024: "Create travels.test.ts verifying data structure"
Task T025: "Create highlights.test.ts verifying photo metadata"
Task T026: "Create formatDate.ts + formatDate.test.ts for date formatting"
Task T027: "Create filterTravels.ts + filterTravels.test.ts for filtering"

# These 4 tasks create different test files - no conflicts, can run in parallel
```

---

## Implementation Strategy

### MVP First (Core Testing Capability)

1. **Complete Phase 1: Setup** (T001-T008)
   - Install all dependencies
   - Configure Jest and test environment
   - Verify empty test suite works

2. **Complete Phase 2: User Story 1** (T009-T015)
   - Create sample tests
   - Verify on-demand test execution
   - **STOP and VALIDATE**: Run `npm test` successfully

3. **Add Phase 3: User Story 3** (T016-T023)
   - Create component tests (P1 priority)
   - **STOP and VALIDATE**: Component testing works

4. **Add Phase 4: User Story 4** (T024-T031)
   - Create utility tests (P1 priority)
   - **STOP and VALIDATE**: Utility testing works

**MVP COMPLETE**: Developers can write and run component and utility tests on demand

### Incremental Delivery

1. **Foundation** (Phase 1) → Testing infrastructure ready
2. **+ US1** (Phase 2) → Can run tests on demand (MVP core)
3. **+ US3** (Phase 3) → Can test React components
4. **+ US4** (Phase 4) → Can test TypeScript utilities
5. **+ US2** (Phase 5) → Watch mode for continuous testing
6. **+ US5** (Phase 6) → Coverage reporting
7. **+ Polish** (Phase 7) → Documentation and cross-platform validation

Each phase adds value without breaking previous phases.

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Phase 1 (Setup)
2. **Once Setup is done**:
   - Developer A: Phase 2 (US1 - Basic test execution)
   - Developer B: Phase 3 (US3 - Component tests) - can start in parallel with A
   - Developer C: Phase 4 (US4 - Utility tests) - can start in parallel with A/B
3. **Sequential** (requires tests from US1/US3/US4):
   - Developer A: Phase 5 (US2 - Watch mode)
   - Developer A: Phase 6 (US5 - Coverage)
4. **Together**: Phase 7 (Polish & Documentation)

---

## Validation Checkpoints

### After Setup (Phase 1)
- ✅ `npm test` runs without errors (shows "no tests found")
- ✅ `npm run test:watch` starts watch mode
- ✅ `npm run test:coverage` generates coverage (0% because no tests)
- ✅ Jest config uses next/jest for Next.js integration
- ✅ ESLint recognizes Jest globals

### After US1 (Phase 2)
- ✅ `npm test` executes sample tests successfully
- ✅ Test failures show file locations and stack traces
- ✅ Exit code is 0 for passing tests, non-zero for failures
- ✅ Test output shows execution time and summary

### After US3 (Phase 3)
- ✅ Component tests render React components successfully
- ✅ Can query DOM elements with RTL queries (getByRole, getByText)
- ✅ Can simulate user events (clicks, hovers)
- ✅ Next.js modules (usePathname, next/image) are mocked correctly

### After US4 (Phase 4)
- ✅ Utility tests verify function inputs/outputs
- ✅ Edge cases (null, undefined, empty arrays) are tested
- ✅ TypeScript types are enforced in test files

### After US2 (Phase 5)
- ✅ Watch mode detects file changes within 2 seconds
- ✅ Only affected tests re-run (not full suite)
- ✅ Interactive controls work (a, f, p, t, q)
- ✅ Watch mode stable for 10+ minutes

### After US5 (Phase 6)
- ✅ Coverage report generates in coverage/ directory
- ✅ HTML report shows uncovered lines
- ✅ Coverage metrics include statements, branches, functions, lines
- ✅ Coverage thresholds configurable (optional enforcement)

### After Polish (Phase 7)
- ✅ All tests pass on Windows (cross-platform validation)
- ✅ Full suite executes in <10 seconds (performance goal)
- ✅ Documentation complete (quickstart.md, test-patterns.md)
- ✅ Shared test utilities created for reusability

---

## Success Criteria Mapping

Each task maps to success criteria from spec.md:

- **SC-001** (suite <10s for 50 tests): Validated in T061
- **SC-002** (watch mode <2s re-run): Validated in T035
- **SC-003** (100% pass/fail accuracy): Validated in T011-T014
- **SC-004** (90% debuggable failures): Validated in T013
- **SC-005** (accurate coverage): Validated in T044-T046
- **SC-006** (first test in 5 mins): Validated in quickstart.md and T063
- **SC-007** (200+ tests in <30s): Validated in T062
- **SC-008** (watch mode 4+ hours): Validated in T041
- **SC-009** (cross-platform): Validated in T053
- **SC-010** (95% patterns supported): Validated by comprehensive test examples in T064

---

## Notes

- **[P] tasks** = Different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **No separate test tasks** because this feature IS the testing infrastructure
- **Self-validating**: Each phase validates itself by running the tests it creates
- **Incremental**: Each user story delivers independent value
- **Performance targets**: <10s for 50 tests, <2s watch mode re-run
- **Cross-platform**: Validate on Windows (project development environment)
- **Documentation**: quickstart.md and test-patterns.md updated throughout

**Total Tasks**: 65 tasks across 7 phases  
**MVP Scope**: Phases 1-4 (T001-T031) - Basic test execution with component and utility testing  
**Full Feature**: All 7 phases (T001-T065) - Complete testing infrastructure with watch mode and coverage
