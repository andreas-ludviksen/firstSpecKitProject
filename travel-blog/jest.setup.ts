// Extend Jest matchers with DOM-specific assertions
require('@testing-library/jest-dom');

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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react');
    // eslint-disable-next-line jsx-a11y/alt-text
    return React.createElement('img', props);
  },
}));

// Set up global test timeout (5 seconds default)
jest.setTimeout(5000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
