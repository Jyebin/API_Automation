import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.spec.ts', '**/tests/**/*.test.ts'],
  globalSetup: './src/setup/globalSetup.ts',
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
      'jest-html-reporter',
      {
        outputPath: 'test-report.html',
        pageTitle: 'Metademy API 테스트 결과',
        includeFailureMsg: true,
        includeConsoleLog: false,
        sort: 'status',
      },
    ],
  ],
};

export default config;
