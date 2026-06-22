// server/src/entities/defectdata-iqa/model-drizzle.ts
/**
 * Defect Data IQA Entity Model - Drizzle ORM Implementation
 * SERIAL Primary Key Pattern with bytea data
 *
 * This is the Drizzle ORM version of the DefectDataIQAModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original DefectDataIQAModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_DEFECTDATA_IQA=true in .env
 */

import { eq, sql, asc } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import {
  defectdataIqa,
  DefectdataIqa as DrizzleDefectdataIqa,
  NewDefectdataIqa
} from '../../db/schema';
import {
  DefectDataIQA,
  CreateDefectDataIQARequest,
  DefectDataIQAConfig,
  DEFAULT_DEFECT_IMAGE_CONFIG
} from './types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToEntity(row: DrizzleDefectdataIqa): DefectDataIQA {
  return {
    id: row.id,
    defect_id: row.defectId ?? 0,
    iqaid: row.iqaid ?? undefined,
    defect_description: row.defectDescription ?? '',
    imge_data: row.imgeData as Buffer
  };
}

// ==================== DEFECT DATA IQA MODEL CLASS (DRIZZLE) ====================

/**
 * Defect Data IQA Entity Model - Drizzle ORM Version
 *
 * Data access layer for IQA defect image management using Drizzle ORM.
 * Provides image storage operations with type-safe queries.
 */
export class DefectDataIQAModel {
  private db: DrizzleDb;
  private config: DefectDataIQAConfig;

  constructor(db: DrizzleDb, config: DefectDataIQAConfig = DEFAULT_DEFECT_IMAGE_CONFIG) {
    this.db = db;
    this.config = config;
  }

  /**
   * Create a new defect image
   */
  async create(data: CreateDefectDataIQARequest): Promise<DefectDataIQA> {
    const insertData: NewDefectdataIqa = {
      defectId: data.defect_id,
      iqaid: data.iqaid || null,
      defectDescription: data.defect_description || '',
      imgeData: data.imge_data
    };

    const result = await this.db
      .insert(defectdataIqa)
      .values(insertData)
      .returning();

    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Bulk create defect images
   */
  async bulkCreate(defectId: number, images: Buffer[], defectDescription?: string, iqaid?: number): Promise<DefectDataIQA[]> {
    console.log('💾 Model.bulkCreate (Drizzle) - Starting for IQA defect images');
    console.log('  - defectId:', defectId);
    console.log('  - iqaid:', iqaid);
    console.log('  - images count:', images.length);

    const createdImages: DefectDataIQA[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        console.log(`  - Inserting image ${i + 1}/${images.length} (${imageData.length} bytes)`);

        const result = await this.db
          .insert(defectdataIqa)
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

    } catch (error) {
      console.error('❌ Error during bulk create:', error);
      throw error;
    }
  }

  /**
   * Get image by ID
   */
  async getById(id: number): Promise<DefectDataIQA | null> {
    const result = await this.db
      .select()
      .from(defectdataIqa)
      .where(eq(defectdataIqa.id, id))
      .limit(1);

    return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
  }

  /**
   * Get all images for a defect
   */
  async getByDefectId(defectId: number): Promise<DefectDataIQA[]> {
    const result = await this.db
      .select()
      .from(defectdataIqa)
      .where(eq(defectdataIqa.defectId, defectId))
      .orderBy(asc(defectdataIqa.id));

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Get all images for an IQA record
   */
  async getByIQAId(iqaid: number): Promise<DefectDataIQA[]> {
    const result = await this.db
      .select()
      .from(defectdataIqa)
      .where(eq(defectdataIqa.iqaid, iqaid))
      .orderBy(asc(defectdataIqa.id));

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Delete image by ID
   */
  async delete(
    id: number,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<boolean> {
    return await this.db.transaction(async (tx: any) => {
      const [deleted] = await tx
        .delete(defectdataIqa)
        .where(eq(defectdataIqa.id, id))
        .returning();

      if (!deleted) return false;

      await logDelete(this.db, {
        entity: 'defectdata_iqa',
        recordId: deleted.id,
        oldValues: deleted as any,
        actor,
        req,
        tx,
        excludeFields: ['imgeData'],
      });

      return true;
    });
  }

  /**
   * Delete all images for a defect
   */
  async deleteByDefectId(defectId: number): Promise<number> {
    const result = await this.db
      .delete(defectdataIqa)
      .where(eq(defectdataIqa.defectId, defectId))
      .returning();

    return result.length;
  }

  /**
   * Count images for a defect
   */
  async countByDefectId(defectId: number): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defectdataIqa)
      .where(eq(defectdataIqa.defectId, defectId));

    return result[0]?.count || 0;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle defect data IQA model instance
 */
export function createDefectDataIQAModel(db: DrizzleDb): DefectDataIQAModel {
  return new DefectDataIQAModel(db);
}

export default DefectDataIQAModel;
