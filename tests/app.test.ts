import { describe, expect, it } from 'vitest'

import { start } from '../src/app'

describe('App', () => {
  it('should run without errors', async () => {
    await expect(start()).resolves.not.toThrow()
  })
})
