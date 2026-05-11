import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: {
    // npx is on PATH on every node install (Windows + Linux), pnpm may not be
    // when Playwright spawns the subprocess via cmd.exe.
    command: 'npx --no-install next build && npx --no-install next start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
