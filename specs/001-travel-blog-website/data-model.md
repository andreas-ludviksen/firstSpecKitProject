# Data Model: Modern Travel Blog Website

**Feature**: Modern Travel Blog Website  
**Date**: 2025-11-12  
**Context**: TypeScript interfaces for embedded mock data

## Overview

This document defines the data structures for the travel blog's mock content. All data is embedded in TypeScript files (`src/data/`) with no external database or CMS.

## Core Entities

### TravelStory

Represents a complete travel experience with destination, description, photos, and metadata.

```typescript
interface TravelStory {
  id: number;                    // Unique identifier
  destination: string;           // Location name (e.g., "Paris, France")
  title: string;                 // Story title (e.g., "A Week in the City of Lights")
  description: string;           // Full travel story/blog content (markdown or plain text)
  summary: string;               // Short excerpt (150-200 chars) for preview cards
  images: string[];              // Array of image paths relative to public/ (e.g., "/images/travels/paris-01.jpg")
  coverImage: string;            // Primary image for story card
  date: string;                  // Travel date in ISO format (YYYY-MM-DD)
  duration: string;              // Trip length (e.g., "7 days", "2 weeks")
  travelers: string[];           // Who traveled (e.g., ["Adults", "Kids 6-12"])
  tags: string[];                // Categories (e.g., ["Europe", "City", "Culture"])
}
```

**Validation Rules**:
- `id`: Must be unique across all stories
- `destination`: Required, non-empty string
- `title`: Required, max 100 characters
- `description`: Required, min 200 characters
- `summary`: Required, 150-200 characters
- `images`: Must contain at least 1 image path
- `coverImage`: Must be one of the paths in `images` array
- `date`: Must be valid ISO date string
- `duration`: Required, format: "{number} {days|weeks|months}"
- `travelers`: At least one traveler type
- `tags`: At least one tag

**Example**:
```typescript
{
  id: 1,
  destination: "Paris, France",
  title: "A Week in the City of Lights",
  description: "Our family adventure through the streets of Paris...",
  summary: "Seven magical days exploring Paris with kids, from the Eiffel Tower to hidden bakeries in Montmartre.",
  images: [
    "/images/travels/paris-eiffel.jpg",
    "/images/travels/paris-louvre.jpg",
    "/images/travels/paris-montmartre.jpg"
  ],
  coverImage: "/images/travels/paris-eiffel.jpg",
  date: "2024-06-15",
  duration: "7 days",
  travelers: ["Adults", "Kids 6-12"],
  tags: ["Europe", "City", "Culture", "Family-Friendly"]
}
```

---

### HighlightPhoto

Featured image displayed on the landing page, linked to a travel story.

```typescript
interface HighlightPhoto {
  id: number;                    // Unique identifier
  imageUrl: string;              // Path to image (e.g., "/images/highlights/bali-beach.jpg")
  title: string;                 // Photo caption/title
  subtitle?: string;             // Optional secondary text
  travelStoryId: number;         // Foreign key to TravelStory.id (for linking)
  destination: string;           // Location name (redundant with TravelStory, but useful for display)
  order: number;                 // Display order on landing page (1 = first)
}
```

**Validation Rules**:
- `id`: Must be unique across all highlights
- `imageUrl`: Required, must be valid path
- `title`: Required, max 80 characters
- `subtitle`: Optional, max 120 characters
- `travelStoryId`: Must reference an existing TravelStory.id
- `destination`: Required, non-empty
- `order`: Must be unique, determines display sequence (1-6)

**Relationships**:
- Each HighlightPhoto links to exactly one TravelStory via `travelStoryId`
- Multiple HighlightPhotos can reference the same TravelStory

**Example**:
```typescript
{
  id: 1,
  imageUrl: "/images/highlights/bali-beach.jpg",
  title: "Sunset at Seminyak Beach",
  subtitle: "Finding peace on Bali's western coast",
  travelStoryId: 3,
  destination: "Bali, Indonesia",
  order: 1
}
```

---

### FamilyTip

Travel advice specific to families with children, organized by category.

```typescript
interface FamilyTip {
  id: number;                    // Unique identifier
  category: TipCategory;         // Tip category (see enum below)
  title: string;                 // Tip headline
  description: string;           // Full tip content/advice
  icon?: string;                 // Optional icon name (for UI representation)
  order: number;                 // Display order within category
}

enum TipCategory {
  PACKING = "Packing",
  ENTERTAINMENT = "Entertainment",
  SAFETY = "Safety",
  ACCOMMODATION = "Accommodation",
  FOOD = "Food & Dining",
  TRANSPORTATION = "Transportation",
  ACTIVITIES = "Activities",
  BUDGETING = "Budgeting"
}
```

**Validation Rules**:
- `id`: Must be unique across all tips
- `category`: Must be one of the TipCategory enum values
- `title`: Required, max 100 characters
- `description`: Required, min 100 characters
- `icon`: Optional, if provided must be valid icon identifier
- `order`: Determines sequence within category

**Organization**:
- Tips are grouped by category on the Family Tips page
- Each category displays 1-3 tips
- Total of 5-8 categories with 8-15 total tips

**Example**:
```typescript
{
  id: 1,
  category: TipCategory.PACKING,
  title: "Pack a Surprise Bag",
  description: "Fill a small bag with new toys, books, or activities revealed throughout the trip. Keeps kids engaged during long waits or travel days.",
  icon: "gift",
  order: 1
}
```

---

### NavigationItem

Menu link configuration for site navigation.

```typescript
interface NavigationItem {
  label: string;                 // Display text (e.g., "Travels")
  href: string;                  // Route path (e.g., "/travels")
  order: number;                 // Display order in nav (1 = first)
  isMobileVisible: boolean;      // Show in mobile menu
  isDesktopVisible: boolean;     // Show in desktop menu
}
```

**Validation Rules**:
- `label`: Required, max 30 characters
- `href`: Required, must be valid route (starts with "/")
- `order`: Determines nav item sequence
- Both visibility flags: Default to true

**Example**:
```typescript
const navigationItems: NavigationItem[] = [
  { label: "Home", href: "/", order: 1, isMobileVisible: true, isDesktopVisible: true },
  { label: "Travels", href: "/travels", order: 2, isMobileVisible: true, isDesktopVisible: true },
  { label: "Family Tips", href: "/family-tips", order: 3, isMobileVisible: true, isDesktopVisible: true }
];
```

---

## Data Relationships

```
HighlightPhoto (n) ──> (1) TravelStory
  - Each highlight photo links to one travel story
  - A travel story can have multiple highlight photos

FamilyTip (n) ──> (1) TipCategory
  - Each tip belongs to one category
  - A category contains multiple tips
```

**No relationships between**:
- TravelStory ↔ FamilyTip (independent content types)
- NavigationItem ↔ other entities (configuration only)

## State Transitions

**N/A** - This is a static site with embedded data. No state changes, mutations, or user-generated content.

All data is read-only and defined at build time.

## Sample Data Requirements

Based on spec assumptions:

| Entity | Minimum | Target | Maximum |
|--------|---------|--------|---------|
| TravelStory | 6 | 8 | 10 |
| HighlightPhoto | 3 | 5 | 6 |
| FamilyTip | 8 | 12 | 15 |
| NavigationItem | 3 | 3 | 5 |
| TipCategory (used) | 5 | 6 | 8 |

## File Organization

```typescript
// src/types/index.ts
export interface TravelStory { /* ... */ }
export interface HighlightPhoto { /* ... */ }
export interface FamilyTip { /* ... */ }
export interface NavigationItem { /* ... */ }
export enum TipCategory { /* ... */ }

// src/data/travels.ts
import { TravelStory } from '@/types';
export const travelStories: TravelStory[] = [ /* 8 stories */ ];

// src/data/highlights.ts
import { HighlightPhoto } from '@/types';
export const highlightPhotos: HighlightPhoto[] = [ /* 5 photos */ ];

// src/data/familyTips.ts
import { FamilyTip, TipCategory } from '@/types';
export const familyTips: FamilyTip[] = [ /* 12 tips */ ];

// src/data/navigation.ts
import { NavigationItem } from '@/types';
export const navigationItems: NavigationItem[] = [ /* 3 items */ ];
```

## Type Safety Benefits

1. **Compile-time validation**: TypeScript catches missing/incorrect fields before runtime
2. **Autocomplete**: IDE provides IntelliSense for data structure
3. **Refactoring safety**: Renaming fields updates all references
4. **Documentation**: Types serve as inline documentation
5. **Migration path**: Easy to replace with API/CMS later (same interfaces)

## Future Extensibility

If migrating to CMS or API:
- Keep same TypeScript interfaces
- Replace `import { data }` with `fetch()` calls
- Add loading states and error handling
- No component code changes required (same prop types)
