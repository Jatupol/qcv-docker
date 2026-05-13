
// client/src/utils/convertUtils.ts
/**
 * Converstion Utilities
 * 
 * Helper functions for working with  data
 */

import type{DropdownOption, BaseOption} from '../types/selectors';

// ==================== COMMON UTILITY TYPES ====================

 
// ====================  UTILITY Function  ====================
/**
 * Convert DropdownOption to BaseOption
 */
export function convertToBaseOption(option: DropdownOption): BaseOption {
  return {
    value: option.value,
    label: option.label,
    code: option.code || option.value
  };
}

/**
 * Convert array of DropdownOptions to BaseOptions
 */
export function convertDropdownOptionsToBaseOptions(options: DropdownOption[]): BaseOption[] {
  return options.map(convertToBaseOption);
}