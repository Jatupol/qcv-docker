"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
function getGitInfo() {
    try {
        const commit = (0, child_process_1.execSync)('git rev-parse HEAD').toString().trim();
        const shortCommit = (0, child_process_1.execSync)('git rev-parse --short HEAD').toString().trim();
        const date = (0, child_process_1.execSync)('git log -1 --format=%ai').toString().trim();
        const message = (0, child_process_1.execSync)('git log -1 --format=%s').toString().trim();
        const branch = (0, child_process_1.execSync)('git rev-parse --abbrev-ref HEAD').toString().trim();
        return { commit, shortCommit, date, message, branch };
    }
    catch (error) {
        return null;
    }
}
function getBuildTimestamp() {
    try {
        const distPath = path_1.default.join(__dirname, '..', '..');
        if (fs_1.default.existsSync(distPath)) {
            const stats = fs_1.default.statSync(distPath);
            return stats.mtime.toISOString();
        }
        return null;
    }
    catch (error) {
        return null;
    }
}
function checkSmtpValidationVersion() {
    try {
        const servicePath = path_1.default.join(__dirname, '..', 'entities', 'sysconfig', 'service.js');
        if (fs_1.default.existsSync(servicePath)) {
            const content = fs_1.default.readFileSync(servicePath, 'utf-8');
            if (content.includes('!activeConfig.smtp_server || !activeConfig.smtp_username || !activeConfig.smtp_password')) {
                return 'OLD - Requires server, username, and password';
            }
            if (content.includes('if (!activeConfig.smtp_server)') && !content.includes('!activeConfig.smtp_username')) {
                return 'NEW - Only requires server (authentication optional)';
            }
            return 'UNKNOWN - Cannot determine validation logic';
        }
        return 'FILE_NOT_FOUND - service.js not found';
    }
    catch (error) {
        return `ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
router.get('/', (req, res) => {
    const gitInfo = getGitInfo();
    const buildTimestamp = getBuildTimestamp();
    const smtpValidation = checkSmtpValidationVersion();
    const versionInfo = {
        success: true,
        environment: process.env.NODE_ENV || 'development',
        server: {
            version: '1.0.0',
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        },
        build: {
            timestamp: buildTimestamp,
            buildDate: buildTimestamp ? new Date(buildTimestamp).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Unknown'
        },
        git: gitInfo ? {
            commit: gitInfo.commit,
            shortCommit: gitInfo.shortCommit,
            branch: gitInfo.branch,
            message: gitInfo.message,
            date: gitInfo.date
        } : {
            error: 'Git information not available (not a git repository or git not installed)'
        },
        features: {
            smtpValidation: smtpValidation
        },
        timestamp: new Date().toISOString()
    };
    res.json(versionInfo);
});
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
router.get('/smtp-check', (req, res) => {
    const smtpValidation = checkSmtpValidationVersion();
    const gitInfo = getGitInfo();
    res.json({
        success: true,
        smtpValidationVersion: smtpValidation,
        isNewVersion: smtpValidation.includes('NEW'),
        isOldVersion: smtpValidation.includes('OLD'),
        currentCommit: gitInfo?.shortCommit || 'Unknown',
        expectedCommit: '1492f49f',
        message: smtpValidation.includes('NEW')
            ? '✅ Server is running the NEW code (authentication optional)'
            : smtpValidation.includes('OLD')
                ? '❌ Server is running the OLD code (requires username/password)'
                : '⚠️ Cannot determine SMTP validation version',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
