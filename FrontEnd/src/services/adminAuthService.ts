// client/src/services/adminAuthService.ts
// Admin-only client API for session monitoring + auth audit log.

import { apiBaseUrl, apiFetch, buildQueryString, type ApiResponse } from './api';

export interface ActiveSession {
  sid: string;
  username: string | null;
  userId: number | null;
  role: string | null;
  loginTime: string | null;
  lastActivity: string | null;
  expiresAt: string;
  ip: string | null;
  userAgent: string | null;
}

export type AuthEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'force_logout'
  | 'session_expired'
  | 'session_kicked';

export interface AuthEvent {
  ts: string;
  type: AuthEventType;
  username: string;
  userId?: number | null;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  reason?: string;
  actor?: string;
}

export interface AuthEventsMeta {
  total: number;
  scanned: number;
  truncated: boolean;
  limit: number;
  offset: number;
  timestamp: string;
}

export interface AuthEventsResponse {
  success: boolean;
  data?: AuthEvent[];
  meta?: AuthEventsMeta;
  message?: string;
}

export interface ForceLogoutStatus {
  isEnabled: boolean;
  times: string[];
  timezone: string;
  startedAt: string | null;
  lastRunAt: string | null;
  lastKilledCount: number;
}

export interface AuthEventsQuery {
  from?: string;       // ISO datetime
  to?: string;         // ISO datetime
  username?: string;
  type?: AuthEventType | AuthEventType[];
  limit?: number;
  offset?: number;
}

const baseUrl = apiBaseUrl('admin');

const adminAuthService = {
  // ===== Sessions =====

  async listSessions(): Promise<ApiResponse<ActiveSession[]>> {
    return apiFetch<ActiveSession[]>(`${baseUrl}/sessions`);
  },

  async kickSession(sid: string): Promise<ApiResponse<{ sid: string; username: string; deleted: number }>> {
    return apiFetch(`${baseUrl}/sessions/${encodeURIComponent(sid)}`, { method: 'DELETE' });
  },

  async runForceLogoutNow(): Promise<ApiResponse<{ killed: number }>> {
    return apiFetch(`${baseUrl}/sessions/force-logout`, { method: 'POST' });
  },

  async getForceLogoutStatus(): Promise<ApiResponse<ForceLogoutStatus>> {
    return apiFetch<ForceLogoutStatus>(`${baseUrl}/force-logout/status`);
  },

  // ===== Auth events =====

  async listAuthEvents(query: AuthEventsQuery = {}): Promise<AuthEventsResponse> {
    const params: Record<string, any> = {
      from: query.from,
      to: query.to,
      username: query.username,
      limit: query.limit,
      offset: query.offset,
    };
    if (query.type) {
      params.type = Array.isArray(query.type) ? query.type : [query.type];
    }
    const qs = buildQueryString(params);
    const url = `${baseUrl}/auth-events${qs}`;
    // We need full response (not just data) to surface meta — call fetch directly here.
    try {
      const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json?.message || `HTTP ${res.status}` };
      }
      return json as AuthEventsResponse;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },
};

export default adminAuthService;
