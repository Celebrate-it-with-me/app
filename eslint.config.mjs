// eslint.config.mjs
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage']
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: vueParser,
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',

        // Web APIs
        URL: 'readonly',
        IntersectionObserver: 'readonly',

        // Timers
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Console
        console: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module'
      }
    },
    plugins: {
      vue
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'warn',

      'vue/multi-word-component-names': 'off',
      'vue/no-mutating-props': 'error',
      'vue/no-unused-components': 'warn'
    }
  },

  prettier
]
