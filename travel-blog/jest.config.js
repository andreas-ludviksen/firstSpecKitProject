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

  // Projects for different test environments
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.[jt]s?(x)'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'workers',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/workers/**/*.test.[jt]s'],
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            module: 'commonjs',
            esModuleInterop: true,
          },
        }],
      },
      moduleNameMapper: {
        '^@workers/(.*)$': '<rootDir>/workers/$1',
      },
    },
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/layout.tsx',
    '!src/app/**/page.tsx',
  ],

  // Coverage reporters
  coverageReporters: ['html', 'text', 'lcov', 'json-summary'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Maximum workers for parallel execution
  maxWorkers: '50%',

  // Verbose output
  verbose: true,
};

// Export merged config
module.exports = createJestConfig(customJestConfig);
