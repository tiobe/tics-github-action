const config = {
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
      setupFilesAfterEnv: ['<rootDir>/test/.setup/mock.ts', '<rootDir>/test/.setup/extend_jest.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      }
    }
  ]
};

export default config;
