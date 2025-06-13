import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
// import fetch from "node-fetch";
import { verifyShopifyWebhook } from "app/util/verifyWebhook";

const SHOPIFY_API_URL =
  "https://your-store.myshopify.com/admin/api/2025-01/graphql.json";
const SHOPIFY_ACCESS_TOKEN = "your-shopify-access-token";

export const loader: LoaderFunction = async ({ request }) => {
  return new Response("Not a valid HTTP method", { status: 400 });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const { topic, shop, session, payload, apiVersion, webhookId, admin } =
      await authenticate.webhook(request);

    // admin is returned ONLY if there is a session for the shop!

    // webhookId is a UNIQUE id for the webhook and is useful to keep track of WHICH events your app has already processed!

    console.log("topic:", topic);
    console.log("shop:", shop);
    console.log("session:", session);
    console.log("payload:", payload);
    // TODO: There is a five-second timeout for the entire request: Shopify expects to establish the connection and receive your response in less than five seconds or the request times out.
    if (!session) {
      return new Response("No active Session for Shop", { status: 400 });
    }
    if (!admin) {
      return new Response("No Admin Resource Available", { status: 500 });
    }

    // TODO: apparently we can get sent duplicates of the SAME webhook event.. so we'll need to manage that!
    if (!payload) return null;

    return null;
    // should construct this data to what's best for the DB
    const record = {
      orderId: payload?.id,
      locationId: payload?.location_id, // no merchant id, sale is by location!
      customer: {
        id: payload?.customer.id,
        fname: payload?.customer.first_name,
        lname: payload?.customer.last_name,
        userId: payload?.user_id,
      },
      financialStatus: payload?.financial_status,
      fulfillmentStatus: payload?.fulfillment_status,
      currentTotalPrice: payload?.current_total_price,
      createdAt: payload?.created_at,
      test: payload?.test,
      tags: payload?.tags,
      orderNumber: payload?.order_number,
      items: payload?.line_items,
      note: payload?.note,
      noteAttributes: payload?.note_attributes,
      totalDiscounts: payload?.total_discounts,
      totalPrice: payload?.total_price,
      totalOutstanding: payload?.total_outstanding,
    };
    console.log("payload.line_items:", payload.line_items);
    console.table("payload.line_items:", payload.line_items);

    // TODO: parse the private props of each line item
    const metafieldObj: { [key: string]: string[] } = {};

    payload.line_items.forEach((item: any) => {
      console.log("item:", item);

      if (item.properties.length === 0) {
        return;
      }

      item.properties.forEach((prop: { name: string; value: string }) => {
        console.log("prop:", prop);
        console.table(prop);
        console.log("prop.name:", prop.name);
        console.log("prop.value:", prop.value);

        if (prop.name !== "__upfile_id") {
          return;
        }

        const strArr = prop.value.split(",");
        console.log("strArr:", strArr);
        // I just need each line item and an list of strings associated with it
        metafieldObj[item] = strArr;
      });
    });
    console.log("record:", record);
    console.log("metafieldObj:", metafieldObj);

    // TODO: update the order asset based on the order_id with metafields that we got from the private properties of the line_items
    if (topic !== "ORDERS_CREATE") {
      return new Response("Incorrect Topic for this route", { status: 400 });
    }

    // await admin.graphql(`
    //  /* GraphQL */
    // orderUpdate(input: {
    //     id: "gid://shopify/Order/${orderId}",
    //     metafields: [
    //       {
    //         namespace: "custom_documents",
    //         key: "__upfile_id",
    //         value: "${fileIds}",
    //         valueType: STRING
    //       }
    //     ]
    //   }) {
    //     order {
    //       id
    //       metafields(first: 10) {
    //         edges {
    //           node {
    //             key
    //             value
    //           }
    //         }
    //       }
    // }
    // `);

    // TODO: update Database. Configure the file document so that it won't be deleted in 14 days. ie. The order that's connected with the file HAS BEEN placed!

    return new Response("Success!", {
      status: 200,
      headers: {
        Connection: "keep-alive",
        "Keep-Alive": "timeout=60, max=25",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("order webhook action() msg:", error.message);
    } else {
      console.log("order webhook action() error:", error);
    }
  }
};
