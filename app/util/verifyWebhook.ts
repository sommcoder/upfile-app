import crypto from "node:crypto";

export function verifyShopifyWebhook(req, secret: string) {
  const hmacHeader = req.headers["X-Shopify-Hmac-Sha256"];

  const body = req.rawBody; // The body of the webhook request

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  console.log("hash:", hash);

  // Compare the hash generated with the HMAC header from Shopify
  if (hash === hmacHeader) {
    console.log("Webhook verified successfully.");
    return true;
  } else {
    console.log("Invalid webhook signature.");
    return false;
  }
}
