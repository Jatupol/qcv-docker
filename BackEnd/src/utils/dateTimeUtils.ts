// server/src/utils/dateTimeUtils.ts
/**
 * DateTime Utilities - Local Timezone Preservation
 *
 * Helper functions for working with dates and times while preserving local timezone.
 * Used with PostgreSQL timestamp WITHOUT timezone columns.
 */

/**
 * Ensure a value is a Date object
 * Handles both Date objects and ISO strings from JSON
 *
 * @param date - Date object or date string
 * @returns Date object
 *
 * @example
 * toDate(new Date()); // Returns the Date object
 * toDate('2026-01-27T15:56:05'); // Returns Date at 15:56:05 local time
 * toDate('2026-01-27'); // Returns Date at 00:00:00 local time
 */
export function toDate(date: Date | string | null | undefined): Date {
  if (!date) {
    return new Date();
  }

  if (date instanceof Date) {
    return date;
  }

  // Check if it's a date-only string (YYYY-MM-DD)
  // Parse as local midnight to avoid UTC conversion
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Check if it's a datetime string with space separator (YYYY-MM-DD HH:mm:ss)
  // This format needs explicit parsing to ensure local timezone
  const spaceMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
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

  // Check if it's a datetime string with T separator (YYYY-MM-DDTHH:mm:ss)
  const tMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if (tMatch) {
    const [, year, month, day, hours, minutes, seconds, ms] = tMatch;
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

  // Fallback: let JavaScript parse it (may have timezone issues)
  console.warn(`⚠️ toDate: Unrecognized date format "${date}", using fallback parsing`);
  return new Date(date);
}

/**
 * Format date to ISO date string (YYYY-MM-DD) in local timezone
 *
 * @param date - Date object or date string
 * @returns Formatted string in YYYY-MM-DD format
 *
 * @example
 * formatDateLocal(new Date('2026-01-27T15:56:05')); // Returns "2026-01-27"
 */
export function formatDateLocal(date: Date | string): string {
  const dateObj = toDate(date);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format date to ISO datetime string (YYYY-MM-DDTHH:mm:ss) in local timezone
 *
 * @param date - Date object or date string
 * @returns Formatted string in YYYY-MM-DDTHH:mm:ss format
 *
 * @example
 * formatDateTimeLocal(new Date('2026-01-27T15:56:05')); // Returns "2026-01-27T15:56:05"
 */
export function formatDateTimeLocal(date: Date | string): string {
  const dateObj = toDate(date);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Format date to display format (DD/MM/YYYY HH:mm:ss) in local timezone
 *
 * @param date - Date object or date string
 * @returns Formatted string in DD/MM/YYYY HH:mm:ss format
 *
 * @example
 * formatDateTimeDisplay(new Date('2026-01-27T15:56:05')); // Returns "27/01/2026 15:56:05"
 */
export function formatDateTimeDisplay(date: Date | string | null | undefined): string {
  if (!date) return '-';

  const dateObj = toDate(date);

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
