import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'decoding-test*.js',
      'tmp/**',
      '*.js',
      '*.config.mjs',
    ],
  },

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
