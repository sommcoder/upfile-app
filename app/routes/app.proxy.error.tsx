// import { type ActionFunction } from "@remix-run/node";
// import logger from "app/util/logger";
// import { authenticate, db } from "app/shopify.server";

// // db check:
// try {
//   if (!db) {
//     // maybe we should TRY to reconnect before throwing an Error
//     throw new Error("No valid database connection");
//   }
// } catch (error) {
//   if (error instanceof Error) {
//     console.log("proxy.file msg:", error.message);
//   } else {
//     console.log("proxy.file error:", error);
//   }
// }

// // ! this is for RECEIVING client side errors
// export const action: ActionFunction = async ({ request }) => {
//   try {
//     // Example of logging an info-level message
//     logger.info("Loading homepage data...");

//     // Simulate data fetch
//     const data = { message: "Hello, Remix!" };

//     console.log("request:", request);
//     const { session } = await authenticate.public.appProxy(request);

//     if (!session) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     const storeId = session.id;
//     const storeDomain = session.shop;

//     if (!storeId || !storeDomain) {
//       return new Response("Invalid session", { status: 400 });
//     }

//     // TODO: want to log errors on our DB in a separate collection called error-logs
//     /*

// CREATE TABLE logs (
//   id SERIAL PRIMARY KEY,
//   store_id INT,
//   user_id INT,    ... does Shopify give us a logged in customer ID?
//   message TEXT,
//   error_type TEXT,
//   stack_trace TEXT,
//   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// */
//     return new Response(JSON.stringify(data));
//   } catch (error) {
//     if (error instanceof Error) {
//       console.log("action msg:", error.message);
//     } else {
//       console.log("action error:", error);
//     }
//   }
// };

// /*

// If your app generates a large amount of logs, you might want to implement log rotation. You can achieve this by using the pino-daily-rotate-file package, which is a separate transport for log file rotation

// */
