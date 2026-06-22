// client/src/types/sysconfig.ts
/**
 * System Configuration Types for Client
 *
 * This file contains all system configuration types including:
 * - Sysconfig entity types
 * - Sampling configuration types
 * - Selector component types
 * - Utility functions for parsing and validating sysconfig data
 *
 * These types match the server-side sysconfig entity and provide
 * type safety for client-side operations.
 */

import type{ BaseSelectorProps, BaseOption, DropdownOption, SelectorConfig } from './selectors';

// ==================== SYSCONFIG ENTITY TYPES ====================

/**
 * System Configuration entity from database
 * Contains all configuration values for the application
 */
export interface SysConfig {
  id: number;
  fvi_lot_qty: string;           // Comma-separated values from sysconfig
  general_oqa_qty: string;       // Comma-separated values from sysconfig (OQA/OBA general)
  crack_oqa_qty: string;         // Comma-separated values from sysconfig (OQA/OBA crack)
  general_siv_qty: string;       // Comma-separated values from sysconfig (SIV general)
  crack_siv_qty: string;         // Comma-separated values from sysconfig (SIV crack)
  defect_type: string;
  shift: string;
  site: string;
  tabs: string;
  product_type: string;
  product_families: string;
  smtp_server: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password: string | null;
  system_name: string | null;
  system_updated: Date | null;   // System updated timestamp
  created_at: Date;
  updated_at: Date;
}


/**
 * Inspection configuration entity
 * Stores inspection sampling quantities, organization data, and defect configuration
 */
export interface InspectionConfig {
  id: string;
  active?: boolean;

  // Sampling Quantities (stored as comma-separated strings)
  fvi_lot_qty: string;
  general_oqa_qty: string;
  crack_oqa_qty: string;
  general_oba_qty?: string;
  crack_oba_qty?: string;
  general_siv_qty: string;
  crack_siv_qty: string;

  // Organization Data
  shift: string;
  site: string;
  tabs: string;
  product_type: string;
  product_families: string;

  // Defect Configuration
  defect_type: string;
  defect_group?: string;
  defect_color?: string;

  // Notifications
  defect_notification_emails?: string;

  // Audit fields
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

/**
 * Props for ArrayValueManager component
 * Manages comma-separated values with add/remove functionality
 */
export interface ArrayValueManagerProps {
  values: string[];
  onChange: (newValues: string[]) => void;
  type: 'text' | 'numeric';
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
  label?: string;
  maxLength?: number;
  validationPattern?: RegExp;
  validationMessage?: string;
}

/**
 * Configuration section type
 * Used for organizing configuration fields into logical groups
 */
export type ConfigSection =
  | 'sampling'
  | 'organization'
  | 'defect'
  | 'notification';

/**
 * API response for sysconfig operations
 */
export interface SysconfigResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: InspectionConfig;
  errors?: string[];
}

/**
 * Validation result for configuration changes
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration change tracking
 */
export interface ConfigChanges {
  hasChanges: boolean;
  modifiedFields: string[];
  originalConfig?: InspectionConfig;
  currentConfig?: InspectionConfig;
}



/**
 * Parsed System Configuration with arrays of options
 * Used for dropdowns and selectors throughout the application
 */
export interface ParsedSysConfig {
  id: number;
  fviLotQtyOptions: number[];
  generalOQAOptions: number[];
  crackOQAOptions: number[];
  generalSIVOptions: number[];
  crackSIVOptions: number[];
  defectTypeOptions: string[];
  shiftOptions: string[];
  siteOptions: string[];
  tabsOptions: string[];
  productTypeOptions: string[];
  productFamiliesOptions: string[];
}

/**
 * API Response type for sysconfig endpoints
 */
export interface SysConfigApiResponse {
  success: boolean;
  data?: SysConfig;
  message?: string;
  error?: string;
}

// ==================== SAMPLING CONFIGURATION TYPES ====================

/**
 * Sampling Configuration Data
 * Represents the sampling quantities for inspection
 */
export interface SamplingConfigData {
  fviLotQty: number;
  generalSamplingQty: number;
  crackSamplingQty: number;
  round: number;
}

/**
 * Sampling Configuration Component Props
 */
export interface SamplingConfigProps {
  config: SamplingConfigData;
  sysConfig: SysConfig | null;
  onChange: (config: SamplingConfigData) => void;
  disabled?: boolean;
  className?: string;
  layout?: 'grid' | 'vertical' | 'horizontal';
  showLabels?: boolean;
  showCustomInput?: boolean;
  allowRoundSelection?: boolean;
  maxRounds?: number;
  station?: string; // Station code (OQA, OBA, SIV) - determines which sampling options to use
  disableFviLotQty?: boolean; // Disable FVI Lot Quantity field (for SIV station)
  disableGeneralSamplingQty?: boolean; // Disable General Sampling Qty field
  disableCrackSamplingQty?: boolean; // Disable Crack Sampling Qty field
}

/**
 * Sampling Field Component Props
 */
export interface SamplingFieldProps {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  disabled?: boolean;
  showCustomInput?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
  fieldType: 'fviLotQty' | 'generalSamplingQty' | 'crackSamplingQty' | 'round';
  configContext?: SamplingConfigData; // For ratio calculations
}

/**
 * Custom Input Component Props
 */
export interface CustomInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * Round Selector Component Props
 */
export interface RoundSelectorProps {
  value: number;
  onChange: (value: number) => void;
  maxRounds?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Sampling Configuration Validation Result
 */
export interface SamplingConfigValidation {
  isValid: boolean;
  errors: SamplingFieldError[];
  warnings: SamplingFieldWarning[];
}

/**
 * Sampling Field Error
 */
export interface SamplingFieldError {
  field: keyof SamplingConfigData;
  message: string;
  type: 'required' | 'min' | 'max' | 'invalid' | 'relationship';
}

/**
 * Sampling Field Warning
 */
export interface SamplingFieldWarning {
  field: keyof SamplingConfigData;
  message: string;
  type: 'unusual' | 'inefficient' | 'recommendation';
}

/**
 * Sampling Configuration Component State
 */
export interface SamplingConfigState {
  config: SamplingConfigData;
  sysConfig: SysConfig | null;
  loading: boolean;
  error: string | null;
  showCustomInputs: {
    fviLotQty: boolean;
    generalSamplingQty: boolean;
    crackSamplingQty: boolean;
  };
  validation: SamplingConfigValidation;
}

// ==================== SAMPLING CONFIGURATION CONSTANTS ====================

/**
 * Default sampling configuration values
 */
export const DEFAULT_SAMPLING_CONFIG: SamplingConfigData = {
  fviLotQty: 2800,
  generalSamplingQty: 140,
  crackSamplingQty: 7,
  round: 1
};

/**
 * Fallback options when sysconfig is not available
 */
export const FALLBACK_OPTIONS = {
  fviLotQtyOptions: [],
  generalSamplingOptions: [],
  crackSamplingOptions: [],
  roundOptions: []
};

/**
 * Field limits for sampling quantities
 */
export const SAMPLING_FIELD_LIMITS = {
  fviLotQty: { min: 1, max: 999999, step: 1 },
  generalSamplingQty: { min: 0, max: 99999, step: 1 },
  crackSamplingQty: { min: 0, max: 99999, step: 1 },
  round: { min: 1, max: 20, step: 1 }
} as const;

/**
 * Available round options (1-20)
 */
export const ROUND_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

// ==================== SYSCONFIG UTILITY FUNCTIONS ====================

/**
 * Parse comma-separated values from sysconfig to number array
 * @param configString - Comma-separated string of numbers
 * @returns Sorted array of unique numbers
 */
export const parseConfigValues = (configString: string): number[] => {
  if (!configString || configString.trim() === '') {
    return [];
  }

  return configString
    .split(',')
    .map(val => val.trim())
    .filter(val => val !== '')
    .map(val => parseInt(val, 10))
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b);
};

/**
 * Parse full SysConfig into usable options
 * @param sysConfig - Raw sysconfig from database
 * @returns Parsed configuration with array options
 */
export const parseSysConfig = (sysConfig: SysConfig | null): ParsedSysConfig | null => {
  if (!sysConfig) return null;

  return {
    id: sysConfig.id,
    fviLotQtyOptions: parseConfigValues(sysConfig.fvi_lot_qty),
    generalOQAOptions: parseConfigValues(sysConfig.general_oqa_qty),
    crackOQAOptions: parseConfigValues(sysConfig.crack_oqa_qty),
    generalSIVOptions: parseConfigValues(sysConfig.general_siv_qty),
    crackSIVOptions: parseConfigValues(sysConfig.crack_siv_qty),
    defectTypeOptions: sysConfig.defect_type?.split(',').map(s => s.trim()).filter(s => s) || [],
    shiftOptions: sysConfig.shift?.split(',').map(s => s.trim()).filter(s => s) || [],
    siteOptions: sysConfig.site?.split(',').map(s => s.trim()).filter(s => s) || [],
    tabsOptions: sysConfig.tabs?.split(',').map(s => s.trim()).filter(s => s) || [],
    productTypeOptions: sysConfig.product_type?.split(',').map(s => s.trim()).filter(s => s) || [],
    productFamiliesOptions: sysConfig.product_families?.split(',').map(s => s.trim()).filter(s => s) || []
  };
};

/**
 * Get options with fallback for each field
 * @param sysConfig - System configuration object
 * @param field - Field name to get options for
 * @param station - Station code (OQA, OBA, SIV) - defaults to OQA if not provided
 * @returns Array of numeric options for the field
 */
export const getFieldOptions = (
  sysConfig: SysConfig | null,
  field: keyof SamplingConfigData,
  station?: string
): number[] => {
  const parsed = parseSysConfig(sysConfig);

  let result: number[] = [];

  switch (field) {
    case 'fviLotQty':
      result = parsed?.fviLotQtyOptions.length
        ? parsed.fviLotQtyOptions
        : FALLBACK_OPTIONS.fviLotQtyOptions;
      break;

    case 'generalSamplingQty':
      // Use SIV options for SIV station, OQA options for others
      if (station === 'SIV') {
        result = parsed?.generalSIVOptions.length
          ? parsed.generalSIVOptions
          : FALLBACK_OPTIONS.generalSamplingOptions;
        console.log(`🔧 getFieldOptions(generalSamplingQty, SIV):`, result, 'from generalSIVOptions:', parsed?.generalSIVOptions);
      } else {
        result = parsed?.generalOQAOptions.length
          ? parsed.generalOQAOptions
          : FALLBACK_OPTIONS.generalSamplingOptions;
        console.log(`🔧 getFieldOptions(generalSamplingQty, ${station || 'OQA'}):`, result, 'from generalOQAOptions:', parsed?.generalOQAOptions);
      }
      break;

    case 'crackSamplingQty':
      // Use SIV options for SIV station, OQA options for others
      if (station === 'SIV') {
        result = parsed?.crackSIVOptions.length
          ? parsed.crackSIVOptions
          : FALLBACK_OPTIONS.crackSamplingOptions;
        console.log(`🔧 getFieldOptions(crackSamplingQty, SIV):`, result, 'from crackSIVOptions:', parsed?.crackSIVOptions);
      } else {
        result = parsed?.crackOQAOptions.length
          ? parsed.crackOQAOptions
          : FALLBACK_OPTIONS.crackSamplingOptions;
        console.log(`🔧 getFieldOptions(crackSamplingQty, ${station || 'OQA'}):`, result, 'from crackOQAOptions:', parsed?.crackOQAOptions);
      }
      break;

    case 'round':
      result = ROUND_OPTIONS;
      break;

    default:
      result = [];
  }

  return result;
};

/**
 * Validate sampling configuration with business rules
 * @param config - Sampling configuration to validate
 * @returns Validation result with errors and warnings
 */
export const validateSamplingConfig = (config: SamplingConfigData): SamplingConfigValidation => {
  const errors: SamplingFieldError[] = [];
  const warnings: SamplingFieldWarning[] = [];

  // Validate FVI Lot Quantity
  if (config.fviLotQty < SAMPLING_FIELD_LIMITS.fviLotQty.min) {
    errors.push({
      field: 'fviLotQty',
      message: `FVI Lot Quantity must be at least ${SAMPLING_FIELD_LIMITS.fviLotQty.min}`,
      type: 'min'
    });
  }
  if (config.fviLotQty > SAMPLING_FIELD_LIMITS.fviLotQty.max) {
    errors.push({
      field: 'fviLotQty',
      message: `FVI Lot Quantity cannot exceed ${SAMPLING_FIELD_LIMITS.fviLotQty.max}`,
      type: 'max'
    });
  }

  // Validate General Sampling Quantity
  if (config.generalSamplingQty < SAMPLING_FIELD_LIMITS.generalSamplingQty.min) {
    errors.push({
      field: 'generalSamplingQty',
      message: `General Sampling Quantity cannot be negative`,
      type: 'min'
    });
  }
  if (config.generalSamplingQty > SAMPLING_FIELD_LIMITS.generalSamplingQty.max) {
    errors.push({
      field: 'generalSamplingQty',
      message: `General Sampling Quantity cannot exceed ${SAMPLING_FIELD_LIMITS.generalSamplingQty.max}`,
      type: 'max'
    });
  }

  // Validate Crack Sampling Quantity
  if (config.crackSamplingQty < SAMPLING_FIELD_LIMITS.crackSamplingQty.min) {
    errors.push({
      field: 'crackSamplingQty',
      message: `Crack Sampling Quantity cannot be negative`,
      type: 'min'
    });
  }
  if (config.crackSamplingQty > SAMPLING_FIELD_LIMITS.crackSamplingQty.max) {
    errors.push({
      field: 'crackSamplingQty',
      message: `Crack Sampling Quantity cannot exceed ${SAMPLING_FIELD_LIMITS.crackSamplingQty.max}`,
      type: 'max'
    });
  }

  // Validate Round
  if (config.round < SAMPLING_FIELD_LIMITS.round.min) {
    errors.push({
      field: 'round',
      message: `Round must be at least ${SAMPLING_FIELD_LIMITS.round.min}`,
      type: 'min'
    });
  }
  if (config.round > SAMPLING_FIELD_LIMITS.round.max) {
    errors.push({
      field: 'round',
      message: `Round cannot exceed ${SAMPLING_FIELD_LIMITS.round.max}`,
      type: 'max'
    });
  }

  // Business Logic Validations
  if (config.generalSamplingQty > config.fviLotQty) {
    warnings.push({
      field: 'generalSamplingQty',
      message: 'General sampling quantity is larger than FVI lot quantity',
      type: 'unusual'
    });
  }

  if (config.crackSamplingQty > config.generalSamplingQty && config.generalSamplingQty > 0) {
    warnings.push({
      field: 'crackSamplingQty',
      message: 'Crack sampling quantity is larger than general sampling quantity',
      type: 'unusual'
    });
  }

  // Efficiency warnings
  const samplingRatio = config.fviLotQty > 0 ? (config.generalSamplingQty / config.fviLotQty) : 0;
  if (samplingRatio > 0.2) {
    warnings.push({
      field: 'generalSamplingQty',
      message: 'Sampling ratio is quite high (>20%), consider reducing for efficiency',
      type: 'inefficient'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calculate sampling ratios for analysis
 */
export const calculateSamplingRatio = (generalQty: number, fviQty: number): number => {
  return fviQty > 0 ? (generalQty / fviQty) * 100 : 0;
};

export const calculateCrackRatio = (crackQty: number, generalQty: number): number => {
  return generalQty > 0 ? (crackQty / generalQty) * 100 : 0;
};

/**
 * Format display values
 */
export const formatSamplingValue = (value: number, field: keyof SamplingConfigData): string => {
  switch (field) {
    case 'fviLotQty':
      return value.toLocaleString();
    case 'round':
      return `Round ${value}`;
    default:
      return value.toString();
  }
};

/**
 * Get field icon based on type (legacy - for backward compatibility)
 */
export const getFieldIcon = (field: keyof SamplingConfigData): string => {
  switch (field) {
    case 'fviLotQty':
      return 'Package';
    case 'generalSamplingQty':
      return 'BarChart3';
    case 'crackSamplingQty':
      return 'AlertTriangle';
    case 'round':
      return 'RotateCcw';
    default:
      return 'Settings';
  }
};
 
// ==================== SYSCONFIG-BASED SELECTOR TYPES ====================

/**
 * Defect Type option (from sysconfig.defect_type)
 */
export interface DefectTypeOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Defect Type selector props
 */
export interface DefectTypeSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Shift option (from sysconfig.shift)
 */
export interface ShiftOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Shift selector props
 */
export interface ShiftSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Site option (from sysconfig.site)
 */
export interface SiteOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Site selector props
 */
export interface SiteSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Group option (from sysconfig.grps)
 */
export interface GroupOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Group selector props
 */
export interface GroupSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Zone option (from sysconfig.zones)
 */
export interface ZoneOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Zone selector props
 */
export interface ZoneSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Tab option (from sysconfig.tabs)
 */
export interface TabOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Tab selector props
 */
export interface TabSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Product Type option (from sysconfig.product_type)
 */
export interface ProductTypeOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Product Type selector props
 */
export interface ProductTypeSelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

/**
 * Product Family option (from sysconfig.product_families)
 */
export interface ProductFamilyOption extends BaseOption {
  // Inherits: value, label, code
}

/**
 * Product Family selector props
 */
export interface ProductFamilySelectorProps extends BaseSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}


 
// ==================== SELECTOR CONFIGURATION TYPES ====================

/**
 * Default selector configurations
 */
export const DEFAULT_SELECTOR_CONFIGS: Record<string, SelectorConfig> = {
  defectType: {
    placeholder: "Select defect type...",
    errorMessage: "Failed to load defect types",
    loadingMessage: "Loading defect types...",
    emptyMessage: "No defect types available"
  },
  shift: {
    placeholder: "Select shift...",
    errorMessage: "Failed to load shifts",
    loadingMessage: "Loading shifts...",
    emptyMessage: "No shifts available"
  },
  site: {
    placeholder: "Select site...",
    errorMessage: "Failed to load sites",
    loadingMessage: "Loading sites...",
    emptyMessage: "No sites available"
  },
  group: {
    placeholder: "Select group...",
    errorMessage: "Failed to load groups",
    loadingMessage: "Loading groups...",
    emptyMessage: "No groups available"
  },
  zone: {
    placeholder: "Select zone...",
    errorMessage: "Failed to load zones",
    loadingMessage: "Loading zones...",
    emptyMessage: "No zones available"
  },
  tab: {
    placeholder: "Select tab...",
    errorMessage: "Failed to load tabs",
    loadingMessage: "Loading tabs...",
    emptyMessage: "No tabs available"
  },
  productType: {
    placeholder: "Select product type...",
    errorMessage: "Failed to load product types",
    loadingMessage: "Loading product types...",
    emptyMessage: "No product types available"
  },
  productFamily: {
    placeholder: "Select product family...",
    errorMessage: "Failed to load product families",
    loadingMessage: "Loading product families...",
    emptyMessage: "No product families available"
  } 
};

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if a value is a valid option
 */
export function isValidOption(value: any): value is BaseOption {
  return value && typeof value === 'object' && 
         typeof value.value === 'string' && 
         typeof value.label === 'string' && 
         typeof value.code === 'string';
}

/**
 * Type guard to check if a value is a valid dropdown option
 */
export function isValidDropdownOption(value: any): value is DropdownOption {
  return value && typeof value === 'object' && 
         typeof value.value === 'string' && 
         typeof value.label === 'string';
}

 