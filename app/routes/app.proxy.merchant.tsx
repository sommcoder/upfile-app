import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { settings } from "app/data/merchant-settings";
// import type { MerchantStore } from "app/types";
// import { type Collection } from "mongodb";

import { authenticate, db } from "app/shopify.server";

// db check:
try {
  if (!db) {
    // maybe we should TRY to reconnect before throwing an Error
    throw new Error("No valid database connection");
  }
} catch (error) {
  if (error instanceof Error) {
    console.log("proxy.file msg:", error.message);
  } else {
    console.log("proxy.file error:", error);
  }
}

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("merchant action request:", request);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.log("action msg:", error.message);
    } else {
      console.log("action error:", error);
    }
  }
};

// loads the merchant settings for the theme app block
export const loader: LoaderFunction = async ({ request }) => {
  try {
    // console.log("request:", request);
    // if (!request || !request.body) return null;

    // console.log("merchant loader request:", request);

    const { session } = await authenticate.public.appProxy(request);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    return new Response(
      JSON.stringify({
        ...settings,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log("loader() msg:", error.message);
    } else {
      console.log("loader() error:", error);
    }
    return new Response("Internal Server Error", { status: 500 });
  }
};
