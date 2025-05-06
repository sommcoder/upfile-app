import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import { createStorefrontAccessToken } from "app/storefront-token.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Attempting to authenticate admin request...");

    const { admin, session } = await authenticate.admin(request);
    console.log("admin:", admin);

    console.log("session.shop:", session.shop);
    console.log(" session.accessToken:", session.accessToken);

    if (!session.shop || !session.accessToken) {
      return null;
    }
    await createStorefrontTokenGraphQL(session.shop, session.accessToken);

    return redirect("/app");
  } catch (error) {
    console.error("Admin authentication failed:", error);
    throw error;
  }
};

// const { session } = await authenticate.admin(request);
// console.log("Admin authentication successful");

// const shop = session.shop;
// const accessToken = session.accessToken;
// console.log("shop:", shop);
// console.log("accessToken:", accessToken);

// if (!shop || !accessToken) {
//   throw new Error("Missing shop or access token in session");
// }

// // 🆕 Create Storefront Access Token and store it
// await createStorefrontAccessToken(shop, accessToken);

async function createStorefrontTokenGraphQL(shop: string, accessToken: string) {
  try {
    const res = await fetch(`https://${shop}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `
          mutation CreateStorefrontToken {
            storefrontAccessTokenCreate(input: {
              title: "Upfile App Storefront Token"
            }) {
              storefrontAccessToken {
                accessToken
                accessScope
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
      }),
    });

    const json = await res.json();
    console.log("json:", json);
    if (
      json.errors ||
      json.data.storefrontAccessTokenCreate.userErrors.length
    ) {
      console.error(
        "Error creating token:",
        json.errors || json.data.storefrontAccessTokenCreate.userErrors,
      );
      return null;
    }

    return json.data.storefrontAccessTokenCreate.storefrontAccessToken
      .accessToken;
  } catch (error) {
    if (error instanceof Error) {
      console.log("createStorefrontTokenGraphQL() msg:", error.message);
    } else {
      console.log("createStorefrontTokenGraphQL() error:", error);
    }
  }
}
