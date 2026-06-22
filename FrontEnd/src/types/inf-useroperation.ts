// client/src/types/inf-useroperation.ts
// Type definitions for UserOperation Interface (Frontend)
// Updated: Schema refactored, using centralized base types

import type { ApiResponse, PaginatedApiResponse } from './base';

/**
 * User Operation Record from inf_useroperation table
 */
export interface InfUserOperationRecord {
  username: string;
  isActive: boolean;
  isDelete: boolean;
  isSuperAdmin: boolean;
  roleCode: string | null;
  operatorName: string | null;
  isMrb: boolean;
  lineNoId: string | null;
  workShiftId: string | null;
  importedAt: string;
}

/**
 * Data filters for search and filtering
 */
export interface DataFilters {
  usernameSearch: string;
  operatorNameSearch: string;
  roleCodeFilter: string;
  lineNoIdFilter: string;
  workShiftIdFilter: string;
  isActiveFilter: boolean | null;
  isMrbFilter: boolean | null;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Import statistics for dashboard
 */
export interface ImportStats {
  totalRecords: number;
  totalToday: number;
  totalMonth: number;
  totalYear: number;
  totalActive: number;
  totalInactive: number;
  totalSuperAdmin: number;
  totalMrb: number;
  lastSync?: string;
}

/**
 * Sync statistics from MSSQL import
 */
export interface SyncStats {
  imported?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
}

/**
 * Sync step (for modal progress indicator)
 */
export type SyncStep = 0 | 1 | 2 | 3 | 4;

/**
 * Re-export ApiResponse from base types for backward compatibility
 */
export type { ApiResponse, PaginatedApiResponse };

/**
 * Filter options data
 */
export interface FilterOptionsData {
  roleCodes: string[];
  lineNoIds: string[];
  workShiftIds: string[];
}
