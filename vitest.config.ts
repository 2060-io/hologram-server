import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    passWithNoTests: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: ['dist', 'node_modules', '__tests__', 'tests'],
    },
    include: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    root: './',
  },
})
