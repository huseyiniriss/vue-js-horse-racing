import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      root: fileURLToPath(new URL('./', import.meta.url)),
      include: ['src/**/*.spec.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      restoreMocks: true,
      setupFiles: ['src/test/vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/app/main.ts', 'src/**/index.ts'],
        // A floor, not a target: CI fails if coverage drops below today's level.
        thresholds: { statements: 93, branches: 87, functions: 95, lines: 94 },
      },
    },
  }),
)
