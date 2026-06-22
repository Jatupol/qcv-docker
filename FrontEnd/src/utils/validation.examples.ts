// client/src/utils/validation.examples.ts
// Examples of how to use the centralized validation utility

import {
  validateSchema,
  ValidationSchema,
  required,
  minLength,
  maxLength,
  lengthBetween,
  pattern,
  email,
  username,
  usernameRules,
  emailRules,
  passwordRules,
  nameRules,
  codeRules,
  combine,
  matches,
  hasErrors,
} from './validation';

// ============ EXAMPLE 1: LOGIN FORM ============

interface LoginFormData {
  username: string;
  password: string;
}

const loginValidationSchema: ValidationSchema<LoginFormData> = {
  username: required('Username is required'),
  password: required('Password is required'),
};

// Usage in component:
function validateLoginForm(formData: LoginFormData) {
  const errors = validateSchema(formData, loginValidationSchema);
  return errors; // Returns {} if valid, {username: 'error', password: 'error'} if invalid
}

// ============ EXAMPLE 2: USER FORM ============

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  role: string;
}

const userValidationSchema: ValidationSchema<UserFormData> = {
  username: usernameRules, // Uses predefined rules
  email: emailRules, // Uses predefined rules
  fullName: nameRules(2, 100, 'Full name'), // Custom length limits
  role: required('Role is required'),
};

// Usage:
function validateUserForm(formData: UserFormData) {
  return validateSchema(formData, userValidationSchema);
}

// ============ EXAMPLE 3: ENTITY CODE FORM ============

interface DefectFormData {
  defect_code: string;
  defect_name: string;
  description?: string;
}

const defectValidationSchema: ValidationSchema<DefectFormData> = {
  defect_code: codeRules(1, 10, 'Defect code'),
  defect_name: nameRules(2, 100, 'Defect name'),
  // description is optional, only validate if provided
  description: maxLength(500, 'Description must not exceed 500 characters'),
};

// ============ EXAMPLE 4: CUSTOM COMBINED VALIDATION ============

interface CustomFormData {
  productCode: string;
  quantity: number;
}

const customValidationSchema: ValidationSchema<CustomFormData> = {
  productCode: combine(
    required('Product code is required'),
    lengthBetween(5, 10),
    pattern(/^[A-Z]{2}[0-9]{3,8}$/, 'Product code must start with 2 uppercase letters followed by numbers')
  ),
  quantity: combine(
    required('Quantity is required'),
    (value) => {
      const num = Number(value);
      if (isNaN(num)) return 'Quantity must be a number';
      if (num < 1) return 'Quantity must be at least 1';
      if (num > 1000) return 'Quantity cannot exceed 1000';
      return null;
    }
  ),
};

// ============ EXAMPLE 5: PASSWORD CONFIRMATION ============

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const registerValidationSchema: ValidationSchema<RegisterFormData> = {
  username: usernameRules,
  password: passwordRules,
  confirmPassword: [
    required('Please confirm your password'),
    matches('password', 'Passwords do not match'),
  ],
};

// ============ EXAMPLE 6: DEFECT INPUT PAGE (COMPLEX) ============

interface DefectInputFormData {
  tray: string;
  positionOnTray: number;
  colorGroup?: string;
  qcName: string;
  qcLeaderConfirmName: string;
  mrbConfirmName: string;
  defectType: string;
}

// This can be created dynamically based on station type
function createDefectInputSchema(isSIVStation: boolean): ValidationSchema<DefectInputFormData> {
  const schema: ValidationSchema<DefectInputFormData> = {
    tray: required('Tray number is required'),
    positionOnTray: required('Position on tray is required'),
    qcName: required('QC name is required'),
    qcLeaderConfirmName: required('QC leader name is required'),
    mrbConfirmName: required('FVI Leader confirm name is required'),
    defectType: required('Defect type is required'),
  };

  // Conditionally add colorGroup validation for SIV station
  if (isSIVStation) {
    schema.colorGroup = required('Color group is required for SIV station');
  }

  return schema;
}

// Usage:
function validateDefectInputForm(formData: DefectInputFormData, isSIVStation: boolean) {
  const schema = createDefectInputSchema(isSIVStation);
  return validateSchema(formData, schema);
}

// ============ EXAMPLE 7: USING hasErrors HELPER ============

function handleFormSubmit(formData: UserFormData) {
  const errors = validateSchema(formData, userValidationSchema);

  if (hasErrors(errors)) {
    // Show errors to user
    console.error('Validation failed:', errors);
    return;
  }

  // Proceed with submission
  console.log('Form is valid, submitting...');
}

// ============ MIGRATION GUIDE ============

/*
BEFORE (Old approach - duplicated in each file):

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.username.trim()) {
    newErrors.username = 'Username is required';
  } else if (formData.username.length < 3) {
    newErrors.username = 'Username must be at least 3 characters';
  } else if (formData.username.length > 50) {
    newErrors.username = 'Username must not exceed 50 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
    newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

AFTER (New approach - centralized, reusable):

import { validateSchema, usernameRules, emailRules, hasErrors } from '../utils/validation';

const validationSchema: ValidationSchema<FormData> = {
  username: usernameRules,
  email: emailRules,
};

const validateForm = (): boolean => {
  const newErrors = validateSchema(formData, validationSchema);
  setErrors(newErrors);
  return !hasErrors(newErrors);
};

BENEFITS:
✅ 90% less code
✅ Consistent validation rules across app
✅ Easy to test and maintain
✅ Type-safe with TypeScript
✅ Reusable validation rules
✅ No duplication
*/

export {
  loginValidationSchema,
  userValidationSchema,
  defectValidationSchema,
  customValidationSchema,
  registerValidationSchema,
  createDefectInputSchema,
};
