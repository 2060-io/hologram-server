import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    passWithNoTests: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: ['dist', 'node_modules', '__tests__', 'tests'],
    },
    workspace: 'vitest.workspace.ts',
  },
})
