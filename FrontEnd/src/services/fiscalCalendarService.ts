// client/src/services/fiscalCalendarService.ts
// Service for Seagate Financial Calendar API

import { apiBaseUrl, apiFetch } from './api';
import type { FiscalCalendarResponse, FiscalWeekUpsertRequest } from '../types/fiscal-calendar';

const BASE_URL = apiBaseUrl('fiscal-calendar');

export async function fetchFiscalCalendar(fy?: string): Promise<FiscalCalendarResponse> {
  const url = fy ? `${BASE_URL}?fy=${fy}` : BASE_URL;
  const result = await apiFetch<any>(url);

  // apiFetch returns the full JSON body: { success, data, availableFYs, selectedFY }
  // availableFYs/selectedFY are top-level, not inside result.data
  const raw = result as any;

  if (raw.success) {
    return {
      success: true,
      data: Array.isArray(raw.data) ? raw.data : [],
      availableFYs: raw.availableFYs ?? [],
      selectedFY: raw.selectedFY ?? null,
    };
  }

  return {
    success: false,
    data: [],
    availableFYs: [],
    selectedFY: null,
    message: raw.message || 'Failed to fetch fiscal calendar',
  };
}

export async function updateYearMonth(params: {
  fiscal_year: string; ww: string; yearmonth: string;
}): Promise<{ success: boolean; message?: string }> {
  const result = await apiFetch<any>(`${BASE_URL}/yearmonth`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
  return { success: !!result.success, message: (result as any).message };
}

export async function generateFiscalYear(fiscalYear: string): Promise<{ success: boolean; message?: string }> {
  const result = await apiFetch<any>(`${BASE_URL}/generate`, {
    method: 'POST',
    body: JSON.stringify({ fiscal_year: fiscalYear }),
  });
  return { success: !!result.success, message: (result as any).message };
}
