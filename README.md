# captcha-react

> **Imperative, ref-based React CAPTCHA component** supporting Google reCAPTCHA v3 and Cloudflare Turnstile

## ✨ Features

- 🎯 **Imperative API** — You control when CAPTCHA executes (no auto-execution)
- 🔄 **Multi-Provider Support** — Google v3 & Cloudflare Turnstile
- 👻 **Invisible & Checkbox Modes**
- 🎨 **Theme Support** (Cloudflare)
- 📦 **Zero Dependencies** (only React peer dep)
- 📘 **Full TypeScript Support**
- 🚀 **Simple API** — Ref-based control with `execute()` and `reset()`

## 📦 Installation

```bash
npm install captcha-react
```

## 🚀 Quick Start

### Google reCAPTCHA v3 (Invisible)

```tsx
import { useRef } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

function LoginForm() {
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleLogin = async () => {
    // Execute CAPTCHA when user clicks login
    await captchaRef.current?.execute();
  };

  return (
    <form>
      <input type="email" />
      <input type="password" />
      
      <Captcha
        ref={captchaRef}
        provider="google-v3"
        siteKey="your-google-site-key"
        action="login"
        onVerify={(token) => {
          // Send token to backend
          fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ captchaToken: token })
          });
        }}
      />
      
      <button type="button" onClick={handleLogin}>
        Login
      </button>
    </form>
  );
}
```

### Cloudflare Turnstile (Checkbox)

```tsx
import { useRef } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

function SignupForm() {
  const captchaRef = useRef<CaptchaHandle>(null);

  return (
    <form>
      <input type="text" />
      
      {/* User clicks checkbox to verify */}
      <Captcha
        ref={captchaRef}
        provider="cloudflare-turnstile"
        siteKey="your-cloudflare-site-key"
        mode="checkbox"
        theme="dark"
        onVerify={(token) => {
          console.log('Verified!', token);
        }}
      />
      
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## 📖 API Reference

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | `'google-v3' \| 'cloudflare-turnstile'` | ✅ | Captcha provider |
| `siteKey` | `string` | ✅ | Your site key |
| `action` | `string` | ❌ | Action name (Google v3 only, default: `'default'`) |
| `mode` | `'invisible' \| 'checkbox'` | ❌ | Display mode (default: `'invisible'`) |
| `theme` | `'light' \| 'dark' \| 'auto'` | ❌ | Theme (Cloudflare only, default: `'light'`) |
| `onVerify` | `(token: string) => void` | ✅ | Callback with token |

### Ref Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `execute()` | `Promise<void>` | Manually trigger CAPTCHA execution |
| `reset()` | `void` | Reset CAPTCHA state (useful after errors) |

## 🎯 How It Works

1. Component loads CAPTCHA scripts on mount (but doesn't execute)
2. Developer calls `captchaRef.current?.execute()` when needed
3. CAPTCHA generates token
4. `onVerify(token)` callback is triggered
5. Developer sends token to backend for verification
6. On error, call `captchaRef.current?.reset()` to retry

## 📂 Project Structure

```
captcha-react/
 ├─ components/
 │    └─ Captcha.tsx        # Main component
 ├─ loaders/
 │    ├─ googleLoader.ts    # Google script loader
 │    └─ cloudflareLoader.ts # Cloudflare script loader
 └─ types/
      └─ index.ts           # TypeScript types
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! See [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md) for detailed usage examples.

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
