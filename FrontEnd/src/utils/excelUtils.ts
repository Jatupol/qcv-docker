// client/src/utills/excelUtils.ts
/**
 * Excel Export Utilities
 *
 * Helper functions for exporting data to Excel using the xlsx library
 */

import * as XLSX from 'xlsx';
import { parseAsLocalDate, formatDateForInput } from './formatUtils';

/**
 * Column configuration for Excel export
 */
export interface ExcelColumn {
  /** The key in the data object */
  key: string;
  /** The header label to display */
  header: string;
  /** Optional width for the column */
  width?: number;
  /** Optional formatter function */
  formatter?: (value: any) => any;
}

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  /** The filename (without extension) */
  filename: string;
  /** The sheet name. Default is 'Sheet1' */
  sheetName?: string;
  /** Column configurations */
  columns?: ExcelColumn[];
  /** Whether to auto-fit column widths. Default is true */
  autoWidth?: boolean;
}

/**
 * Export data to Excel file
 *
 * @param data - Array of objects to export
 * @param options - Export configuration options
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExcelExportOptions
): void {
  const {
    filename,
    sheetName = 'Sheet1',
    columns,
    autoWidth = true
  } = options;

  // Prepare the data
  let exportData: any[];

  if (columns && columns.length > 0) {
    // Use column configuration to transform data
    exportData = data.map(row => {
      const transformedRow: Record<string, any> = {};
      columns.forEach(col => {
        const value = row[col.key];
        transformedRow[col.header] = col.formatter ? col.formatter(value) : value;
      });
      return transformedRow;
    });
  } else {
    // Export all data as-is
    exportData = data;
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-fit column widths
  if (autoWidth) {
    const columnWidths = calculateColumnWidths(exportData, columns);
    worksheet['!cols'] = columnWidths;
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Calculate optimal column widths based on content
 */
function calculateColumnWidths(
  data: any[],
  columns?: ExcelColumn[]
): XLSX.ColInfo[] {
  if (!data || data.length === 0) return [];

  const headers = columns
    ? columns.map(col => col.header)
    : Object.keys(data[0]);

  return headers.map((header, index) => {
    // Get max length from header and data
    let maxLength = header.length;

    data.forEach(row => {
      const value = columns ? row[header] : row[Object.keys(row)[index]];
      const valueStr = value?.toString() || '';
      maxLength = Math.max(maxLength, valueStr.length);
    });

    // Apply custom width if provided
    if (columns && columns[index]?.width) {
      return { wch: columns[index].width };
    }

    // Add some padding and limit max width
    return { wch: Math.min(maxLength + 2, 50) };
  });
}

/**
 * Export table data to Excel (for HTML tables or similar structures)
 *
 * @param tableId - The ID of the HTML table element
 * @param filename - The filename (without extension)
 * @param sheetName - The sheet name. Default is 'Sheet1'
 */
export function exportTableToExcel(
  tableId: string,
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with ID '${tableId}' not found`);
    return;
  }

  const worksheet = XLSX.utils.table_to_sheet(table);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export multiple sheets to a single Excel file
 *
 * @param sheets - Array of sheet configurations
 * @param filename - The filename (without extension)
 */
export function exportMultipleSheets(
  sheets: Array<{
    data: any[];
    sheetName: string;
    columns?: ExcelColumn[];
  }>,
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ data, sheetName, columns }) => {
    let exportData: any[];

    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const transformedRow: Record<string, any> = {};
        columns.forEach(col => {
          const value = row[col.key];
          transformedRow[col.header] = col.formatter ? col.formatter(value) : value;
        });
        return transformedRow;
      });
    } else {
      exportData = data;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-fit columns
    const columnWidths = calculateColumnWidths(exportData, columns);
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Common formatters for Excel export
 */
export const ExcelFormatters = {
  /** Format date to YYYY-MM-DD (local timezone) */
  date: (value: Date | string | null | undefined): string => {
    if (!value) return '';
    const date = parseAsLocalDate(typeof value === 'string' ? value : value);
    return formatDateForInput(date);
  },

  /** Format date to YYYY-MM-DD HH:mm:ss (local timezone) */
  datetime: (value: Date | string | null | undefined): string => {
    if (!value) return '';
    const date = parseAsLocalDate(typeof value === 'string' ? value : value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  /** Format number with 2 decimal places */
  decimal: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return value.toFixed(2);
  },

  /** Format as percentage */
  percentage: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return `${(value * 100).toFixed(2)}%`;
  },

  /** Format boolean as Yes/No */
  boolean: (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return value ? 'Yes' : 'No';
  },

  /** Format currency (USD) */
  currency: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return `$${value.toFixed(2)}`;
  },

  /** Truncate long text */
  truncate: (maxLength: number) => (value: string | null | undefined): string => {
    if (!value) return '';
    return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
  }
};
