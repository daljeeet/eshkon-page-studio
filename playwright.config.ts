import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI builds first (see ci.yml), then this starts the production server.
    // Locally, an already-running `npm run dev` is reused.
    command: "npm run start",
    url: `${baseURL}/preview/hello`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { USE_MOCK_CONTENT: "true" },
  },
});
