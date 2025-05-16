module.exports = {
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**', '!**/vendor/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
};