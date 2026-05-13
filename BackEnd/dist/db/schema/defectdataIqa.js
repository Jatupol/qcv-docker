"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defectdataIqa = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.defectdataIqa = (0, pg_core_1.pgTable)('defectdata_iqa', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    iqaid: (0, pg_core_1.integer)('iqaid'),
    defectId: (0, pg_core_1.integer)('defect_id'),
    defectDescription: (0, pg_core_1.varchar)('defect_description', { length: 200 }),
    imgeData: (0, common_1.bytea)('imge_data'),
});
