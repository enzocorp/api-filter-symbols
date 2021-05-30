/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  clearMocks: true,
  coverageProvider: "v8",
  testEnvironment: "node",
  roots: ['<rootDir>/src'],
  preset: 'ts-jest'
};
