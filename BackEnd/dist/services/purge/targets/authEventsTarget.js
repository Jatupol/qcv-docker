"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authEventsTarget = void 0;
const authEventLogger_1 = require("../../../utils/authEventLogger");
exports.authEventsTarget = {
    key: 'auth_events',
    label: 'Auth Event Log Files',
    type: 'file',
    defaultRetentionDays: 90,
    async count(retentionDays) {
        return (0, authEventLogger_1.countOldLogs)(retentionDays);
    },
    async purge(retentionDays) {
        const removed = (0, authEventLogger_1.purgeOldLogs)(retentionDays);
        return { removed: removed.length, details: removed };
    },
};
