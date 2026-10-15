import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: process.env.E2E_DIR ?? './tests',
  outputDir: process.env.OUT_DIR ?? './test-results',
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
