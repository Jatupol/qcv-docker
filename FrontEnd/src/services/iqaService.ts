// client/src/services/iqaService.ts

/**
 * IQA Service - Frontend API service for IQA entity
 *
 * Provides centralized service for IQA data import, management, and operations
 * Includes Excel file processing, validation, and API communication
 */

import * as XLSX from 'xlsx';
import { apiBaseUrl } from './api';
import type {
  IQAData,
  IQACreateRequest,
  IQABulkImportRequest,
  IQABulkImportResponse,
  IQAQueryFilters,
  IQAQueryOptions,
  IQAExportData,
  IQAHeaderValidationResult,
  IQA_EXPECTED_HEADERS,
  IQADefectSubmission
} from '../types/iqa';
import { IQA_EXPECTED_HEADERS as EXPECTED_HEADERS } from '../types/iqa';

// ==================== RESPONSE TYPES ====================

export interface IQAApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ==================== EXCEL PROCESSING UTILITIES ====================

/**
 * Helper function to convert Excel serial date to text string
 * Uses local timezone to prevent day shift issues
 */
export const formatDateAsText = (value: any): string | null => {
  if (!value) return null;

  try {
    // If it's already a string, return as-is
    if (typeof value === 'string') {
      return value.trim() || null;
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      // Excel stores dates as days since 1900-01-01
      // Convert Excel serial date to JavaScript date
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch (Dec 30, 1899)
      const jsDate = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

      // Check if date is valid
      if (isNaN(jsDate.getTime())) {
        return null;
      }

      // Format date using local timezone (not UTC) to prevent day shift
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, '0');
      const day = String(jsDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Try to parse as date object
    const date = new Date(value);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    // Format date using local timezone (not UTC) to prevent day shift
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
};

/**
 * Helper function to safely parse integer
 */
export const parseInteger = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Helper function to safely convert value to string
 * Handles numbers from Excel that should be stored as varchar
 */
export const toStringOrNull = (value: any): string | null => {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim() || null;
};

/**
 * Validate Excel file headers match expected template
 */
export const validateHeaders = (actualHeaders: string[]): IQAHeaderValidationResult => {
  const errors: string[] = [];
  const mismatches: Array<{ column: number; expected: string; actual: string }> = [];

  // Check if the number of headers match
  if (actualHeaders.length !== EXPECTED_HEADERS.length) {
    errors.push(
      `Expected ${EXPECTED_HEADERS.length} columns but found ${actualHeaders.length}`
    );
  }

  // Check if each header matches (case-sensitive)
  for (let i = 0; i < EXPECTED_HEADERS.length; i++) {
    if (actualHeaders[i] !== EXPECTED_HEADERS[i]) {
      mismatches.push({
        column: i + 1,
        expected: EXPECTED_HEADERS[i],
        actual: actualHeaders[i] || '(missing)'
      });
      errors.push(
        `Column ${i + 1}: Expected "${EXPECTED_HEADERS[i]}" but found "${actualHeaders[i] || '(missing)'}"`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    expectedCount: EXPECTED_HEADERS.length,
    actualCount: actualHeaders.length,
    mismatches
  };
};

// Export interface for parse result with details
export interface IQAParseResult {
  validRecords: IQACreateRequest[];
  skippedRows: Array<{ row: number; lotno: string; missingFields: string[] }>;
  totalRows: number;
}

/**
 * Parse Excel file and map to IQA data structure
 * Returns detailed information about valid and skipped records
 */
export const parseExcelFile = async (file: File): Promise<IQAParseResult> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Read the header row directly (row 0) to get all column names
  // This is needed because sheet_to_json skips columns with empty values in first data row
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  if (rawData.length < 2) {
    throw new Error('The uploaded Excel file is empty. Please use the IQA_Template.xlsx file and add data rows.');
  }

  // Get actual headers from the first row
  const actualHeaders = (rawData[0] || []).map((h: any) => String(h || '').trim());

  // Validate headers
  const validation = validateHeaders(actualHeaders);

  if (!validation.isValid) {
    throw new Error(
      `Invalid file format. Header columns do not match:\n${validation.errors.join('\n')}\n\nPlease use the IQA_Template.xlsx file.`
    );
  }

  // Log column headers for debugging
  console.log('📋 Excel Column Headers:', actualHeaders);
  console.log('📍 Lot No column name:', actualHeaders.find(h => h.toLowerCase().includes('lot')));

  // Read data with headers (default behavior)
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  // Map Excel columns to database fields using header names directly
  const allRecords = jsonData.map((row: any, index) => {
    // Access columns by header name for accuracy
    const dateIqa = formatDateAsText(row['Date']);
    const receiptDate = formatDateAsText(row['RECEIPT_DATE']);

    return {
      rowNumber: index + 2, // +2 because Excel row 1 is headers, row 2 is first data row
      record: {
        // fy and ww are auto-calculated from date_iqa on backend
        // Use toStringOrNull for all varchar fields to handle Excel numeric values
        fw: toStringOrNull(row['FW']),
        date_iqa: dateIqa,
        shift_to_shift: toStringOrNull(row['Shift for Shift']),
        expense: toStringOrNull(row['Expense']),
        re_expense: toStringOrNull(row['Re-Expense']),
        qc_owner: toStringOrNull(row['QC Owner']),
        model: toStringOrNull(row['MODEL']),
        item: toStringOrNull(row['ITEM']),  // Excel may store as number
        telex: toStringOrNull(row['TELEX']),
        supplier: toStringOrNull(row['SUPPLIER']),  // Excel may store as number
        descr: toStringOrNull(row['DESCR']),
        location: toStringOrNull(row['LOCATIONS']),
        qty: parseInteger(row['QTY']),
        supplier_do: toStringOrNull(row['SUPPLIER DO']),
        remark: toStringOrNull(row['REMARK']),
        po: toStringOrNull(row['PO#']),  // Excel may store as number
        sbr: toStringOrNull(row['SBR#']),
        disposition_code: toStringOrNull(row['DISPOSITION CODE']),
        receipt_date: receiptDate,
        age: parseInteger(row['AGE']),
        warehouse: toStringOrNull(row['Warehouse']),
        building: toStringOrNull(row['Building']),
        business_unit: toStringOrNull(row['Business Unit']),
        std_case_qty: parseInteger(row['Std Case Quantity']),
        lpn: parseInteger(row['LPN']),
        ref_code: toStringOrNull(row['Ref Code(Order Marking)']),
        lotno: toStringOrNull(row['Lot No']),
        data_on_web: toStringOrNull(row['Data on Web']),
        inspec: parseInteger(row['Inspec']),
        rej: parseInteger(row['Rej.']),
        defect: toStringOrNull(row['Defect']),
        vender: toStringOrNull(row['Vender'])
      } as IQACreateRequest
    };
  });

  // Filter out records with blank/null in ANY of the 10 unique constraint columns
  // Unique constraint: iqadata_unique_import (fy, ww, fw, date_iqa, model, lotno, location, supplier_do, age, expense)
  // Note: fy and ww are auto-calculated from date_iqa on backend
  const skippedRows: Array<{ row: number; lotno: string; missingFields: string[]; invalidFields?: string[] }> = [];

  const validRecords = allRecords.filter(({ rowNumber, record }) => {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    // Check required fields
    if (!record.date_iqa || record.date_iqa === '') missingFields.push('Date');
    if (!record.fw || record.fw === '') missingFields.push('FW');
    if (!record.model || record.model === '') missingFields.push('MODEL');
    if (!record.lotno || record.lotno === '') missingFields.push('Lot No');
    if (!record.location || record.location === '') missingFields.push('LOCATIONS');
    if (!record.supplier_do || record.supplier_do === '') missingFields.push('SUPPLIER DO');
    if (record.age === null) missingFields.push('AGE');
    if (!record.expense || record.expense === '') missingFields.push('Expense');

    // Skip instruction/note rows (check if Date contains non-date text)
    if (record.date_iqa && (record.date_iqa.includes('[') || record.date_iqa.toLowerCase().includes('required') || record.date_iqa.toLowerCase().includes('primary'))) {
      // This is likely an instruction row, skip silently
      return false;
    }

    if (missingFields.length > 0 || invalidFields.length > 0) {
      skippedRows.push({
        row: rowNumber,
        lotno: record.lotno || '(empty)',
        missingFields,
        invalidFields: invalidFields.length > 0 ? invalidFields : undefined
      });
      return false;
    }

    return true;
  }).map(({ record }) => record);

  // Log sample of valid records for verification (including integer fields)
  if (validRecords.length > 0) {
    console.log('✅ Sample of first valid record:', {
      lotno: validRecords[0].lotno,
      model: validRecords[0].model,
      fw: validRecords[0].fw,
      date_iqa: validRecords[0].date_iqa,
      // Integer fields for debugging
      qty: validRecords[0].qty,
      age: validRecords[0].age,
      inspec: validRecords[0].inspec,
      rej: validRecords[0].rej
    });
  }

  // Log skipped rows for debugging with detailed information
  if (skippedRows.length > 0) {
    console.warn(`⚠️ Skipped ${skippedRows.length} rows with missing/invalid required fields:`);
    skippedRows.slice(0, 10).forEach(({ row, lotno, missingFields }) => {
      console.warn(`  - Row ${row}, Lot: "${lotno}": ${missingFields.join(', ')}`);
    });
    if (skippedRows.length > 10) {
      console.warn(`  ... and ${skippedRows.length - 10} more rows`);
    }

    // Log detailed data for first few skipped rows
    console.group('📋 Detailed Data for Skipped Rows (first 3):');
    skippedRows.slice(0, 3).forEach(({ row }) => {
      const record = allRecords.find(r => r.rowNumber === row);
      if (record) {
        console.log(`Row ${row}:`, {
          lotno: record.record.lotno,
          model: record.record.model,
          fw: record.record.fw,
          date_iqa: record.record.date_iqa,
          location: record.record.location,
          supplier_do: record.record.supplier_do,
          age: record.record.age,
          expense: record.record.expense
        });
      }
    });
    console.groupEnd();
  }

  return {
    validRecords,
    skippedRows,
    totalRows: jsonData.length
  };
};

/**
 * Prepare data for Excel export
 */
export const prepareExportData = (records: IQAData[]): IQAExportData[] => {
  return records.map((record, index) => ({
    '#': index + 1,
    'FY': record.fy || '',
    'WW': record.ww || '',
    'FW': record.fw || '',
    'Date IQA': record.date_iqa || '',
    'Shift to Shift': record.shift_to_shift || '',
    'Expense': record.expense || '',
    'Re-Expense': record.re_expense || '',
    'QC Owner': record.qc_owner || '',
    'MODEL': record.model || '',
    'ITEM': record.item || '',
    'TELEX': record.telex || '',
    'SUPPLIER': record.supplier || '',
    'DESCR': record.descr || '',
    'LOCATION': record.location || '',
    'QTY': record.qty || 0,
    'SUPPLIER DO': record.supplier_do || '',
    'REMARK': record.remark || '',
    'PO': record.po || '',
    'SBR': record.sbr || '',
    'DISPOSITION CODE': record.disposition_code || '',
    'RECEIPT DATE': record.receipt_date || '',
    'AGE': record.age || 0,
    'Warehouse': record.warehouse || '',
    'Building': record.building || '',
    'Business Unit': record.business_unit || '',
    'Std Case Qty': record.std_case_qty || 0,
    'LPN': record.lpn || 0,
    'Ref Code': record.ref_code || '',
    'Lot No': record.lotno || '',
    'Data on Web': record.data_on_web || '',
    'Inspec': record.inspec || 0,
    'Rej': record.rej || 0,
    'Defect': record.defect || '',
    'Vender': record.vender || ''
  }));
};

/**
 * Export data to Excel file
 */
export const exportToExcel = (records: IQAData[], filename: string = 'IQA_Export'): void => {
  const exportData = prepareExportData(records);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'IQA Data');

  // Generate timestamp for unique filename
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
};

/**
 * Primary Fields for duplicate detection (10-field unique constraint)
 * FY and WW are auto-calculated from Date
 */
export const IQA_PRIMARY_FIELDS = [
  'FW',           // Required
  'Date',         // Required - FY and WW calculated from this
  'MODEL',        // Required
  'Lot No',       // Required
  'LOCATIONS',    // Required
  'SUPPLIER DO',  // Required
  'AGE',          // Required
  'Expense'       // Required
];

/**
 * Generate IQA import template
 * Includes headers with primary fields marked with asterisk (*)
 * Primary columns are required for duplicate detection
 */
export const generateTemplate = (): void => {
  // Define all headers in order (matching expected import format)
  // Row 2 indicates which columns are PRIMARY (required)
  const headers = [
    'FW',                      // 0 - PRIMARY
    'Date',                    // 1 - PRIMARY (FY, WW auto-calculated)
    'Shift for Shift',         // 2
    'Expense',                 // 3 - PRIMARY
    'Re-Expense',              // 4
    'QC Owner',                // 5
    'MODEL',                   // 6 - PRIMARY
    'ITEM',                    // 7
    'TELEX',                   // 8
    'SUPPLIER',                // 9
    'DESCR',                   // 10
    'LOCATIONS',               // 11 - PRIMARY
    'QTY',                     // 12
    'SUPPLIER DO',             // 13 - PRIMARY
    'REMARK',                  // 14
    'PO#',                     // 15
    'SBR#',                    // 16
    'DISPOSITION CODE',        // 17
    'RECEIPT_DATE',            // 18
    'AGE',                     // 19 - PRIMARY
    'Warehouse',               // 20
    'Building',                // 21
    'Business Unit',           // 22
    'Std Case Quantity',       // 23
    'LPN',                     // 24
    'Ref Code(Order Marking)', // 25
    'Lot No',                  // 26 - PRIMARY
    'Data on Web',             // 27
    'Inspec',                  // 28
    'Rej.'                     // 29
  ];

  // Note row explaining primary fields (will be filtered out during import due to invalid date)
  const noteRow = [
    '[REQUIRED]', // FW
    '[REQUIRED]', // Date
    '',           // Shift for Shift
    '[REQUIRED]', // Expense
    '',           // Re-Expense
    '',           // QC Owner
    '[REQUIRED]', // MODEL
    '',           // ITEM
    '',           // TELEX
    '',           // SUPPLIER
    '',           // DESCR
    '[REQUIRED]', // LOCATIONS
    '',           // QTY
    '[REQUIRED]', // SUPPLIER DO
    '',           // REMARK
    '',           // PO#
    '',           // SBR#
    '',           // DISPOSITION CODE
    '',           // RECEIPT_DATE
    '[REQUIRED]', // AGE
    '',           // Warehouse
    '',           // Building
    '',           // Business Unit
    '',           // Std Case Quantity
    '',           // LPN
    '',           // Ref Code
    '[REQUIRED]', // Lot No
    '',           // Data on Web
    '',           // Inspec
    ''            // Rej.
  ];

  // Sample data row
  const sampleRow = [
    'FW-001',          // FW
    '2026-01-28',      // Date
    'Day',             // Shift for Shift
    'EXP001',          // Expense
    '',                // Re-Expense
    'QC001',           // QC Owner
    'MODEL-A',         // MODEL
    'ITEM-001',        // ITEM
    '',                // TELEX
    'SUPPLIER-A',      // SUPPLIER
    'Description',     // DESCR
    'LOC-01',          // LOCATIONS
    100,               // QTY
    'DO-001',          // SUPPLIER DO
    '',                // REMARK
    '',                // PO#
    '',                // SBR#
    '',                // DISPOSITION CODE
    '2026-01-27',      // RECEIPT_DATE
    5,                 // AGE
    'WH-01',           // Warehouse
    'B1',              // Building
    'BU-01',           // Business Unit
    10,                // Std Case Quantity
    '',                // LPN
    '',                // Ref Code
    'LOT-001',         // Lot No
    '',                // Data on Web
    100,               // Inspec
    0                  // Rej.
  ];

  // Create worksheet with headers, note row, and sample data
  const data = [headers, noteRow, sampleRow];
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = headers.map((header) => ({
    wch: Math.max(header.replace('*', '').length + 4, 15)
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'IQA Import');

  // Add instructions sheet
  const instructionsData = [
    ['IQA Import Template Instructions'],
    [''],
    ['PRIMARY FIELDS (Required for Import):'],
    ['These 8 fields form a unique constraint. All must be filled for successful import.'],
    ['FY and WW are auto-calculated from the Date field.'],
    [''],
    ['Field', 'Description', 'Required'],
    ['FW', 'Firmware version', 'YES - PRIMARY'],
    ['Date', 'Inspection date (YYYY-MM-DD format)', 'YES - PRIMARY'],
    ['MODEL', 'Product model', 'YES - PRIMARY'],
    ['Lot No', 'Lot number', 'YES - PRIMARY'],
    ['LOCATIONS', 'Warehouse location', 'YES - PRIMARY'],
    ['SUPPLIER DO', 'Supplier delivery order', 'YES - PRIMARY'],
    ['AGE', 'Material age (number)', 'YES - PRIMARY'],
    ['Expense', 'Expense code', 'YES - PRIMARY'],
    [''],
    ['DUPLICATE DETECTION:'],
    ['Records with the same values in all 8 primary fields + auto-calculated FY/WW will be updated.'],
    ['New unique combinations will be inserted as new records.'],
    [''],
    ['NOTES:'],
    ['- Row 2 in "IQA Import" sheet shows which columns are PRIMARY (required)'],
    ['- Row 3 contains sample data - replace or delete before import'],
    ['- Date format: YYYY-MM-DD (e.g., 2026-01-28)'],
    ['- Records missing any PRIMARY field will be skipped during import']
  ];
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [{ wch: 20 }, { wch: 45 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Write file
  XLSX.writeFile(workbook, 'IQA_Template.xlsx');
};

// ==================== IQA SERVICE CLASS ====================

class IQAApiService {
  private readonly baseUrl = apiBaseUrl('iqadata');
  private readonly defectBaseUrl = apiBaseUrl('defectdata-iqa');

  // ============ HELPER METHODS ============

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<IQAApiResponse<T>> {
    try {
      console.log(`📡 IQA Service - Making request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      console.log(`📡 IQA Service - Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ IQA Service - HTTP Error: ${response.status} ${response.statusText}`);

        // Try to parse error message from response body
        try {
          const errorData = await response.json();
          console.error('❌ IQA Service - Error details:', errorData);
          return {
            success: false,
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            error: errorData.error
          };
        } catch (parseError) {
          // If JSON parsing fails, use default error message
          return {
            success: false,
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      }

      const data = await response.json();
      console.log('📡 IQA Service - Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ IQA Service - Network error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // ============ CRUD OPERATIONS ============

  public async getAll(filters?: IQAQueryFilters, options?: IQAQueryOptions): Promise<IQAApiResponse<IQAData[]>> {
    const params = { ...filters, ...options };
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return this.makeRequest<IQAData[]>(url);
  }

  public async getById(id: number): Promise<IQAApiResponse<IQAData>> {
    return this.makeRequest<IQAData>(`${this.baseUrl}/${id}`);
  }

  public async create(data: IQACreateRequest): Promise<IQAApiResponse<IQAData>> {
    return this.makeRequest<IQAData>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async bulkImport(records: IQACreateRequest[]): Promise<IQAApiResponse<IQABulkImportResponse>> {
    // Use upsert endpoint to replace existing records instead of creating duplicates
    // Records with the same (fy, ww, lotno) combination will be updated
    return this.makeRequest<IQABulkImportResponse>(`${this.baseUrl}/upsert`, {
      method: 'POST',
      body: JSON.stringify({ data: records }),
    });
  }

  public async delete(id: number): Promise<IQAApiResponse<any>> {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  public async bulkDelete(ids: number[]): Promise<IQAApiResponse<any>> {
    return this.makeRequest(`${this.baseUrl}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // ============ FILTER OPERATIONS ============

  public async getFilterOptions(): Promise<IQAApiResponse<{ fyOptions: string[]; wwOptions: string[] }>> {
    return this.makeRequest<{ fyOptions: string[]; wwOptions: string[] }>(`${this.baseUrl}/filter-options`);
  }

  /**
   * Get distinct FY (Fiscal Year) values for filtering
   */
  public async getDistinctFY(): Promise<IQAApiResponse<string[]>> {
    try {
      console.log('📡 IQA Service - Fetching distinct FY values...');
      const response = await fetch(`${this.baseUrl}/distinct-fy`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`❌ IQA Service - HTTP Error: ${response.status}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('📡 IQA Service - FY Options loaded:', result);

      return {
        success: result.success || true,
        data: result.data || []
      };
    } catch (error) {
      console.error('❌ IQA Service - Error loading FY options:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: []
      };
    }
  }

  /**
   * Get distinct WW (Work Week) values for filtering
   * @param fy - Optional FY filter to get WW values for a specific fiscal year
   */
  public async getDistinctWW(fy?: string): Promise<IQAApiResponse<string[]>> {
    try {
      console.log('📡 IQA Service - Fetching distinct WW values...');
      const url = fy
        ? `${this.baseUrl}/distinct-ww?fy=${encodeURIComponent(fy)}`
        : `${this.baseUrl}/distinct-ww`;

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`❌ IQA Service - HTTP Error: ${response.status}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('📡 IQA Service - WW Options loaded:', result);

      return {
        success: result.success || true,
        data: result.data || []
      };
    } catch (error) {
      console.error('❌ IQA Service - Error loading WW options:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: []
      };
    }
  }

  // ============ DEFECT SUBMISSION ============

  public async submitDefect(submission: IQADefectSubmission): Promise<IQAApiResponse<any>> {
    const formData = new FormData();
    formData.append('iqa_id', String(submission.iqa_id));
    formData.append('defect_id', String(submission.defect_id));
    formData.append('defect_description', submission.defect_description);

    if (submission.images) {
      submission.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/defect`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ IQA Service - Defect submission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  public async getDefectsByIQAId(iqaId: number): Promise<IQAApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${this.baseUrl}/${iqaId}/defects`);
  }

  /**
   * Get saved defect data for a specific IQA record
   * @param iqaId - IQA record ID
   */
  public async getSavedDefectData(iqaId: number): Promise<IQAApiResponse<any[]>> {
    try {
      console.log('📡 IQA Service - Loading saved defect data for IQA ID:', iqaId);

      const response = await fetch(`${this.defectBaseUrl}/iqa/${iqaId}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('📡 IQA Service - Loaded saved defect data:', result.data);
        return {
          success: true,
          data: result.data
        };
      } else {
        console.error('❌ IQA Service - Failed to load saved defect data:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to load saved defect data',
          data: []
        };
      }
    } catch (error) {
      console.error('❌ IQA Service - Error loading saved defect data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: []
      };
    }
  }

  /**
   * Submit bulk defect data with images
   * @param defectId - Defect type ID
   * @param description - Defect description
   * @param iqaId - IQA record ID
   * @param images - Array of image files
   */
  public async submitBulkDefect(
    defectId: number,
    description: string,
    iqaId: number,
    images: File[]
  ): Promise<IQAApiResponse<any>> {
    try {
      console.log('📡 IQA Service - Submitting bulk defect data...');

      const formData = new FormData();
      formData.append('defect_id', defectId.toString());
      formData.append('defect_description', description);
      formData.append('iqaid', iqaId.toString());

      images.forEach((file) => {
        formData.append('images', file);
      });

      console.log('📡 IQA Service - Defect submission data:', {
        defect_id: defectId,
        defect_description: description,
        iqaid: iqaId,
        image_count: images.length
      });

      const response = await fetch(`${this.defectBaseUrl}/bulk`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('📡 IQA Service - Response status:', response.status);

      const result = await response.json();

      if (result.success) {
        console.log('✅ IQA Service - Defect data submitted successfully');
        return {
          success: true,
          message: result.message || 'Defect data submitted successfully',
          data: result.data
        };
      } else {
        console.error('❌ IQA Service - Defect submission failed:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to submit defect data'
        };
      }
    } catch (error) {
      console.error('❌ IQA Service - Error submitting defect data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }
}

// ============ SINGLETON EXPORT ============

export const iqaService = new IQAApiService();
export default iqaService;
