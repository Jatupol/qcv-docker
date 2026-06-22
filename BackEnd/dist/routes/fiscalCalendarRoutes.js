"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const shared_1 = require("@qcv/shared");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const pool = (0, database_1.getDatabasePool)();
        const fyParam = req.query.fy;
        const fyResult = await pool.query(`SELECT DISTINCT fiscal_year FROM fiscal_calendar ORDER BY fiscal_year DESC`);
        const availableFYs = fyResult.rows.map((r) => r.fiscal_year);
        const fy = fyParam && availableFYs.includes(fyParam) ? fyParam : availableFYs[0];
        if (!fy) {
            res.json({ success: true, data: [], availableFYs: [], selectedFY: null });
            return;
        }
        const fyNum = parseInt(fy, 10);
        const result = await pool.query(`SELECT calendar_date::text as calendar_date, yearmonth, fiscal_year, ww
       FROM fiscal_calendar
       WHERE fiscal_year IN ($1, $2, $3)
       ORDER BY calendar_date ASC`, [fy, String(fyNum - 1), String(fyNum + 1)]);
        res.json({
            success: true,
            data: result.rows,
            availableFYs,
            selectedFY: fy,
        });
    }
    catch (error) {
        console.error('Fiscal calendar error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.put('/yearmonth', async (req, res) => {
    try {
        const pool = (0, database_1.getDatabasePool)();
        const { fiscal_year, ww, yearmonth } = req.body;
        if (!fiscal_year || !ww || !yearmonth) {
            res.status(400).json({ success: false, message: 'fiscal_year, ww, and yearmonth are required' });
            return;
        }
        const result = await pool.query(`UPDATE fiscal_calendar
       SET yearmonth = $1
       WHERE fiscal_year = $2 AND ww = $3`, [yearmonth, fiscal_year, ww]);
        await pool.query(`REFRESH MATERIALIZED VIEW mv_fiscal_calendar`);
        res.json({
            success: true,
            message: `Updated ${result.rowCount} records (FY${fiscal_year} WW${ww} → ${yearmonth})`,
        });
    }
    catch (error) {
        console.error('Fiscal calendar yearmonth update error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.post('/generate', async (req, res) => {
    try {
        const pool = (0, database_1.getDatabasePool)();
        const { fiscal_year } = req.body;
        if (!fiscal_year) {
            res.status(400).json({ success: false, message: 'fiscal_year is required' });
            return;
        }
        const fyNum = parseInt(fiscal_year, 10);
        if (isNaN(fyNum) || fyNum < 2000 || fyNum > 2100) {
            res.status(400).json({ success: false, message: 'Invalid fiscal year' });
            return;
        }
        const existCheck = await pool.query(`SELECT COUNT(*) as cnt FROM fiscal_calendar WHERE fiscal_year = $1`, [fiscal_year]);
        const existingCount = parseInt(existCheck.rows[0].cnt, 10);
        if (existingCount > 0 && existingCount < 12) {
            await pool.query(`DELETE FROM fiscal_calendar WHERE fiscal_year = $1`, [fiscal_year]);
        }
        else if (existingCount >= 12) {
            res.status(400).json({
                success: false,
                message: `FY${fiscal_year} already has ${existingCount} records. Delete existing data first or use the calendar editor.`,
            });
            return;
        }
        const rows = [];
        for (let ww = 1; ww <= 52; ww++) {
            const wwStr = String(ww).padStart(2, '0');
            const fyWeekKey = `${fiscal_year}${wwStr}`;
            const yearmonth = (0, shared_1.fiscalWeekToYearMonth)(fyWeekKey);
            const range = (0, shared_1.getFiscalWeekRange)(fyNum, ww);
            const cursor = new Date(range.start);
            for (let d = 0; d < 7; d++) {
                const y = cursor.getFullYear();
                const m = String(cursor.getMonth() + 1).padStart(2, '0');
                const day = String(cursor.getDate()).padStart(2, '0');
                rows.push({
                    calendar_date: `${y}-${m}-${day}`,
                    yearmonth,
                    fiscal_year,
                    ww: wwStr,
                });
                cursor.setDate(cursor.getDate() + 1);
            }
        }
        const values = [];
        const params = [];
        let paramIdx = 1;
        for (const row of rows) {
            values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3})`);
            params.push(row.calendar_date, row.yearmonth, row.fiscal_year, row.ww);
            paramIdx += 4;
        }
        await pool.query(`INSERT INTO fiscal_calendar (calendar_date, yearmonth, fiscal_year, ww)
       VALUES ${values.join(', ')}
       ON CONFLICT (calendar_date) DO NOTHING`, params);
        await pool.query(`REFRESH MATERIALIZED VIEW mv_fiscal_calendar`);
        const startDate = rows[0].calendar_date;
        const endDate = rows[rows.length - 1].calendar_date;
        res.json({
            success: true,
            message: `Generated FY${fiscal_year}: ${rows.length} days (${startDate} to ${endDate}), 52 weeks`,
        });
    }
    catch (error) {
        console.error('Fiscal calendar generate error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
