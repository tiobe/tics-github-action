module.exports = {
  coverageReporters: ['lcov', 'cobertura', 'text'],
  verbose: true,
  projects: [
    {
      clearMocks: true,

      moduleFileExtensions: ['js', 'ts'],
      testMatch: ['**/integration/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      }
    },
    {
      clearMocks: true,
      moduleFileExtensions: ['js', 'ts'],
      testMatch: ['**/unit/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      },
      setupFilesAfterEnv: [
        '<rootDir>/test/.setup/mock.ts'
      ]
    }
  ]
};
