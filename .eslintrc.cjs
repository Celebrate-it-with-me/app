module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', '@vue/eslint-config-prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/no-parsing-error': 'error',
    'vue/no-unsupported-features': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  }
}
