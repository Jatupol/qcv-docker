// client/src/services/purgePolicyService.ts
// Admin-only client API for the configurable purge janitor.

import { apiBaseUrl, apiFetch, type ApiResponse } from './api';

export type PurgeTargetType = 'file' | 'db_table';

export interface PurgePolicy {
  id: number;
  target_key: string;
  label: string;
  target_type: PurgeTargetType;
  enabled: boolean;
  retention_days: number;
  db_table_name: string | null;
  db_timestamp_column: string | null;
  last_run_at: string | null;
  last_removed_count: number;
  last_dry_run_at: string | null;
  last_dry_run_count: number;
  notes: string | null;
  is_builtin: boolean;
}

export interface AllowedTable {
  tableName: string;
  timestampColumn: string;
  label: string;
  alreadyConfigured: boolean;
}

export interface CreatePolicyPayload {
  target_key: string;
  label: string;
  db_table_name: string;
  db_timestamp_column: string;
  retention_days: number;
  enabled?: boolean;
  notes?: string | null;
}

export interface PurgeRunResult {
  targetKey: string;
  ok: boolean;
  removed: number;
  message?: string;
  durationMs: number;
}

export interface PurgeStatus {
  isEnabled: boolean;
  cronExpression: string;
  timezone: string;
  startedAt: string | null;
  lastRunAt: string | null;
  lastRunResults: PurgeRunResult[];
  registeredTargets: Array<{
    key: string;
    label: string;
    type: PurgeTargetType;
    defaultRetentionDays: number;
  }>;
}

export interface UpdatePolicyPayload {
  enabled?: boolean;
  retention_days?: number;
  notes?: string | null;
}

const baseUrl = apiBaseUrl('admin/purge');

const purgePolicyService = {
  async listPolicies(): Promise<ApiResponse<PurgePolicy[]>> {
    return apiFetch<PurgePolicy[]>(`${baseUrl}/policies`);
  },

  async getStatus(): Promise<ApiResponse<PurgeStatus>> {
    return apiFetch<PurgeStatus>(`${baseUrl}/status`);
  },

  async updatePolicy(targetKey: string, patch: UpdatePolicyPayload): Promise<ApiResponse<PurgePolicy>> {
    return apiFetch<PurgePolicy>(`${baseUrl}/policies/${encodeURIComponent(targetKey)}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  },

  async dryRun(targetKey: string): Promise<ApiResponse<{ wouldRemove: number; retentionDays: number }>> {
    return apiFetch(`${baseUrl}/policies/${encodeURIComponent(targetKey)}/dry-run`, {
      method: 'POST',
    });
  },

  async runOne(targetKey: string): Promise<ApiResponse<PurgeRunResult>> {
    return apiFetch<PurgeRunResult>(`${baseUrl}/policies/${encodeURIComponent(targetKey)}/run-now`, {
      method: 'POST',
    });
  },

  async runAll(): Promise<ApiResponse<{ results: PurgeRunResult[]; totalRemoved: number }>> {
    return apiFetch(`${baseUrl}/run-all`, { method: 'POST' });
  },

  async listAllowedTables(): Promise<ApiResponse<AllowedTable[]>> {
    return apiFetch<AllowedTable[]>(`${baseUrl}/allowed-tables`);
  },

  async createPolicy(payload: CreatePolicyPayload): Promise<ApiResponse<PurgePolicy>> {
    return apiFetch<PurgePolicy>(`${baseUrl}/policies`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deletePolicy(targetKey: string): Promise<ApiResponse<null>> {
    return apiFetch(`${baseUrl}/policies/${encodeURIComponent(targetKey)}`, {
      method: 'DELETE',
    });
  },
};

export default purgePolicyService;
