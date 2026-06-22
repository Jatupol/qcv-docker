"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interfaceLogService_1 = __importDefault(require("../services/interfaceLogService"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.requireAuthentication, async (req, res) => {
    try {
        const tablename = req.query.tablename;
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        if (tablename && !['LIN', 'CHK'].includes(tablename)) {
            res.status(400).json({
                success: false,
                message: 'Invalid tablename. Must be LIN or CHK'
            });
            return;
        }
        const logs = await interfaceLogService_1.default.getRecentLogs(tablename, limit);
        res.json({
            success: true,
            data: logs,
            message: `Retrieved ${logs.length} log entries`
        });
    }
    catch (error) {
        console.error('Error getting interface logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve interface logs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/stats/:tablename', auth_1.requireAuthentication, async (req, res) => {
    try {
        const tablename = req.params.tablename;
        const days = req.query.days ? parseInt(req.query.days) : 7;
        if (!['LIN', 'CHK'].includes(tablename)) {
            res.status(400).json({
                success: false,
                message: 'Invalid tablename. Must be LIN or CHK'
            });
            return;
        }
        const stats = await interfaceLogService_1.default.getLogStats(tablename, days);
        res.json({
            success: true,
            data: stats,
            message: `Retrieved statistics for ${tablename} (last ${days} days)`
        });
    }
    catch (error) {
        console.error('Error getting interface log stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve interface log statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/cleanup', auth_1.requireAuthentication, async (req, res) => {
    try {
        const { tablename, daysToKeep = 90 } = req.body;
        if (tablename && !['LIN', 'CHK'].includes(tablename)) {
            res.status(400).json({
                success: false,
                message: 'Invalid tablename. Must be LIN or CHK'
            });
            return;
        }
        const deletedCount = await interfaceLogService_1.default.cleanupOldLogs(tablename, daysToKeep);
        res.json({
            success: true,
            data: { deletedCount },
            message: `Cleaned up ${deletedCount} old log entries`
        });
    }
    catch (error) {
        console.error('Error cleaning up interface logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cleanup interface logs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
