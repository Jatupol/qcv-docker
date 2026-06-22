"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDefectImageModel = void 0;
class BaseDefectImageModel {
    constructor(db, config) {
        this.db = db;
        this.config = config;
    }
    async create(data) {
        const query = `
      INSERT INTO ${this.config.tableName} (defect_id, imge_data)
      VALUES ($1, $2)
      RETURNING id, defect_id, imge_data
    `;
        const result = await this.db.query(query, [
            data.defect_id,
            data.imge_data
        ]);
        return result.rows[0];
    }
    async bulkCreate(defectId, images) {
        console.log('💾 Model.bulkCreate - Starting transaction');
        console.log('  - Table:', this.config.tableName);
        console.log('  - defectId:', defectId);
        console.log('  - images count:', images.length);
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            console.log('  - Transaction started');
            const createdImages = [];
            for (let i = 0; i < images.length; i++) {
                const imageData = images[i];
                const query = `
          INSERT INTO ${this.config.tableName} (defect_id, imge_data)
          VALUES ($1, $2)
          RETURNING id, defect_id, imge_data
        `;
                console.log(`  - Inserting image ${i + 1}/${images.length} (${imageData.length} bytes)`);
                const result = await client.query(query, [defectId, imageData]);
                console.log(`  - Image ${i + 1} inserted with id:`, result.rows[0].id);
                createdImages.push(result.rows[0]);
            }
            await client.query('COMMIT');
            console.log('✅ Transaction committed, created', createdImages.length, 'images');
            return createdImages;
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Transaction rolled back due to error:', error);
            if (error instanceof Error) {
                console.error('  - Error message:', error.message);
                console.error('  - Error stack:', error.stack);
            }
            throw error;
        }
        finally {
            client.release();
            console.log('  - Database client released');
        }
    }
    async getById(id) {
        const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      WHERE id = $1
    `;
        const result = await this.db.query(query, [id]);
        return result.rows[0] || null;
    }
    async getAll() {
        const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      ORDER BY id DESC
    `;
        const result = await this.db.query(query);
        return result.rows;
    }
    async getByDefectId(defectId) {
        const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      WHERE defect_id = $1
      ORDER BY id ASC
    `;
        const result = await this.db.query(query, [defectId]);
        return result.rows;
    }
    async update(id, imageData) {
        const query = `
      UPDATE ${this.config.tableName}
      SET imge_data = $1
      WHERE id = $2
      RETURNING id, defect_id, imge_data
    `;
        const result = await this.db.query(query, [imageData, id]);
        return result.rows[0] || null;
    }
    async delete(id) {
        const query = `
      DELETE FROM ${this.config.tableName}
      WHERE id = $1
    `;
        const result = await this.db.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
    async deleteByDefectId(defectId) {
        const query = `
      DELETE FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;
        const result = await this.db.query(query, [defectId]);
        return result.rowCount ?? 0;
    }
    async countByDefectId(defectId) {
        const query = `
      SELECT COUNT(*) as count
      FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;
        const result = await this.db.query(query, [defectId]);
        return parseInt(result.rows[0].count, 10);
    }
}
exports.BaseDefectImageModel = BaseDefectImageModel;
