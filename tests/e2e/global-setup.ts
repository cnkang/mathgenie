// Global setup for e2e tests
import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for e2e tests...");

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app to ensure it's working
    const baseURL = config.projects[0].use.baseURL || "http://localhost:4173";
    console.log(`📍 Checking app availability at ${baseURL}`);

    await page.goto(baseURL, { timeout: 30000 });

    // Wait for the app to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Verify basic functionality
    const title = await page.textContent("h1");
    if (!title || title.includes("Error") || title.includes("404")) {
      throw new Error(`App not loaded correctly. Title: ${title}`);
    }

    console.log(`✅ App is available and loaded correctly. Title: ${title}`);

    // Clear any existing localStorage/sessionStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log("🧹 Cleared browser storage");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

export default globalSetup;
