module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended'
  ],
  plugins: ['@typescript-eslint', 'jest'],
  env: {
    node: true,
    es6: true,
    'jest/globals': true
  },
  rules: {
    // Add custom rules here
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};