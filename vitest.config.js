import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // The project has no unit tests yet; do not fail the run because of that.
      passWithNoTests: true,
      // Both languages are registered up front: tests read texts synchronously (the app loads them on demand).
      setupFiles: ['./src/locales/__tests__/setup.js'],
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'html', 'json-summary'],
        // Git-ignored (see `coverage` in .gitignore).
        reportsDirectory: './coverage',
        // Still write the report when some test fails, so the baseline is never lost.
        reportOnFailure: true,
        // `include` makes untested files count as 0 % (vitest >= 4 has no `all` option).
        include: ['src/**/*.{js,vue}'],
        exclude: [
          // Tests, test helpers and mocks.
          'src/**/__tests__/**',
          'src/**/__mocks__/**',
          'src/**/*.{spec,test}.js',
          // Dev-only showcase pages (/dev/ui, /dev/template-picker); not shipped to users.
          'src/views/dev/**',
          // Translation dictionaries are static data; i18n.js (the loader) stays measured.
          'src/locales/en.js',
          'src/locales/es.js',
          // App entry point: only wires plugins and mounts the app.
          'src/main.js',
          // Static JSON data and assets (fonts, images, css).
          'src/data/**',
          'src/assets/**'
        ],
        // Target is 95 %. By default we only REPORT; set COVERAGE_ENFORCE=1 to fail below the target.
        // COVERAGE_THRESHOLD overrides the target (e.g. COVERAGE_THRESHOLD=90).
        thresholds: process.env.COVERAGE_ENFORCE
          ? (() => {
              const t = Number(process.env.COVERAGE_THRESHOLD || 95)
              return { lines: t, branches: t, functions: t, statements: t }
            })()
          : undefined
      }
    }
  })
)
