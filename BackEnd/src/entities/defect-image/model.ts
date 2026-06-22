// server/src/entities/defect-image/model-drizzle.ts
/* Defect Image Entity Model - Drizzle ORM Implementation
 * SERIAL Primary Key Pattern with bytea data
 *
 * This is the Drizzle ORM version of the DefectImageModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original DefectImageModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_DEFECT_IMAGE=true in .env
 */

import { eq, sql, desc, asc } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import {
  defectImage,
  DefectImage as DrizzleDefectImage,
  NewDefectImage
} from '../../db/schema';
import {
  DefectImage,
  CreateDefectImageRequest,
  DefectImageConfig,
  DEFAULT_DEFECT_IMAGE_CONFIG
} from './types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToEntity(row: DrizzleDefectImage): DefectImage {
  return {
    id: row.id,
    defect_id: row.defectId ?? 0,
    imge_data: row.imgeData as Buffer,
    trayno: row.trayno ?? null,
    tray_row: row.trayRow ?? null,
    tray_position: row.trayPosition ?? null,
    photo_magnification: row.photoMagnification ?? null,
    stamp: row.stamp ?? null
  };
}

// ==================== DEFECT IMAGE MODEL CLASS (DRIZZLE) ====================

/**
 * Defect Image Entity Model - Drizzle ORM Version
 *
 * Data access layer for defect image management using Drizzle ORM.
 * Provides image storage operations with type-safe queries.
 */
export class DefectImageModel {
  private db: DrizzleDb;
  private config: DefectImageConfig;

  constructor(db: DrizzleDb, config: DefectImageConfig = DEFAULT_DEFECT_IMAGE_CONFIG) {
    this.db = db;
    this.config = config;
  }

  /**
   * Create a new defect image
   */
  async create(data: CreateDefectImageRequest): Promise<DefectImage> {
    const insertData: NewDefectImage = {
      defectId: data.defect_id,
      imgeData: data.imge_data,
      trayno: data.trayno ?? null,
      trayRow: data.tray_row ?? null,
      trayPosition: data.tray_position ?? null,
      photoMagnification: data.photo_magnification ?? null,
      stamp: data.stamp ?? null
    };

    const result = await this.db
      .insert(defectImage)
      .values(insertData)
      .returning();

    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Bulk create defect images
   */
  async bulkCreate(defectId: number, images: Buffer[], trayInfos?: Array<{ trayno?: string | null; tray_row?: string | null; tray_position?: string | null; photo_magnification?: string | null; stamp?: string | null }>): Promise<DefectImage[]> {
    console.log('💾 Model.bulkCreate (Drizzle) - Starting transaction');
    console.log('  - defectId:', defectId);
    console.log('  - images count:', images.length);

    const createdImages: DefectImage[] = [];

    // Use raw SQL for transaction handling since Drizzle transactions work differently
    try {
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        const trayInfo = trayInfos?.[i];
        console.log(`  - Inserting image ${i + 1}/${images.length} (${imageData.length} bytes)`);

        const result = await this.db
          .insert(defectImage)
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

      console.log('✅ Created', createdImages.length, 'images');
      return createdImages;

    } catch (error) {
      console.error('❌ Error during bulk create:', error);
      throw error;
    }
  }

  /**
   * Get image by ID
   */
  async getById(id: number): Promise<DefectImage | null> {
    const result = await this.db
      .select()
      .from(defectImage)
      .where(eq(defectImage.id, id))
      .limit(1);

    return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
  }

  /**
   * Get all images
   */
  async getAll(): Promise<DefectImage[]> {
    const result = await this.db
      .select()
      .from(defectImage)
      .orderBy(desc(defectImage.id));

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Get all images for a defect
   */
  async getByDefectId(defectId: number): Promise<DefectImage[]> {
    const result = await this.db
      .select()
      .from(defectImage)
      .where(eq(defectImage.defectId, defectId))
      .orderBy(asc(defectImage.id));

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Update image by ID
   */
  async update(id: number, imageData: Buffer): Promise<DefectImage | null> {
    const result = await this.db
      .update(defectImage)
      .set({ imgeData: imageData })
      .where(eq(defectImage.id, id))
      .returning();

    return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
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
        .delete(defectImage)
        .where(eq(defectImage.id, id))
        .returning();

      if (!deleted) return false;

      await logDelete(this.db, {
        entity: 'defect_image',
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
      .delete(defectImage)
      .where(eq(defectImage.defectId, defectId))
      .returning();

    return result.length;
  }

  /**
   * Count images for a defect
   */
  async countByDefectId(defectId: number): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defectImage)
      .where(eq(defectImage.defectId, defectId));

    return result[0]?.count || 0;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle defect image model instance
 */
export function createDefectImageModel(db: DrizzleDb): DefectImageModel {
  return new DefectImageModel(db);
}

export default DefectImageModel;
