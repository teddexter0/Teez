import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { channel: 'chrome', baseURL: 'http://127.0.0.1:3339' },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3339',
    url: 'http://127.0.0.1:3339',
    timeout: 35_000,
  },
});
