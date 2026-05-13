/**
 * Fiscal Week Utilities
 *
 * Helper functions for calculating fiscal week numbers
 *
 * FISCAL YEAR RULES:
 * 1. Fiscal year starts on the Saturday closest to July 1 (can be late June or early July)
 * 2. New weeks always start on Saturday
 * 3. Each fiscal year has exactly 52 full weeks (Saturday to Friday)
 * 4. FY is named after the year it ENDS (FY2025 = starts ~July 2024, ends ~June 2025)
 * 5. Maximum week number is 52
 *
 * Examples of FY start dates:
 * - FY2023: 2 July 2022 (Sat) - July 1, 2022 was Friday
 * - FY2024: 1 July 2023 (Sat) - July 1, 2023 was Saturday
 * - FY2025: 29 June 2024 (Sat) - July 1, 2024 is Monday
 * - FY2026: 28 June 2025 (Sat) - July 1, 2025 is Tuesday
 */
/**
 * Get the start date (Week 1 Saturday) for a given fiscal year
 * FY starts on the Saturday closest to July 1 of the previous calendar year
 *
 * @param fiscalYear - The fiscal year (e.g., 2025 for FY2025)
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The start date (Saturday) of Week 1 for this fiscal year
 */
export declare function getFiscalYearStartDate(fiscalYear: number, fiscalYearStartDay?: number): Date;
/**
 * Calculate fiscal week number based on a date
 * Fiscal year starts on Saturday closest to July 1, all weeks are full 7-day weeks
 * Maximum week number is 52
 *
 * @param date - The date to calculate the fiscal week for
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The fiscal week number (1-52)
 */
export declare function calculateFiscalWeekNumber(date: Date | string, fiscalYearStartDay?: number): number;
/**
 * Get the fiscal year from a date
 * Fiscal year starts on the Saturday closest to July 1
 * Fiscal year is named after the year in which it ENDS (e.g., FY2025 starts ~July 2024)
 *
 * @param date - The date to get the fiscal year for
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The fiscal year number
 *
 * @example
 * // For a date in August 2024
 * getFiscalYear(new Date('2024-08-15'), 6); // Returns 2025 (FY2025)
 *
 * @example
 * // For a date in January 2025
 * getFiscalYear(new Date('2025-01-15'), 6); // Returns 2025 (still in FY2025)
 *
 * @example
 * // For June 28, 2025 (before FY2026 starts)
 * getFiscalYear(new Date('2025-06-27'), 6); // Returns 2025 (still in FY2025)
 *
 * @example
 * // For June 28, 2025 (FY2026 starts on this Saturday)
 * getFiscalYear(new Date('2025-06-28'), 6); // Returns 2026 (FY2026 starts)
 */
export declare function getFiscalYear(date: Date | string, fiscalYearStartDay?: number): number;
/**
 * Get fiscal week range (start and end dates) for a given week number
 * All weeks are full 7-day weeks (Saturday to Friday)
 *
 * @param fiscalYear - The fiscal year (e.g., 2025 for FY2025)
 * @param weekNumber - The fiscal week number (1-52)
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns Object containing start and end dates of the fiscal week
 */
export declare function getFiscalWeekRange(fiscalYear: number, weekNumber: number, fiscalYearStartDay?: number): {
    start: Date;
    end: Date;
};
/**
 * Format fiscal week as a string
 *
 * @param date - The date to format
 * @param format - The format string ('YYYY-WW' or 'YYYY Week WW'). Default is 'YYYY-WW'
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns Formatted fiscal week string
 */
export declare function formatFiscalWeek(date: Date | string, format?: 'YYYY-WW' | 'YYYY Week WW', fiscalYearStartDay?: number): string;
/**
 * Get the current fiscal week number
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns The current fiscal week number
 */
export declare function getCurrentFiscalWeek(fiscalYearStartDay?: number): number;
/**
 * Get the current fiscal year
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns The current fiscal year number
 */
export declare function getCurrentFiscalYear(fiscalYearStartDay?: number): number;
/**
 * Get the previous fiscal week (current date - 7 days)
 * Uses date subtraction to naturally handle fiscal year boundaries
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns Object with fiscalYear and weekNumber of the previous week
 */
export declare function getPreviousFiscalWeek(fiscalYearStartDay?: number): {
    fiscalYear: number;
    weekNumber: number;
};
/**
 * Convert yearmonth format to month name format
 * Converts numeric yearmonth (YYMM) to abbreviated month name with year (MMM`YY)
 *
 * @param yearmonth - The yearmonth in YYMM format (e.g., "2406" or 2406)
 * @returns Formatted month name string (e.g., "Jun`24")
 *
 * @example
 * getMonthName("2406"); // Returns "Jun`24"
 * getMonthName(2412); // Returns "Dec`24"
 * getMonthName("2501"); // Returns "Jan`25"
 */
export declare function getMonthName(yearmonth: string | number): string;
/**
 * Convert yearmonth format to month name format with optional week prefix
 * Converts numeric yearmonth (YYMMWW) to abbreviated month name with year (MMM`YY)
 * If last two digits are not "99", adds week prefix
 *
 * @param yearmonthtrend - The yearmonth in YYMMWW format (e.g., "240699" or "250112")
 * @returns Formatted month name string (e.g., "Jun`24" or "WW12 Jan`25")
 *
 * @example
 * getMonthTrendName("240699"); // Returns "Jun`24"
 * getMonthTrendName("241299"); // Returns "Dec`24"
 * getMonthTrendName("250112"); // Returns "WW12 Jan`25"
 */
export declare function getMonthTrendName(yearmonthtrend?: string): string;
/**
 * Convert fiscal year and week to calendar year and month
 * Takes fiscal week format (YYYYWW like "202401") and returns year-month format (YYMM like "2406")
 *
 * @param fiscalYearWeek - Fiscal year and week in format YYYYWW (e.g., "202401")
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns Year and month in format YYMM (e.g., "2406")
 *
 * @example
 * // FY2024 Week 01 starts in late June 2024
 * fiscalWeekToYearMonth("202401"); // Returns "2406"
 *
 * @example
 * // FY2024 Week 10 is in August 2024
 * fiscalWeekToYearMonth("202410"); // Returns "2408"
 */
export declare function fiscalWeekToYearMonth(fiscalYearWeek: string, fiscalYearStartDay?: number): string;
//# sourceMappingURL=fiscalWeek.d.ts.map