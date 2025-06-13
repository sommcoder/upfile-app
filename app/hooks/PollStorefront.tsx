let intervalId: number | null = null;
let timeoutId: number | null = null;
let shopDomain = "https://your-store.myshopify.com"; // Replace with your store domain

function startPollingStorefront() {
  // Prevent multiple intervals
  if (intervalId !== null) return;

  console.log("🔁 Starting polling...");
  intervalId = window.setInterval(() => checkAppEmbedStatus(shopDomain), 5000);

  // Stop polling after 30 seconds
  timeoutId = window.setTimeout(() => {
    console.log("⏱️ Polling timed out after 30 seconds");
    stopPollingStorefront();
  }, 30000); // 30 seconds
}

function stopPollingStorefront() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  console.log("🛑 Stopped polling");
}

async function checkAppEmbedStatus(shopDomain: string) {
  try {
    const res = await fetch(`${shopDomain}`);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const signal = doc.querySelector("#upfile-app-bridge-signal");

    if (signal) {
      const data = JSON.parse(signal.textContent || "{}");
      console.log("📦 Embed signal data:", data);

      if (data.enabled) {
        alert("✅ App embed is now enabled!");
        stopPollingStorefront();
        // Optionally update Admin UI here
      }
    }
  } catch (err) {
    console.error("⚠️ Error checking embed status:", err);
  }
}


//
// Detect user leaving and returning
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    console.log("👋 User left the tab — begin checking embed status");
    startPollingStorefront();
    checkAppEmbedStatus(shopDomain); // Do one check immediately
  } else if (document.visibilityState === "visible") {
    console.log("👀 User came back — do final check");
    checkAppEmbedStatus(shopDomain);
    stopPollingStorefront(); // Cleanup in case interval still running
  }
});
