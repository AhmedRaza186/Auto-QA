import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 300000,

  use: {
    headless: true,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 100000,
    navigationTimeout: 150000,
  },
});