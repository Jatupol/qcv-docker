// client/src/components/inspection/config/index.ts

/**
 * Sampling Configuration Components Export Index
 * Complete Separation Entity Architecture - Centralized exports for sampling configuration
 */

// Main component exports
export { default as SamplingConfiguration } from './SamplingConfiguration';
export { default as SamplingField } from './SamplingField';

// Service exports - now using sysconfigService from services folder
export { sysconfigService as samplingConfigApiService } from '../../../services/sysconfigService';

// Type exports - now from centralized types/sysconfig
export type {
  SamplingConfigData,
  SamplingConfigProps,
  SamplingFieldProps,
  SysConfig,
  ParsedSysConfig,
  SamplingConfigValidation,
  SamplingFieldError,
  SamplingFieldWarning,
  SamplingConfigState,
  SysConfigApiResponse,
  CustomInputProps,
  RoundSelectorProps
} from '../../../types/sysconfig';

// Constant exports - now from centralized types/sysconfig
export {
  DEFAULT_SAMPLING_CONFIG,
  FALLBACK_OPTIONS,
  SAMPLING_FIELD_LIMITS,
  ROUND_OPTIONS
} from '../../../types/sysconfig';

// Utility function exports - now from centralized types/sysconfig
export {
  parseConfigValues,
  parseSysConfig,
  getFieldOptions,
  validateSamplingConfig,
  formatSamplingValue,
  calculateSamplingRatio,
  calculateCrackRatio,
  getFieldIcon
} from '../../../types/sysconfig';