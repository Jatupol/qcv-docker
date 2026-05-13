// client/src/utils/usersUtils.ts
// User-related utility and validation functions
// Manufacturing Quality Control System

import { formatDateTime } from './formatUtils';

// ==================== TYPE DEFINITIONS ====================

export interface UserValidationErrors {
  name?: string;
  email?: string;
  position?: string;
  newPassword?: string;
  confirmPassword?: string;
  currentPassword?: string;
  general?: string;
}

export interface PasswordValidationData {
  newPassword: string;
  confirmPassword: string;
}

// ==================== FORMATTING UTILITY FUNCTIONS ====================

/**
 * Format a date object or string to a readable format
 * @param date - Date object or string to format
 * @returns Formatted date string or 'Not specified' if no date provided
 */
export const formatUserDate = (date: Date | string | undefined): string => {
  if (!date) return 'Not specified';
  return formatDateTime(date, 'Not specified');
};

/**
 * Format a time string to HH:mm format
 * @param timeString - Time string in HH:mm or HH:mm:ss format
 * @returns Formatted time string or 'Not specified' if no time provided
 */
export const formatUserTime = (timeString: string | undefined): string => {
  if (!timeString) return 'Not specified';
  // Handle both HH:mm and HH:mm:ss formats
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Get Tailwind CSS classes for role badge styling
 * @param role - User role (admin, manager, user, viewer)
 * @returns Tailwind CSS class string
 */
export const getRoleColorClasses = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300';
    case 'manager':
      return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300';
    case 'user':
      return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
    case 'viewer':
      return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
  }
};

/**
 * Get Tailwind CSS classes for work shift badge styling
 * @param shift - Work shift (A, B, C, or undefined)
 * @returns Tailwind CSS class string
 */
export const getShiftColorClasses = (shift: string | undefined): string => {
  if (!shift) return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200';
  switch (shift.toUpperCase()) {
    case 'A':
      return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200';
    case 'B':
      return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200';
    case 'C':
      return 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200';
    default:
      return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-200';
  }
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate user name field
 * @param name - User name to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateUserName = (name: string | undefined): string | undefined => {
  if (!name?.trim()) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.trim().length > 100) {
    return 'Name must be less than 100 characters';
  }
  return undefined;
};

/**
 * Validate user email field
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateUserEmail = (email: string | undefined): string | undefined => {
  if (!email?.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return undefined;
};

/**
 * Validate user position field (optional field)
 * @param position - Position to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateUserPosition = (position: string | undefined): string | undefined => {
  if (position && position.trim().length > 100) {
    return 'Position must be less than 100 characters';
  }
  return undefined;
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validatePassword = (password: string | undefined): string | undefined => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }
  return undefined;
};

/**
 * Validate password confirmation matches
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Error message if invalid, undefined if valid
 */
export const validatePasswordMatch = (
  password: string | undefined,
  confirmPassword: string | undefined
): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return undefined;
};

/**
 * Validate user profile edit form
 * @param data - User form data to validate
 * @returns Object containing validation errors
 */
export const validateUserProfileForm = (data: {
  name?: string;
  email?: string;
  position?: string;
}): UserValidationErrors => {
  const errors: UserValidationErrors = {};

  // Name validation
  const nameError = validateUserName(data.name);
  if (nameError) errors.name = nameError;

  // Email validation
  /*
  const emailError = validateUserEmail(data.email);
  if (emailError) errors.email = emailError;
 */

  // Position validation
  const positionError = validateUserPosition(data.position);
  if (positionError) errors.position = positionError;

  return errors;
};

/**
 * Validate password change form
 * @param data - Password change data to validate
 * @returns Object containing validation errors
 */
export const validatePasswordChangeForm = (data: PasswordValidationData): UserValidationErrors => {
  const errors: UserValidationErrors = {};

  // New password validation
  const passwordError = validatePassword(data.newPassword);
  if (passwordError) errors.newPassword = passwordError;

  // Confirm password validation
  const confirmError = validatePasswordMatch(data.newPassword, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
};

/**
 * Check if validation errors object has any errors
 * @param errors - Validation errors object
 * @returns True if there are any errors, false otherwise
 */
export const hasValidationErrors = (errors: UserValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
