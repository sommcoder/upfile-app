import { type LoaderFunction } from "@remix-run/node";
// import fetch from "node-fetch";
import { verifyShopifyWebhook } from "app/util/verifyWebhook";

const SHOPIFY_API_URL =
  "https://your-store.myshopify.com/admin/api/2025-01/graphql.json";
const SHOPIFY_ACCESS_TOKEN = "your-shopify-access-token";

export const loader: LoaderFunction = async ({ request }) => {
  // Step 1: Parse the incoming request body (Shopify webhook)
  const body = await request.text();
  console.log("loader() body:", body);

  // Shopify sends a raw body; validate using a webhook secret if you have one
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("ERROR: Missing Env Variable: 'WEBHOOK_SECRET'");
  }

  if (!verifyShopifyWebhook(request, secret)) {
    return new Response(JSON.stringify({ error: "Invalid webhook" }), {
      status: 400,
    });
  }

  // Step 2: Parse the webhook payload
  const order = JSON.parse(body);
  console.log("order:", order);

  // Step 3: Loop through the line items and check for __file_id property
  const fileIds = order.line_items.flatMap((item: any) =>
    item.properties && item.properties["__file_id"]
      ? item.properties["__file_id"]
      : [],
  );

  if (fileIds.length > 0) {
    console.log("Found file IDs:", fileIds);

    // Step 4: Add the __file_id as a metafield to the order
    await addMetafieldToOrder(order.id, fileIds.join(","));
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

// Function to add metafield to the order using GraphQL
async function addMetafieldToOrder(orderId: number, fileIds: string) {
  const query = `
    mutation {
      orderUpdate(input: {
        id: "gid://shopify/Order/${orderId}",
        metafields: [
          {
            namespace: "custom_data",
            key: "__file_id",
            value: "${fileIds}",
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
