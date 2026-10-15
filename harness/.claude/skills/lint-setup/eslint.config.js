import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const DEFAULT_EXPORT_ALLOWED = [
  '**/*.config.{ts,mts,js,mjs}',
  '**/*.stories.{ts,tsx}',
  '**/*.d.ts',
  '**/app/**/{page,layout,template,loading,error,global-error,not-found,default,opengraph-image}.tsx',
];

export default defineConfig(
  { ignores: ['dist', 'build', '.next', 'coverage', 'node_modules'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: { allowDefaultProject: ['*.config.ts', '*.config.mts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      'jsx-a11y/control-has-associated-label': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-implicit-coercion': 'error',
      'no-console': ['warn', { allow: ['error'] }],
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme'], location: 'anywhere' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowString: false, allowNumber: false, allowNullableObject: false },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', modifiers: ['destructured'], format: null },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'typeParameter', format: ['PascalCase'], custom: { regex: '^(T|T[A-Z][A-Za-z]+|K|E)$', match: true } },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportDefaultDeclaration', message: 'named export만 사용합니다 (code-style S2).' },
        { selector: 'ExportSpecifier[exported.name="default"]', message: 'named export만 사용합니다 (code-style S2).' },
      ],
    },
  },
  {
    files: DEFAULT_EXPORT_ALLOWED,
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.d.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  }
);
