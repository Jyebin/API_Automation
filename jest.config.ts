import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.spec.ts', '**/tests/**/*.test.ts'],
  globalSetup: './src/setup/globalSetup.ts',
  setupFilesAfterEnv: ['./src/setup/jestSetup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  reporters: [
    'default',
    [
      '<rootDir>/src/reporters/html-reporter.js',
      { outputPath: 'test-report.html' },
    ],
  ],
};

export default config;
