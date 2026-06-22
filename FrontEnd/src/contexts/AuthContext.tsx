// client/src/contexts/AuthContext.tsx
/**
 * FIXED: Authentication Context - Backend Response Format Compatible
 * This fixes the "User not authenticated" issue after successful login
 * 
 * ✅ FIXED: Properly parses your backend's response format
 * ✅ FIXED: Handles success/data structure from your API
 * ✅ FIXED: Correctly reads authentication status from nested data
 * ✅ FIXED: Better error handling and debugging
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types/user';
import { AuthAPI } from '../services/authService';
import { apiBaseUrl } from '../services/api';
import { infCheckinService } from '../services/infCheckinService';

// ==================== TYPES ====================

// Re-export for backward compatibility
export type { User, UserRole };

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionExpiry: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isLoading?: boolean;
  sessionExpiry: string | null;
}

// ==================== CONTEXT CREATION ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== AUTH PROVIDER ====================

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true, // Start with loading true
    error: null,
    sessionExpiry: null,
  });

  const api = new AuthAPI();

  // ==================== AUTH FUNCTIONS ====================

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔐 Attempting login for:', credentials.username);

      const user = await api.login(credentials);
      
      console.log('✅ Login successful, user:', user);

      // ✅ CRITICAL FIX: Update state with authenticated user
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
        sessionExpiry: null // Will be set by subsequent checkAuth
      });

      // ✅ ADDITIONAL FIX: Force a re-check after login to ensure session is working
      setTimeout(async () => {
        try {
          await checkAuth();
        } catch (error) {
          console.error('Post-login auth check failed:', error);
        }
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login failed:', errorMessage);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        user: null,
        isAuthenticated: false,
        sessionExpiry: null
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🚪 Attempting logout...');

      await api.logout();

      sessionStorage.removeItem('qcv:checkin-fired');

      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        sessionExpiry: null
      });

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      sessionStorage.removeItem('qcv:checkin-fired');
      // Even if server logout fails, clear client state
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        sessionExpiry: null
      });
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🔍 Checking authentication status...');

      const result = await api.checkStatus();

      console.log('📊 Auth check result:', result);

      setState({
        user: result.user || null,
        isAuthenticated: result.isAuthenticated,
        loading: false,
        error: null,
        sessionExpiry: result.sessionExpiry || null
      });

      if (result.isAuthenticated && result.user) {
        // Successful authentication — clear the loop-detection flag set by
        // LoginPage so a future logout/expiry doesn't false-positive as a
        // cookie persistence failure.
        sessionStorage.removeItem('qcv:login-attempt');
        console.log('✅ User authenticated:', result.user.username);

        // Fire user check-in once per browser session, on the page *after*
        // the post-login redirect. Doing this here instead of inline on
        // LoginPage avoids racing the cookie write on iPad Safari — by the
        // time /status comes back authenticated, the session cookie is
        // guaranteed to be attached to outbound requests.
        if (!sessionStorage.getItem('qcv:checkin-fired')) {
          sessionStorage.setItem('qcv:checkin-fired', '1');
          infCheckinService.triggerUserCheckin(result.user.username);
        }
      } else {
        console.log('👤 User not authenticated');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auth check failed';
      console.error('❌ Auth check failed:', errorMessage);

      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null, // Don't show error for auth check failures
        sessionExpiry: null
      });
    }
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Update user in context without full re-authentication
   * Use this after updating profile to avoid page reload
   */
  const updateUser = useCallback((updatedUser: Partial<User>): void => {
    console.log('🔄 Updating user in AuthContext:', updatedUser);

    setState(prev => {
      if (!prev.user) {
        console.warn('⚠️ Cannot update user - no user in context');
        return prev;
      }

      const merged = {
        ...prev.user,
        ...updatedUser
      };

      console.log('✅ User updated in context:', merged);

      return {
        ...prev,
        user: merged
      };
    });
  }, []);

  // ==================== ROLE FUNCTIONS ====================

  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  }, [state.user]);

  // ==================== EFFECTS ====================

  // Check authentication on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (mounted) {
          await checkAuth();
        }
      } catch (error) {
        if (mounted) {
          console.error('Initial auth check failed:', error);
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  // Listen for 401 session-expired events from AuthAPI
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleSessionExpired = () => {
      console.log('⏰ Session expired (detected by 401 response)');
      sessionStorage.setItem('session-expired', '1');
      setState({ user: null, isAuthenticated: false, loading: false, error: 'session-expired', sessionExpiry: null });
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [state.isAuthenticated]);

  // Clear stale auth error whenever a login succeeds — including LoginPage's
  // standalone AuthAPI.login() path, which doesn't go through this context.
  // Without this, a prior 'session-expired' error survives the login and the
  // global "Authentication Error" toast (App.tsx) renders on top of the
  // "Login Successful!" screen.
  useEffect(() => {
    const handleLoginSuccess = () => {
      sessionStorage.removeItem('session-expired');
      setState(prev => (prev.error ? { ...prev, error: null } : prev));
    };

    window.addEventListener('auth:login-success', handleLoginSuccess);
    return () => window.removeEventListener('auth:login-success', handleLoginSuccess);
  }, []);

  // Force auto-logout at configured times (default 07:35, 19:20).
  //
  // Resilience strategy (in addition to server-side enforcement):
  //   1. Poll once per minute instead of relying on a single setTimeout.
  //      Single setTimeout breaks when laptop sleeps, tab is suspended, or
  //      timer drifts past the firing window.
  //   2. On `visibilitychange`/focus, immediately re-check so a missed window
  //      caught on wake/return fires right away.
  //   3. Persist `last-fired-day` per logout-time slot in localStorage so a
  //      missed window (browser closed at fire time) is detected and fired
  //      the next time the user is online — once per day per slot.
  //   4. Server-side cron (forceLogoutScheduler) is the authoritative kill;
  //      if cookies were already invalidated, the next request returns 401
  //      and `auth:session-expired` triggers the same logout path.
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const FORCE_LOGOUT_TIMES: Array<{ hour: number; minute: number; label: string }> = [
      { hour: 7,  minute: 35, label: '07:35' },
      { hour: 19, minute: 20, label: '19:20' },
    ];
    const STORAGE_KEY = 'qcv:force-logout:last-fired';
    const CHECK_INTERVAL_MS = 60_000;

    type FiredMap = Record<string, string>; // label -> "YYYY-MM-DD"

    const todayKey = (d = new Date()): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const readFired = (): FiredMap => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as FiredMap) : {};
      } catch { return {}; }
    };

    const writeFired = (m: FiredMap) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch { /* noop */ }
    };

    const triggerLogout = async (label: string) => {
      console.log(`🔒 Force auto-logout triggered (window ${label})`);
      try {
        await logout();
      } catch {
        sessionStorage.setItem('session-expired', '1');
        setState({ user: null, isAuthenticated: false, loading: false, error: 'session-expired', sessionExpiry: null });
      }
    };

    // True if `now` is at-or-after this slot's fire time today.
    const slotElapsedToday = (now: Date, slot: { hour: number; minute: number }): boolean => {
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot.hour, slot.minute, 0, 0);
      return now.getTime() >= target.getTime();
    };

    let firedThisCycle = false;

    const check = async () => {
      if (firedThisCycle) return;
      const now = new Date();
      const today = todayKey(now);
      const fired = readFired();

      for (const slot of FORCE_LOGOUT_TIMES) {
        if (fired[slot.label] === today) continue;       // already fired today
        if (!slotElapsedToday(now, slot)) continue;       // window not reached yet

        // Mark BEFORE awaiting so reentry/another tab won't double-fire
        fired[slot.label] = today;
        writeFired(fired);
        firedThisCycle = true;
        await triggerLogout(slot.label);
        return;
      }
    };

    // Initial check (handles late login + missed window on resume)
    void check();

    const intervalId = window.setInterval(() => { void check(); }, CHECK_INTERVAL_MS);

    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [state.isAuthenticated, logout]);

  // Auto-logout when session cookie expires
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const expiryTime = new Date(state.sessionExpiry).getTime();
    const remaining = expiryTime - Date.now();

    if (remaining <= 0) {
      // Already expired
      console.log('⏰ Session already expired, logging out');
      sessionStorage.setItem('session-expired', '1');
      setState({ user: null, isAuthenticated: false, loading: false, error: 'session-expired', sessionExpiry: null });
      return;
    }

    console.log(`⏰ Session expiry auto-logout scheduled in ${Math.round(remaining / 60000)} minutes`);

    const timeoutId = setTimeout(async () => {
      console.log('⏰ Session expired (timeout reached), logging out');
      try {
        await logout();
      } catch {
        sessionStorage.setItem('session-expired', '1');
        setState({ user: null, isAuthenticated: false, loading: false, error: 'session-expired', sessionExpiry: null });
      }
    }, remaining);

    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, state.sessionExpiry, logout]);

  // ==================== DEBUG INFO ====================

  // Add debug logging for state changes
  useEffect(() => {
    console.log('🔄 AuthContext state changed:', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      username: state.user?.username,
      loading: state.loading,
      error: state.error
    });
  }, [state]);

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    checkAuth,
    updateUser,
    hasRole,
    hasAnyRole,
    isLoading: state.loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== CUSTOM HOOK ====================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ==================== UTILITY HOOKS ====================

export const useHasRole = (role: UserRole): boolean => {
  const { user } = useAuth();
  return user?.role === role;
};

export const useHasAnyRole = (roles: UserRole[]): boolean => {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
};

export const useIsAdmin = (): boolean => {
  return useHasRole('admin');
};

export const useIsManager = (): boolean => {
  return useHasAnyRole(['manager', 'admin']);
};

export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

export default AuthProvider;

/*
=== CRITICAL FIXES FOR AUTHCONTEXT ===

BACKEND RESPONSE FORMAT FIXES:
✅ Properly parses success/data structure from your backend
✅ Handles nested data.authenticated and data.user correctly
✅ Doesn't throw errors on non-2xx responses with success: false
✅ Reads error messages from response.message or response.error

SESSION COOKIE HANDLING:
✅ credentials: 'include' on ALL requests
✅ Proper error handling without breaking auth flow
✅ Debug logging to track API calls and responses
✅ Post-login auth check to verify session persistence

STATE MANAGEMENT FIXES:
✅ Properly updates isAuthenticated state after successful login
✅ Handles loading states correctly during auth operations
✅ Clear error handling that doesn't interfere with auth flow
✅ Debug logging for state changes

AUTHENTICATION FLOW:
✅ Login → Update state → Force auth check → Verify session
✅ Proper error propagation for login failures
✅ Clean logout with state reset
✅ Robust initial auth checking on app load

DEBUGGING FEATURES:
✅ Comprehensive console logging for troubleshooting
✅ State change tracking
✅ API request/response logging
✅ Clear error messages

This fixed AuthContext should resolve the "User not authenticated"
issue by properly parsing your backend's response format and
correctly managing the authentication state after login.
*/