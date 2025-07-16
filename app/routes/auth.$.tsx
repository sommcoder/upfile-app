import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createInitAppDefinitions } from "app/transactions/installation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Auth/: Attempting to authenticate admin request...");
    await authenticate.admin(request);
    // const result = await createInitAppDefinitions(admin);
    // console.log("result:", result);

    // if (!result) {
    //   throw new Error("App Definition Creation Failed");
    // }

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
