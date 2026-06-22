"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defectImage = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.defectImage = (0, pg_core_1.pgTable)('defect_image', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    defectId: (0, pg_core_1.integer)('defect_id'),
    imgeData: (0, common_1.bytea)('imge_data'),
    trayno: (0, pg_core_1.varchar)('trayno', { length: 20 }),
    trayRow: (0, pg_core_1.varchar)('tray_row', { length: 20 }),
    trayPosition: (0, pg_core_1.varchar)('tray_position', { length: 20 }),
    photoMagnification: (0, pg_core_1.varchar)('photo_magnification', { length: 50 }),
    stamp: (0, pg_core_1.varchar)('stamp', { length: 30 }),
});
