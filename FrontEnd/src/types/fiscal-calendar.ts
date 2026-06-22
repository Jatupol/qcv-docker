// client/src/types/fiscal-calendar.ts
// Types for Seagate Financial Calendar page

export interface FiscalCalendarRecord {
  calendar_date: string; // 'YYYY-MM-DD'
  yearmonth: string;     // 'YYMM'
  fiscal_year: string;   // 'YYYY'
  ww: string;            // '01'-'52'
}

export interface FiscalCalendarResponse {
  success: boolean;
  data: FiscalCalendarRecord[];
  availableFYs: string[];
  selectedFY: string | null;
  message?: string;
}

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isSaturday: boolean;
  isToday: boolean;
  fw: string | null; // fiscal week number for the Saturday of this row
  inFY: boolean;     // whether this day belongs to the selected FY
}

export interface CalendarWeekRow {
  days: CalendarDay[]; // 7 days, Sat-Fri
  fw: string | null;
}

export interface MonthCalendar {
  year: number;
  month: number; // 0-11
  label: string; // e.g. "July 2025"
  weeks: CalendarWeekRow[];
}

export interface QuarterData {
  label: string; // "FQ1", "FQ2", etc.
  months: MonthCalendar[];
}

export interface FiscalWeekUpsertRecord {
  calendar_date: string; // 'YYYY-MM-DD'
  yearmonth: string;     // 'YYMM'
  fiscal_year: string;   // 'YYYY'
  ww: string;            // '01'-'52'
}

export interface FiscalWeekUpsertRequest {
  dates: FiscalWeekUpsertRecord[];
}
