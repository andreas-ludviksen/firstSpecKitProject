# Test Patterns & Contracts

**Feature**: 002-unit-test-runner  
**Purpose**: Standard testing patterns, configuration examples, and common test structures  
**Last Updated**: 2025-11-13

---

## Table of Contents
1. [Common Testing Patterns](#common-testing-patterns)
2. [Configuration Examples](#configuration-examples)
3. [Component Test Examples](#component-test-examples)
4. [Utility Test Examples](#utility-test-examples)
5. [Mocking Patterns](#mocking-patterns)
6. [Best Practices](#best-practices)

---

## Common Testing Patterns

### Pattern 1: Component Rendering Test

**Purpose**: Verify that a React component renders without crashing and displays expected content.

**When to Use**: Every component should have at least one rendering test.

**Structure**:
```typescript
import { render, screen } from '@testing-library/react';
import ComponentName from '@/components/ComponentName';

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('displays expected text content', () => {
    render(<ComponentName title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

**Contract**:
- ✅ Use `render()` from React Testing Library
- ✅ Query by semantic roles/labels (getByRole, getByLabelText)
- ✅ Assert presence with `toBeInTheDocument()`
- ❌ Don't query by test IDs unless necessary
- ❌ Don't test implementation details (state, props directly)

---

### Pattern 2: User Interaction Test

**Purpose**: Simulate user actions (clicks, typing, hovering) and verify resulting behavior.

**When to Use**: Testing interactive components (buttons, forms, navigation).

**Structure**:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/Button';

describe('Button interactions', () => {
  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    await user.click(screen.getByRole('button', { name: /click me/i }));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    
    await user.click(button); // Attempt click
    expect(handleClick).not.toHaveBeenCalled(); // Should not fire
  });
});
```

**Contract**:
- ✅ Use `userEvent.setup()` for realistic interactions
- ✅ Use `await` with user events (they're async)
- ✅ Query by accessible roles and names
- ✅ Test both expected behavior and edge cases
- ❌ Don't use `fireEvent` (less realistic than userEvent)
- ❌ Don't test internal state changes (test behavior)

---

### Pattern 3: Async Operations Test

**Purpose**: Test components that fetch data, handle promises, or wait for async updates.

**When to Use**: Components with useEffect, data fetching, timers, or async state.

**Structure**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import DataComponent from '@/components/DataComponent';

describe('DataComponent async behavior', () => {
  it('displays loading state initially', () => {
    render(<DataComponent />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays data after fetch completes', async () => {
    render(<DataComponent />);
    
    // Wait for loading to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Data should now be visible
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    
    render(<DataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

**Contract**:
- ✅ Use `waitFor()` for async state changes
- ✅ Use `findBy*` queries (they wait automatically)
- ✅ Test loading, success, and error states
- ✅ Mock async dependencies (fetch, timers)
- ❌ Don't use `act()` directly (React Testing Library handles it)
- ❌ Don't use arbitrary waits (setTimeout) - use waitFor

---

### Pattern 4: Mocking Next.js Dependencies

**Purpose**: Mock Next.js-specific modules (navigation, router, images).

**When to Use**: Components that use next/navigation, next/router, next/image.

**Structure**:
```typescript
// At top of test file, before imports
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

describe('Navigation with mocked Next.js', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('highlights active link based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/about');
    
    render(<Navigation />);
    
    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toHaveClass('active');
  });

  it('shows different active link for different pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/contact');
    
    render(<Navigation />);
    
    const contactLink = screen.getByRole('link', { name: /contact/i });
    expect(contactLink).toHaveClass('active');
  });
});
```

**Contract**:
- ✅ Mock at module level (before imports)
- ✅ Type cast mocks: `as jest.Mock`
- ✅ Clear mocks in beforeEach for isolation
- ✅ Return different values per test case
- ❌ Don't mock the entire Next.js module (only what you need)
- ❌ Don't forget to restore mocks between tests

---

### Pattern 5: Snapshot Testing (Use Sparingly)

**Purpose**: Capture component output for regression detection.

**When to Use**: Only for stable components where structure rarely changes.

**Structure**:
```typescript
import { render } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Footer />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

**Contract**:
- ✅ Use for stable, rarely-changing components
- ✅ Review snapshot diffs carefully
- ✅ Keep snapshots small (specific subtrees)
- ❌ Don't snapshot entire pages (too brittle)
- ❌ Don't use snapshots as primary testing method
- ❌ Don't commit broken snapshots

---

## Configuration Examples

### jest.config.js (Complete)

```javascript
const nextJest = require('next/jest');

// Create Jest config using Next.js helper
const createJestConfig = nextJest({
  dir: './', // Next.js app directory
});

// Custom Jest configuration
const customJestConfig = {
  // Test environment (jsdom for React components)
  testEnvironment: 'jsdom',

  // Setup file to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module path aliases (matches tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/layout.tsx', // Exclude Next.js layout
    '!src/app/page.tsx',   // Exclude if mostly static
  ],

  coverageThresholds: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ['html', 'text', 'lcov', 'json-summary'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Transform configuration (handled by next/jest)
  // - TypeScript files transformed with ts-jest
  // - CSS modules mocked
  // - Static assets (images) mocked

  // Maximum workers for parallel execution
  maxWorkers: '50%', // Use half of available CPU cores

  // Verbose output
  verbose: true,
};

// Export merged config
module.exports = createJestConfig(customJestConfig);
```

**Key Points**:
- `next/jest` auto-configures TypeScript, CSS modules, static assets
- `setupFilesAfterEnv` runs before each test file
- `moduleNameMapper` supports `@/` imports
- `collectCoverageFrom` excludes test files, type definitions, storybook
- `coverageThresholds` enforces minimum coverage (optional)

---

### jest.setup.js (Global Test Setup)

```javascript
// Extend Jest matchers with DOM-specific assertions
import '@testing-library/jest-dom';

// Mock next/navigation globally (can override in specific tests)
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock next/image to avoid image optimization in tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Suppress console errors in tests (optional, use sparingly)
// global.console.error = jest.fn();

// Set up global test timeout (5 seconds default)
jest.setTimeout(5000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

**Key Points**:
- `@testing-library/jest-dom` adds matchers like `toBeInTheDocument()`
- Global mocks can be overridden in individual test files
- `afterEach` cleanup ensures test isolation
- `jest.setTimeout` prevents hanging tests

---

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

**Scripts Explained**:
- `npm test`: Run all tests once
- `npm run test:watch`: Watch mode for development
- `npm run test:coverage`: Generate coverage report
- `npm run test:ci`: Optimized for CI/CD (fewer workers, coverage)

---

## Component Test Examples

### Example 1: Navigation Component Test (Actual Implementation)

**File**: `src/components/__tests__/Navigation.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

// Mock Next.js navigation at module level
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test for isolation
    jest.clearAllMocks();
  });

  it('renders the Travel Blog logo', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    // Query by text content
    const logo = screen.getByText('Travel Blog');
    expect(logo).toBeInTheDocument();
  });

  it('renders all active navigation links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    // Query all links by role
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /stories/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /highlights/i })).toBeInTheDocument();
  });

  it('highlights the active link based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/about');
    
    render(<Navigation />);
    
    const aboutLink = screen.getByRole('link', { name: /about/i });
    const homeLink = screen.getByRole('link', { name: /home/i });
    
    // Active link has text-blue-600 class
    expect(aboutLink).toHaveClass('text-blue-600');
    // Inactive link has text-gray-700 class
    expect(homeLink).toHaveClass('text-gray-700');
  });

  it('renders mobile menu button', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    // Mobile menu button exists
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
    
    // Parent div has mobile-specific classes
    expect(menuButton.parentElement).toHaveClass('md:hidden');
  });

  it('applies correct href attributes to links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /stories/i })).toHaveAttribute('href', '/stories');
    expect(screen.getByRole('link', { name: /highlights/i })).toHaveAttribute('href', '/highlights');
  });
});
```

**Coverage**:
- ✅ Logo rendering
- ✅ All navigation links present
- ✅ Active link highlighting (conditional CSS classes)
- ✅ Mobile menu button with responsive classes
- ✅ Href attributes validation
- ✅ Next.js usePathname mocking with different return values per test

---

### Example 2: Footer Component Test (Actual Implementation)

**File**: `src/components/__tests__/Footer.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer Component', () => {
  it('renders the copyright text', () => {
    render(<Footer />);
    
    // Dynamic year calculation
    const currentYear = new Date().getFullYear();
    const copyrightText = `© ${currentYear} Travel Blog. All rights reserved.`;
    
    expect(screen.getByText(copyrightText)).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<Footer />);
    
    // Footer element should have dark background
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-gray-800');
    expect(footer).toHaveClass('text-white');
  });

  it('renders with centered content', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    
    // Check for centering classes
    expect(footer?.firstChild).toHaveClass('text-center');
  });
});
```

**Coverage**:
- ✅ Dynamic copyright text with current year
- ✅ Styling classes (dark theme)
- ✅ Layout classes (centered content)
- ✅ Direct DOM queries with container when needed

---

### Example 3: HighlightPhotoCard with User Events (Actual Implementation)

**File**: `src/components/__tests__/HighlightPhotoCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HighlightPhotoCard from '@/components/HighlightPhotoCard';
import { HighlightPhoto } from '@/types';

// Mock next/image locally for this test
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('HighlightPhotoCard Component', () => {
  const mockPhoto: HighlightPhoto = {
    id: '1',
    title: 'Sunset in Santorini',
    location: 'Santorini, Greece',
    imageUrl: '/images/santorini.jpg',
    imageAlt: 'Beautiful sunset over Santorini',
    date: '2024-06-15',
    story: 'An unforgettable evening watching the sunset.',
  };

  it('renders the photo image with correct attributes', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockPhoto.imageUrl);
    expect(image).toHaveAttribute('alt', mockPhoto.imageAlt);
  });

  it('displays the photo title', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('Sunset in Santorini')).toBeInTheDocument();
  });

  it('displays the location', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('Santorini, Greece')).toBeInTheDocument();
  });

  it('displays the story when provided', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('An unforgettable evening watching the sunset.')).toBeInTheDocument();
  });

  it('does not display story text when story is not provided', () => {
    const photoWithoutStory = { ...mockPhoto, story: undefined };
    
    render(<HighlightPhotoCard photo={photoWithoutStory} />);
    
    expect(screen.queryByText('An unforgettable evening watching the sunset.')).not.toBeInTheDocument();
  });

  it('has hover effect classes', () => {
    const { container } = render(<HighlightPhotoCard photo={mockPhoto} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-xl');
    expect(card).toHaveClass('transition-shadow');
  });

  it('simulates hover interaction', async () => {
    const user = userEvent.setup();
    const { container } = render(<HighlightPhotoCard photo={mockPhoto} />);
    
    const card = container.firstChild as HTMLElement;
    
    // Hover over the card
    await user.hover(card);
    
    // Card should still be in document (no state change, just CSS effects)
    expect(card).toBeInTheDocument();
    
    // Unhover
    await user.unhover(card);
    
    expect(card).toBeInTheDocument();
  });
});
```

**Coverage**:
- ✅ Image rendering with src and alt attributes
- ✅ Title and location display
- ✅ Conditional story rendering (with and without)
- ✅ Hover effect CSS classes
- ✅ User event simulation (hover/unhover)
- ✅ Next.js Image component mocking
- ✅ TypeScript types for mock data

---

## Utility Test Examples

### Example 1: Date Formatting Utility (Actual Implementation)

**File**: `src/utils/__tests__/formatDate.test.ts`

```typescript
import { formatDate } from '@/utils/formatDate';

describe('formatDate utility', () => {
  it('formats date to YYYY-MM-DD', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    expect(formatDate(date)).toBe('2024-06-15');
  });

  it('formats date with custom separator', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    expect(formatDate(date, '/')).toBe('2024/06/15');
  });

  it('pads single-digit month and day with zeros', () => {
    const date = new Date('2024-01-05T12:00:00Z');
    expect(formatDate(date)).toBe('2024-01-05');
  });

  it('handles invalid dates gracefully', () => {
    const invalidDate = new Date('invalid-date-string');
    expect(formatDate(invalidDate)).toBe('Invalid Date');
  });

  it('handles null input gracefully', () => {
    // @ts-expect-error Testing invalid input
    expect(formatDate(null)).toBe('Invalid Date');
  });

  it('handles undefined input gracefully', () => {
    // @ts-expect-error Testing invalid input
    expect(formatDate(undefined)).toBe('Invalid Date');
  });
});
```

**Coverage**:
- ✅ Happy path (standard date formatting)
- ✅ Custom configuration (separator parameter)
- ✅ Edge cases (padding, invalid dates, null, undefined)
- ✅ TypeScript @ts-expect-error for intentional type violations in tests

**Source Code** (`src/utils/formatDate.ts`):
```typescript
export function formatDate(date: Date, separator: string = '-'): string {
  // Handle invalid input
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${separator}${month}${separator}${day}`;
}
```

---

### Example 2: Array Filtering Utilities (Actual Implementation)

**File**: `src/utils/__tests__/filterTravels.test.ts`

```typescript
import { filterTravelsByCountry, filterTravelsByCompanion } from '@/utils/filterTravels';
import { TravelStory } from '@/types';

describe('filterTravelsByCountry', () => {
  const mockTravels: TravelStory[] = [
    { id: '1', title: 'Paris Adventure', country: 'France', companion: 'Solo', date: '2024-01-15', story: 'Story 1' },
    { id: '2', title: 'Tokyo Nights', country: 'Japan', companion: 'Friends', date: '2024-02-20', story: 'Story 2' },
    { id: '3', title: 'French Riviera', country: 'France', companion: 'Spouse', date: '2024-03-10', story: 'Story 3' },
  ];

  it('returns all travels when country is "All"', () => {
    const result = filterTravelsByCountry(mockTravels, 'All');
    expect(result).toHaveLength(3);
    expect(result).toEqual(mockTravels);
  });

  it('filters travels by specific country', () => {
    const result = filterTravelsByCountry(mockTravels, 'France');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Paris Adventure');
    expect(result[1].title).toBe('French Riviera');
  });

  it('filters are case-insensitive', () => {
    const result = filterTravelsByCountry(mockTravels, 'france');
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no matches', () => {
    const result = filterTravelsByCountry(mockTravels, 'Antarctica');
    expect(result).toHaveLength(0);
  });

  it('handles empty input array', () => {
    const result = filterTravelsByCountry([], 'France');
    expect(result).toHaveLength(0);
  });

  it('handles empty string filter (returns all)', () => {
    const result = filterTravelsByCountry(mockTravels, '');
    expect(result).toHaveLength(3);
  });

  it('handles null input gracefully', () => {
    // @ts-expect-error Testing invalid input
    const result = filterTravelsByCountry(null, 'France');
    expect(result).toHaveLength(0);
  });
});

describe('filterTravelsByCompanion', () => {
  const mockTravels: TravelStory[] = [
    { id: '1', title: 'Solo Paris', country: 'France', companion: 'Solo', date: '2024-01-15', story: 'Story 1' },
    { id: '2', title: 'Friends Tokyo', country: 'Japan', companion: 'Friends', date: '2024-02-20', story: 'Story 2' },
    { id: '3', title: 'Spouse Rome', country: 'Italy', companion: 'Spouse', date: '2024-03-10', story: 'Story 3' },
    { id: '4', title: 'Family Barcelona', country: 'Spain', companion: 'Family', date: '2024-04-05', story: 'Story 4' },
  ];

  it('returns all travels when companion is "All"', () => {
    const result = filterTravelsByCompanion(mockTravels, 'All');
    expect(result).toHaveLength(4);
  });

  it('filters travels by specific companion', () => {
    const result = filterTravelsByCompanion(mockTravels, 'Solo');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Solo Paris');
  });

  it('filters are case-insensitive', () => {
    const result = filterTravelsByCompanion(mockTravels, 'friends');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Friends Tokyo');
  });

  it('returns travels with just spouse', () => {
    const result = filterTravelsByCompanion(mockTravels, 'Spouse');
    expect(result).toHaveLength(1);
    expect(result[0].companion).toBe('Spouse');
  });

  it('returns empty array when no matches', () => {
    const result = filterTravelsByCompanion(mockTravels, 'Coworker');
    expect(result).toHaveLength(0);
  });

  it('handles empty input array', () => {
    const result = filterTravelsByCompanion([], 'Solo');
    expect(result).toHaveLength(0);
  });

  it('handles empty string filter (returns all)', () => {
    const result = filterTravelsByCompanion(mockTravels, '');
    expect(result).toHaveLength(4);
  });
});
```

**Coverage**:
- ✅ "All" filter (returns everything)
- ✅ Specific value filtering
- ✅ Case-insensitive matching
- ✅ No matches scenario
- ✅ Empty input arrays
- ✅ Empty string filters
- ✅ Null input handling
- ✅ Mock data created inline for test isolation

**Source Code** (`src/utils/filterTravels.ts`):
```typescript
import { TravelStory } from '@/types';

export function filterTravelsByCountry(
  travels: TravelStory[],
  country: string
): TravelStory[] {
  if (!travels || travels.length === 0) {
    return [];
  }

  if (!country || country === 'All' || country === '') {
    return travels;
  }

  return travels.filter(
    (travel) => travel.country.toLowerCase() === country.toLowerCase()
  );
}

export function filterTravelsByCompanion(
  travels: TravelStory[],
  companion: string
): TravelStory[] {
  if (!travels || travels.length === 0) {
    return [];
  }

  if (!companion || companion === 'All' || companion === '') {
    return travels;
  }

  return travels.filter(
    (travel) => travel.companion.toLowerCase() === companion.toLowerCase()
  );
}
```

---

### Example 3: Data Validation Tests (Actual Implementation)

**File**: `src/data/__tests__/travels.test.ts`

```typescript
import { travelStories } from '@/data/travels';

describe('Travel Stories Data', () => {
  it('contains travel story entries', () => {
    expect(travelStories).toBeDefined();
    expect(Array.isArray(travelStories)).toBe(true);
    expect(travelStories.length).toBeGreaterThan(0);
  });

  it('each story has required fields', () => {
    travelStories.forEach((story) => {
      // Check all required fields exist
      expect(story).toHaveProperty('id');
      expect(story).toHaveProperty('title');
      expect(story).toHaveProperty('country');
      expect(story).toHaveProperty('companion');
      expect(story).toHaveProperty('date');
      expect(story).toHaveProperty('story');

      // Verify types
      expect(typeof story.id).toBe('string');
      expect(typeof story.title).toBe('string');
      expect(typeof story.country).toBe('string');
      expect(typeof story.companion).toBe('string');
      expect(typeof story.date).toBe('string');
      expect(typeof story.story).toBe('string');
    });
  });

  it('all story IDs are unique', () => {
    const ids = travelStories.map((story) => story.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
```

**Coverage**:
- ✅ Array existence and length
- ✅ All required fields present on each item
- ✅ Type validation for each field
- ✅ Unique constraint on IDs

---

### Example 4: Highlight Photos Data Validation (Actual Implementation)

**File**: `src/data/__tests__/highlights.test.ts`

```typescript
import { highlightPhotos } from '@/data/highlights';

describe('Highlight Photos Data', () => {
  it('contains highlight photo entries', () => {
    expect(highlightPhotos).toBeDefined();
    expect(Array.isArray(highlightPhotos)).toBe(true);
    expect(highlightPhotos.length).toBeGreaterThan(0);
  });

  it('each photo has required fields', () => {
    highlightPhotos.forEach((photo) => {
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('title');
      expect(photo).toHaveProperty('location');
      expect(photo).toHaveProperty('imageUrl');
      expect(photo).toHaveProperty('imageAlt');
      expect(photo).toHaveProperty('date');

      // Verify types
      expect(typeof photo.id).toBe('string');
      expect(typeof photo.title).toBe('string');
      expect(typeof photo.location).toBe('string');
      expect(typeof photo.imageUrl).toBe('string');
      expect(typeof photo.imageAlt).toBe('string');
      expect(typeof photo.date).toBe('string');
    });
  });

  it('each photo has a valid date format (YYYY-MM-DD)', () => {
    highlightPhotos.forEach((photo) => {
      // Check date format matches YYYY-MM-DD
      expect(photo.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Verify it's a valid date
      const date = new Date(photo.date);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  it('all photo IDs are unique', () => {
    const ids = highlightPhotos.map((photo) => photo.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all image URLs start with /images/', () => {
    highlightPhotos.forEach((photo) => {
      expect(photo.imageUrl).toMatch(/^\/images\//);
    });
  });

  it('all photos have alt text for accessibility', () => {
    highlightPhotos.forEach((photo) => {
      expect(photo.imageAlt.length).toBeGreaterThan(0);
      expect(photo.imageAlt).not.toBe('');
    });
  });

  it('story field is optional', () => {
    // Just verify structure - some photos may or may not have story
    highlightPhotos.forEach((photo) => {
      if (photo.story) {
        expect(typeof photo.story).toBe('string');
      }
    });
  });
});
```

**Coverage**:
- ✅ Array validation
- ✅ Required fields with type checking
- ✅ Date format validation with regex
- ✅ Date validity (not just format)
- ✅ Unique ID constraint
- ✅ URL format validation
- ✅ Accessibility check (alt text non-empty)
- ✅ Optional field handling

---

## Mocking Patterns

### Pattern 1: Mock Entire Module

```typescript
jest.mock('@/data/highlights', () => ({
  highlightPhotos: [
    { id: '1', src: '/test1.jpg', alt: 'Test 1' },
    { id: '2', src: '/test2.jpg', alt: 'Test 2' },
  ],
}));
```

**When**: Need consistent test data from a module.

---

### Pattern 2: Mock Function with Different Return Values

```typescript
const mockFn = jest.fn();

// Test 1: Return value A
mockFn.mockReturnValueOnce('A');

// Test 2: Return value B
mockFn.mockReturnValueOnce('B');

// Test 3: Throw error
mockFn.mockImplementationOnce(() => {
  throw new Error('Test error');
});
```

**When**: Testing different branches of code.

---

### Pattern 3: Spy on Object Method

```typescript
const myObject = {
  getData: () => ({ id: 1, name: 'Real Data' }),
};

const spy = jest.spyOn(myObject, 'getData');
spy.mockReturnValue({ id: 2, name: 'Mock Data' });

// Use myObject in test
expect(spy).toHaveBeenCalled();

spy.mockRestore(); // Restore original implementation
```

**When**: Need to verify method calls without replacing entire module.

---

### Pattern 4: Mock Timers

```typescript
describe('Component with timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes callback after delay', () => {
    const callback = jest.fn();
    setTimeout(callback, 1000);

    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

**When**: Testing debounce, throttle, or delayed actions.

---

## Best Practices

### ✅ DO

1. **Test User Behavior, Not Implementation**
   ```typescript
   // Good: Test what user sees
   expect(screen.getByText('Welcome')).toBeInTheDocument();
   
   // Bad: Test component internals
   expect(component.state.message).toBe('Welcome');
   ```

2. **Use Semantic Queries**
   ```typescript
   // Good: Query by role (accessibility)
   screen.getByRole('button', { name: /submit/i });
   
   // Bad: Query by test ID (not semantic)
   screen.getByTestId('submit-button');
   ```

3. **Isolate Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
     // Reset any global state
   });
   ```

4. **Test Edge Cases**
   - Empty arrays
   - Invalid inputs
   - Error states
   - Boundary conditions

5. **Keep Tests Fast**
   - Avoid real network requests (mock fetch)
   - Avoid real timers (use fake timers)
   - Avoid heavy computations (mock results)

---

### ❌ DON'T

1. **Don't Test Third-Party Libraries**
   ```typescript
   // Bad: Testing React itself
   it('useState updates state', () => {
     // Don't test React's internal behavior
   });
   ```

2. **Don't Use Brittle Selectors**
   ```typescript
   // Bad: CSS classes that may change
   const element = container.querySelector('.btn-primary');
   
   // Good: Semantic queries
   const element = screen.getByRole('button', { name: /submit/i });
   ```

3. **Don't Test Everything**
   - Skip trivial getters/setters
   - Skip third-party component internals
   - Focus on business logic and user interactions

4. **Don't Overuse Snapshots**
   - Snapshots are brittle
   - Hard to review large diffs
   - Use for stable components only

5. **Don't Share State Between Tests**
   ```typescript
   // Bad: Shared mutable state
   let sharedData = [];
   
   it('test 1', () => {
     sharedData.push(1); // Affects test 2
   });
   
   it('test 2', () => {
     expect(sharedData).toHaveLength(0); // Fails!
   });
   ```

---

## Summary

This document provides:
- **5 core testing patterns**: Rendering, interactions, async, mocking, snapshots
- **Complete Jest configuration**: jest.config.js, jest.setup.js, package.json scripts
- **Real-world examples**: Navigation, Button, utility functions
- **Mocking strategies**: Module mocks, function mocks, spies, timers
- **Best practices**: Test user behavior, use semantic queries, isolate tests, test edge cases

All patterns align with FR-001 to FR-020 and support the success criteria (SC-001 to SC-010) from the feature specification.
