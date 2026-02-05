# Migration Guide: Auto-Execute → Imperative API

## Overview

The CAPTCHA component has been refactored from **auto-execute on mount** to an **imperative ref-based API**. This gives you complete control over when CAPTCHA verification happens.

---

## What Changed?

### Before (v0.1.0 - Auto-Execute)

```tsx
import { Captcha } from 'captcha-react';

function LoginForm() {
  return (
    <Captcha
      provider="google-v3"
      siteKey="..."
      onVerify={(token) => {
        // This fires automatically when component mounts!
        sendToBackend(token);
      }}
    />
  );
}
```

**Problems:**
- ❌ CAPTCHA executes immediately on page load
- ❌ No control over execution timing
- ❌ Can't retry/reset after errors
- ❌ Wastes tokens on unmounted components
- ❌ Poor UX (verification before user interaction)

---

### After (v0.2.0+ - Imperative API)

```tsx
import { useRef } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

function LoginForm() {
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleLogin = async () => {
    // Execute CAPTCHA only when user clicks login
    await captchaRef.current?.execute();
  };

  return (
    <form>
      <Captcha
        ref={captchaRef}
        provider="google-v3"
        siteKey="..."
        onVerify={(token) => {
          // This fires ONLY when execute() is called
          sendToBackend(token);
        }}
      />
      
      <button onClick={handleLogin}>Login</button>
    </form>
  );
}
```

**Benefits:**
- ✅ You control when CAPTCHA executes
- ✅ No surprise API calls
- ✅ Can reset on errors
- ✅ Better UX (execute on user action)
- ✅ More efficient token usage

---

## Breaking Changes

### 1. Component Must Use `ref`

**Before:**
```tsx
<Captcha provider="google-v3" siteKey="..." onVerify={...} />
```

**After:**
```tsx
const captchaRef = useRef<CaptchaHandle>(null);
<Captcha ref={captchaRef} provider="google-v3" siteKey="..." onVerify={...} />
```

### 2. Must Call `execute()` Manually

**Before:**
```tsx
// Auto-executed on mount - no action needed
```

**After:**
```tsx
// Trigger manually
captchaRef.current?.execute();
```

### 3. New Type Export

**Before:**
```tsx
import { Captcha, CaptchaProps } from 'captcha-react';
```

**After:**
```tsx
import { Captcha, CaptchaProps, CaptchaHandle } from 'captcha-react';
```

---

## Migration Steps

### Step 1: Add Ref

```diff
+ import { useRef } from 'react';
- import { Captcha } from 'captcha-react';
+ import { Captcha, CaptchaHandle } from 'captcha-react';

function MyComponent() {
+  const captchaRef = useRef<CaptchaHandle>(null);

   return (
     <Captcha
+      ref={captchaRef}
       provider="google-v3"
       siteKey="..."
       onVerify={handleVerify}
     />
   );
}
```

### Step 2: Trigger Execution

```diff
function MyComponent() {
   const captchaRef = useRef<CaptchaHandle>(null);

   const handleSubmit = async () => {
+    await captchaRef.current?.execute();
   };

   return (
     <form>
       <Captcha ref={captchaRef} ... />
-      <button type="submit">Submit</button>
+      <button type="button" onClick={handleSubmit}>Submit</button>
     </form>
   );
}
```

### Step 3: Handle Errors with Reset

```diff
const handleVerify = async (token: string) => {
   const response = await fetch('/api/login', {
     method: 'POST',
     body: JSON.stringify({ captchaToken: token })
   });

   if (!response.ok) {
+    captchaRef.current?.reset();
+    alert('Login failed. Please try again.');
   }
};
```

---

## Common Migration Patterns

### Pattern 1: Login Form

```tsx
const captchaRef = useRef<CaptchaHandle>(null);

const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  await captchaRef.current?.execute();
};

const handleVerify = async (token: string) => {
  const res = await loginAPI({ email, password, captchaToken: token });
  if (!res.ok) {
    captchaRef.current?.reset(); // Allow retry
  }
};

return (
  <form onSubmit={handleLogin}>
    <input type="email" />
    <input type="password" />
    <Captcha ref={captchaRef} provider="google-v3" siteKey="..." onVerify={handleVerify} />
    <button type="submit">Login</button>
  </form>
);
```

### Pattern 2: Cloudflare Checkbox

```tsx
const captchaRef = useRef<CaptchaHandle>(null);

// Checkbox mode: user clicks widget to verify
// No need to call execute() - it's triggered by user clicking checkbox

const handleVerify = async (token: string) => {
  await submitForm({ captchaToken: token });
};

return (
  <form>
    <input type="text" />
    <Captcha 
      ref={captchaRef} 
      provider="cloudflare-turnstile" 
      mode="checkbox"
      siteKey="..." 
      onVerify={handleVerify} 
    />
    <button type="submit">Submit</button>
  </form>
);
```

### Pattern 3: Multi-Step Form

```tsx
const [step, setStep] = useState(1);
const captchaRef = useRef<CaptchaHandle>(null);

const handleNext = async () => {
  if (step === 3) {
    // Execute CAPTCHA on final step only
    await captchaRef.current?.execute();
  } else {
    setStep(step + 1);
  }
};

const handleVerify = async (token: string) => {
  await submitEntireForm({ ...formData, captchaToken: token });
};
```

---

## Behavior Differences

| Scenario | Old (Auto-Execute) | New (Imperative) |
|----------|-------------------|------------------|
| Component mounts | ❌ CAPTCHA executes immediately | ✅ Scripts load, no execution |
| User clicks login | ℹ️ Token already generated | ✅ Execute on click |
| Login fails | ❌ Can't retry easily | ✅ Call `reset()` |
| Multiple renders | ❌ May execute multiple times | ✅ Safe - only executes when called |
| Unmount during execution | ❌ Race conditions possible | ✅ Clean cancellation |

---

## Troubleshooting

### Issue: "CAPTCHA not executing"

**Cause:** Forgot to call `execute()`

**Fix:**
```tsx
<button onClick={() => captchaRef.current?.execute()}>
  Submit
</button>
```

---

### Issue: "ref is null"

**Cause:** Accessing ref before component mounts

**Fix:**
```tsx
// ❌ Wrong
useEffect(() => {
  captchaRef.current?.execute(); // Might be null
}, []);

// ✅ Correct
const handleClick = () => {
  captchaRef.current?.execute(); // Always defined when user clicks
};
```

---

### Issue: "Type error: CaptchaHandle not found"

**Cause:** Not importing type

**Fix:**
```tsx
import { Captcha, CaptchaHandle } from 'captcha-react';
```

---

## FAQ

**Q: Why this change?**  
A: The old auto-execute behavior caused poor UX and wasted CAPTCHA tokens. The imperative API gives you full control.

**Q: Do I need to migrate immediately?**  
A: Yes, v0.2.0+ only supports the imperative API.

**Q: What about Cloudflare checkbox mode?**  
A: Checkbox mode doesn't need `execute()` - user clicking checkbox triggers verification automatically.

**Q: Can I execute multiple times?**  
A: Yes, call `execute()` as many times as needed. For Google v3, each call generates a new token.

**Q: Does this work with React 17?**  
A: Yes, forwardRef and useImperativeHandle work in React 16.3+.

---

## Summary

✅ **Add ref:** `const captchaRef = useRef<CaptchaHandle>(null)`  
✅ **Pass ref:** `<Captcha ref={captchaRef} ... />`  
✅ **Call execute:** `captchaRef.current?.execute()`  
✅ **Handle errors:** `captchaRef.current?.reset()`

---

For more examples, see [USAGE_GUIDE.md](./USAGE_GUIDE.md).
