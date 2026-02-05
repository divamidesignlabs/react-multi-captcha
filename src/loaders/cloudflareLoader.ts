let cfScriptLoaded = false;
let cfScriptLoading = false;
let cfLoadPromise: Promise<void> | null = null;

export function loadCloudflareScript(): Promise<void> {
  // If already loaded, resolve immediately
  if (cfScriptLoaded && (window as any).turnstile) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (cfScriptLoading && cfLoadPromise) {
    return cfLoadPromise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector(
    'script[src*="challenges.cloudflare.com/turnstile"]'
  );

  if (existingScript && (window as any).turnstile) {
    cfScriptLoaded = true;
    return Promise.resolve();
  }

  cfScriptLoading = true;

  cfLoadPromise = new Promise((resolve, reject) => {
    // Check if turnstile is already available
    if ((window as any).turnstile) {
      cfScriptLoaded = true;
      cfScriptLoading = false;
      return resolve();
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      cfScriptLoaded = true;
      cfScriptLoading = false;

      // Wait for turnstile to be ready
      const checkReady = setInterval(() => {
        if ((window as any).turnstile) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if ((window as any).turnstile) {
          resolve();
        } else {
          reject(
            new Error("Cloudflare Turnstile failed to load")
          );
        }
      }, 10000);
    };

    script.onerror = () => {
      cfScriptLoading = false;
      cfLoadPromise = null;
      reject(
        new Error("Failed to load Cloudflare Turnstile script")
      );
    };

    document.head.appendChild(script);
  });

  return cfLoadPromise;
}

// Reset function (useful for tests / retries)
export function resetCloudflareScript() {
  cfScriptLoaded = false;
  cfScriptLoading = false;
  cfLoadPromise = null;
}
