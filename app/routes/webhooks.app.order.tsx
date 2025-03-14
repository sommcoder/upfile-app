import { ActionFunction, type LoaderFunction } from "@remix-run/node";
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

  // Step 3: Loop through the line items and check for __upfile_id property
  const fileIds = order.line_items.flatMap((item: any) =>
    item.properties && item.properties["__upfile_id"]
      ? item.properties["__upfile_id"]
      : [],
  );

  if (fileIds.length > 0) {
    console.log("Found file IDs:", fileIds);

    // Step 4: Add the __upfile_id as a metafield to the order
    await addMetafieldToOrder(order.id, fileIds.join(","));
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("request:", request);

    const data = await request.json();

    console.log("data:", data);

    // should construct this data to what's best for the DB
    const record = {
      orderId: data?.id,
      locationId: data?.location_id, // no merchant id, sale is by location!
      customer: {
        id: data?.customer.id,
        fname: data?.customer.first_name,
        lname: data?.customer.last_name,
        userId: data?.user_id,
      },
      financialStatus: data?.financial_status,
      fulfillmentStatus: data?.fulfillment_status,
      currentTotalPrice: data?.current_total_price,
      createdAt: data?.created_at,
      test: data?.test,
      tags: data?.tags,
      orderNumber: data?.order_number,
      items: data?.line_items,
      note: data?.note,
      noteAttributes: data?.note_attributes,
      totalDiscounts: data?.total_discounts,
      totalPrice: data?.total_price,
      totalOutstanding: data?.total_outstanding,
    };
    console.log("record:", record);
    console.log("data.line_items:", data.line_items);
    console.table("data.line_items:", data.line_items);

    data.line_items.forEach((item) => {
      console.log("item:", item);
      item.properties.forEach((prop) => {
        console.log("prop:", prop);
        console.table(prop);
        console.log("prop.name:", prop.name);
        console.log("prop.value:", prop.value);
        // will need to parse through value and split(',') and get each individual ID, IF there are any commas in value ONLY!
      });
    });

    /*
{
  "id": 6112205832390,
  "customer": {
    "id": 7805400809670
  },
  "location_id": null,
  "financial_status": "paid",
  "fulfillment_status": null,
  "current_total_price": "600.00",
  "created_at": "2025-03-14T12:51:31-04:00",
  "test": true,
  "note": null,
  "user_id": null,
  "tags": "",
  "note_attributes": [],
  "total_discounts": "0.00",
  "total_price": "600.00",
  "total_outstanding": "0.00",
  "order_number": 1018,
  "line_items": [
    {
      "id": 14410809573574,
      "quantity": 1,
      "properties": [],
      "product_id": 8377618399430,
      "title": "The Collection Snowboard: Hydrogen",
      "price": "600.00",
      "total_discount": "0.00",
      "variant_id": 44250802913478,
      "variant_title": null
    }
  ]
}

    */

    /*
     


    1) who's the merchant? get their id
    2) get the line items private property string value, parse the CSV into individual IDs
    3) 
    4) query our db and read and confirm that THAT merchant has those file IDs
     
    */

    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.log("order webhook action() msg:", error.message);
    } else {
      console.log("order webhook action() error:", error);
    }
  }
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
            key: "__upfile_id",
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
