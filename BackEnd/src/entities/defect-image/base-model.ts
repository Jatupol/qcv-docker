// server/src/entities/defect-image/base-model.ts
/**
 * Base Defect Image Model
 * Shared functionality for defect image entities
 */

import { Pool } from 'pg';

/**
 * Base interface for defect image data
 */
export interface BaseDefectImage {
  id: number;
  defect_id: number;
  imge_data: Buffer;
}

/**
 * Base interface for creating defect images
 */
export interface BaseCreateDefectImageRequest {
  defect_id: number;
  imge_data: Buffer;
}

/**
 * Configuration for defect image models
 */
export interface BaseDefectImageConfig {
  tableName: string;
}

/**
 * Base Defect Image Model - Shared database operations
 */
export abstract class BaseDefectImageModel<T extends BaseDefectImage, C extends BaseCreateDefectImageRequest> {
  protected db: Pool;
  protected config: BaseDefectImageConfig;

  constructor(db: Pool, config: BaseDefectImageConfig) {
    this.db = db;
    this.config = config;
  }

  /**
   * Create a new defect image
   */
  async create(data: C): Promise<T> {
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

  /**
   * Bulk create defect images
   */
  async bulkCreate(defectId: number, images: Buffer[]): Promise<T[]> {
    console.log('💾 Model.bulkCreate - Starting transaction');
    console.log('  - Table:', this.config.tableName);
    console.log('  - defectId:', defectId);
    console.log('  - images count:', images.length);

    const client = await this.db.connect();

    try {
      await client.query('BEGIN');
      console.log('  - Transaction started');

      const createdImages: T[] = [];

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

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Transaction rolled back due to error:', error);
      if (error instanceof Error) {
        console.error('  - Error message:', error.message);
        console.error('  - Error stack:', error.stack);
      }
      throw error;
    } finally {
      client.release();
      console.log('  - Database client released');
    }
  }

  /**
   * Get image by ID
   */
  async getById(id: number): Promise<T | null> {
    const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all images
   */
  async getAll(): Promise<T[]> {
    const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      ORDER BY id DESC
    `;

    const result = await this.db.query(query);
    return result.rows;
  }

  /**
   * Get all images for a defect
   */
  async getByDefectId(defectId: number): Promise<T[]> {
    const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      WHERE defect_id = $1
      ORDER BY id ASC
    `;

    const result = await this.db.query(query, [defectId]);
    return result.rows;
  }

  /**
   * Update image by ID
   */
  async update(id: number, imageData: Buffer): Promise<T | null> {
    const query = `
      UPDATE ${this.config.tableName}
      SET imge_data = $1
      WHERE id = $2
      RETURNING id, defect_id, imge_data
    `;

    const result = await this.db.query(query, [imageData, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete image by ID
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all images for a defect
   */
  async deleteByDefectId(defectId: number): Promise<number> {
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;

    const result = await this.db.query(query, [defectId]);
    return result.rowCount ?? 0;
  }

  /**
   * Count images for a defect
   */
  async countByDefectId(defectId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;

    const result = await this.db.query(query, [defectId]);
    return parseInt(result.rows[0].count, 10);
  }
}
