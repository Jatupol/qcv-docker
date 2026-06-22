// client/src/utils/sysconfigUtils.ts
/**
 * System Configuration Utilities
 * 
 * Helper functions for working with sysconfig data
 */

// Define DropdownOption interface locally to avoid circular imports
interface DropdownOption {
  value: string;
  label: string;
  code?: string;
}

export class SysconfigUtils {
  /**
   * Parse comma-separated string values
   */
  static parseCommaSeparated(value: string): string[] {
    if (!value || typeof value !== 'string') return [];
    
    return value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '' && item.length > 0);
  }

  /**
   * Parse comma-separated numeric values
   */
  static parseCommaSeparatedNumbers(value: string): number[] {
    const strings = this.parseCommaSeparated(value);

    return strings
      .map(str => {
        const num = parseInt(str, 10);
        return isNaN(num) ? null : num;
      })
      .filter(num => num !== null) as number[];
  }

  /**
   * Convert string array to dropdown options
   */
  static toDropdownOptions(values: string[], codePrefix?: string): DropdownOption[] {
    return values.map((value, index) => ({
      value: value,
      label: value,
      code: codePrefix ? `${codePrefix}${String(index + 1).padStart(3, '0')}` : value
    }));
  }

  /**
   * Filter dropdown options by search term
   */
  static filterOptions(options: DropdownOption[], searchTerm: string): DropdownOption[] {
    if (!searchTerm) return options;
    
    const term = searchTerm.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(term) ||
      option.value.toLowerCase().includes(term) ||
      (option.code && option.code.toLowerCase().includes(term))
    );
  }

  /**
   * Validate sysconfig field value
   */
  static validateField(fieldName: string, value: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!value || value.trim() === '') {
      errors.push(`${fieldName} cannot be empty`);
      return { isValid: false, errors, warnings };
    }

    const items = this.parseCommaSeparated(value);
    
    // Check for duplicate values
    const uniqueItems = [...new Set(items)];
    if (items.length !== uniqueItems.length) {
      warnings.push(`${fieldName} contains duplicate values`);
    }

    // Check field-specific limits
    const limits: Record<string, number> = {
      'defect_type': 5,
      'shift': 5,
      'site': 10,
      'grps': 10,
      'zones': 20,
      'tabs': 10,
      'product_type': 10,
      'product_families': 10
    };

    const maxItems = limits[fieldName] || 10;
    if (items.length > maxItems) {
      errors.push(`${fieldName} cannot have more than ${maxItems} values`);
    }

    // Check for numeric fields
    const numericFields = ['fvi_lot_qty', 'general_oqa_qty', 'crack_sampling_qty'];
    if (numericFields.includes(fieldName)) {
      const numbers = this.parseCommaSeparatedNumbers(value);
      if (numbers.length !== items.length) {
        errors.push(`${fieldName} must contain only numeric values`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
 
  /**
   * Format configuration for display
   */
  static formatConfigForDisplay(value: string, maxLength: number = 50): string {
    if (value.length <= maxLength) return value;
    
    const items = this.parseCommaSeparated(value);
    if (items.length <= 3) return value;
    
    return `${items.slice(0, 3).join(', ')} ... (+${items.length - 3} more)`;
  }

  /**
   * Export configuration as JSON
   */
  static exportAsJson(config: any): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  static importFromJson(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }
}

// Export the DropdownOption type for use in other files
export type { DropdownOption };