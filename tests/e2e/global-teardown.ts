// Global teardown for e2e tests
import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global teardown for e2e tests...");

  // Cleanup any global resources if needed
  // For now, just log completion

  console.log("✅ Global teardown completed successfully");
}

export default globalTeardown;
