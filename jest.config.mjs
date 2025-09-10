/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  coverageReporters: ['lcov', 'cobertura', 'text'],
  verbose: true,
  projects: [
    {
      clearMocks: true,
      moduleFileExtensions: ['js', 'ts'],
      testMatch: ['**/integration/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.test.json'
          }
        ]
      }
    },
    {
      clearMocks: true,
      moduleFileExtensions: ['js', 'ts'],
      testMatch: ['**/unit/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/.setup/mock.ts', '<rootDir>/test/.setup/extend_jest.ts'],
      transform: {
        '^.+\\.ts$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.test.json'
          }
        ]
      }
    }
  ]
};
