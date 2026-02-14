import path from 'path'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      name: 'unit',
      environment: 'node',
      pool: 'threads',
      include: ['src/**/*.spec.ts'],
    },
  },
  {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      name: 'integration',
      environment: 'node',
      pool: 'forks',
      include: ['tests/**/*.test.ts'],
    },
  },
])
