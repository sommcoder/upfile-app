import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Attempting to authenticate admin request...");
    await authenticate.admin(request);
    console.log("Admin authentication successful");
    return null;
  } catch (error) {
    console.error("Admin authentication failed:", error);
    throw error;
  }
};
