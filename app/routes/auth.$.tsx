import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, db } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Auth/: Attempting to authenticate admin request...");
    const { admin, session } = await authenticate.admin(request);

    console.log("AUTH admin:", admin);
    console.log("AUTH session:", session);
    // after the merchant has installed the app, we can create a Storefront Access Token to allow the app to access the Storefront API
    const response = await admin.graphql(
      `#graphql
  mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
    storefrontAccessTokenCreate(input: $input) {
      userErrors {
        field
        message
      }
      shop {
        id
      }
      storefrontAccessToken {
        accessScopes {
          handle
        }
        accessToken
        title
      }
    }
  }`,
      {
        variables: {
          input: {
            title: "New Storefront Access Token",
          },
        },
      },
    );

    const data = await response.json();

    if (!data) {
      throw new Error("No data returned from Storefront Access Token creation");
    }

    console.log("AUTH data.data:", data.data);
    console.log(
      "AUTH access token:",
      data.data.storefrontAccessTokenCreate.storefrontAccessToken,
    );

    if (!db) {
      throw new Error("No valid database connection");
    }

    await db.collection("shopify_sessions").updateOne(
      { id: session.id },
      {
        $set: {
          storefrontToken:
            data.data.storefrontAccessTokenCreate.storefrontAccessToken
              .accessToken,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return redirect("/app");
  } catch (error) {
    console.error("Admin authentication failed:", error);
    throw error;
  }
};
