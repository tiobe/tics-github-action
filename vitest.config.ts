import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ['lcov', 'cobertura', 'text'],
      include: ['src/**']
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['**/integration/**/*.test.ts'],
          environment: 'node'
        }
      },
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/unit/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['./test/.setup/mock.ts', './test/.setup/extend_jest.ts']
        }
      }
    ]
  }
});
