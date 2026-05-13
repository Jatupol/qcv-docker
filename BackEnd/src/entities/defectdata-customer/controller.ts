// server/src/entities/defectdatacustomer/controller.ts
/**
 * DefectDataCustomer Entity Controller - Complete Separation Entity Architecture
 * SPECIAL Pattern Implementation
 *
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSpecialController for maximum code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained defectdatacustomer HTTP handling layer
 * ✅ Manufacturing Quality Control domain optimized
 *
 * Database Schema Compliance:
 * - Table: defectdatacustomer
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SPECIAL Entity (SERIAL ID with complex structure)
 * - API Routes: /api/defectdatacustomer/:id
 */

import { Request, Response, NextFunction } from 'express';
import { GenericSpecialController } from '../../generic/entities/special-entity/generic-controller';
import {
  ISpecialController,
  SpecialApiResponse,
  SpecialEntityRequest,
  HTTP_STATUS
} from '../../generic/entities/special-entity/generic-types';

import {
  DefectData,
  DefectDetail,
  DefectEmail,
  CreateDefectDataRequest,
  UpdateDefectDataRequest,
  DefectDataQueryOptions,
  DefectDataSummary,
  DefectDataProfile,
  DefectDataTrend,
  InspectorPerformance,
  DEFAULT_DEFECTDATA_CONFIG
} from './types';

import { DefectDataService } from './service';
import { EmailService } from '../../utils/emailService';
import { Pool } from 'pg';

// ==================== DEFECTDATA CONTROLLER CLASS ====================

/**
 * DefectData Controller - HTTP handling layer for DefectData entity
 *
 * Provides defect data-specific HTTP endpoints while extending
 * the generic SPECIAL controller pattern for maximum code reuse.
 *
 * Features:
 * - Complete CRUD endpoints via generic pattern
 * - DefectData-specific HTTP operations
 * - Manufacturing Quality Control optimized endpoints
 * - Enhanced error handling and response formatting
 * - Analytics and reporting endpoints
 */
export class DefectDataController extends GenericSpecialController<DefectData> implements ISpecialController {

  private defectDataService: DefectDataService;
  private emailService: EmailService | null = null;
  private db: Pool | null = null;

  constructor(defectDataService: DefectDataService, db?: Pool) {
    // Pass the service to the generic controller
    super(defectDataService, DEFAULT_DEFECTDATA_CONFIG);
    this.defectDataService = defectDataService;

    // Initialize email service and store db connection if provided
    if (db) {
      this.db = db;
      this.emailService = new EmailService(db);
    }
  }

  // ==================== INHERITED CRUD ENDPOINTS ====================
  // The following methods are inherited from GenericSpecialController:
  // - getById(req, res, next) - GET /:id - Get defect data by ID
  // - getAll(req, res, next) - GET / - Get all defect data with filtering/pagination
  // - create(req, res, next) - POST / - Create new defect data
  // - update(req, res, next) - PUT /:id - Update defect data
  // - delete(req, res, next) - DELETE /:id - Delete defect data (soft delete)
  // - getHealth(req, res, next) - GET /health - Health check
  // - getStatistics(req, res, next) - GET /statistics - Statistics

  // ==================== DEFECTDATA-SPECIFIC ENDPOINTS ====================

  /**
   * Get defect data by inspection number
   * GET /inspection/:inspectionNo
   */
  getByInspectionNo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inspectionNo } = req.params;
      const userId = this.extractUserId(req);

      const result = await this.defectDataService.getByInspectionNo(inspectionNo, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectData[]> = {
        success: true,
        data: result.data,
        message: `Found ${result.data?.length || 0} defect records for inspection ${inspectionNo}`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
  /**
   * Get defect etaildata by inspection number
   * GET /detail/:inspectionNo
   */
  getDetailByInspectionNo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inspectionNo } = req.params;
      const userId = this.extractUserId(req);

      const result = await this.defectDataService.getDetailByInspectionNo(inspectionNo);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectDetail[]> = {
        success: true,
        data: result.data,
        message: `Found ${result.data?.length || 0} defect records for inspection ${inspectionNo}`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get defect data by station and date range
   * GET /station/:station?startDate=...&endDate=...&limit=...
   */
  getByStationAndDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { station } = req.params;
      const { startDate, endDate, limit } = req.query;
      const userId = this.extractUserId(req);

      // Validate required parameters
      if (!startDate || !endDate) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Start date and end date are required'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const limitNum = limit ? parseInt(limit as string, 10) : 100;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Invalid date format'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.defectDataService.getByStationAndDateRange(
        station,
        start,
        end,
        limitNum,
        userId
      );

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectData[]> = {
        success: true,
        data: result.data,
        message: `Found ${result.data?.length || 0} defect records for station ${station}`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get defect data by inspector
   * GET /inspector/:inspector?limit=...
   */
  getByInspector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inspector } = req.params;
      const { limit } = req.query;
      const userId = this.extractUserId(req);

      const limitNum = limit ? parseInt(limit as string, 10) : 100;

      const result = await this.defectDataService.getByInspector(inspector, limitNum, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectData[]> = {
        success: true,
        data: result.data,
        message: `Found ${result.data?.length || 0} defect records for inspector ${inspector}`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get defect data profile with detailed information
   * GET /:id/profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = this.extractUserId(req);

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Invalid defect data ID'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.defectDataService.getProfile(idNum, userId);

      if (!result.success) {
        const status = result.error?.includes('not found') ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.BAD_REQUEST;
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(status).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectDataProfile> = {
        success: true,
        data: result.data,
        message: 'Defect data profile retrieved successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get defect data summary for analytics
   * GET /summary?startDate=...&endDate=...
   */
  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const userId = this.extractUserId(req);

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          const response: SpecialApiResponse = {
            success: false,
            message: 'Invalid start date format'
          };
          res.status(HTTP_STATUS.BAD_REQUEST).json(response);
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          const response: SpecialApiResponse = {
            success: false,
            message: 'Invalid end date format'
          };
          res.status(HTTP_STATUS.BAD_REQUEST).json(response);
          return;
        }
      }

      const result = await this.defectDataService.getSummary(start, end, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectDataSummary> = {
        success: true,
        data: result.data,
        message: 'Defect data summary retrieved successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get defect data trends for charts
   * GET /trends?days=...
   */
  getTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days } = req.query;
      const userId = this.extractUserId(req);

      const daysNum = days ? parseInt(days as string, 10) : 7;

      if (isNaN(daysNum) || daysNum <= 0) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Invalid days parameter'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.defectDataService.getTrends(daysNum, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectDataTrend[]> = {
        success: true,
        data: result.data,
        message: `Defect data trends for ${daysNum} days retrieved successfully`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inspector performance data
   * GET /inspector/:inspector/performance
   */
  getInspectorPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inspector } = req.params;
      const userId = this.extractUserId(req);

      const result = await this.defectDataService.getInspectorPerformance(inspector, userId);

      if (!result.success) {
        const status = result.error?.includes('No performance data found') ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.BAD_REQUEST;
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(status).json(response);
        return;
      }

      const response: SpecialApiResponse<InspectorPerformance> = {
        success: true,
        data: result.data,
        message: `Performance data for inspector ${inspector} retrieved successfully`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enhanced create endpoint with defect data validation
   * POST /
   */
  createDefectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateDefectDataRequest = req.body;
      const userId = this.extractUserId(req);

      const result = await this.defectDataService.createDefectData(data, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

       //*******SKIP****** */
      // Send defect email asynchronously (don't wait for it) 
      /*
      if (result.data && result.data.id) {
        this.sendDefectEmail(result.data.id).catch(error => {
          console.error('❌ Error sending defect email:', error);
          // Don't fail the request if email fails
        });
      }
      */
      const response: SpecialApiResponse<DefectData> = {
        success: true,
        data: result.data,
        message: 'Defect data created successfully'
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enhanced update endpoint with defect data validation
   * PUT /:id
   */
  updateDefectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateDefectDataRequest = req.body;
      const userId = this.extractUserId(req);

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Invalid defect data ID'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.defectDataService.updateDefectData(idNum, data, userId);

      if (!result.success) {
        const status = result.error?.includes('not found') ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.BAD_REQUEST;
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(status).json(response);
        return;
      }

      const response: SpecialApiResponse<DefectData> = {
        success: true,
        data: result.data,
        message: 'Defect data updated successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Advanced search endpoint
   * POST /search
   */
  searchDefectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searchOptions: DefectDataQueryOptions = req.body;
      const userId = this.extractUserId(req);

      const result = await this.defectDataService.searchDefectData(searchOptions, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse = {
        success: true,
        data: result.data?.data,
        pagination: result.data?.pagination,
        message: `Found ${result.data?.pagination.totalCount || 0} defect data records`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get defect data by today's date
   * GET /today
   */
  getTodayDefectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { station } = req.query;
      const userId = this.extractUserId(req);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const searchOptions: DefectDataQueryOptions = {
        defect_date_from: today,
        defect_date_to: tomorrow,
        station: station as string || undefined,
        page: 1,
        limit: 100,
        sortBy: 'defect_date',
        sortOrder: 'DESC'
      };

      const result = await this.defectDataService.searchDefectData(searchOptions, userId);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.error
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse = {
        success: true,
        data: result.data?.data,
        pagination: result.data?.pagination,
        message: `Found ${result.data?.pagination.totalCount || 0} defect records for today`
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend defect notification email
   * POST /:id/resend-email
   */
  resendDefectEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = this.extractUserId(req);

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Invalid defect data ID'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      console.log(`📧 Resending email for defect ID: ${idNum}`);

      // Call the sendDefectEmail function
      const result = await this.sendDefectEmail(idNum);

      if (!result.success) {
        const response: SpecialApiResponse = {
          success: false,
          message: result.message
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const response: SpecialApiResponse = {
        success: true,
        message: 'Email sent successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete defect data by ID
   * DELETE /:id
   */
  deleteDefectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      console.log(`🗑️ Deleting defect data: ${id} `);

      const result = await this.defectDataService.delete(id, (req as any).user ?? null, req);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Defect data deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to delete defect data',
          error: 'DELETE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error deleting defect data:', error);
      next(error); 
    }
  };


  /**
   * Bulk create defect data
   * POST /bulk
   */
  bulkCreateDefectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { records }: { records: CreateDefectDataRequest[] } = req.body;
      const userId = this.extractUserId(req);

      if (!Array.isArray(records) || records.length === 0) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Records array is required and cannot be empty'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      if (records.length > 100) {
        const response: SpecialApiResponse = {
          success: false,
          message: 'Cannot create more than 100 records at once'
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const results: DefectData[] = [];
      const errors: string[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const result = await this.defectDataService.createDefectData(record, userId);

        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`Record ${i + 1}: ${result.error}`);
        }
      }

      const response: SpecialApiResponse<DefectData[]> = {
        success: errors.length === 0,
        data: results,
        message: `Successfully created ${results.length} records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        errors: errors.length > 0 ? { bulk: errors } : undefined
      };

      const status = errors.length === 0 ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST;
      res.status(status).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ==================== HELPER METHODS ====================
 
  /**
   * Send defect notification email
   * Separated function for reusability (can be called from create or resend)
   */
  private async sendDefectEmail(defectId: number): Promise<{ success: boolean; message: string }> {
    if (!this.emailService || !this.db) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
 
      // Get email detail data using service method (includes inspection, item, and defect data)
      const emailDataResult = await this.defectDataService.getEmailDetailById(defectId);

      if (!emailDataResult.success || !emailDataResult.data || emailDataResult.data.length === 0) {
        console.warn('⚠️ No email detail data found for:', defectId);
        return { success: false, message: 'Email detail data not found' };
      }

      const defectData = emailDataResult.data[0]; // Basic defect data
 
      // Extract data from the defect detail (which includes inspection and item data)
      const station = defectData.station || '';
      const inspectionNo = defectData.inspection_no || '';
      const model = defectData.model || '';
      const version = defectData.version || '';
      const shift = defectData.shift || '';
      const itemno = defectData.itemno || '';
      const fvilineno = defectData.fvilineno || '';
      const lotno = defectData.lotno || '';
      const tab = defectData.tab || '';
      const defectName = defectData.defect_name || '';
      const defectType = defectData.defect_type || '';
      const ngQty = defectData.ng_qty; 

      const inspector = defectData.inspector_fullname ||'';
      const qc_name = defectData.qc_fullname ||'';
      const qclead_name = defectData.qclead_fullname ||'';
      const mbr_name = defectData.mbr_fullname||'';
      const trayno= defectData.trayno ||'';
      const tray_position = defectData.tray_position ||'';
      const fy = defectData.fy|| '';
      const ww= defectData.ww|| '';
      const month_year= defectData.month_year|| '';
      const qc_id= defectData.qc_name || '';
      const sampling_reason_name = defectData.sampling_reason_name || '';
      const fvi_lot_qty= defectData.fvi_lot_qty|| '';
      const fvi_inspected_qty= defectData.fvi_inspected_qty|| '';
      const general_sampling_qty= defectData.general_sampling_qty|| '';
      const crack_sampling_qty= defectData.crack_sampling_qty|| '';
      const judgment = defectData.judgment || 'N/A';

      const partsite= defectData.partsite|| '';
      const mclineno= defectData.mclineno|| '';
      const round= defectData.round|| '';

      // Format date for subject and content
      const defectDate = new Date(defectData.defect_date);
      const formattedDate = defectDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

      // Build subject line
      const subject = `🚨 ${station} ${defectType} ${defectName} ${model} ${version}_${formattedDate}_Shift ${shift}`;

      // Get image data from database (we'll fetch raw binary data and tray info for attachments)
      const imageDataResult = await this.db!.query(
        'SELECT id, imge_data, trayno, tray_row, tray_position, photo_magnification FROM defect_customer_image WHERE defect_id = $1 ORDER BY id',
        [defectId]
      );

      const imageAttachments = imageDataResult.rows.map((row, index) => ({
        filename: `defect_${defectId}_image_${index + 1}.jpg`,
        content: row.imge_data,
        contentType: 'image/jpeg',
        cid: `defect_image_${row.id}@qcv`,
        trayno: row.trayno || '',
        tray_row: row.tray_row || '',
        tray_position: row.tray_position || '',
        photo_magnification: row.photo_magnification || ''
      }));

      console.log(`📸 Image attachments for defect ${defectId}:`, imageAttachments.length, 'images prepared');

      // Build HTML email content with CID references (Matching RecordDetailModal layout)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 900px; margin: 0 auto; padding: 0; background: #fff; }

            /* Modal Header - Matching RecordDetailModal gradient */
            .header {
              background: ${judgment === 'Pass'
                ? 'linear-gradient(to right, #10b981, #059669)'
                : judgment === 'Reject'
                  ? 'linear-gradient(to right, #ef4444, #dc2626)'
                  : 'linear-gradient(to right, #6b7280, #4b5563)'
              };
              color: white;
              padding: 16px 20px;
              border-radius: 12px 12px 0 0;
            }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin: 4px 0 0 0; font-size: 14px; opacity: 0.8; }

            /* Modal Content - Compact spacing like modal */
            .content { padding: 16px; }

            /* Section styling matching modal color scheme */
            .section { padding: 12px; margin: 12px 0; border-radius: 8px; }
            .section-blue { background: #eff6ff; border: 1px solid #bfdbfe; }
            .section-red { background: #fee2e2; border: 1px solid #fca5a5; }
            .section-purple { background: #faf5ff; border: 1px solid #e9d5ff; }
            .section-indigo { background: #eef2ff; border: 1px solid #c7d2fe; }

            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .section-title-blue { color: #1e3a8a; }
            .section-title-red { color: #991b1b; }
            .section-title-purple { color: #581c87; }
            .section-title-indigo { color: #3730a3; }

            /* Compact Field Layout - matching modal grid */
            .detail-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 8px;
            }
            .detail-row { display: flex; flex-direction: column; }
            .label {
              font-size: 12px;
              color: #6b7280;
              font-weight: 500;
              margin-bottom: 2px;
            }
            .value {
              font-size: 12px;
              color: #1f2937;
              font-weight: 600;
            }
            .highlight {
              font-weight: bold;
              color: #1e40af;
            }

            /* Judgment Badge - matching modal status colors */
            .judgment-container { margin-bottom: 12px; }
            .judgment-badge {
              display: inline-flex;
              align-items: center;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              border: 1px solid;
              margin-top: 4px;
            }
            .judgment-pass {
              background: #d1fae5;
              color: #065f46;
              border-color: #6ee7b7;
            }
            .judgment-reject {
              background: #fee2e2;
              color: #991b1b;
              border-color: #fca5a5;
            }

            /* Action box */
            .alert-box {
              background: #fef3c7;
              border: 2px solid #fbbf24;
              padding: 12px;
              margin: 16px 0;
              border-radius: 8px;
            }
            .alert-box strong { color: #92400e; }

            /* Images section */
            .images { margin: 16px 0; }
            .image-title {
              color: #dc2626;
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 12px;
            }
            .image-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 12px;
              margin-top: 12px;
            }
            .image-item img {
              width: 100%;
              max-width: 300px;
              border: 2px solid #d1d5db;
              border-radius: 8px;
              display: block;
            }

            /* Footer */
            .footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 2px solid #e5e7eb;
              font-size: 11px;
              color: #6b7280;
              text-align: center;
            }

            /* Greeting */
            .greeting {
              font-size: 14px;
              margin: 16px 0 12px 0;
              font-weight: 600;
            }
            .intro {
              font-size: 13px;
              margin-bottom: 16px;
              line-height: 1.6;
              background: #fef2f2;
              padding: 12px;
              border-left: 4px solid #dc2626;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Modal Header - Matching RecordDetailModal -->
            <div class="header">
              <h1>🚨 Inspection Details - Defect Notification</h1>
              <p>${station} Station - ID: ${defectId} - ${formattedDate}</p>
            </div>

            <!-- Modal Content - Compact -->
            <div class="content">
              <!-- Greeting -->
              <div class="greeting">Dear FVI team and all,</div>

              <!-- Introduction -->
              <div class="intro">
                I would like to share <strong>${station} ${defectName}</strong> on <strong>${model} ${version}</strong>
                found <strong class="highlight">${ngQty} piece${ngQty > 1 ? 's' : ''}</strong>, please see more details as below.
              </div>

              <!-- Section 1: Inspection Identification (Blue) -->
              <div class="section section-blue">
                <h4 class="section-title section-title-blue">🔍 Inspection Identification</h4>
                <div class="detail-grid">
                  <div class="detail-row">
                    <span class="label">Station:</span>
                    <span class="value">${station}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Sampling No:</span>
                    <span class="value">${inspectionNo}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Inspection Ref:</span>
                    <span class="value">N/A</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">FY/WW:</span>
                    <span class="value">${fy || 'N/A'}/${ww || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Month/Year:</span>
                    <span class="value">${month_year || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Shift:</span>
                    <span class="value">${shift}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">QC Inspector:</span>
                    <span class="value">QC${qc_id || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Sampling Reason:</span>
                    <span class="value">${sampling_reason_name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">FVI Lot Qty:</span>
                    <span class="value highlight">${fvi_lot_qty ? fvi_lot_qty.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">General Sampling:</span>
                    <span class="value highlight">${general_sampling_qty ? general_sampling_qty.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Crack Sampling:</span>
                    <span class="value highlight">${crack_sampling_qty ? crack_sampling_qty.toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Section 2: Product Information (Purple) -->
              <div class="section section-purple">
                <h4 class="section-title section-title-purple">📦 Product Information</h4>
                <div class="detail-grid">
                  <div class="detail-row">
                    <span class="label">Lot No:</span>
                    <span class="value">${lotno}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Item No:</span>
                    <span class="value">${itemno}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Model:</span>
                    <span class="value">${model}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Version:</span>
                    <span class="value">${version}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Part Site:</span>
                    <span class="value">${partsite || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Round:</span>
                    <span class="value">${round || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">FVI Line No:</span>
                    <span class="value">${fvilineno}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">MC Line No:</span>
                    <span class="value">${mclineno || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Product Tab:</span>
                    <span class="value">${tab || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Section 3: Judgment & Defect Information (Indigo) -->
              <div class="section section-indigo">
                <h4 class="section-title section-title-indigo">⚖️ Judgment & Defect Information</h4>

                <!-- Judgment Badge -->
                <div class="judgment-container">
                  <span style="font-size: 12px; font-weight: 600; color: #4b5563;">Final Judgment:</span>
                  <div class="judgment-badge ${judgment === 'Pass' ? 'judgment-pass' : 'judgment-reject'}">
                    ${judgment === 'Pass' ? '✓' : '✗'} ${judgment || 'N/A'}
                  </div>
                </div>

                <!-- Defect Details Grid -->
                <div class="detail-grid" style="margin-top: 12px;">
                  <div class="detail-row">
                    <span class="label">Defect Type:</span>
                    <span class="value">${defectType || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Defect Name:</span>
                    <span class="value">${defectName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Reject Q'ty:</span>
                    <span class="value highlight" style="color: #dc2626;">${ngQty} piece${ngQty > 1 ? 's' : ''}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Inspector:</span>
                    <span class="value">${inspector || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">QC Name:</span>
                    <span class="value">${qc_name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">QC Leader:</span>
                    <span class="value">${qclead_name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">FVI Leader Confirm Name:</span>
                    <span class="value">${mbr_name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Section 4: Defect Sample Images -->
              ${imageAttachments.length > 0 ? `
                <div class="images">
                  <div class="image-title">📸 Reject Sample Images (${imageAttachments.length})</div>
                  <div class="image-grid">
                    ${imageAttachments.map(img => {
                      return `
                      <div class="image-item">
                        <img src="cid:${img.cid}" alt="Defect Sample" style="border-radius: 8px 8px 0 0;" />
                        <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-top: none; border-radius: 0 0 8px 8px; padding: 4px 10px; font-size: 10px; display: flex; justify-content: center; gap: 12px;">
                          <span><span style="color: #6b7280;">Tray:</span> <span style="color: #1f2937; font-weight: 600;">${img.trayno || '-'}</span></span>
                          <span><span style="color: #6b7280;">Row:</span> <span style="color: #1f2937; font-weight: 600;">${img.tray_row || '-'}</span></span>
                          <span><span style="color: #6b7280;">Pos:</span> <span style="color: #1f2937; font-weight: 600;">${img.tray_position || '-'}</span></span>
                          <span><span style="color: #6b7280;">Mag:</span> <span style="color: #1f2937; font-weight: 600;">${img.photo_magnification || '-'}</span></span>
                        </div>
                      </div>
                    `}).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Action Required Box -->
              <div class="alert-box">
                <p style="margin: 5px 0;"><strong>⚠️ Action Required:</strong></p>
                <p style="margin: 5px 0;">• Please alert the visual operator to pay attention to this defect.</p>
                <p style="margin: 5px 0;">• Please FVI do the rescreening as the recall protocol then share the result.</p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p><strong>This is an automated notification from the Quality Control & Verification System.</strong></p>
                <p>Generated at ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Build plain text email content (Enhanced with detailed information)
      const textContent = `
🚨 DEFECT NOTIFICATION
${station} Station - ${defectName} - ${formattedDate}

Dear FVI team and all,

I would like to share ${station} ${defectName} on ${model} ${version} found ${ngQty} piece${ngQty > 1 ? 's' : ''}, please see more details as below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DEFECT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Defect Type: ${defectType || 'N/A'}
Defect Name: ${defectName}
Reject Q'ty: ${ngQty} piece${ngQty > 1 ? 's' : ''}
Inspector: ${inspector || 'N/A'}
QC Name: ${qc_name || 'N/A'}
QC Leader: ${qclead_name || 'N/A'}
FVI Leader Confirm Name: ${mbr_name || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INSPECTION IDENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: ${station}
Sampling No: ${inspectionNo}
Date: ${formattedDate}
Shift: ${shift}
FY/WW: ${fy || 'N/A'}/${ww || 'N/A'}
Month/Year: ${month_year || 'N/A'}
QC Inspector: QC${qc_id || 'N/A'}
Sampling Reason: ${sampling_reason_name || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PRODUCT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lot No: ${lotno}
Item No: ${itemno}
Model: ${model} ${version}
Part Site: ${partsite || 'N/A'}
FVI Line No: ${fvilineno}
MC Line No: ${mclineno || 'N/A'}
Round: ${round || 'N/A'}
Product Tab: ${tab || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SAMPLING QUANTITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FVI Lot Qty: ${fvi_lot_qty ? fvi_lot_qty.toLocaleString() : 'N/A'}
General Sampling: ${general_sampling_qty ? general_sampling_qty.toLocaleString() : 'N/A'}
Crack Sampling: ${crack_sampling_qty ? crack_sampling_qty.toLocaleString() : 'N/A'}
Judgment: ${judgment || 'N/A'}

⚠️ ACTION REQUIRED:
• Please alert the visual operator to pay attention to this defect.
• Please FVI do the rescreening as the recall protocol then share the result.

${imageAttachments.length > 0 ? `📸 Reject Sample Images: ${imageAttachments.length} image(s) attached` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from the Quality Control & Verification System.
Generated at ${new Date().toLocaleString()}
      `.trim();

      // Get recipient email addresses from sysconfig
      const sysconfigResult = await this.db!.query(
        'SELECT defect_notification_emails FROM sysconfig ORDER BY created_at DESC LIMIT 1'
      );

      let recipientEmails = 'jatupol.sa@gmail.com'; // Default fallback

      if (sysconfigResult.rows.length > 0 && sysconfigResult.rows[0].defect_notification_emails) {
        const configuredEmails = sysconfigResult.rows[0].defect_notification_emails.trim();
        if (configuredEmails) {
          recipientEmails = configuredEmails;
          console.log(`📧 Sending defect notification to configured recipients: ${recipientEmails}`);
        } else {
          console.log(`📧 No configured emails found, using default: ${recipientEmails}`);
        }
      } else {
        console.log(`📧 No sysconfig found, using default recipient: ${recipientEmails}`);
      }

      // Send email to configured recipients with image attachments
      console.log(`📧 Attempting to send email with ${imageAttachments.length} attachments to: ${recipientEmails}`);

      const emailResult = await this.emailService.sendEmail({
        //to: 'jatupol.sa@gmail.com',
        to: recipientEmails,
        subject: subject,
        text: textContent,
        html: htmlContent,
        attachments: imageAttachments
      });

      console.log(`📧 Email send result - Success: ${emailResult.success}, MessageId: ${emailResult.messageId || 'N/A'}, Error: ${emailResult.error || 'N/A'}`);

      if (!emailResult.success) {
        console.error(`❌ Failed to send defect email: ${emailResult.error}`);
        return { success: false, message: emailResult.error || 'Failed to send email' };
      }

      console.log(`✅ Defect email sent successfully to: ${recipientEmails}`);

      return { success: true, message: 'Email sent successfully' };

    } catch (error) {
      console.error('❌ Error sending defect email:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(req: Request): number {
    // Extract user ID from session, JWT token, or request headers
    // This depends on your authentication implementation
    const user = (req as any).user || (req as any).session?.user;
    return user?.id || 0; // Default to 0 if no user found
  }

  /**
   * Format validation errors for API response
   */
  private formatValidationErrors(errors: string[]): Record<string, string[]> {
    return {
      validation: errors
    };
  }

  /**
   * Build query options from request query parameters
   */
  private buildQueryOptions(query: any): DefectDataQueryOptions {
    const options: DefectDataQueryOptions = {};

    // Pagination
    if (query.page) options.page = parseInt(query.page, 10);
    if (query.limit) options.limit = parseInt(query.limit, 10);

    // Sorting
    if (query.sortBy) options.sortBy = query.sortBy;
    if (query.sortOrder) options.sortOrder = query.sortOrder;

    // Search
    if (query.search) options.search = query.search;

    // Filters
    if (query.inspection_no) options.inspection_no = query.inspection_no;
    if (query.station) options.station = query.station;
    if (query.linevi) options.linevi = query.linevi;
    if (query.inspector) options.inspector = query.inspector;
    if (query.defect_id) options.defect_id = parseInt(query.defect_id, 10);

    // Date filters
    if (query.defect_date_from) options.defect_date_from = new Date(query.defect_date_from);
    if (query.defect_date_to) options.defect_date_to = new Date(query.defect_date_to);

    // Quantity filters
    if (query.ng_qty_min) options.ng_qty_min = parseInt(query.ng_qty_min, 10);
    if (query.ng_qty_max) options.ng_qty_max = parseInt(query.ng_qty_max, 10);

    // Boolean shortcuts
    if (query.today === 'true') options.today = true;
    if (query.yesterday === 'true') options.yesterday = true;
    if (query.this_week === 'true') options.this_week = true;
    if (query.this_month === 'true') options.this_month = true;

    return options;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a defect data controller instance
 *
 * Provides dependency injection pattern for defect data controller creation
 */
export function createDefectDataController(defectDataService: DefectDataService, db?: Pool): DefectDataController {
  return new DefectDataController(defectDataService, db);
}

// ==================== DEFAULT EXPORT ====================

export default DefectDataController;
