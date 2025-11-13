# Component Contracts

**Feature**: Modern Travel Blog Website  
**Date**: 2025-11-12  
**Purpose**: Define React component interfaces and prop contracts

## Overview

This document defines the TypeScript prop interfaces for all React components. These contracts ensure type safety and clear component APIs.

## Page Components

### LandingPage (`src/app/page.tsx`)

**Purpose**: Display highlight photos and introduce the blog.

**Props**: None (page component, receives no props)

**Data Dependencies**:
- `highlightPhotos` from `@/data/highlights`
- `travelStories` from `@/data/travels` (for metadata)

**Rendered Components**:
- `Navigation` (in layout)
- `HighlightPhoto` (multiple instances)

**Acceptance Criteria**:
- Displays 3-6 highlight photos in responsive grid
- Photos link to respective travel stories
- Loads in <3 seconds
- Responsive on 320px+ screens

---

### TravelsPage (`src/app/travels/page.tsx`)

**Purpose**: Display all travel stories in browsable layout.

**Props**: None (page component)

**Data Dependencies**:
- `travelStories` from `@/data/travels`

**Rendered Components**:
- `Navigation` (in layout)
- `TravelStory` (multiple instances)

**Acceptance Criteria**:
- Shows all 6-10 travel stories
- Stories in reverse chronological order (newest first)
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)

---

### FamilyTipsPage (`src/app/family-tips/page.tsx`)

**Purpose**: Display organized family travel tips by category.

**Props**: None (page component)

**Data Dependencies**:
- `familyTips` from `@/data/familyTips`
- Groups tips by `TipCategory`

**Rendered Components**:
- `Navigation` (in layout)
- `FamilyTip` (multiple instances, grouped)

**Acceptance Criteria**:
- Tips organized into 5-8 visible categories
- Clear category headings
- Scannable layout

---

## Layout Components

### RootLayout (`src/app/layout.tsx`)

**Purpose**: Provide consistent navigation and page structure.

**Props**:
```typescript
interface RootLayoutProps {
  children: React.ReactNode;     // Page content
}
```

**Data Dependencies**:
- `navigationItems` from `@/data/navigation`

**Rendered Components**:
- `Navigation`
- `{children}` (page content)

**Acceptance Criteria**:
- Navigation visible on all pages
- Semantic HTML structure (header, main, footer)
- Accessible skip-to-content link

---

## Presentational Components

### Navigation (`src/components/Navigation.tsx`)

**Purpose**: Site-wide navigation header.

**Props**:
```typescript
interface NavigationProps {
  items?: NavigationItem[];      // Optional: defaults to imported navigationItems
  className?: string;            // Optional: additional CSS classes
}
```

**Behavior**:
- Desktop: Horizontal nav bar with logo + links
- Mobile: Hamburger menu with slide-out drawer
- Highlights current page (active state)

**Acceptance Criteria**:
- All nav links functional
- Keyboard accessible (tab navigation, enter to activate)
- Mobile menu toggles on hamburger click
- Active page visually indicated

---

### HighlightPhoto (`src/components/HighlightPhoto.tsx`)

**Purpose**: Display featured photo with caption on landing page.

**Props**:
```typescript
interface HighlightPhotoProps {
  photo: HighlightPhoto;         // Photo data
  priority?: boolean;            // Optional: Next.js image priority (default false)
  className?: string;            // Optional: additional CSS classes
}
```

**Behavior**:
- Renders optimized image with next/image
- Shows title and optional subtitle overlay
- Links to related travel story
- Hover effect (scale/overlay change)

**Acceptance Criteria**:
- Image loads with lazy loading (unless priority=true)
- Alt text from photo.title
- Link navigates to `/travels#story-{travelStoryId}`
- Responsive image sizing
- Visual hover feedback

---

### TravelStory (`src/components/TravelStory.tsx`)

**Purpose**: Display travel story card on Travels page.

**Props**:
```typescript
interface TravelStoryProps {
  story: TravelStory;            // Story data
  variant?: 'card' | 'full';    // Optional: display mode (default 'card')
  className?: string;            // Optional: additional CSS classes
}
```

**Behavior**:
- **Card variant**: Shows cover image, title, summary, date, duration
- **Full variant**: Shows all images, full description, metadata
- Images optimized with next/image
- Destination, tags displayed

**Acceptance Criteria**:
- Cover image loads with lazy loading
- Summary truncated to 200 chars (card mode)
- Date formatted as "Month Day, Year" (e.g., "June 15, 2024")
- Tags displayed as pills/badges
- Readable on all screen sizes

---

### FamilyTip (`src/components/FamilyTip.tsx`)

**Purpose**: Display individual family travel tip.

**Props**:
```typescript
interface FamilyTipProps {
  tip: FamilyTip;                // Tip data
  showCategory?: boolean;        // Optional: display category label (default false)
  className?: string;            // Optional: additional CSS classes
}
```

**Behavior**:
- Shows tip title and full description
- Optional icon display (if tip.icon provided)
- Optionally shows category badge

**Acceptance Criteria**:
- Title prominent and readable
- Description supports multi-line text
- Icon (if present) renders from icon library
- Accessible (proper heading hierarchy)

---

## Utility Components

### Image (`next/image`)

**Usage**: All image rendering uses Next.js `next/image` component.

**Standard Props**:
```typescript
{
  src: string;                   // Image path from public/
  alt: string;                   // Descriptive alt text (never empty)
  width: number;                 // Intrinsic width
  height: number;                // Intrinsic height
  priority?: boolean;            // Load eagerly (for above-fold images)
  className?: string;            // Tailwind classes
  sizes?: string;                // Responsive sizes attribute
}
```

**Recommended Sizes**:
- Highlight photos: `width={1920} height={1280}` (3:2 ratio)
- Travel story covers: `width={1200} height={800}` (3:2 ratio)
- Travel story gallery: `width={800} height={600}` (4:3 ratio)

**Sizes Attribute Examples**:
```typescript
// Highlight photos (full-width mobile, 1/3 desktop)
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

// Travel story cards (1 col mobile, 2 col tablet, 3 col desktop)
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

---

## Testing Contracts

### Component Test Requirements

Each component must have:

1. **Render test**: Component renders without crashing
2. **Props test**: All props correctly applied
3. **Data test**: Displays provided data accurately
4. **Accessibility test**: Basic a11y checks (aria labels, semantic HTML)
5. **Interaction test** (if applicable): Click handlers, keyboard navigation

**Example Test Structure**:
```typescript
// Navigation.test.tsx
describe('Navigation', () => {
  it('renders all navigation items', () => { /* ... */ });
  it('highlights active page', () => { /* ... */ });
  it('opens mobile menu on hamburger click', () => { /* ... */ });
  it('is keyboard accessible', () => { /* ... */ });
});
```

---

## Type Definitions Location

All component prop types defined in component files:

```typescript
// src/components/Navigation.tsx
export interface NavigationProps {
  items?: NavigationItem[];
  className?: string;
}

export function Navigation({ items, className }: NavigationProps) {
  // Implementation
}
```

Import shared data types from `@/types`:

```typescript
import { NavigationItem } from '@/types';
```

---

## Contract Evolution

When adding new components:

1. Define prop interface with JSDoc comments
2. Mark optional props with `?`
3. Provide sensible defaults in destructuring
4. Export interface for testing
5. Update this document with new contract

**Example**:
```typescript
/**
 * Displays a category badge for filtering travel stories
 */
export interface CategoryBadgeProps {
  /** Category name to display */
  category: string;
  /** Whether badge is in active/selected state */
  isActive?: boolean;
  /** Click handler for filter selection */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function CategoryBadge({ 
  category, 
  isActive = false, 
  onClick, 
  className = '' 
}: CategoryBadgeProps) {
  // Implementation
}
```
