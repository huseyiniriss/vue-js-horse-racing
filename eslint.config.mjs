import skipFormatting from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

/**
 * Architecture boundaries (see docs/decisions/0001-feature-based-structure.md):
 * - shared/ is a leaf: it never knows about features or the app shell.
 * - a feature talks to another feature only through its public index.
 * - domain/ is framework-free TypeScript.
 */
const FEATURE_PUBLIC_API_ONLY = {
  group: ['@/features/*/*', '../../*', '../../**'],
  message: 'Import other features through their public API: "@/features/<name>".',
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/coverage/**', '**/playwright-report/**', '**/test-results/**'],
  },

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,

  {
    name: 'app/conventions',
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
      'vue/multi-word-component-names': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-typed-ref': 'error',
      'vue/no-required-prop-with-default': 'error',

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  {
    name: 'app/boundaries/features',
    files: ['src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            FEATURE_PUBLIC_API_ONLY,
            { group: ['@/app/*'], message: 'Features must not depend on the app shell.' },
          ],
        },
      ],
    },
  },
  {
    name: 'app/boundaries/domain',
    files: ['src/features/*/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'vue', message: 'Domain code is framework-free.' },
            { name: 'pinia', message: 'Domain code is framework-free.' },
          ],
          patterns: [
            FEATURE_PUBLIC_API_ONLY,
            {
              group: ['../store/*', '../components/*', '../composables/*'],
              message: 'Domain code must not depend on the UI or state layers.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/boundaries/shared',
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*', '@/app/*'], message: 'shared/ must stay feature-agnostic.' },
          ],
        },
      ],
    },
  },
  {
    name: 'app/scripts',
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
  {
    name: 'app/tests',
    files: ['**/*.spec.ts', 'e2e/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  skipFormatting,
)
