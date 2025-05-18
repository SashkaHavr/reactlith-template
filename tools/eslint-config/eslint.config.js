import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginReactCompiler from 'eslint-plugin-react-compiler';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  globalIgnores(['dist/']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended],
    rules: {
      curly: ['error', 'multi-line'],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylistic,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: [
          '../../packages/*/tsconfig.json',
          '../../apps/*/tsconfig.json',
          '../../apps/*/tsconfig.app.json',
          '../../apps/*/tsconfig.node.json',
          '../../tools/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNumber: false,
          allowNullableString: true,
          allowNullableBoolean: true,
          allowNullableObject: true,
        },
      ],
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  pluginReactHooks.configs['recommended-latest'],
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/components/ui/*.tsx'],
    extends: [pluginReactRefresh.configs.recommended],
  },
  pluginReactCompiler.configs.recommended,
  pluginQuery.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['*.config.ts', 'src/index.ts'],
    rules: {
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Program > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
          message: 'Top-level arrow functions are not allowed.',
        },
        {
          selector:
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
          message: 'Top-level arrow functions are not allowed.',
        },
        {
          selector: 'ExportDefaultDeclaration > ArrowFunctionExpression',
          message: 'Top-level arrow functions are not allowed.',
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: "Don't declare enums",
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-empty-pattern': 'off',
      'no-empty': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/components/ui/*.tsx'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: ['@radix-ui/*', '!@radix-ui/react-visually-hidden'] },
      ],
    },
  },
);
