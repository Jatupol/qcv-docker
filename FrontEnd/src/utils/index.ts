// client/src/utills/index.ts
/**
 * Utilities Index
 *
 * Central export point for all utility functions
 */

// Export conversion utilities
export * from './convertUtils';

// Export system configuration utilities
export { SysconfigUtils } from './sysconfigUtils';
export type { DropdownOption } from './sysconfigUtils';

// Export fiscal week utilities (from shared package)
export {
  calculateFiscalWeekNumber,
  getFiscalWeekRange,
  formatFiscalWeek,
  getCurrentFiscalWeek,
  getFiscalYear,
  getCurrentFiscalYear,
  getMonthName,
  getMonthTrendName,
  fiscalWeekToYearMonth
} from '@qcv/shared';

// Export Excel utilities
export {
  exportToExcel,
  exportTableToExcel,
  exportMultipleSheets,
  ExcelFormatters
} from './excelUtils';

// Export formatting utilities
export {
  formatNumber,
  formatDate,
  formatDateTime,
  formatDateTimeFull,
  formatTime,
  formatTimeFull,
  getTodayDateString,
  parseAsLocalDate,
  // Input formatting (local timezone)
  formatDateForInput,
  formatDateTimeForInput,
  toLocalDate,
  parseLocalDateTime
} from './formatUtils';

export type { ExcelColumn, ExcelExportOptions } from './excelUtils';
