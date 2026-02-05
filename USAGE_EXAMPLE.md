# Usage Examples

## Installation

```bash
npm install @your-org/captcha-react
```

## Google reCAPTCHA v3 (Invisible)

```tsx
import { Captcha } from '@your-org/captcha-react';

function LoginForm() {
  const handleVerify = (token: string) => {
    console.log('Captcha token:', token);
    // Send this token to your backend for verification
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ captchaToken: token }),
    });
  };

  return (
    <div>
      <h2>Login</h2>
      <Captcha
        provider="google-v3"
        siteKey="your-google-site-key"
        action="login"
        onVerify={handleVerify}
      />
    </div>
  );
}
```

## Cloudflare Turnstile (Checkbox Mode)

```tsx
import { Captcha } from '@your-org/captcha-react';

function SignupForm() {
  const handleVerify = (token: string) => {
    console.log('Captcha token:', token);
    // Send token to backend
  };

  return (
    <form>
      <h2>Sign Up</h2>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      
      <Captcha
        provider="cloudflare-turnstile"
        siteKey="your-cloudflare-site-key"
        mode="checkbox"
        theme="dark"
        onVerify={handleVerify}
      />
      
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## Cloudflare Turnstile (Invisible Mode)

```tsx
import { Captcha } from '@your-org/captcha-react';

function ContactForm() {
  const handleVerify = (token: string) => {
    console.log('Captcha token:', token);
    // Auto-submits form with token
  };

  return (
    <div>
      <h2>Contact Us</h2>
      <Captcha
        provider="cloudflare-turnstile"
        siteKey="your-cloudflare-site-key"
        mode="invisible"
        onVerify={handleVerify}
      />
    </div>
  );
}
```

## Multiple Captchas on Same Page

```tsx
import { Captcha } from '@your-org/captcha-react';

function MultiFormPage() {
  return (
    <div>
      {/* Login with Google */}
      <section>
        <h2>Login</h2>
        <Captcha
          provider="google-v3"
          siteKey="google-key"
          action="login"
          onVerify={(token) => console.log('Login token:', token)}
        />
      </section>

      {/* Signup with Cloudflare */}
      <section>
        <h2>Sign Up</h2>
        <Captcha
          provider="cloudflare-turnstile"
          siteKey="cloudflare-key"
          mode="checkbox"
          onVerify={(token) => console.log('Signup token:', token)}
        />
      </section>
    </div>
  );
}
```

## How It Works

1. **Component mounts** → Loads the captcha script (Google or Cloudflare)
2. **Script loads** → Generates token automatically (invisible) or renders checkbox
3. **Token generated** → Calls `onVerify(token)` with the token
4. **Your code** → Sends token to your backend for verification

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | `'google-v3' \| 'cloudflare-turnstile'` | ✅ | Which captcha provider to use |
| `siteKey` | `string` | ✅ | Your site key from the provider |
| `action` | `string` | ❌ | Action name for Google v3 (default: 'default') |
| `mode` | `'invisible' \| 'checkbox'` | ❌ | Display mode (default: 'invisible') |
| `theme` | `'light' \| 'dark' \| 'auto'` | ❌ | Cloudflare theme (default: 'light') |
| `onVerify` | `(token: string) => void` | ✅ | Callback when token is generated |

## Backend Verification

After receiving the token from `onVerify`, verify it on your backend:

### Google reCAPTCHA v3

```javascript
const response = await fetch(
  `https://www.google.com/recaptcha/api/siteverify`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=YOUR_SECRET_KEY&response=${token}`
  }
);

const data = await response.json();
if (data.success && data.score > 0.5) {
  // Valid user
}
```

### Cloudflare Turnstile

```javascript
const response = await fetch(
  'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: 'YOUR_SECRET_KEY',
      response: token
    })
  }
);

const data = await response.json();
if (data.success) {
  // Valid user
}
```

## Advantages

✅ **No global provider** — Works independently, no context needed  
✅ **Multiple providers** — Use Google and Cloudflare on the same page  
✅ **Simple API** — Just pass props, no complex setup  
✅ **TypeScript support** — Fully typed  
✅ **Zero dependencies** — Only React peer dependency  
