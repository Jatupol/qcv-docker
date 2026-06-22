"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const serverStartTime = new Date();
router.get('/status', auth_1.requireAuthentication, auth_1.requireAdmin, (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
        success: true,
        data: {
            uptime: process.uptime(),
            startTime: serverStartTime.toISOString(),
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024),
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            },
            pid: process.pid,
            env: process.env.NODE_ENV || 'development',
        },
        message: 'Server is running'
    });
});
router.post('/restart', auth_1.requireAuthentication, auth_1.requireAdmin, (req, res) => {
    const user = req.session?.user;
    const username = user?.username || user?.email || 'unknown';
    console.log(`\n🔄 Server restart requested by: ${username}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`   IP: ${req.ip}`);
    res.json({
        success: true,
        message: 'Server restart initiated. The server will be back online shortly.',
        data: {
            requestedBy: username,
            requestedAt: new Date().toISOString(),
        }
    });
    setTimeout(() => {
        console.log('🔄 Exiting process for restart...');
        process.exit(0);
    }, 500);
});
exports.default = router;
