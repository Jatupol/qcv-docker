"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const syncScheduler_1 = require("../services/syncScheduler");
const router = (0, express_1.Router)();
router.get('/status', (req, res) => {
    try {
        const scheduler = (0, syncScheduler_1.getSyncScheduler)();
        const status = scheduler.getStatus();
        res.json({
            success: true,
            data: status,
            message: status.isEnabled ? 'Scheduler is running' : 'Scheduler is stopped'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get scheduler status',
            error: 'SCHEDULER_ERROR'
        });
    }
});
router.post('/start', async (req, res) => {
    try {
        const scheduler = (0, syncScheduler_1.getSyncScheduler)();
        await scheduler.start();
        res.json({
            success: true,
            message: 'Scheduler started successfully',
            data: scheduler.getStatus()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to start scheduler',
            error: 'SCHEDULER_START_ERROR'
        });
    }
});
router.post('/stop', (req, res) => {
    try {
        const scheduler = (0, syncScheduler_1.getSyncScheduler)();
        scheduler.stop();
        res.json({
            success: true,
            message: 'Scheduler stopped successfully',
            data: scheduler.getStatus()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to stop scheduler',
            error: 'SCHEDULER_STOP_ERROR'
        });
    }
});
router.post('/trigger', async (req, res) => {
    try {
        const scheduler = (0, syncScheduler_1.getSyncScheduler)();
        if (!scheduler.getStatus().isEnabled) {
            res.status(400).json({
                success: false,
                message: 'Scheduler is not running. Start the scheduler first or use individual sync endpoints.',
                error: 'SCHEDULER_NOT_RUNNING'
            });
            return;
        }
        await scheduler.triggerManualSync();
        res.json({
            success: true,
            message: 'Manual sync triggered successfully',
            data: scheduler.getStatus()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to trigger sync',
            error: 'SYNC_TRIGGER_ERROR'
        });
    }
});
router.put('/interval', async (req, res) => {
    try {
        const { minutes } = req.body;
        if (!minutes || typeof minutes !== 'number' || minutes < 1) {
            res.status(400).json({
                success: false,
                message: 'Invalid interval. Must be a number >= 1 minute.',
                error: 'INVALID_INTERVAL'
            });
            return;
        }
        const scheduler = (0, syncScheduler_1.getSyncScheduler)();
        await scheduler.updateInterval(minutes);
        res.json({
            success: true,
            message: `Sync interval updated to ${minutes} minutes`,
            data: scheduler.getStatus()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update interval',
            error: 'INTERVAL_UPDATE_ERROR'
        });
    }
});
exports.default = router;
