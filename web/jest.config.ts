import type { Config } from 'jest/build';

const config: Config = {
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts'],
  setupFiles: ['react-app-polyfill/jsdom'],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
    '^.+\\.css$': '<rootDir>/webpack/configuration/jest/css_transformer.ts',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)':
      '<rootDir>/webpack/configuration/jest/file_transformer.ts',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(@?firebase)).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@assets/(.*)': '<rootDir>/assets/$1',
    '^@common/(.*)': '<rootDir>/common/$1',
    '^@services/(.*)': '<rootDir>/services/$1',
    '^@theme/(.*)': '<rootDir>/theme/$1',
    '^@views/(.*)': '<rootDir>/views/$1',
    '^@widgets/(.*)': '<rootDir>/widgets/$1',
  },
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
};

export default config;
