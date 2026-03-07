import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting E2E global setup...");
  
  // Optional: Set up any global test data or services here
  // For now, we'll just verify that the required services are accessible
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Verify frontend is accessible
    await page.goto(config.webServer?.url || "http://localhost:3000");
    console.log("✅ Frontend is accessible");
    
    // Verify backend is accessible
    const backendResponse = await page.request.get(`${process.env.VITE_API_URL || "http://localhost:3001"}/api/live`);
    if (backendResponse.ok()) {
      console.log("✅ Backend is accessible");
    } else {
      throw new Error(`Backend health check failed: ${backendResponse.status()}`);
    }
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log("✅ E2E global setup completed");
}

export default globalSetup;
