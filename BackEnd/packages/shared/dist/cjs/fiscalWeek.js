"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiscalYearStartDate = getFiscalYearStartDate;
exports.calculateFiscalWeekNumber = calculateFiscalWeekNumber;
exports.getFiscalYear = getFiscalYear;
exports.getFiscalWeekRange = getFiscalWeekRange;
exports.formatFiscalWeek = formatFiscalWeek;
exports.getCurrentFiscalWeek = getCurrentFiscalWeek;
exports.getCurrentFiscalYear = getCurrentFiscalYear;
exports.getPreviousFiscalWeek = getPreviousFiscalWeek;
exports.getMonthName = getMonthName;
exports.getMonthTrendName = getMonthTrendName;
exports.fiscalWeekToYearMonth = fiscalWeekToYearMonth;
/**
 * Get the start date (Week 1 Saturday) for a given fiscal year
 * FY starts on the Saturday closest to July 1 of the previous calendar year
 *
 * @param fiscalYear - The fiscal year (e.g., 2025 for FY2025)
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The start date (Saturday) of Week 1 for this fiscal year
 */
function getFiscalYearStartDate(fiscalYear, fiscalYearStartDay = 6) {
    // July 1 of the previous calendar year (e.g., for FY2025, check July 1, 2024)
    const july1 = new Date(fiscalYear - 1, 6, 1);
    july1.setHours(0, 0, 0, 0);
    const dayOfWeek = july1.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Find the Saturday closest to July 1
    // Days to next Saturday: (6 - dayOfWeek) % 7 (but 0 if already Saturday)
    // Days to previous Saturday: dayOfWeek === 6 ? 0 : -(dayOfWeek + 1)
    let daysToClosestSaturday;
    if (dayOfWeek === fiscalYearStartDay) {
        // July 1 is already Saturday
        daysToClosestSaturday = 0;
    }
    else {
        const daysToNextSat = (fiscalYearStartDay - dayOfWeek + 7) % 7;
        const daysToPrevSat = (dayOfWeek - fiscalYearStartDay + 7) % 7;
        // Choose the closer one (if tie, prefer staying in July - go forward)
        if (daysToPrevSat < daysToNextSat) {
            daysToClosestSaturday = -daysToPrevSat;
        }
        else {
            daysToClosestSaturday = daysToNextSat;
        }
    }
    const fyStartDate = new Date(july1);
    fyStartDate.setDate(july1.getDate() + daysToClosestSaturday);
    fyStartDate.setHours(0, 0, 0, 0);
    return fyStartDate;
}
/**
 * Calculate fiscal week number based on a date
 * Fiscal year starts on Saturday closest to July 1, all weeks are full 7-day weeks
 * Maximum week number is 52
 *
 * @param date - The date to calculate the fiscal week for
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The fiscal week number (1-52)
 */
function calculateFiscalWeekNumber(date, fiscalYearStartDay = 6) {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    targetDate.setHours(0, 0, 0, 0); // Normalize to start of day
    // Determine the fiscal year for this date
    const fiscalYear = getFiscalYear(targetDate, fiscalYearStartDay);
    // Get the start date of this fiscal year (Week 1 Saturday)
    const fyStartDate = getFiscalYearStartDate(fiscalYear, fiscalYearStartDay);
    // Calculate the difference in days from the FY start
    const diffInMs = targetDate.getTime() - fyStartDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    // Calculate week number (Week 1 starts on fyStartDate)
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    // Ensure week number is within valid range (1-52)
    return Math.max(1, Math.min(52, weekNumber));
}
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
function getFiscalYear(date, fiscalYearStartDay = 6) {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth(); // 0-11 (January = 0, July = 6)
    // Determine candidate fiscal years to check
    // If in second half of year (July-Dec), could be FY(currentYear+1)
    // If in first half of year (Jan-June), could be FY(currentYear) or FY(currentYear+1) for late June
    let candidateFY;
    if (currentMonth >= 6) {
        // July to December: likely in FY that ends next calendar year
        candidateFY = currentYear + 1;
    }
    else {
        // January to June: likely in FY that ends this calendar year
        candidateFY = currentYear;
    }
    // Get the start date of the candidate FY
    const candidateFYStart = getFiscalYearStartDate(candidateFY, fiscalYearStartDay);
    // Check if target date is before the candidate FY start
    if (targetDate < candidateFYStart) {
        // Target is in the previous fiscal year
        return candidateFY - 1;
    }
    // Check if target date is on or after the next FY start (for dates near FY boundary)
    const nextFYStart = getFiscalYearStartDate(candidateFY + 1, fiscalYearStartDay);
    if (targetDate >= nextFYStart) {
        return candidateFY + 1;
    }
    return candidateFY;
}
/**
 * Get fiscal week range (start and end dates) for a given week number
 * All weeks are full 7-day weeks (Saturday to Friday)
 *
 * @param fiscalYear - The fiscal year (e.g., 2025 for FY2025)
 * @param weekNumber - The fiscal week number (1-52)
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns Object containing start and end dates of the fiscal week
 */
function getFiscalWeekRange(fiscalYear, weekNumber, fiscalYearStartDay = 6) {
    // Validate week number (max 52)
    if (weekNumber < 1 || weekNumber > 52) {
        throw new Error('Week number must be between 1 and 52');
    }
    // Get the start date of this fiscal year (Week 1 Saturday)
    const fyStartDate = getFiscalYearStartDate(fiscalYear, fiscalYearStartDay);
    // Calculate week start: Week 1 starts on fyStartDate, each subsequent week is 7 days later
    const weekStart = new Date(fyStartDate);
    weekStart.setDate(fyStartDate.getDate() + (weekNumber - 1) * 7);
    weekStart.setHours(0, 0, 0, 0);
    // Week end is always 6 days after start (Saturday to Friday = 7 days)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(0, 0, 0, 0);
    return {
        start: weekStart,
        end: weekEnd
    };
}
/**
 * Format fiscal week as a string
 *
 * @param date - The date to format
 * @param format - The format string ('YYYY-WW' or 'YYYY Week WW'). Default is 'YYYY-WW'
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns Formatted fiscal week string
 */
function formatFiscalWeek(date, format = 'YYYY-WW', fiscalYearStartDay = 6) {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    const fiscalYear = getFiscalYear(targetDate, fiscalYearStartDay);
    const weekNumber = calculateFiscalWeekNumber(targetDate, fiscalYearStartDay);
    const paddedWeek = String(weekNumber).padStart(2, '0');
    if (format === 'YYYY Week WW') {
        return `${fiscalYear} Week ${paddedWeek}`;
    }
    return `${fiscalYear}-${paddedWeek}`;
}
/**
 * Get the current fiscal week number
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns The current fiscal week number
 */
function getCurrentFiscalWeek(fiscalYearStartDay = 6) {
    return calculateFiscalWeekNumber(new Date(), fiscalYearStartDay);
}
/**
 * Get the current fiscal year
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns The current fiscal year number
 */
function getCurrentFiscalYear(fiscalYearStartDay = 6) {
    return getFiscalYear(new Date(), fiscalYearStartDay);
}
/**
 * Get the previous fiscal week (current date - 7 days)
 * Uses date subtraction to naturally handle fiscal year boundaries
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns Object with fiscalYear and weekNumber of the previous week
 */
function getPreviousFiscalWeek(fiscalYearStartDay = 6) {
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 7);
    return {
        fiscalYear: getFiscalYear(prevDate, fiscalYearStartDay),
        weekNumber: calculateFiscalWeekNumber(prevDate, fiscalYearStartDay),
    };
}
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
function getMonthName(yearmonth) {
    // Convert to string if number
    const yearmonthStr = String(yearmonth);
    // Validate format (should be 4 digits: YYMM)
    if (yearmonthStr.length !== 4 || isNaN(Number(yearmonthStr))) {
        console.warn(`Invalid yearmonth format: ${yearmonth}. Expected YYMM format.`);
        return String(yearmonth); // Return as-is if invalid
    }
    // Extract year and month
    const year = yearmonthStr.substring(0, 2);
    const month = yearmonthStr.substring(2, 4);
    // Convert month number to abbreviated month name
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = parseInt(month, 10) - 1; // Month is 1-based, array is 0-based
    // Validate month range
    if (monthIndex < 0 || monthIndex > 11) {
        console.warn(`Invalid month in yearmonth: ${yearmonth}. Month should be 01-12.`);
        return String(yearmonth); // Return as-is if invalid
    }
    const monthName = monthNames[monthIndex];
    return `${monthName}\`${year}`;
}
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
function getMonthTrendName(yearmonthtrend = '') {
    const lastTwo = yearmonthtrend.slice(-2);
    const yearmonth = getMonthName(yearmonthtrend.toString().substring(0, 4));
    const result = lastTwo !== "99" ? "WW" + lastTwo + " " + yearmonth : yearmonth;
    return result;
}
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
function fiscalWeekToYearMonth(fiscalYearWeek, fiscalYearStartDay = 6) {
    // Parse input format YYYYWW
    if (fiscalYearWeek.length !== 6) {
        throw new Error('Invalid fiscal year week format. Expected YYYYWW (e.g., "202401")');
    }
    const fiscalYear = parseInt(fiscalYearWeek.substring(0, 4));
    const weekNumber = parseInt(fiscalYearWeek.substring(4, 6));
    if (isNaN(fiscalYear) || isNaN(weekNumber)) {
        throw new Error('Invalid fiscal year week format. Year and week must be numbers.');
    }
    if (weekNumber < 1 || weekNumber > 52) {
        throw new Error('Week number must be between 1 and 52');
    }
    // Get the fiscal week range to find the start date
    const weekRange = getFiscalWeekRange(fiscalYear, weekNumber, fiscalYearStartDay);
    const weekStartDate = weekRange.start;
    // Extract calendar year and month from the week start date
    const calendarYear = weekStartDate.getFullYear();
    const calendarMonth = weekStartDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    // Format as YYMM
    const yearTwoDigit = String(calendarYear).substring(2, 4); // Get last 2 digits of year
    const monthTwoDigit = String(calendarMonth).padStart(2, '0');
    return yearTwoDigit + monthTwoDigit;
}
//# sourceMappingURL=fiscalWeek.js.map