// client/src/types/selectors.ts

/**
 * Centralized Type Definitions for Selector Components
 * 
 * This file contains all type definitions used by selector components
 * to ensure consistency and maintainability across the application.
 */

// ==================== BASE SELECTOR INTERFACES ====================

/**
 * Base properties for all selector components
 */
export interface BaseSelectorProps {
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
}

/**
 * Base option interface for dropdown items
 */
export interface BaseOption {
  value: string;
  label: string;
  code: string;
}

 
// ==================== COMMON UTILITY TYPES ====================

/**
 * Dropdown option from services (with optional code)
 */
export interface DropdownOption {
  value: string;
  label: string;
  code?: string;
}

/**
 * Service response format for selectors
 */
export interface SelectorServiceResponse<T> {
  success?: boolean;
  data?: T[];
  message?: string;
  error?: string;
}

/**
 * Loading states for selectors
 */
export interface SelectorLoadingState {
  loading: boolean;
  error: string | null;
}

// ==================== SELECTOR CONFIGURATION TYPES ====================

/**
 * Configuration for selector components
 */
export interface SelectorConfig {
  placeholder: string;
  errorMessage: string;
  loadingMessage: string;
  emptyMessage: string;
}

 
 