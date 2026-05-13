// client/src/utils/validation.ts
// Centralized form validation utility
// Provides reusable validation functions and schema-based validation

/**
 * Validation error type - can be a single string or array of strings
 */
export type ValidationError = string | string[];

/**
 * Validation errors object - maps field names to errors
 */
export type ValidationErrors<T = any> = {
  [K in keyof Partial<T>]: ValidationError;
};

/**
 * Validation rule function type
 */
export type ValidationRule<T = any> = (
  value: any,
  fieldName?: string,
  formData?: T
) => ValidationError | null;

/**
 * Validation schema type
 */
export type ValidationSchema<T = any> = {
  [K in keyof Partial<T>]: ValidationRule<T> | ValidationRule<T>[];
};

// ============ COMMON VALIDATION RULES ============

/**
 * Validates that a field is required (not empty)
 */
export const required = (message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (value === null || value === undefined) {
      return message || `${fieldName || 'Field'} is required`;
    }
    if (typeof value === 'string' && !value.trim()) {
      return message || `${fieldName || 'Field'} is required`;
    }
    if (typeof value === 'number' && isNaN(value)) {
      return message || `${fieldName || 'Field'} is required`;
    }
    return null;
  };
};

/**
 * Validates minimum string length
 */
export const minLength = (min: number, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (!value) return null; // Skip if empty (use required() for that)
    const stringValue = String(value).trim();
    if (stringValue.length < min) {
      return message || `${fieldName || 'Field'} must be at least ${min} characters`;
    }
    return null;
  };
};

/**
 * Validates maximum string length
 */
export const maxLength = (max: number, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (!value) return null; // Skip if empty
    const stringValue = String(value).trim();
    if (stringValue.length > max) {
      return message || `${fieldName || 'Field'} must not exceed ${max} characters`;
    }
    return null;
  };
};

/**
 * Validates string length range
 */
export const lengthBetween = (min: number, max: number, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (!value) return null;
    const stringValue = String(value).trim();
    if (stringValue.length < min || stringValue.length > max) {
      return message || `${fieldName || 'Field'} must be between ${min} and ${max} characters`;
    }
    return null;
  };
};

/**
 * Validates against a regex pattern
 */
export const pattern = (regex: RegExp, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (!value) return null;
    const stringValue = String(value).trim();
    if (!regex.test(stringValue)) {
      return message || `${fieldName || 'Field'} has an invalid format`;
    }
    return null;
  };
};

/**
 * Validates email format
 */
export const email = (message?: string): ValidationRule => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern(emailRegex, message || 'Please enter a valid email address');
};

/**
 * Validates username format (alphanumeric, hyphens, underscores)
 */
export const username = (message?: string): ValidationRule => {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return pattern(
    usernameRegex,
    message || 'Username can only contain letters, numbers, hyphens, and underscores'
  );
};

/**
 * Validates numeric range
 */
export const numberBetween = (min: number, max: number, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${fieldName || 'Field'} must be a valid number`;
    }
    if (numValue < min || numValue > max) {
      return message || `${fieldName || 'Field'} must be between ${min} and ${max}`;
    }
    return null;
  };
};

/**
 * Validates minimum number
 */
export const min = (minValue: number, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${fieldName || 'Field'} must be a valid number`;
    }
    if (numValue < minValue) {
      return message || `${fieldName || 'Field'} must be at least ${minValue}`;
    }
    return null;
  };
};

/**
 * Validates maximum number
 */
export const max = (maxValue: number, message?: string): ValidationRule => {
  return (value: any, fieldName?: string) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${fieldName || 'Field'} must be a valid number`;
    }
    if (numValue > maxValue) {
      return message || `${fieldName || 'Field'} must not exceed ${maxValue}`;
    }
    return null;
  };
};

/**
 * Validates that two fields match (e.g., password confirmation)
 */
export const matches = <T = any>(
  otherField: keyof T,
  message?: string
): ValidationRule<T> => {
  return (value: any, fieldName?: string, formData?: T) => {
    if (!formData || !value) return null;
    if (value !== formData[otherField]) {
      return message || `${fieldName || 'Field'} must match ${String(otherField)}`;
    }
    return null;
  };
};

/**
 * Combines multiple validation rules with AND logic
 */
export const combine = (...rules: ValidationRule[]): ValidationRule => {
  return (value: any, fieldName?: string, formData?: any) => {
    for (const rule of rules) {
      const error = rule(value, fieldName, formData);
      if (error) return error;
    }
    return null;
  };
};

// ============ VALIDATION SCHEMA EXECUTOR ============

/**
 * Validates form data against a validation schema
 * @param formData The form data to validate
 * @param schema The validation schema
 * @returns Validation errors object (empty if valid)
 */
export function validateSchema<T extends Record<string, any>>(
  formData: T,
  schema: ValidationSchema<T>
): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {};

  for (const fieldName in schema) {
    const rules = schema[fieldName];
    const value = formData[fieldName];

    if (Array.isArray(rules)) {
      // Multiple rules for this field
      for (const rule of rules) {
        const error = rule(value, fieldName, formData);
        if (error) {
          errors[fieldName] = error;
          break; // Stop at first error
        }
      }
    } else if (rules) {
      // Single rule for this field
      const error = rules(value, fieldName, formData);
      if (error) {
        errors[fieldName] = error;
      }
    }
  }

  return errors;
}

/**
 * Checks if validation errors object has any errors
 */
export function hasErrors<T>(errors: ValidationErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Normalizes errors to always be string arrays
 */
export function normalizeErrors<T>(errors: ValidationErrors<T>): Record<keyof T, string[]> {
  const normalized: any = {};
  for (const key in errors) {
    const error = errors[key];
    if (error) {
      normalized[key] = Array.isArray(error) ? error : [error];
    }
  }
  return normalized;
}

// ============ COMMON VALIDATION SCHEMAS ============

/**
 * Common username validation rules
 */
export const usernameRules = [
  required('Username is required'),
  minLength(3, 'Username must be at least 3 characters'),
  maxLength(50, 'Username must not exceed 50 characters'),
  username(),
];

/**
 * Common email validation rules
 */
export const emailRules = [
  required('Email is required'),
  email(),
];

/**
 * Common password validation rules
 */
export const passwordRules = [
  required('Password is required'),
  minLength(6, 'Password must be at least 6 characters'),
];

/**
 * Common code field validation (for entity codes)
 */
export const codeRules = (
  minLen: number = 1,
  maxLen: number = 10,
  entityName: string = 'Code'
) => [
  required(`${entityName} is required`),
  lengthBetween(minLen, maxLen),
];

/**
 * Common name field validation
 */
export const nameRules = (
  minLen: number = 2,
  maxLen: number = 100,
  entityName: string = 'Name'
) => [
  required(`${entityName} is required`),
  lengthBetween(minLen, maxLen),
];

// ============ EXAMPLE USAGE ============

/*
// Example 1: Login form validation
interface LoginFormData {
  username: string;
  password: string;
}

const loginSchema: ValidationSchema<LoginFormData> = {
  username: [required('Username is required'), minLength(3)],
  password: required('Password is required'),
};

const errors = validateSchema(formData, loginSchema);
if (hasErrors(errors)) {
  // Handle errors
}

// Example 2: User form validation
interface UserFormData {
  username: string;
  email: string;
  fullName: string;
}

const userSchema: ValidationSchema<UserFormData> = {
  username: usernameRules,
  email: emailRules,
  fullName: nameRules(2, 100, 'Full name'),
};

// Example 3: Custom combined validation
const customRule = combine(
  required(),
  minLength(5),
  pattern(/^[A-Z]/, 'Must start with uppercase letter')
);

// Example 4: Field matching (password confirmation)
interface RegisterFormData {
  password: string;
  confirmPassword: string;
}

const registerSchema: ValidationSchema<RegisterFormData> = {
  password: passwordRules,
  confirmPassword: [
    required('Please confirm your password'),
    matches('password', 'Passwords do not match'),
  ],
};
*/
