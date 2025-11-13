# Phase 0: Research & Technical Decisions

**Feature**: Modern Travel Blog Website  
**Date**: 2025-11-12  
**Status**: Complete

## Overview

This document captures the technical research and decisions made for implementing the travel blog as a static Next.js application with embedded mock data.

## Key Technical Decisions

### 1. Framework: Next.js 14 with Static Export

**Decision**: Use Next.js 14 App Router with `output: 'export'` configuration for static site generation.

**Rationale**:
- Next.js provides built-in image optimization via `next/image` (automatic WebP/AVIF, responsive srcsets, lazy loading)
- Static export generates pure HTML/CSS/JS with no server runtime required
- App Router enables modern React patterns (Server Components, layouts, file-based routing)
- Excellent performance out-of-the-box (automatic code splitting, prefetching)
- Meets constitution requirement for static-first architecture

**Alternatives Considered**:
- **Gatsby**: More complex setup, slower build times for simple sites, overkill for this scope
- **Vanilla React + Vite**: Would require manual setup for routing, image optimization, and build pipeline
- **Astro**: Good choice, but team familiarity with Next.js and superior image optimization make Next.js better fit
- **11ty/Hugo**: Static site generators lack React component reusability and modern dev experience

### 2. Styling: TailwindCSS

**Decision**: Use TailwindCSS for styling with mobile-first responsive utilities.

**Rationale**:
- Utility-first approach enables rapid UI development while maintaining consistency
- Built-in responsive design utilities (sm:, md:, lg:, xl:, 2xl:) align with mobile-first requirement
- Automatic purging removes unused CSS, optimizing bundle size for performance
- Modern, sleek design achievable with default design system or custom theme
- Excellent TypeScript/VSCode IntelliSense support

**Alternatives Considered**:
- **CSS Modules**: More verbose, requires more custom CSS writing
- **Styled Components**: Runtime CSS-in-JS impacts performance (not ideal for static sites)
- **Vanilla CSS**: Time-consuming, harder to maintain responsive design system

### 3. Data Structure: Embedded TypeScript Constants

**Decision**: Store all mock data as TypeScript arrays/objects in `src/data/` directory.

**Rationale**:
- Type safety ensures data consistency across components
- No external dependencies or build-time data fetching needed
- Simple, transparent, and easy to modify during development
- Meets requirement for "mocked data, not pulled from content-site"
- Allows easy migration to CMS later if needed (swap data source, keep interfaces)

**Data Organization**:
```typescript
// src/data/travels.ts
export const travelStories: TravelStory[] = [
  { id: 1, destination: "...", description: "...", images: [...], date: "..." },
  // 6-10 stories
];

// src/data/highlights.ts
export const highlightPhotos: HighlightPhoto[] = [
  { id: 1, imageUrl: "...", title: "...", travelId: 1 },
  // 3-6 photos
];

// src/data/familyTips.ts
export const familyTips: FamilyTip[] = [
  { id: 1, category: "Packing", title: "...", description: "..." },
  // 5-8 categories
];
```

**Alternatives Considered**:
- **JSON files**: Less type safety, no auto-completion
- **Markdown with frontmatter**: Overkill for this scope, requires MDX setup
- **External API**: Violates "no content-site" requirement

### 4. Image Optimization Strategy

**Decision**: Use Next.js `next/image` component with responsive images stored in `public/images/`.

**Rationale**:
- Automatic format conversion (WebP/AVIF) for modern browsers
- Responsive image loading with srcset generation
- Lazy loading by default (improves initial page load)
- Placeholder blur effect for better perceived performance
- Meets performance requirement (<3s load time) and constitution (optimized assets)

**Image Guidelines**:
- Source images: 1920px wide for highlights, 1200px for travel stories
- Formats: JPEG/PNG source, Next.js auto-converts to WebP/AVIF
- Compression: Tools like ImageOptim or Squoosh before adding to repo
- Naming: Descriptive names (e.g., `paris-eiffel-tower.jpg`, not `IMG_1234.jpg`)

**Alternatives Considered**:
- **Manual responsive images**: Too much boilerplate, easy to get wrong
- **Standard `<img>` tags**: No optimization, poor performance
- **External image CDN**: Unnecessary complexity for static mock data

### 5. Testing Strategy

**Decision**: Jest + React Testing Library for components, Playwright for E2E flows.

**Rationale**:
- RTL ensures tests focus on user behavior, not implementation details
- Jest provides fast unit test execution with good Next.js integration
- Playwright E2E tests verify critical user journeys (navigation, page loads, responsive behavior)
- Aligns with constitution requirement for testing

**Test Coverage Targets**:
- Unit: All presentational components (Navigation, HighlightPhoto, TravelStory, FamilyTip)
- Integration: Page rendering with mock data
- E2E: P1, P2, P3 user stories from spec

**Alternatives Considered**:
- **Cypress**: Good choice, but Playwright has better TypeScript support and multi-browser testing
- **Vitest**: Newer, less ecosystem support for Next.js testing

### 6. Responsive Design Approach

**Decision**: Mobile-first development with TailwindCSS breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px).

**Rationale**:
- Constitution mandates mobile-first approach
- Spec requires functionality at 320px+ (Tailwind default breakpoint covers this)
- Mobile-first CSS is more performant (base styles small, add complexity for larger screens)
- TailwindCSS utilities make responsive development straightforward

**Breakpoint Strategy**:
- **Base (320px+)**: Single column, stacked navigation, full-width images
- **sm (640px+)**: Two-column grids for travel stories
- **md (768px+)**: Horizontal navigation, three-column grids
- **lg (1024px+)**: Wider max-width, enhanced spacing
- **xl (1280px+)**: Max content width, optimal reading experience

### 7. Performance Optimization Techniques

**Decision**: Implement multiple performance optimizations to meet <3s load time and Lighthouse 90+ targets.

**Techniques**:
1. **Code Splitting**: Next.js automatic route-based splitting
2. **Image Optimization**: next/image with WebP/AVIF, lazy loading
3. **Font Optimization**: next/font for optimized Google Fonts loading
4. **CSS Purging**: TailwindCSS removes unused styles in production
5. **Minification**: Next.js automatic JS/CSS minification
6. **Static Generation**: All pages pre-rendered at build time (no runtime overhead)
7. **Prefetching**: Next.js Link component prefetches linked pages on hover

**Monitoring**:
- Lighthouse CI in GitHub Actions
- Vercel Analytics (if deploying to Vercel)
- Manual testing with Chrome DevTools Performance tab

### 8. Accessibility Standards

**Decision**: Implement WCAG 2.1 Level AA baseline accessibility.

**Implementation**:
- Semantic HTML5 elements (nav, main, article, section)
- Alt text for all images (descriptive, not generic)
- Keyboard navigation support (focus styles, tab order)
- Color contrast ratios meeting AA standards (4.5:1 for text)
- Aria labels where semantic HTML insufficient
- Skip-to-content link for keyboard users

**Testing**:
- axe DevTools browser extension
- Lighthouse accessibility audit
- Manual keyboard navigation testing

### 9. Browser Support Strategy

**Decision**: Support last 2 versions of Chrome, Firefox, Safari, Edge per constitution.

**Implementation**:
- Next.js browserslist configuration targets modern browsers
- Babel transpilation for ES6+ features
- PostCSS Autoprefixer for CSS vendor prefixes
- No experimental CSS/JS features without polyfills
- Progressive enhancement for older browsers (graceful degradation)

**Testing Plan**:
- BrowserStack for cross-browser testing
- Focus on latest 2 versions as specified
- Verify on Windows, macOS, iOS, Android

### 10. Deployment Strategy

**Decision**: Configure for multiple static hosting options (Vercel, Netlify, GitHub Pages).

**Configuration**:
- `next.config.js` with `output: 'export'` and `images.unoptimized: true` for non-Vercel hosts
- `.vercelignore` / `.netlify/` configs as needed
- `npm run build` produces `out/` directory with static files
- No environment variables needed (all data embedded)

**Recommended Host**: Vercel (native Next.js support, automatic optimizations, zero config)

**Alternatives**: Netlify (excellent, requires slight config), GitHub Pages (works but slower), S3+CloudFront (more setup)

## Open Questions Resolved

**Q1**: Should we use Next.js Pages Router or App Router?  
**A**: App Router - newer, better performance, cleaner code, future-proof

**Q2**: How many travel stories should we include in mock data?  
**A**: 8 stories (middle of 6-10 range from spec) - enough variety, not overwhelming

**Q3**: Should images be in repo or external CDN?  
**A**: In repo under `public/images/` - simpler for static site, no external dependencies

**Q4**: What image dimensions should we target?  
**A**: 1920px wide for highlights, 1200px for stories - covers 2x retina displays at reasonable sizes

**Q5**: Should we implement dark mode?  
**A**: Not in initial scope (not mentioned in spec) - can add later if needed

## Dependencies Summary

**Production**:
- `next@14.x` - Framework
- `react@18.x`, `react-dom@18.x` - UI library
- `tailwindcss@3.x` - Styling
- `autoprefixer`, `postcss` - CSS processing

**Development**:
- `typescript@5.x` - Type safety
- `@types/react`, `@types/node` - Type definitions
- `jest@29.x`, `@testing-library/react` - Testing
- `playwright@1.x` - E2E testing
- `eslint`, `prettier` - Code quality

**Optional (Nice to have)**:
- `clsx` or `tailwind-merge` - Conditional class merging
- `@next/bundle-analyzer` - Bundle size analysis

## Next Steps

Phase 0 research complete. Proceed to Phase 1:
1. Create data-model.md (entity schemas)
2. Create contracts/ (component interfaces, if needed)
3. Create quickstart.md (setup instructions)
4. Update agent context with technology stack
