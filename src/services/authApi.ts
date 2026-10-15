/**
 * Cyber Kawach - Client Authentication API
 * Provides unified, secure backend authentication calls with robust error mapping.
 */

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  error?: string;
}

const TOKEN_KEY = 'cyber_kawach_auth_token';
const CACHED_USER_KEY = 'cyber_kawach_user_profile';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage error while persisting token:', e);
  }
}

export function getStoredCachedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredCachedUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage error while persisting user:', e);
  }
}

export async function registerWithBackend(
  fullName: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<{ user: AuthUser; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = fullName.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: normalizedName,
        email: normalizedEmail,
        password,
        confirmPassword,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      const errorMsg = data.error || (res.status === 409
        ? 'An account with this email address already exists. Please sign in instead.'
        : res.status === 400
        ? 'Please review the entered information and meet the password requirements.'
        : 'A server error occurred during registration. Please try again.');
      const err = new Error(errorMsg);
      (err as any).status = res.status;
      throw err;
    }

    setStoredToken(data.token);
    setStoredCachedUser(data.user);
    return { user: data.user, token: data.token };
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      const netErr = new Error('Network error: Unable to reach authentication server. Please check your internet connection.');
      (netErr as any).isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
}

export async function loginWithBackend(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      const errorMsg = data.error || (res.status === 401
        ? 'Invalid email or password combination. Please try again.'
        : 'An error occurred while signing in. Please try again.');
      const err = new Error(errorMsg);
      (err as any).status = res.status;
      throw err;
    }

    setStoredToken(data.token);
    setStoredCachedUser(data.user);
    return { user: data.user, token: data.token };
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      const netErr = new Error('Network error: Unable to reach authentication server. Please check your internet connection.');
      (netErr as any).isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setStoredToken(null);
      setStoredCachedUser(null);
      return null;
    }

    const data = await res.json();
    if (data.success && data.user) {
      setStoredCachedUser(data.user);
      return data.user;
    }
    return null;
  } catch {
    // If backend is offline or temporary network issue, return cached user
    return getStoredCachedUser();
  }
}

export async function logoutBackend(): Promise<void> {
  const token = getStoredToken();
  setStoredToken(null);
  setStoredCachedUser(null);

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Non-blocking logout failure
    }
  }
}

export async function resetPasswordBackend(email: string): Promise<{ message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const data = await res.json().catch(() => ({}));
    return {
      message: data.message || 'If an account exists with this email address, a password reset link has been dispatched to your inbox.',
    };
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to reach authentication server. Please check your connection.');
    }
    throw err;
  }
}
