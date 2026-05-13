// server/src/routes/fiscalWeekRoutes.ts
/**
 * Fiscal Week Test Routes
 * API endpoints to test fiscal week calculations
 * No authentication required - useful for testing
 */

import { Router, Request, Response } from 'express';
import {
  calculateFiscalWeekNumber,
  getFiscalYear,
  getFiscalWeekRange,
  formatFiscalWeek,
  getCurrentFiscalWeek,
  getCurrentFiscalYear,
  getMonthName,
  getMonthTrendName,
  fiscalWeekToYearMonth
} from '@qcv/shared';

const router = Router();

// Helper to format local date as YYYY-MM-DD (avoids timezone issues)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * GET /api/fiscal-week
 * Get current fiscal week information
 */
router.get('/', (req: Request, res: Response) => {
  const today = new Date();

  res.json({
    success: true,
    current: {
      date: today.toLocaleDateString('en-CA'),
      fiscalYear: getCurrentFiscalYear(),
      workWeek: getCurrentFiscalWeek(),
      formatted: formatFiscalWeek(today)
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/fiscal-week/calculate?date=2025-06-28
 * Calculate fiscal week for a specific date
 */
router.get('/calculate', (req: Request, res: Response): void => {
  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing required parameter: date (format: YYYY-MM-DD)'
    });
    return;
  }

  try {
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    const fy = getFiscalYear(targetDate);
    const ww = calculateFiscalWeekNumber(targetDate);
    const range = getFiscalWeekRange(fy, ww);

    res.json({
      success: true,
      input: {
        date: date,
        dayOfWeek: targetDate.toLocaleDateString('en-US', { weekday: 'long' })
      },
      result: {
        fiscalYear: fy,
        workWeek: ww,
        formatted: formatFiscalWeek(targetDate),
        formattedLong: formatFiscalWeek(targetDate, 'YYYY Week WW')
      },
      weekRange: {
        start: range.start.toLocaleDateString('en-CA'),
        end: range.end.toLocaleDateString('en-CA')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fiscal-week/range?fy=2026&ww=1
 * Get date range for a specific fiscal week
 */
router.get('/range', (req: Request, res: Response): void => {
  const { fy, ww } = req.query;

  if (!fy || !ww) {
    res.status(400).json({
      success: false,
      error: 'Missing required parameters: fy (fiscal year) and ww (work week)'
    });
    return;
  }

  const fiscalYear = parseInt(fy as string);
  const workWeek = parseInt(ww as string);

  if (isNaN(fiscalYear) || isNaN(workWeek)) {
    res.status(400).json({
      success: false,
      error: 'Invalid parameters. fy and ww must be numbers'
    });
    return;
  }

  if (workWeek < 1 || workWeek > 52) {
    res.status(400).json({
      success: false,
      error: 'Work week must be between 1 and 52'
    });
    return;
  }

  try {
    const range = getFiscalWeekRange(fiscalYear, workWeek);

    res.json({
      success: true,
      input: {
        fiscalYear,
        workWeek
      },
      result: {
        start: range.start.toLocaleDateString('en-CA'),
        end: range.end.toLocaleDateString('en-CA'),
        startDay: range.start.toLocaleDateString('en-US', { weekday: 'long' }),
        endDay: range.end.toLocaleDateString('en-US', { weekday: 'long' })
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fiscal-week/convert?fyww=202601
 * Convert fiscal year week to calendar year month
 */
router.get('/convert', (req: Request, res: Response): void => {
  const { fyww } = req.query;

  if (!fyww || typeof fyww !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing required parameter: fyww (format: YYYYWW, e.g., 202601)'
    });
    return;
  }

  try {
    const yearMonth = fiscalWeekToYearMonth(fyww);
    const monthName = getMonthName(yearMonth);

    res.json({
      success: true,
      input: {
        fiscalYearWeek: fyww
      },
      result: {
        yearMonth,
        monthName
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fiscal-week/test
 * Run comprehensive test of all fiscal week functions
 */
router.get('/test', (req: Request, res: Response) => {
  const testDates = [
    '2025-07-01',
    '2025-07-05',
    '2025-06-28',
    '2025-06-27',
    '2025-06-30',
    '2025-12-25',
    '2026-01-01',
    '2026-01-28',
    '2026-06-30',
  ];

  const results = testDates.map(dateStr => {
    const date = new Date(dateStr);
    return {
      date: dateStr,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fiscalYear: getFiscalYear(date),
      workWeek: calculateFiscalWeekNumber(date),
      formatted: formatFiscalWeek(date)
    };
  });

  const weekRanges = [1, 2, 10, 26, 52].map(ww => {
    const range = getFiscalWeekRange(2026, ww);
    return {
      week: ww,
      start: range.start.toLocaleDateString('en-CA'),
      end: range.end.toLocaleDateString('en-CA')
    };
  });

  res.json({
    success: true,
    current: {
      date: new Date().toLocaleDateString('en-CA'),
      fiscalYear: getCurrentFiscalYear(),
      workWeek: getCurrentFiscalWeek()
    },
    testDates: results,
    weekRanges: {
      fiscalYear: 2026,
      ranges: weekRanges
    },
    monthConversions: [
      { input: '2401', output: getMonthName('2401') },
      { input: '2406', output: getMonthName('2406') },
      { input: '2407', output: getMonthName('2407') }
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;
