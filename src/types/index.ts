export type CaptchaProvider = 'google-v3' | 'cloudflare-turnstile';

export type CaptchaMode = 'invisible' | 'checkbox';

export interface CaptchaProps {
  provider: CaptchaProvider;
  siteKey: string;
  action?: string;           // Optional, for Google v3
  mode?: CaptchaMode;        // Optional, mainly for Cloudflare
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark' | 'auto'; // Cloudflare only
  skip?: boolean;            // Skip captcha validation
  containerProps?: React.HTMLAttributes<HTMLDivElement>;

}

export interface CaptchaHandle {
  execute: () => Promise<void>;
  reset: () => void;
}

export interface CaptchaRef {
  reset: () => void;
}