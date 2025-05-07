import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, db } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Auth/: Attempting to authenticate admin request...");

    const { admin, session } = await authenticate.admin(request);
    console.log("admin:", admin);
    console.log("session.shop:", session.shop);
    console.log("session.accessToken:", session.accessToken);

    if (!session.shop || !session.accessToken) {
      throw new Error("Missing shop or access token in session");
    }

    // Create the storefront token
    const storefrontToken = await createStorefrontTokenGraphQL(
      session.shop,
      session.accessToken,
    );
    console.log("storefrontToken:", storefrontToken);
    if (!storefrontToken) {
      throw new Error("Failed to create storefront token");
    }

    console.log("Storefront token created:", storefrontToken);
    if (!db) {
      return null;
    }
    // Store the token in your database
    const res = await db
      .collection("storefrontAPITokens")
      .updateOne(
        { shop: session.shop },
        { $set: { storefrontToken } },
        { upsert: true },
      );

    if (!res) {
      return null;
    }

    return redirect("/app");
  } catch (error) {
    console.error("Admin authentication failed:", error);
    throw error;
  }
};

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
    console.log("GraphQL response:", json);

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
    console.error("Error in createStorefrontTokenGraphQL:", error);
    return null;
  }
}
