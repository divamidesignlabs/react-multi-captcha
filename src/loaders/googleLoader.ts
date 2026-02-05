let scriptLoaded = false; 
let scriptLoading = false; 
let loadPromise: Promise<void> | null = null;


export function loadGoogleScript(siteKey: string): Promise<void> {
  // If already loaded, resolve immediately
  if (scriptLoaded && (window as any).grecaptcha) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (scriptLoading && loadPromise) {
    return loadPromise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector(
    'script[src*="google.com/recaptcha"]'
  );

  if (existingScript && (window as any).grecaptcha) {
    scriptLoaded = true;
    return Promise.resolve();
  }

  scriptLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    // Check if grecaptcha is already available
    if (
      (window as any).grecaptcha &&
      (window as any).grecaptcha.execute
    ) {
      scriptLoaded = true;
      scriptLoading = false;
      return resolve();
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;

      // Wait for grecaptcha to be ready
      const checkReady = setInterval(() => {
        if (
          (window as any).grecaptcha &&
          (window as any).grecaptcha.execute
        ) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if ((window as any).grecaptcha) {
          resolve();
        } else {
          reject(new Error("Google reCAPTCHA failed to load"));
        }
      }, 10000);
    };

    script.onerror = () => {
      scriptLoading = false;
      loadPromise = null;
      reject(new Error("Failed to load Google reCAPTCHA script"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

// Reset function for testing
export function resetGoogleScript() {
  scriptLoaded = false;
  scriptLoading = false;
  loadPromise = null;
}
