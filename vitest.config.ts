import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './__tests__/global.setup.js',
  },
})
