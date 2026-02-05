# Complete Implementation Examples

## Example 1: Production Login Form (Google v3)

```tsx
import { useState, useRef, FormEvent } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Trigger CAPTCHA verification
      await captchaRef.current?.execute();
    } catch (err) {
      setError('CAPTCHA verification failed');
      setIsLoading(false);
    }
  };

  const handleCaptchaVerify = async (token: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaToken: token
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store auth token
      localStorage.setItem('authToken', data.token);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      captchaRef.current?.reset(); // Allow retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            disabled={isLoading}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            disabled={isLoading}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <Captcha
          ref={captchaRef}
          provider="google-v3"
          siteKey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
          action="login"
          onVerify={handleCaptchaVerify}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

## Example 2: Signup Form (Cloudflare Turnstile Checkbox)

```tsx
import { useState, useRef, FormEvent } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupForm() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters');
    }

    if (!captchaToken) {
      newErrors.push('Please complete the CAPTCHA verification');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setErrors(errors.filter(e => !e.includes('CAPTCHA')));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          captchaToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      // Success - redirect to login
      window.location.href = '/login?signup=success';
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Signup failed']);
      
      // Reset CAPTCHA on error
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            disabled={isSubmitting}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            disabled={isSubmitting}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            disabled={isSubmitting}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            disabled={isSubmitting}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        {errors.length > 0 && (
          <div className="error-list">
            {errors.map((error, idx) => (
              <div key={idx} className="error-message">{error}</div>
            ))}
          </div>
        )}

        <div className="captcha-container">
          <Captcha
            ref={captchaRef}
            provider="cloudflare-turnstile"
            siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
            mode="checkbox"
            theme="light"
            onVerify={handleCaptchaVerify}
          />
        </div>

        <button type="submit" disabled={isSubmitting || !captchaToken}>
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
```

---

## Example 3: Contact Form (Invisible Cloudflare)

```tsx
import { useState, useRef, FormEvent } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      // Execute invisible CAPTCHA
      await captchaRef.current?.execute();
    } catch (err) {
      setStatus('error');
      setErrorMessage('CAPTCHA verification failed');
    }
  };

  const handleCaptchaVerify = async (token: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaToken: token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message');
      captchaRef.current?.reset();
    }
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>

      {status === 'success' && (
        <div className="success-message">
          ✅ Message sent successfully! We'll get back to you soon.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              required
              disabled={status === 'sending'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              disabled={status === 'sending'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            required
            disabled={status === 'sending'}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={6}
            required
            disabled={status === 'sending'}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        {status === 'error' && (
          <div className="error-message">{errorMessage}</div>
        )}

        <Captcha
          ref={captchaRef}
          provider="cloudflare-turnstile"
          siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
          mode="invisible"
          onVerify={handleCaptchaVerify}
        />

        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
```

---

## Example 4: Multi-Step Checkout

```tsx
import { useState, useRef } from 'react';
import { Captcha, CaptchaHandle } from 'captcha-react';

type Step = 'shipping' | 'payment' | 'review';

export function CheckoutFlow() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = async () => {
    if (currentStep === 'shipping') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      // Execute CAPTCHA on final step
      setIsProcessing(true);
      try {
        await captchaRef.current?.execute();
      } catch (err) {
        setIsProcessing(false);
        alert('Verification failed');
      }
    }
  };

  const handleCaptchaVerify = async (token: string) => {
    try {
      const response = await fetch('/api/checkout/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // ... checkout data
          captchaToken: token
        })
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      // Success - redirect to confirmation
      window.location.href = '/order/confirmation';
    } catch (err) {
      alert('Checkout failed. Please try again.');
      captchaRef.current?.reset();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-flow">
      <div className="progress-bar">
        <div className={currentStep === 'shipping' ? 'active' : ''}>Shipping</div>
        <div className={currentStep === 'payment' ? 'active' : ''}>Payment</div>
        <div className={currentStep === 'review' ? 'active' : ''}>Review</div>
      </div>

      {currentStep === 'shipping' && <ShippingForm />}
      {currentStep === 'payment' && <PaymentForm />}
      {currentStep === 'review' && <ReviewOrder />}

      {/* CAPTCHA only on final step */}
      {currentStep === 'review' && (
        <Captcha
          ref={captchaRef}
          provider="google-v3"
          siteKey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
          action="checkout"
          onVerify={handleCaptchaVerify}
        />
      )}

      <button onClick={handleNext} disabled={isProcessing}>
        {currentStep === 'review' 
          ? (isProcessing ? 'Processing...' : 'Complete Order')
          : 'Next'}
      </button>
    </div>
  );
}
```

---

## Example 5: Custom Hook for Reusability

```tsx
import { useRef, useState, useCallback } from 'react';
import type { CaptchaHandle } from 'captcha-react';

interface UseCaptchaOptions {
  onSuccess?: (token: string) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useCaptcha(options: UseCaptchaOptions = {}) {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsVerifying(true);
    setError(null);

    try {
      await captchaRef.current?.execute();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('CAPTCHA failed');
      setError(error.message);
      options.onError?.(error);
      setIsVerifying(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    captchaRef.current?.reset();
    setError(null);
    setIsVerifying(false);
  }, []);

  const handleVerify = useCallback(async (token: string) => {
    try {
      await options.onSuccess?.(token);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Verification failed');
      setError(error.message);
      options.onError?.(error);
      reset();
    } finally {
      setIsVerifying(false);
    }
  }, [options, reset]);

  return {
    captchaRef,
    execute,
    reset,
    handleVerify,
    isVerifying,
    error
  };
}

// Usage:
function LoginWithHook() {
  const { captchaRef, execute, handleVerify, isVerifying, error } = useCaptcha({
    onSuccess: async (token) => {
      await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ captchaToken: token })
      });
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); execute(); }}>
      <input type="email" />
      <input type="password" />
      
      <Captcha
        ref={captchaRef}
        provider="google-v3"
        siteKey="..."
        onVerify={handleVerify}
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Environment Variables Setup

```env
# .env.local
VITE_GOOGLE_RECAPTCHA_SITE_KEY=your_google_site_key
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your_cloudflare_site_key
```

---

## CSS Styling Examples

```css
/* Basic form styles */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* CAPTCHA container */
.captcha-container {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
}

/* Error messages */
.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin: 1rem 0;
}

.error-list {
  margin: 1rem 0;
}

/* Success messages */
.success-message {
  padding: 0.75rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  margin: 1rem 0;
}

/* Submit button */
button[type="submit"] {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #1565c0;
}

button[type="submit"]:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}
```

---

See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for more patterns and best practices.
