// client/src/services/auditLogService.ts
// Admin-only client API for the audit_log table (DELETE event trail).

import { apiBaseUrl, apiFetch, buildQueryString, type ApiResponse } from './api';

export interface AuditLogEntry {
  id: number;
  action: string;
  entity: string;
  recordId: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  actorUserId: number | null;
  actorUsername: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  reason: string | null;
  createdAt: string;
}

export interface AuditLogQuery {
  entity?: string;
  action?: string;
  recordId?: string;
  actorUserId?: number;
  dateFrom?: string;   // ISO datetime
  dateTo?: string;     // ISO datetime
  page?: number;
  pageSize?: number;
}

export interface AuditLogMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface AuditLogResponse {
  success: boolean;
  data?: AuditLogEntry[];
  meta?: AuditLogMeta;
  message?: string;
}

const baseUrl = apiBaseUrl('admin');

const auditLogService = {
  async listAuditLog(query: AuditLogQuery = {}): Promise<AuditLogResponse> {
    const qs = buildQueryString({
      entity: query.entity,
      action: query.action,
      recordId: query.recordId,
      actorUserId: query.actorUserId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page,
      pageSize: query.pageSize,
    });
    const url = `${baseUrl}/audit-log${qs}`;
    try {
      const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json?.message || `HTTP ${res.status}` };
      }
      return json as AuditLogResponse;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async listEntities(): Promise<ApiResponse<string[]>> {
    return apiFetch<string[]>(`${baseUrl}/audit-log/entities`);
  },
};

export default auditLogService;
