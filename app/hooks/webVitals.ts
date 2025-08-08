// TODO: add web vital tracking

// Define the callback function
const callback = async (metrics) => {
  const monitorUrl = "https://yourserver.com/web-vitals-metrics";
  const data = JSON.stringify(metrics);

  navigator.sendBeacon(monitorUrl, data);
};

// Register the callback
// shopify?.webVitals?.onReport(callback);
