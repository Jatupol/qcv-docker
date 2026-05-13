// client/src/types/customerts
// Frontend Types for Customer-Site Entity



import type{ BaseSelectorProps, BaseOption, DropdownOption, SelectorServiceResponse, SelectorLoadingState, SelectorConfig } from './selectors';


// ==================== ENTITY-BASED SELECTOR TYPES ====================

/**
 * Customer entity (VARCHAR CODE pattern)
 */
export interface Customer {
  code: string;
  name: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Customer selector props
 */
export interface CustomerSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
  showInactive?: boolean;
}

export const DEFAULT_SELECTOR_CONFIGS: Record<string, SelectorConfig> = {
  customer: {
    placeholder: "Select customer...",
    errorMessage: "Failed to load customers",
    loadingMessage: "Loading customers...",
    emptyMessage: "No customers available"
  }
};