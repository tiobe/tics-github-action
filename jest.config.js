module.exports = {
  clearMocks: true,
  coverageReporters: ['lcov', 'cobertura', 'text'],
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  setupFilesAfterEnv: [
    '<rootDir>/test/.setup/mock.ts'
  ]
};
