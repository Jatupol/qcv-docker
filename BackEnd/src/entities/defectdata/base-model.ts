// server/src/entities/defectdata/base-model.ts
/**
 * Base DefectData Model
 * Shared functionality for defect data entities
 *
 * This base class contains all the common CRUD operations and business logic
 * for both defectdata and defectdata_customer tables
 */

import { Pool, PoolClient } from 'pg';
import { GenericSpecialModel } from '../../generic/entities/special-entity/generic-model';
import {
  ISpecialModel
} from '../../generic/entities/special-entity/generic-types';

/**
 * Base interface for defect data entities
 */
export interface BaseDefectData {
  id: number;
  inspection_no: string;
  defect_date: Date;
  qc_name?: string;
  qclead_name?: string;
  mbr_name?: string;
  linevi?: string;
  groupvi?: string;
  station?: string;
  inspector?: string;
  defect_id: number;
  ng_qty: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Base interface for creating defect data
 */
export interface BaseCreateDefectDataRequest {
  inspection_no: string;
  defect_date?: Date;
  qc_name?: string;
  qclead_name?: string;
  mbr_name?: string;
  linevi?: string;
  groupvi?: string;
  station?: string;
  inspector?: string;
  defect_id: number;
  ng_qty?: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
}

/**
 * Base interface for updating defect data
 */
export interface BaseUpdateDefectDataRequest {
  inspection_no?: string;
  defect_date?: Date;
  qc_name?: string;
  qclead_name?: string;
  mbr_name?: string;
  linevi?: string;
  groupvi?: string;
  station?: string;
  inspector?: string;
  defect_id?: number;
  ng_qty?: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
}

/**
 * Base DefectData Model - Shared operations
 */
export abstract class BaseDefectDataModel<
  T extends BaseDefectData,
  C extends BaseCreateDefectDataRequest,
  U extends BaseUpdateDefectDataRequest
> extends GenericSpecialModel<T> implements ISpecialModel<T> {

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create new defect data record
   */
  async create(data: C, userId?: number): Promise<T> {
    const client = await this.db.connect();

    try {
      const query = `
        INSERT INTO ${this.config.tableName} (
          inspection_no, defect_date, qc_name, qclead_name, mbr_name,
          linevi, groupvi, station, inspector, defect_id, ng_qty,
          trayno, tray_position, color, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15 )
        RETURNING *
      `;

      const values = [
        data.inspection_no,
        data.defect_date || new Date(),
        data.qc_name,
        data.qclead_name,
        data.mbr_name,
        data.linevi,
        data.groupvi,
        data.station,
        data.inspector,
        data.defect_id,
        data.ng_qty || 0,
        data.trayno || null,
        data.tray_position || null,
        data.color || null,
        userId || 0
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Update defect data record
   */
  async update(id: number, data: U, userId?: number): Promise<T | null> {
    const client = await this.db.connect();

    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.inspection_no !== undefined) {
        updateFields.push(`inspection_no = $${paramCount++}`);
        values.push(data.inspection_no);
      }
      if (data.defect_date !== undefined) {
        updateFields.push(`defect_date = $${paramCount++}`);
        values.push(data.defect_date);
      }
      if (data.qc_name !== undefined) {
        updateFields.push(`qc_name = $${paramCount++}`);
        values.push(data.qc_name);
      }
      if (data.qclead_name !== undefined) {
        updateFields.push(`qclead_name = $${paramCount++}`);
        values.push(data.qclead_name);
      }
      if (data.mbr_name !== undefined) {
        updateFields.push(`mbr_name = $${paramCount++}`);
        values.push(data.mbr_name);
      }
      if (data.linevi !== undefined) {
        updateFields.push(`linevi = $${paramCount++}`);
        values.push(data.linevi);
      }
      if (data.groupvi !== undefined) {
        updateFields.push(`groupvi = $${paramCount++}`);
        values.push(data.groupvi);
      }
      if (data.station !== undefined) {
        updateFields.push(`station = $${paramCount++}`);
        values.push(data.station);
      }
      if (data.inspector !== undefined) {
        updateFields.push(`inspector = $${paramCount++}`);
        values.push(data.inspector);
      }
      if (data.defect_id !== undefined) {
        updateFields.push(`defect_id = $${paramCount++}`);
        values.push(data.defect_id);
      }
      if (data.ng_qty !== undefined) {
        updateFields.push(`ng_qty = $${paramCount++}`);
        values.push(data.ng_qty);
      }
      if (data.trayno !== undefined) {
        updateFields.push(`trayno = $${paramCount++}`);
        values.push(data.trayno);
      }
      if (data.tray_position !== undefined) {
        updateFields.push(`tray_position = $${paramCount++}`);
        values.push(data.tray_position);
      }
      if (data.color !== undefined) {
        updateFields.push(`color = $${paramCount++}`);
        values.push(data.color);
      }

      // Always update updated_by and updated_at
      updateFields.push(`updated_by = $${paramCount++}`);
      values.push(userId || 0);
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Add ID as last parameter
      values.push(id);

      const query = `
        UPDATE ${this.config.tableName}
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // ==================== DEFECTDATA-SPECIFIC OPERATIONS ====================

  /**
   * Get defect data by inspection number
   */
  async getByInspectionNo(inspectionNo: string): Promise<T[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = $1
        ORDER BY dd.created_at DESC
      `;

      const result = await client.query(query, [inspectionNo]);
      const defects = result.rows.map(row => this.transformRowToEntity(row));

      // Load images for each defect
      const defectsWithImages = await Promise.all(
        defects.map(async (defect: any) => {
          try {
            // Get images for this defect
            const imageQuery = `
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_customer_image
              WHERE defect_id = $1
              ORDER BY id
            `;
            const imageResult = await client.query(imageQuery, [defect.id]);

            // Convert to array of base64 strings with data URL prefix
            const imageUrls = imageResult.rows.map((img: any) =>
              `data:image/jpeg;base64,${img.image_data}`
            );

            return {
              ...defect,
              image_urls: imageUrls
            };
          } catch (error: any) {
            console.error(`Error loading images for defect ${defect.id}:`, error);
            return {
              ...defect,
              image_urls: []
            };
          }
        })
      );

      return defectsWithImages;
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data by station and date range
   */
  async getByStationAndDateRange(
    station: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<T[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.station = $1
        AND dd.defect_date >= $2
        AND dd.defect_date <= $3
        ORDER BY dd.defect_date DESC, dd.created_at DESC
        LIMIT $4
      `;

      const result = await client.query(query, [station, startDate, endDate, limit]);
      return result.rows.map(row => this.transformRowToEntity(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data by inspector
   */
  async getByInspector(inspector: string, limit: number = 100): Promise<T[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspector = $1
        ORDER BY dd.defect_date DESC, dd.created_at DESC
        LIMIT $2
      `;

      const result = await client.query(query, [inspector, limit]);
      return result.rows.map(row => this.transformRowToEntity(row));
    } finally {
      client.release();
    }
  }

  /**
   * Check if inspection number exists
   */
  async inspectionNumberExists(inspectionNo: string): Promise<boolean> {
    const client = await this.db.connect();

    try {
      const query = `SELECT COUNT(*) as count FROM ${this.config.tableName} WHERE inspection_no = $1`;
      const result = await client.query(query, [inspectionNo]);
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Validate defect ID exists
   */
  async validateDefectId(defectId: number): Promise<boolean> {
    const client = await this.db.connect();

    try {
      const query = 'SELECT COUNT(*) as count FROM defects WHERE id = $1';
      const result = await client.query(query, [defectId]);
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Transform database row to entity
   */
  protected transformRowToEntity(row: any): T {
    return {
      id: row.id,
      inspection_no: row.inspection_no,
      defect_date: new Date(row.defect_date),
      qc_name: row.qc_name,
      qclead_name: row.qclead_name,
      mbr_name: row.mbr_name,
      linevi: row.linevi,
      groupvi: row.groupvi,
      station: row.station,
      inspector: row.inspector,
      defect_id: row.defect_id,
      ng_qty: row.ng_qty || 0,
      trayno: row.trayno,
      tray_position: row.tray_position,
      color: row.color,
      is_active: true,
      created_by: row.created_by,
      updated_by: row.updated_by,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    } as T;
  }
}
