"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectCustomerImageModel = void 0;
exports.createDefectCustomerImageModel = createDefectCustomerImageModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        id: row.id,
        defect_id: row.defectId ?? 0,
        imge_data: row.imgeData,
        trayno: row.trayno ?? null,
        tray_row: row.trayRow ?? null,
        tray_position: row.trayPosition ?? null,
        photo_magnification: row.photoMagnification ?? null,
        stamp: row.stamp ?? null
    };
}
class DefectCustomerImageModel {
    constructor(db, config = types_1.DEFAULT_DEFECT_IMAGE_CONFIG) {
        this.db = db;
        this.config = config;
    }
    async create(data) {
        const insertData = {
            defectId: data.defect_id,
            imgeData: data.imge_data,
            trayno: data.trayno ?? null,
            trayRow: data.tray_row ?? null,
            trayPosition: data.tray_position ?? null,
            photoMagnification: data.photo_magnification ?? null,
            stamp: data.stamp ?? null
        };
        const result = await this.db
            .insert(schema_1.defectCustomerImage)
            .values(insertData)
            .returning();
        return mapDrizzleToEntity(result[0]);
    }
    async bulkCreate(defectId, images, trayInfos) {
        console.log('💾 Model.bulkCreate (Drizzle) - Starting for customer images');
        console.log('  - defectId:', defectId);
        console.log('  - images count:', images.length);
        const createdImages = [];
        try {
            for (let i = 0; i < images.length; i++) {
                const imageData = images[i];
                const trayInfo = trayInfos?.[i];
                console.log(`  - Inserting image ${i + 1}/${images.length} (${imageData.length} bytes)`);
                const result = await this.db
                    .insert(schema_1.defectCustomerImage)
                    .values({
                    defectId: defectId,
                    imgeData: imageData,
                    trayno: trayInfo?.trayno ?? null,
                    trayRow: trayInfo?.tray_row ?? null,
                    trayPosition: trayInfo?.tray_position ?? null,
                    photoMagnification: trayInfo?.photo_magnification ?? null,
                    stamp: trayInfo?.stamp ?? null
                })
                    .returning();
                console.log(`  - Image ${i + 1} inserted with id:`, result[0].id);
                createdImages.push(mapDrizzleToEntity(result[0]));
            }
            console.log('✅ Created', createdImages.length, 'customer images');
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
            .from(schema_1.defectCustomerImage)
            .where((0, drizzle_orm_1.eq)(schema_1.defectCustomerImage.id, id))
            .limit(1);
        return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
    }
    async getAll() {
        const result = await this.db
            .select()
            .from(schema_1.defectCustomerImage)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectCustomerImage.id));
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getByDefectId(defectId) {
        const result = await this.db
            .select()
            .from(schema_1.defectCustomerImage)
            .where((0, drizzle_orm_1.eq)(schema_1.defectCustomerImage.defectId, defectId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.defectCustomerImage.id));
        return result.map(row => mapDrizzleToEntity(row));
    }
    async update(id, imageData) {
        const result = await this.db
            .update(schema_1.defectCustomerImage)
            .set({ imgeData: imageData })
            .where((0, drizzle_orm_1.eq)(schema_1.defectCustomerImage.id, id))
            .returning();
        return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
    }
    async delete(id, actor = null, req) {
        return await this.db.transaction(async (tx) => {
            const [deleted] = await tx
                .delete(schema_1.defectCustomerImage)
                .where((0, drizzle_orm_1.eq)(schema_1.defectCustomerImage.id, id))
                .returning();
            if (!deleted)
                return false;
            await (0, auditLogger_1.logDelete)(this.db, {
                entity: 'defect_customer_image',
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
            .delete(schema_1.defectCustomerImage)
            .where((0, drizzle_orm_1.eq)(schema_1.defectCustomerImage.defectId, defectId))
            .returning();
        return result.length;
    }
    async countByDefectId(defectId) {
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defectCustomerImage)
            .where((0, drizzle_orm_1.eq)(schema_1.defectCustomerImage.defectId, defectId));
        return result[0]?.count || 0;
    }
}
exports.DefectCustomerImageModel = DefectCustomerImageModel;
function createDefectCustomerImageModel(db) {
    return new DefectCustomerImageModel(db);
}
exports.default = DefectCustomerImageModel;
