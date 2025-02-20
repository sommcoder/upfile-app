import { test, expect } from "@playwright/test";
import { chromium } from "playwright";

interface CCTargets {
  [key: string]: { value: string | string[]; id: string };
}

// Function to get a random delay between actions
function getRandomDelay(min = 100, max = 500) {
  return Math.floor(Math.random() * (max - min) + min);
}

test("test file upload order", async ({ page }) => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 }); // Simulate human behavior
  const URL = process.env.TEST_ORDER_URL;

  const targets: CCTargets = {
    "card-fields-name": { value: "Bogus Gateway", id: "name" },
    "card-fields-number": { value: "1", id: "number" },
    "card-fields-verification_value": {
      value: "111",
      id: "verification_value",
    },
    "card-fields-expiry": { value: ["0", "5", "4", "0"], id: "expiry" },
  };

  try {
    await page.goto(`${URL}`); // go to PRODUCT PAGE

    // add a file to

    // Get all iframes on the page
    const allFrames = page.frames();

    // Extract only the iframe names that match our target fields
    const targetFrameNames = allFrames
      .map((frame) => frame.name())
      .filter((frameName) =>
        Object.keys(targets).some((key) => frameName.includes(key)),
      );

    // Process each target iframe sequentially
    for (const targetFrameName of targetFrameNames) {
      console.log(`Found target iframe: ${targetFrameName}`);

      // Find the target field key based on the iframe name
      const targetKey = Object.keys(targets).find((key) =>
        targetFrameName.includes(key),
      );
      if (!targetKey) continue; // Skip if no match found

      const targetValue = targets[targetKey];

      // Select the iframe
      const frameLocator = page.frameLocator(
        `iframe[name="${targetFrameName}"]`,
      );

      // Locate div.current-field inside the iframe
      const currentFieldDiv = frameLocator.locator("div.current-field");

      // Find the input field inside div.current-field using its ID
      const inputEl = currentFieldDiv.locator(`input[id="${targetValue.id}"]`);

      // Check if an input was found before proceeding
      if ((await inputEl.count()) > 0) {
        console.log(`Required input found in iframe: ${targetFrameName}`);

        await inputEl.hover();
        await page.waitForTimeout(getRandomDelay());
        await inputEl.click();
        await page.waitForTimeout(getRandomDelay());

        if (
          targetKey === "card-fields-expiry" &&
          Array.isArray(targetValue.value)
        ) {
          // Type expiry field as separate keystrokes
          for (const digit of targetValue.value) {
            await inputEl.press(digit);
            await page.waitForTimeout(getRandomDelay());
          }
        } else {
          await inputEl.fill(targetValue.value.toString());
          console.log(`Filled ${targetKey} with value: ${targetValue.value}`);
        }
      } else {
        console.log(`No required input found in iframe: ${targetFrameName}`);
      }
    }
  } catch (error) {
    console.error("Error during test execution:", error);
  }
});
