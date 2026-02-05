import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import { CaptchaProps, CaptchaRef } from "../types";
import { loadGoogleScript } from "../loaders/googleLoader";
import { loadCloudflareScript } from "../loaders/cloudflareLoader";

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(
  (
    {
      provider,
      siteKey,
      action = "default",
      mode = "invisible",
      theme = "light",
      onVerify,
      skip = false,
    },
    ref
  ) => {
    const widgetRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    /**
     *  Expose reset() to parent
     */
    useImperativeHandle(ref, () => ({
      async reset() {
        // If captcha is skipped, do nothing
        if (skip) return;

        setIsInitialized(false);

        // Handle Cloudflare Turnstile reset
        if (
          provider === "cloudflare-turnstile" &&
          widgetIdRef.current &&
          (window as any).turnstile
        ) {
          try {
            (window as any).turnstile.reset(widgetIdRef.current);
            
            // Auto-execute if invisible mode
            if (mode === "invisible") {
              await new Promise((r) => setTimeout(r, 100));
              (window as any).turnstile.execute(widgetIdRef.current);
            }
          } catch (err) {
            console.error(" Failed to reset Turnstile:", err);
          }
        }

        // Handle Google reCAPTCHA v3 reset (re-execute)
        if (provider === "google-v3") {
          try {
            if ((window as any).grecaptcha?.execute) {
              const token = await (window as any).grecaptcha.execute(
                siteKey,
                { action }
              );
              setIsInitialized(true);
              onVerify(token);
            }
          } catch (err) {
            console.error(
              "Failed to reset Google reCAPTCHA v3:",
              err
            );
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;
      let timeoutId: NodeJS.Timeout;

      async function initCaptcha() {
        // If skip is enabled, call onVerify with a dummy token and return
        if (skip) {
          onVerify('skipped');
          setIsInitialized(true);
          return;
        }

        if (isInitialized) {
          return;
        }

        try {

          /**
           * ---------------- GOOGLE reCAPTCHA v3 ----------------
           */
          if (provider === "google-v3") {
            await loadGoogleScript(siteKey);
            if (!isMounted) return;

            await new Promise((r) => setTimeout(r, 500));

            if ((window as any).grecaptcha?.execute) {
              const token = await (window as any).grecaptcha.execute(
                siteKey,
                { action }
              );

              if (isMounted) {
                setIsInitialized(true);
                onVerify(token);
              }
            } else {
              console.error("grecaptcha.execute not available");
            }
          }

          /**
           * ---------------- CLOUDFLARE TURNSTILE ----------------
           */
          if (provider === "cloudflare-turnstile") {
            await loadCloudflareScript();
            if (!isMounted) return;

            await new Promise((r) => setTimeout(r, 500));

            if (!(window as any).turnstile) {
              console.error("Cloudflare Turnstile not loaded");
              return;
            }

            if (widgetRef.current && !widgetIdRef.current) {
              widgetIdRef.current = (window as any).turnstile.render(
                widgetRef.current,
                {
                  sitekey: siteKey,
                  theme,
                  size:
                    mode === "invisible"
                      ? "invisible"
                      : "normal",

                  callback: (token: string) => {
                    if (!isMounted) return;
                    setIsInitialized(true);
                    onVerify(token);
                  },

                  "expired-callback": () => {
                    setIsInitialized(false);
                  },

                  "error-callback": (err: any) => {
                    console.error(" Turnstile error:", err);
                    setIsInitialized(false);
                  },
                }
              );
              
              // Auto-execute for invisible mode (like Google reCAPTCHA v3)
              if (mode === "invisible") {
                await new Promise((r) => setTimeout(r, 500));
                try {
                  (window as any).turnstile.execute(widgetIdRef.current);
                } catch (err) {
                  console.error(" Failed to execute invisible Turnstile:", err);
                }
              }
            }
          }
        } catch (err) {
          console.error("Captcha initialization failed:", err);
        }
      }

      timeoutId = setTimeout(initCaptcha, 100);

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);

        if (
          provider === "cloudflare-turnstile" &&
          widgetIdRef.current &&
          (window as any).turnstile
        ) {
          try {
            (window as any).turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch (err) {
            console.error(
              "Failed to remove Turnstile widget:",
              err
            );
          }
        }
      };
    }, [
      provider,
      siteKey,
      action,
      mode,
      theme,
      skip,
      isInitialized,
      onVerify,
    ]);

    // If captcha is skipped, don't render anything
    if (skip) {
      return null;
    }

    if (provider === "cloudflare-turnstile") {
      return (
        <div
          ref={widgetRef}
          style={{
            minHeight:
              mode === "checkbox" ? "65px" : "0px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      );
    }

    return null;
  }
);

Captcha.displayName = "Captcha";
