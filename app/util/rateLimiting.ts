// // app/utils/rateLimiter.ts

// // 10 requests for every 15 minutes
// export function createRateLimiter = (
//   MAX_REQUESTS_PER_WINDOW: number = 10,
//   RATE_LIMIT_WINDOW: number = 15 * 60 * 1000, // 15 minutes
// ) {
//   const requestCounts = new Map<string, { count: number; lastReset: number }>();

//   return async (request: Request) => {
//     const ip =
//       request.headers.get("x-shopify-client-ip") ||
//       request.headers.get("x-forwarded-for")?.split(",")[0].trim();

//     if (!ip) {
//       return { status: 400, message: "Unable to determine client IP" };
//     }

//     const now = Date.now();
//     const entry = requestCounts.get(ip) || { count: 0, lastReset: now };

//     if (now - entry.lastReset > RATE_LIMIT_WINDOW) {
//       requestCounts.set(ip, { count: 1, lastReset: now });
//     } else {
//       if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
//         return {
//           status: 429,
//           message: "Too many requests, please try again later.",
//         };
//       }
//       requestCounts.set(ip, {
//         count: entry.count + 1,
//         lastReset: entry.lastReset,
//       });
//     }

//     return null; // No errors, proceed
//   };
// };
