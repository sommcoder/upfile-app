const THROTTLE_START = 5; // Max requests per window, non-blocking delays will occur
const THROTTLE_LIMIT = 10; // Absolute max request limit, new requests will be rejected
const THROTTLE_TIME_WINDOW = 10000; // 10 seconds

const requestCounts = new Map<string, { count: number; timestamp: number }>();

// ! A Network firewall should be used to do this FOR us, but this is a simple example of how to implement rate limiting in a serverless function
export function isThrottled(ip: string): Promise<boolean> {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return Promise.resolve(false); // No throttle, immediately respond
  }

  // Handle reset of count after the window
  if (now - record.timestamp > THROTTLE_TIME_WINDOW) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return Promise.resolve(false); // No throttle, immediately respond
  }

  // Check if the max limit has been reached
  if (record.count >= THROTTLE_LIMIT) {
    return Promise.resolve(false); // Reject request immediately if max limit reached
  }

  if (record.count >= THROTTLE_START) {
    return new Promise((resolve) => {
      // resolves True after the difference between the current time and the last request time
      setTimeout(
        () => {
          resolve(true);
        },
        THROTTLE_TIME_WINDOW - (now - record.timestamp),
      );
    });
  }

  // Increment the count if no throttling is needed
  record.count++;
  return Promise.resolve(false); // No throttle, immediately respond
}
