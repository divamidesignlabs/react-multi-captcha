# CAPTCHA Component Usage Guide

## Overview

This is a **ref-based, imperative** CAPTCHA component for React. It gives you full control over when CAPTCHA executes.

**Key Features:**
- ✅ No auto-execution on mount
- ✅ Developer controls when to execute
- ✅ Clean reset functionality
- ✅ Works with any React app
- ✅ TypeScript support

---

## Installation

```bash
npm install @your-org/captcha-react
```

---

## Basic Usage

### 1. Google reCAPTCHA v3 (Invisible)

```tsx
import { useRef } from 'react';
import { Captcha, CaptchaHandle } from '@your-org/captcha-react';

function LoginForm() {
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleLogin = async () => {
    // Execute CAPTCHA when user clicks login
    await captchaRef.current?.execute();
  };

  const handleVerify = async (token: string) => {
    // Send token to your backend
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ 
        captchaToken: token,
        email: '...',
        password: '...'
      })
    });

    if (!response.ok) {
      // Reset if login fails
      captchaRef.current?.reset();
    }
  };

  return (
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      
      <Captcha
        ref={captchaRef}
        provider="google-v3"
        siteKey="YOUR_GOOGLE_SITE_KEY"
        action="login"
        onVerify={handleVerify}
      />
      
      <button type="button" onClick={handleLogin}>
        Login
      </button>
    </form>
  );
}
```

---

### 2. Cloudflare Turnstile (Checkbox Mode)

```tsx
import { useRef } from 'react';
import { Captcha, CaptchaHandle } from '@your-org/captcha-react';

function SignupForm() {
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleVerify = async (token: string) => {
    // Send token to backend
    const response = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        captchaToken: token,
        username: '...'
      })
    });

    if (!response.ok) {
      // Reset checkbox on error
      captchaRef.current?.reset();
    }
  };

  return (
    <form>
      <input type="text" placeholder="Username" />
      
      {/* User clicks checkbox to trigger verification */}
      <Captcha
        ref={captchaRef}
        provider="cloudflare-turnstile"
        siteKey="YOUR_CLOUDFLARE_SITE_KEY"
        mode="checkbox"
        theme="light"
        onVerify={handleVerify}
      />
      
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

---

### 3. Cloudflare Turnstile (Invisible Mode)

```tsx
import { useRef } from 'react';
import { Captcha, CaptchaHandle } from '@your-org/captcha-react';

function ContactForm() {
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleSubmit = async () => {
    // Execute invisible CAPTCHA before submitting
    await captchaRef.current?.execute();
  };

  const handleVerify = async (token: string) => {
    // Send form + token to backend
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ 
        captchaToken: token,
        message: '...'
      })
    });
  };

  return (
    <form>
      <textarea placeholder="Your message" />
      
      <Captcha
        ref={captchaRef}
        provider="cloudflare-turnstile"
        siteKey="YOUR_CLOUDFLARE_SITE_KEY"
        mode="invisible"
        onVerify={handleVerify}
      />
      
      <button type="button" onClick={handleSubmit}>
        Send
      </button>
    </form>
  );
}
```

---

## API Reference

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | `'google-v3' \| 'cloudflare-turnstile'` | ✅ | CAPTCHA provider |
| `siteKey` | `string` | ✅ | Your public site key |
| `action` | `string` | ❌ | Google only - action name (default: `'default'`) |
| `mode` | `'checkbox' \| 'invisible'` | ❌ | Cloudflare only (default: `'invisible'`) |
| `theme` | `'light' \| 'dark' \| 'auto'` | ❌ | Cloudflare only (default: `'light'`) |
| `onVerify` | `(token: string) => void` | ✅ | Called when CAPTCHA is verified |

### Ref Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `execute()` | `Promise<void>` | Trigger CAPTCHA execution |
| `reset()` | `void` | Reset CAPTCHA state |

---

## Common Patterns

### Pattern 1: Login Flow

```tsx
const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  
  // 1. Trigger CAPTCHA
  await captchaRef.current?.execute();
  
  // 2. onVerify will be called with token
  // 3. Send token to backend
};

const handleVerify = async (token: string) => {
  try {
    const res = await loginAPI({ email, password, captchaToken: token });
    if (res.ok) {
      navigate('/dashboard');
    } else {
      captchaRef.current?.reset(); // Reset on failure
    }
  } catch (err) {
    captchaRef.current?.reset();
  }
};
```

---

### Pattern 2: Multi-Step Form

```tsx
const [step, setStep] = useState(1);

const handleNextStep = async () => {
  if (step === 3) {
    // Execute CAPTCHA on final step
    await captchaRef.current?.execute();
  } else {
    setStep(step + 1);
  }
};

const handleVerify = async (token: string) => {
  // Submit entire form
  await submitForm({ ...formData, captchaToken: token });
};
```

---

### Pattern 3: Retry Logic

```tsx
const handleVerify = async (token: string) => {
  const res = await fetch('/api/action', {
    method: 'POST',
    body: JSON.stringify({ captchaToken: token })
  });

  if (!res.ok) {
    const data = await res.json();
    
    if (data.error === 'captcha_failed') {
      // Reset and let user try again
      captchaRef.current?.reset();
      alert('Verification failed. Please try again.');
    }
  }
};
```

---

## TypeScript

```tsx
import { useRef } from 'react';
import type { CaptchaHandle } from '@your-org/captcha-react';

function MyComponent() {
  // Typed ref
  const captchaRef = useRef<CaptchaHandle>(null);

  // Type-safe callback
  const handleVerify = (token: string): void => {
    console.log('Token:', token);
  };

  return (
    <Captcha
      ref={captchaRef}
      provider="google-v3"
      siteKey="..."
      onVerify={handleVerify}
    />
  );
}
```

---

## FAQ

### Q: Why doesn't CAPTCHA execute automatically?

**A:** This is intentional. Auto-execution causes:
- Unexpected API calls on page load
- Poor UX (CAPTCHA before user interacts)
- Wasted tokens

You control when to execute via `captchaRef.current?.execute()`.

---

### Q: When should I call `reset()`?

**A:**
- After failed login/signup attempts
- When user needs to retry
- When CAPTCHA expires (Cloudflare checkbox)

---

### Q: Can I use this in Next.js?

**A:** Yes! This works in any React app (Next.js, Vite, CRA, Remix, etc.).

---

### Q: How do I verify the token on the backend?

**A:** See your NestJS integration package for backend verification.

---

## Migration from Auto-Execute Version

**Before (auto-execute on mount):**
```tsx
<Captcha
  provider="google-v3"
  siteKey="..."
  onVerify={handleVerify}
/>
// ❌ Executes immediately when component mounts
```

**After (manual control):**
```tsx
const captchaRef = useRef<CaptchaHandle>(null);

<Captcha
  ref={captchaRef}
  provider="google-v3"
  siteKey="..."
  onVerify={handleVerify}
/>

<button onClick={() => captchaRef.current?.execute()}>
  Login
</button>
// ✅ Executes only when you call execute()
```

---

## License

MIT
