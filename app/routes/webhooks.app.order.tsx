// app/routes/webhook/order-created.tsx
import { json, LoaderFunction } from "remix";
import fetch from "node-fetch";
import { Buffer } from "buffer";
import { verifyShopifyWebhook } from "app/util/verifyWebhook";

import crypto from "node:crypto";

const SHOPIFY_API_URL =
  "https://your-store.myshopify.com/admin/api/2023-01/graphql.json";

const SHOPIFY_ACCESS_TOKEN = "your-shopify-access-token";

export const loader: LoaderFunction = async ({ request }) => {
  // Step 1: Parse the incoming request body (Shopify webhook)
  const body = await request.text();

  // Shopify sends a raw body; validate using a webhook secret if you have one
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("ERROR: Missing Env Variable: 'WEBHOOK_SECRET'");
  }

  if (!verifyShopifyWebhook(request, secret)) {
    return json({ error: "Invalid webhook" }, { status: 400 });
  }

  // Step 2: Parse the webhook payload
  const order = JSON.parse(body);

  // Step 3: Loop through the line items and check for custom properties
  for (const item of order.line_items) {
    if (item.properties && item.properties["_file_id__"]) {
      const fileId = item.properties["_file_id__"];
      console.log("Found file ID:", fileId);

      // Step 4: Add the custom property as a metafield to the order
      await addMetafieldToOrder(order.id, fileId);
    }
  }

  return json({ success: true });
};

// Function to add metafield to the order using GraphQL
async function addMetafieldToOrder(orderId: number, fileId: string) {
  const query = `
    mutation {
      orderUpdate(input: {
        id: "gid://shopify/Order/${orderId}",
        metafields: [
          {
            namespace: "custom_data",
            key: "file_id",
            value: "${fileId}",
            valueType: STRING
          }
        ]
      }) {
        order {
          id
          metafields(first: 10) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(SHOPIFY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const responseData = await response.json();

  if (response.ok) {
    console.log("Metafield added successfully!");
    console.log("Metafields:", responseData.data.orderUpdate.order.metafields);
  } else {
    console.error("Error adding metafield:", responseData.errors);
    throw new Error("Failed to add metafield to the order");
  }
}
