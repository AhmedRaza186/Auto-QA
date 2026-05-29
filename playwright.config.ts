import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,

  use: {
    headless: true,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
});