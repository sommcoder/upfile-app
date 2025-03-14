import { test, expect } from "@playwright/test";
import { chromium } from "playwright";

interface CCTargets {
  [key: string]: { value: string | string[]; id: string };
}

// Function to get a random delay between actions
function getRandomDelay(min = 100, max = 500) {
  return Math.floor(Math.random() * (max - min) + min);
}

/* 
@ purpose:
- tests the private prop and checkout functionality triggering a webhook that has subscribed to orders.
- avoids tedious manual tests adding product with props to cart and entering CC info in Checkout
*/
test("test file upload order", async ({ page }) => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 }); // Simulate human behavior
  const URL = process.env.TEST_ORDER_URL;
  const STORE_PASS = process.env.DEV_STORE_PASSWORD;

  if (!URL || !STORE_PASS) {
    console.log("no URL or STORE_PASS");
    return;
  }

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

    // Check if we're on the store password page
    // The password input field should be present if we're on the password page
    const passwordInput = page.locator('input[type="password"]');

    // If the password field exists, fill it and submit the form
    if (await passwordInput.isVisible()) {
      // Fill the password input with the store password
      await passwordInput.fill(STORE_PASS);

      // Get the submit button (button[type="submit"] or input[type="submit"])
      const submitButton =
        (await page.locator('button[type="submit"]')) ||
        page.locator('input[type="submit"]');

      // Click the submit button to submit the form
      await submitButton.click();

      // Wait for the next navigation to complete (in case of a redirect)
      await page.waitForLoadState("load"); // Replaces waitForNavigation
    }

    // Check if we're on the correct page after submitting password
    let currentUrl = page.url();

    // If we're not on the product page, navigate there
    if (currentUrl !== URL) {
      console.log(
        `Redirected to ${currentUrl}. Navigating to the product page.`,
      );
      await page.goto(URL); // Redirect to the correct URL
    }

    await page.evaluate(async () => {
      // ! PRODUCT PAGE
      const productForm = document.querySelector(
        '[data-type="add-to-cart-form"]',
      );
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "properties[__upfile_id]";
      hiddenInput.value = crypto.randomUUID();
      productForm?.appendChild(hiddenInput);
    });

    const addToCartBtn = await page.locator(
      'button[type="submit"]:has-text("Add to cart")',
    ); // click add to cart button

    addToCartBtn?.click();
    console.log("✅ Clicked Add to Cart");

    // ! CART PAGE
    await page.waitForURL(/cart/);
    console.log("✅ Reached cart page");

    // Click "Checkout" button
    const checkoutButton = page.locator('button[name="checkout"]'); // Update selector if needed
    await checkoutButton.click();
    console.log("✅ Clicked Checkout");

    // ! CHECKOUT PAGE
    // Wait for navigation to checkout page
    await page.waitForURL(/checkout/);
    console.log("✅ Reached checkout page");

    // ! SHIPPING DETAILS
    // Wait for the shipping address form to load
    // await page.waitForTimeout(getRandomDelay());
    const checkoutMain = page.locator("#checkout-main");
    console.log("checkoutMain:", checkoutMain);

    // Fill in the email input
    await checkoutMain.locator("#email").fill("brian.davies589@gmail.com");
    console.log("Filled email address.");
    // await page.waitForTimeout(getRandomDelay());

    // get into the shipping address form
    const shippingAddressForm = checkoutMain.locator("#shippingAddressForm");
    console.log("shippingAddressForm:", shippingAddressForm);

    // Fill in the first name (use a more specific selector)
    await shippingAddressForm
      .locator('input[name="firstName"]:not([type="hidden"])')
      .fill("Brian");
    console.log("Filled first name.");
    // await page.waitForTimeout(getRandomDelay());

    // Fill in the last name
    await shippingAddressForm
      .locator('input[name="lastName"]:not([type="hidden"])')
      .fill("Davies");
    console.log("Filled last name.");
    // await page.waitForTimeout(getRandomDelay());

    // Fill in the address
    const addressInput = shippingAddressForm.locator(
      'input[name="address1"]:not([type="hidden"])',
    );
    console.log("addressInput:", addressInput);
    await addressInput.fill("43 Hanna Avenue, Toronto, ON, Canada");
    console.log("Filled address.");
    // await page.waitForTimeout(getRandomDelay());

    // Press Enter to submit the address
    await addressInput.press("Enter");
    console.log("Submitted the address.");
    // await page.waitForTimeout(getRandomDelay());

    // Fill in the postal code
    // Fill in the postal code, ensuring the correct selector is used
    await shippingAddressForm
      .locator('input[name="postalCode"]:not([type="hidden"])')
      .fill("M6K1X1");
    console.log("Filled postal code.");
    // await page.waitForTimeout(getRandomDelay());

    // Fill in the city
    await shippingAddressForm
      .locator('input[name="city"]:not([type="hidden"])')
      .fill("Toronto");
    console.log("Filled city.");
    // await page.waitForTimeout(getRandomDelay());

    // ! CREDIT CARD DETAILS (Nested in IFRAMES)
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
        // await page.waitForTimeout(getRandomDelay());
        await inputEl.click();
        // await page.waitForTimeout(getRandomDelay());

        if (
          targetKey === "card-fields-expiry" &&
          Array.isArray(targetValue.value)
        ) {
          // Type expiry field as separate keystrokes
          for (const digit of targetValue.value) {
            await inputEl.press(digit);
            // await page.waitForTimeout(getRandomDelay());
          }
        } else {
          await inputEl.fill(targetValue.value.toString());
          console.log(`Filled ${targetKey} with value: ${targetValue.value}`);
        }
      } else {
        console.log(`No required input found in iframe: ${targetFrameName}`);
      }
    }
    await checkoutMain
      .locator("#checkout-pay-button")
      .waitFor({ state: "visible" });
    await checkoutMain.locator("#checkout-pay-button").click();
    console.log("✅ Clicked Pay Now button");

    // Wait for the page to redirect after clicking the Pay Now button
    await page.waitForURL(/thank-you/); // You can adjust the URL pattern as needed
    console.log("✅ Redirected after payment.");

    process.exit(0); // Gracefully exit
  } catch (error) {
    console.error("Error during test execution:", error);
  }
});
