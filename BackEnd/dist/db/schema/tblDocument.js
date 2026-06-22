"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tblDocument = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.tblDocument = (0, pg_core_1.pgTable)('tblDocument', {
    oldDocNo: (0, pg_core_1.varchar)('OldDocNo', { length: 20 }).primaryKey(),
    newDocNo: (0, pg_core_1.varchar)('NewDocNo', { length: 20 }),
});
