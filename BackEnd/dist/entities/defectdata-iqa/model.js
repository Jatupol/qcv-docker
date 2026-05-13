"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataIQAModel = void 0;
exports.createDefectDataIQAModel = createDefectDataIQAModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        id: row.id,
        defect_id: row.defectId ?? 0,
        iqaid: row.iqaid ?? undefined,
        defect_description: row.defectDescription ?? '',
        imge_data: row.imgeData
    };
}
class DefectDataIQAModel {
    constructor(db, config = types_1.DEFAULT_DEFECT_IMAGE_CONFIG) {
        this.db = db;
        this.config = config;
    }
    async create(data) {
        const insertData = {
            defectId: data.defect_id,
            iqaid: data.iqaid || null,
            defectDescription: data.defect_description || '',
            imgeData: data.imge_data
        };
        const result = await this.db
            .insert(schema_1.defectdataIqa)
            .values(insertData)
            .returning();
        return mapDrizzleToEntity(result[0]);
    }
    async bulkCreate(defectId, images, defectDescription, iqaid) {
        console.log('💾 Model.bulkCreate (Drizzle) - Starting for IQA defect images');
        console.log('  - defectId:', defectId);
        console.log('  - iqaid:', iqaid);
        console.log('  - images count:', images.length);
        const createdImages = [];
        try {
            for (let i = 0; i < images.length; i++) {
                const imageData = images[i];
                console.log(`  - Inserting image ${i + 1}/${images.length} (${imageData.length} bytes)`);
                const result = await this.db
                    .insert(schema_1.defectdataIqa)
                    .values({
                    defectId: defectId,
                    iqaid: iqaid || null,
                    defectDescription: defectDescription || '',
                    imgeData: imageData
                })
                    .returning();
                console.log(`  - Image ${i + 1} inserted with id:`, result[0].id);
                createdImages.push(mapDrizzleToEntity(result[0]));
            }
            console.log('✅ Created', createdImages.length, 'IQA defect images');
            return createdImages;
        }
        catch (error) {
            console.error('❌ Error during bulk create:', error);
            throw error;
        }
    }
    async getById(id) {
        const result = await this.db
            .select()
            .from(schema_1.defectdataIqa)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataIqa.id, id))
            .limit(1);
        return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
    }
    async getByDefectId(defectId) {
        const result = await this.db
            .select()
            .from(schema_1.defectdataIqa)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataIqa.defectId, defectId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.defectdataIqa.id));
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getByIQAId(iqaid) {
        const result = await this.db
            .select()
            .from(schema_1.defectdataIqa)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataIqa.iqaid, iqaid))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.defectdataIqa.id));
        return result.map(row => mapDrizzleToEntity(row));
    }
    async delete(id, actor = null, req) {
        return await this.db.transaction(async (tx) => {
            const [deleted] = await tx
                .delete(schema_1.defectdataIqa)
                .where((0, drizzle_orm_1.eq)(schema_1.defectdataIqa.id, id))
                .returning();
            if (!deleted)
                return false;
            await (0, auditLogger_1.logDelete)(this.db, {
                entity: 'defectdata_iqa',
                recordId: deleted.id,
                oldValues: deleted,
                actor,
                req,
                tx,
                excludeFields: ['imgeData'],
            });
            return true;
        });
    }
    async deleteByDefectId(defectId) {
        const result = await this.db
            .delete(schema_1.defectdataIqa)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataIqa.defectId, defectId))
            .returning();
        return result.length;
    }
    async countByDefectId(defectId) {
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defectdataIqa)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataIqa.defectId, defectId));
        return result[0]?.count || 0;
    }
}
exports.DefectDataIQAModel = DefectDataIQAModel;
function createDefectDataIQAModel(db) {
    return new DefectDataIQAModel(db);
}
exports.default = DefectDataIQAModel;
