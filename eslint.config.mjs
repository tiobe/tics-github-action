import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import jest from 'eslint-plugin-jest';

export default tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'lib/**', 'jest.config.js', 'eslint.config.mjs']
  },
  {
    files: ['src/**/*.ts'],
    extends: [eslint.configs.strict, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked, prettier],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigDirName: import.meta.dirname
      }
    }
  },
  {
    files: ['**/*.test.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, jest.configs['flat/recommended']],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
);
