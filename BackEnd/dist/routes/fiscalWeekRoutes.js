"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@qcv/shared");
const router = (0, express_1.Router)();
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
router.get('/', (req, res) => {
    const today = new Date();
    res.json({
        success: true,
        current: {
            date: today.toLocaleDateString('en-CA'),
            fiscalYear: (0, shared_1.getCurrentFiscalYear)(),
            workWeek: (0, shared_1.getCurrentFiscalWeek)(),
            formatted: (0, shared_1.formatFiscalWeek)(today)
        },
        timestamp: new Date().toISOString()
    });
});
router.get('/calculate', (req, res) => {
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
        const fy = (0, shared_1.getFiscalYear)(targetDate);
        const ww = (0, shared_1.calculateFiscalWeekNumber)(targetDate);
        const range = (0, shared_1.getFiscalWeekRange)(fy, ww);
        res.json({
            success: true,
            input: {
                date: date,
                dayOfWeek: targetDate.toLocaleDateString('en-US', { weekday: 'long' })
            },
            result: {
                fiscalYear: fy,
                workWeek: ww,
                formatted: (0, shared_1.formatFiscalWeek)(targetDate),
                formattedLong: (0, shared_1.formatFiscalWeek)(targetDate, 'YYYY Week WW')
            },
            weekRange: {
                start: range.start.toLocaleDateString('en-CA'),
                end: range.end.toLocaleDateString('en-CA')
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/range', (req, res) => {
    const { fy, ww } = req.query;
    if (!fy || !ww) {
        res.status(400).json({
            success: false,
            error: 'Missing required parameters: fy (fiscal year) and ww (work week)'
        });
        return;
    }
    const fiscalYear = parseInt(fy);
    const workWeek = parseInt(ww);
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
        const range = (0, shared_1.getFiscalWeekRange)(fiscalYear, workWeek);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/convert', (req, res) => {
    const { fyww } = req.query;
    if (!fyww || typeof fyww !== 'string') {
        res.status(400).json({
            success: false,
            error: 'Missing required parameter: fyww (format: YYYYWW, e.g., 202601)'
        });
        return;
    }
    try {
        const yearMonth = (0, shared_1.fiscalWeekToYearMonth)(fyww);
        const monthName = (0, shared_1.getMonthName)(yearMonth);
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/test', (req, res) => {
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
            fiscalYear: (0, shared_1.getFiscalYear)(date),
            workWeek: (0, shared_1.calculateFiscalWeekNumber)(date),
            formatted: (0, shared_1.formatFiscalWeek)(date)
        };
    });
    const weekRanges = [1, 2, 10, 26, 52].map(ww => {
        const range = (0, shared_1.getFiscalWeekRange)(2026, ww);
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
            fiscalYear: (0, shared_1.getCurrentFiscalYear)(),
            workWeek: (0, shared_1.getCurrentFiscalWeek)()
        },
        testDates: results,
        weekRanges: {
            fiscalYear: 2026,
            ranges: weekRanges
        },
        monthConversions: [
            { input: '2401', output: (0, shared_1.getMonthName)('2401') },
            { input: '2406', output: (0, shared_1.getMonthName)('2406') },
            { input: '2407', output: (0, shared_1.getMonthName)('2407') }
        ],
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
