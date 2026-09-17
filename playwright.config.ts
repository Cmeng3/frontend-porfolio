import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    ...devices["Desktop Chrome"],
    channel: process.env.CI ? undefined : "msedge",
    trace: "retain-on-failure",
  },
  reporter: "list",
});
