import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticate, db } from "../shopify.server";
import { defineUpfileStoreData, getMerchantAppData } from "app/data/install";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Auth/: Attempting to authenticate admin request...");
    const { admin, session } = await authenticate.admin(request);

    const merchantResponse = await fetch(
      "shopify:admin/api/2025-01/graphql.json",
      {
        method: "POST",
        body: JSON.stringify(getMerchantAppData),
      },
    );

    if (!merchantResponse.ok) {
      throw new Error("writing metaobject failed");
    }

    const data = await merchantResponse.json();
    console.log("data:", data);

    const setAppDataResponse = await admin.graphql(
      defineUpfileStoreData.gql,
      defineUpfileStoreData.variables,
    );

    if (!setAppDataResponse.ok) {
      throw new Error("GQL error: Could not set app data on store");
    }

    return redirect("/app");
  } catch (error) {
    console.error("Admin authentication failed:", error);
    throw error;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // initiate metadata:
  console.log("action", request);

  return null;
};
