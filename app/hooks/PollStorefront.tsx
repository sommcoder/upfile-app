export const pollForBlockActivation = async (themeId, filename) => {
  const POLL_INTERVAL = 2000;
  const MAX_ATTEMPTS = 10;
  let attempts = 0;

  console.log("poll for block activation check!");

  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        return reject(new Error("File not found after max attempts"));
      }

      try {
        const res = await fetch(
          `/theme-files?file=${encodeURIComponent(filename)}&theme=${encodeURIComponent(themeId)}`,
        );

        console.log("res:", res);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const blocksArr = await res.json();
        console.log("POLL: blocksArr:", blocksArr);

        if (Array.isArray(blocksArr)) {
          const allActive = blocksArr.every((b) => b.disabled === false);
          console.log("BLOCKS allActive:", allActive);
          if (allActive) return resolve(allActive);
        }

        attempts++;
        setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        console.error("Polling error:", err);
        attempts++;
        setTimeout(poll, POLL_INTERVAL);
      }
    };
    poll();
  });
};
