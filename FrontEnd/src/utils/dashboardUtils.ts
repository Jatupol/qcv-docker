// client/src/utils/dashboardUtils.ts
import type { TimePeriod } from '../types/report';
import { getCurrentFiscalWeek, getCurrentFiscalYear } from '@qcv/shared';

export function getDefaultDateRange(timePeriod: TimePeriod): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  switch (timePeriod) {
    case 'daily': {
      const to = now;
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      return { from: fmt(from), to: fmt(to) };
    }
    case 'fiscal_weekly': {
      const toFY = getCurrentFiscalYear();
      const toWW = getCurrentFiscalWeek();
      let fromFY = toFY;
      let fromWW = toWW - 13;
      if (fromWW <= 0) {
        fromFY = toFY - 1;
        fromWW = 52 + fromWW;
      }
      return {
        from: `${fromFY}${String(fromWW).padStart(2, '0')}`,
        to: `${toFY}${String(toWW).padStart(2, '0')}`,
      };
    }
    case 'monthly':
      return { from: `${year}-01`, to: `${year}-${month}` };
    case 'quarterly': {
      const currentQ = Math.ceil((now.getMonth() + 1) / 3);
      return { from: `${year}Q1`, to: `${year}Q${currentQ}` };
    }
    case 'yearly':
      return { from: `${year - 1}`, to: `${year}` };
    default:
      return { from: `${year}-01`, to: `${year}-${month}` };
  }
}

export function formatMonthYearKey(monthYear: string): string {
  if (monthYear.length !== 6) return monthYear;
  const year = monthYear.substring(0, 4);
  const month = monthYear.substring(4, 6);
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatPeriodKey(key: string, timePeriod: TimePeriod): string {
  switch (timePeriod) {
    case 'daily': {
      const d = new Date(key);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }
    case 'fiscal_weekly': {
      // key format: YYYYWW e.g. "202501"
      const fy = key.slice(2, 4);
      const ww = key.slice(4);
      return `FY${fy} W${ww}`;
    }
    case 'monthly':
      return formatMonthYearKey(key);
    case 'quarterly': {
      // key format: "2024Q1"
      const qPart = key.slice(4);
      const yPart = key.slice(0, 4);
      return `${qPart} ${yPart}`;
    }
    case 'yearly':
      return key;
    default:
      return key;
  }
}
