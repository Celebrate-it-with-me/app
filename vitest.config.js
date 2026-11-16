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
      root: fileURLToPath(new URL('./', import.meta.url))
    }
  })
)
