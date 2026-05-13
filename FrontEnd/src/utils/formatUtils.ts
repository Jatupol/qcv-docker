// client/src/utils/formatUtils.ts
/**
 * Formating data Utilities
 * 
 * Helper functions for working with formating data
 */

 

/**
 * Format number
 *
 * @param stringNumber
 * @param decimals - Optional number of decimal places to display
 * @returns String with commas as thousand separators
 *
 * @example
 * formatNumber(1234567); // Returns "1,234,567"
 * formatNumber("9876543"); // Returns "9,876,543"
 * formatNumber("1234.5678", 2); // Returns "1,234.57"
 * formatNumber("1234.5", 2); // Returns "1,234.50"
 */
export function formatNumber(stringNumber: string = '0', decimals?: number): string {
  const num = parseFloat(stringNumber);

  if (isNaN(num)) {
    return '0';
  }

  // Apply decimal formatting if specified
  const formattedNum = decimals !== undefined
    ? num.toFixed(decimals)
    : stringNumber;

  // Add thousands separator
  return formattedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


 

 
/**
 * Parse date string as local time (not UTC)
 * Handles formats: "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss"
 */
export function parseAsLocalDate(date: Date | string): Date {
  if (date instanceof Date) {
    return date;
  }

  // Remove 'Z' suffix if present - treat as local time, not UTC
  let dateStr = date;
  if (dateStr.endsWith('Z')) {
    dateStr = dateStr.slice(0, -1);
  }

  // Replace space with T for consistent parsing
  const normalized = dateStr.replace(' ', 'T');

  // Match: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss.mmm
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?)?$/);
  if (match) {
    const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = match;
    // Create date using local time components (not UTC)
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );
  }

  // Fallback to standard parsing
  return new Date(date);
}

/**
 * Format date to dd/mm/yyyy format
 * Parses date strings as local time (not UTC) to prevent timezone issues
 *
 * @param date - Date object, string, or null/undefined
 * @param fallback - Optional fallback string if date is invalid (default: '-')
 * @returns Formatted date string in dd/mm/yyyy format
 *
 * @example
 * formatDate(new Date('2024-01-15')); // Returns "15/01/2024"
 * formatDate('2024-01-15'); // Returns "15/01/2024"
 * formatDate('2024-01-15 14:30:00'); // Returns "15/01/2024"
 * formatDate(null); // Returns "-"
 * formatDate(undefined, 'N/A'); // Returns "N/A"
 */
export function formatDate(date: Date | string | null | undefined, fallback: string = '-'): string {
  if (!date) return fallback;

  try {
    const dateObj = parseAsLocalDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return fallback;
  }
}


/**
 * Format date and time to dd/mm/yyyy HH:mm format
 * Parses date strings as local time (not UTC) to prevent timezone issues
 *
 * @param date - Date object, string, or null/undefined
 * @param fallback - Optional fallback string if date is invalid (default: '-')
 * @returns Formatted date-time string in dd/mm/yyyy HH:mm format
 *
 * @example
 * formatDateTime(new Date('2024-01-15T14:30:00')); // Returns "15/01/2024 14:30"
 * formatDateTime('2024-01-15T14:30:00'); // Returns "15/01/2024 14:30"
 * formatDateTime('2024-01-15 14:30:00'); // Returns "15/01/2024 14:30"
 * formatDateTime(null); // Returns "-"
 */
export function formatDateTime(date: Date | string | null | undefined, fallback: string = '-'): string {
  if (!date) return fallback;

  try {
    const dateObj = parseAsLocalDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return fallback;
  }
}


/**
 * Format date and time to dd/mm/yyyy HH:mm:ss format
 * Parses date strings as local time (not UTC) to prevent timezone issues
 *
 * @param date - Date object, string, or null/undefined
 * @param fallback - Optional fallback string if date is invalid (default: '-')
 * @returns Formatted date-time string in dd/mm/yyyy HH:mm:ss format
 *
 * @example
 * formatDateTimeFull(new Date('2024-01-15T14:30:45')); // Returns "15/01/2024 14:30:45"
 * formatDateTimeFull('2024-01-15T14:30:45'); // Returns "15/01/2024 14:30:45"
 * formatDateTimeFull('2024-01-15 14:30:45'); // Returns "15/01/2024 14:30:45"
 * formatDateTimeFull(null); // Returns "-"
 */
export function formatDateTimeFull(date: Date | string | null | undefined, fallback: string = '-'): string {
  if (!date) return fallback;

  try {
    const dateObj = parseAsLocalDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return fallback;
  }
}


// ==================== INPUT FORMATTING (LOCAL TIMEZONE) ====================

/**
 * Format date for input[type="date"]
 * Uses local timezone to prevent date shifting issues
 *
 * @param date - Date object or date string
 * @returns Formatted string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * formatDateForInput(new Date('2026-01-27T14:30:00')); // Returns "2026-01-27"
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for input[type="datetime-local"]
 * Uses local timezone to preserve the actual time
 *
 * @param date - Date object or date string
 * @param includeSeconds - Whether to include seconds (default: true)
 * @returns Formatted string in YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm format (local timezone)
 *
 * @example
 * formatDateTimeForInput(new Date('2026-01-27T14:30:45')); // Returns "2026-01-27T14:30:45"
 * formatDateTimeForInput(new Date('2026-01-27T14:30:45'), false); // Returns "2026-01-27T14:30"
 */
export function formatDateTimeForInput(date: Date | string, includeSeconds: boolean = true): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  if (includeSeconds) {
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert date string or Date to a local Date object
 * Handles both date-only strings (YYYY-MM-DD) and datetime strings
 *
 * IMPORTANT: Date-only strings like "2026-01-27" are parsed as LOCAL midnight,
 * not UTC midnight (which is the default JavaScript behavior)
 *
 * @param date - Date object, date string, or datetime string
 * @returns Date object in local timezone
 *
 * @example
 * toLocalDate('2026-01-27'); // Returns Date at local midnight (not UTC midnight)
 * toLocalDate('2026-01-27T14:30:00'); // Returns Date at 14:30:00 local time
 * toLocalDate(new Date()); // Returns the same Date object
 */
export function toLocalDate(date: Date | string): Date {
  if (date instanceof Date) {
    return date;
  }

  // Remove 'Z' suffix if present - we want to treat database timestamps as local time
  // Database stores timestamps WITHOUT timezone, so 'Z' suffix from JSON serialization is misleading
  let dateStr = date;
  if (dateStr.endsWith('Z')) {
    dateStr = dateStr.slice(0, -1);
  }

  // Check if it's a date-only string (YYYY-MM-DD)
  // JavaScript's Date() parses "YYYY-MM-DD" as UTC midnight, causing timezone issues
  // We need to parse it as local midnight instead
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Creates local midnight
  }

  // Check if it's a datetime string with T separator (YYYY-MM-DDTHH:mm:ss)
  // Explicitly parse to ensure local timezone
  const tMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/);
  if (tMatch) {
    const [, year, month, day, hours, minutes, seconds, ms] = tMatch;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      seconds ? parseInt(seconds) : 0,
      ms ? parseInt(ms.substring(0, 3)) : 0
    );
  }

  // Check if it's a datetime string with space separator (YYYY-MM-DD HH:mm:ss)
  const spaceMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if (spaceMatch) {
    const [, year, month, day, hours, minutes, seconds, ms] = spaceMatch;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds),
      ms ? parseInt(ms.substring(0, 3)) : 0
    );
  }

  // Fallback: let JavaScript parse it (without Z suffix)
  return new Date(dateStr);
}

/**
 * Create a Date object preserving local time for database storage
 * This ensures the datetime is stored exactly as the user entered it
 *
 * @param dateTimeStr - datetime-local input value (YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)
 * @returns Date object representing the local time
 *
 * @example
 * parseLocalDateTime('2026-01-27T14:30:00'); // Returns Date at 14:30:00 local time
 * parseLocalDateTime('2026-01-27T14:30'); // Returns Date at 14:30:00 local time
 */
export function parseLocalDateTime(dateTimeStr: string): Date {
  if (!dateTimeStr) {
    return new Date();
  }

  // datetime-local format is already in local timezone
  // new Date() parses "YYYY-MM-DDTHH:mm:ss" as local time (not UTC)
  return new Date(dateTimeStr);
}


// ==================== TIME-ONLY FORMATTING ====================

/**
 * Format time only in HH:mm format (24-hour)
 * Parses date strings as local time (not UTC) to prevent timezone issues
 *
 * @param date - Date object, string, or null/undefined
 * @param fallback - Optional fallback string if date is invalid (default: '-')
 * @returns Formatted time string in HH:mm format
 *
 * @example
 * formatTime(new Date('2024-01-15T14:30:45')); // Returns "14:30"
 * formatTime('2024-01-15T14:30:45'); // Returns "14:30"
 * formatTime(null); // Returns "-"
 */
export function formatTime(date: Date | string | null | undefined, fallback: string = '-'): string {
  if (!date) return fallback;

  try {
    const dateObj = parseAsLocalDate(date);

    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch {
    return fallback;
  }
}

/**
 * Format time with seconds in HH:mm:ss format (24-hour)
 * Parses date strings as local time (not UTC) to prevent timezone issues
 *
 * @param date - Date object, string, or null/undefined
 * @param fallback - Optional fallback string if date is invalid (default: '-')
 * @returns Formatted time string in HH:mm:ss format
 *
 * @example
 * formatTimeFull(new Date('2024-01-15T14:30:45')); // Returns "14:30:45"
 * formatTimeFull('2024-01-15T14:30:45'); // Returns "14:30:45"
 * formatTimeFull(null); // Returns "-"
 */
export function formatTimeFull(date: Date | string | null | undefined, fallback: string = '-'): string {
  if (!date) return fallback;

  try {
    const dateObj = parseAsLocalDate(date);

    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  } catch {
    return fallback;
  }
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 * Replaces `new Date().toISOString().split('T')[0]` which returns UTC date
 *
 * @returns Today's date in YYYY-MM-DD format (local timezone)
 *
 * @example
 * getTodayDateString(); // Returns "2026-02-18" (if today is Feb 18, 2026 in local tz)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
