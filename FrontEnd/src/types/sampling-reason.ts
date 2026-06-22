// client/src/types/sampling-reason.ts
// Sampling Reason Component Types - CORRECTED TO MATCH DATABASE SCHEMA
// Complete Separation Entity Architecture - Type definitions for sampling reason selection

/**
 * Sampling Reason Interface - MATCHES DATABASE SCHEMA EXACTLY
 * Based on sampling_reasons table:
 * - id SERIAL PRIMARY KEY
 * - name VARCHAR(100) UNIQUE NOT NULL
 * - description TEXT
 * - is_active BOOLEAN DEFAULT true
 * - created_by INT DEFAULT 0
 * - updated_by INT DEFAULT 0
 * - created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * - updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 */
export interface SamplingReason {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean; // Frontend uses camelCase, maps to is_active
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Sampling Reason Filters Interface
 * Only includes fields that actually exist in the database
 */
export interface SamplingReasonFilters {
  search: string;
  isActive: boolean | null;
}

/**
 * Sampling Reason Selection Component Props
 */
export interface SamplingReasonSelectionProps {
  selectedReason: SamplingReason | null;
  onReasonSelect: (reason: SamplingReason) => void;
  disabled?: boolean;
  className?: string;
  layout?: 'grid' | 'list';
  showSearch?: boolean;
  showFilters?: boolean;
}

/**
 * Sampling Reason Browse Modal Props
 */
export interface SamplingReasonBrowseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReasonSelect: (reason: SamplingReason) => void;
  selectedReason: SamplingReason | null;
}

/**
 * Sampling Reason Card Props
 */
export interface SamplingReasonCardProps {
  reason: SamplingReason;
  isSelected: boolean;
  onSelect: (reason: SamplingReason) => void;
  disabled?: boolean;
}

/**
 * Sampling Reason Search Props
 */
export interface SamplingReasonSearchProps {
  reasons: SamplingReason[];
  onFilter: (filteredReasons: SamplingReason[]) => void;
  filters: SamplingReasonFilters;
  onFiltersChange: (filters: SamplingReasonFilters) => void;
  className?: string;
}

/**
 * Generic API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API Service Response Types
 */
export interface SamplingReasonResponse extends ApiResponse<SamplingReason[]> {}
export interface SingleSamplingReasonResponse extends ApiResponse<SamplingReason> {}

/**
 * Component State Types
 */
export interface SamplingReasonState {
  reasons: SamplingReason[];
  filteredReasons: SamplingReason[];
  loading: boolean;
  error: string | null;
  filters: SamplingReasonFilters;
}

/**
 * Modal Component State
 */
export interface ModalState {
  reasons: SamplingReason[];
  loading: boolean;
  error: string | null;
  filters: SamplingReasonFilters;
}

/**
 * Default Values - SIMPLIFIED TO MATCH ACTUAL SCHEMA
 */
export const DEFAULT_SAMPLING_REASON_FILTERS: SamplingReasonFilters = {
  search: '',
  isActive: true // Default to showing only active reasons
};

export const DEFAULT_SAMPLING_REASON_STATE: Omit<SamplingReasonState, 'filters'> = {
  reasons: [],
  filteredReasons: [],
  loading: false,
  error: null
};

export const DEFAULT_MODAL_STATE: Omit<ModalState, 'filters'> = {
  reasons: [],
  loading: false,
  error: null
};

/**
 * Validation Functions - CORRECTED FOR ACTUAL SCHEMA
 */
export const isSamplingReason = (obj: any): obj is SamplingReason => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.isActive === 'boolean'
  );
};

export const validateSamplingReasonArray = (data: any): data is SamplingReason[] => {
  return Array.isArray(data) && data.every(isSamplingReason);
};

/**
 * Utility Functions - SIMPLIFIED
 */
export const formatReasonDisplayName = (reason: SamplingReason): string => {
  return reason.name;
};

export const getReasonStatusText = (reason: SamplingReason): string => {
  return reason.isActive ? 'Active' : 'Inactive';
};

/**
 * Filter sampling reasons based on actual available filters
 */
export const filterSamplingReasons = (reasons: SamplingReason[], filters: SamplingReasonFilters): SamplingReason[] => {
  return reasons.filter(reason => {
    const searchLower = filters.search.toLowerCase();
    const activeMatch = filters.isActive === null || reason.isActive === filters.isActive;
    
    const searchMatch = !searchLower || 
      reason.name.toLowerCase().includes(searchLower) ||
      reason.description?.toLowerCase().includes(searchLower);

    return searchMatch && activeMatch;
  });
};

/**
 * Re-export for convenience
 */
export type {
  SamplingReason as Reason,
  SamplingReasonFilters as Filters,
  SamplingReasonSelectionProps as SelectionProps,
  SamplingReasonBrowseModalProps as BrowseModalProps,
  SamplingReasonCardProps as CardProps,
  SamplingReasonSearchProps as SearchProps
};

/**
 * Default export for convenience
 */
export default {
  DEFAULT_SAMPLING_REASON_FILTERS,
  DEFAULT_SAMPLING_REASON_STATE,
  DEFAULT_MODAL_STATE,
  isSamplingReason,
  validateSamplingReasonArray,
  formatReasonDisplayName,
  getReasonStatusText,
  filterSamplingReasons
};