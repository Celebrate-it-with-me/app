// eslint.config.mjs
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

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
        ...globals.browser,
        ...globals.node,
        // Loaded at runtime by the Google Maps JS API loader
        google: 'readonly'
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
