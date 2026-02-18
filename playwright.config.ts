import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', // テストフォルダの場所
  fullyParallel: true,
  
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:1420',
  },

  webServer: {
    command: 'npm run dev', 
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});