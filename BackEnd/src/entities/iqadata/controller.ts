// server/src/entities/iqadata/controller.ts
/**
 * IQA Data Entity Controller - SPECIAL Pattern Implementation
 * Manufacturing Quality Control System - Bulk Import & Analytics
 */

import { Response, NextFunction } from 'express';
import { GenericSpecialController } from '../../generic/entities/special-entity/generic-controller';
import {
  ISpecialController,
  SpecialEntityRequest
} from '../../generic/entities/special-entity/generic-types';

import {
  IQAData,
  CreateIQADataRequest,
  UpdateIQADataRequest,
  BulkImportRequest,
  DEFAULT_IQADATA_CONFIG
} from './types';

import { IQADataService } from './service';

// ==================== IQA DATA CONTROLLER CLASS ====================

/**
 * IQA Data Entity Controller - extends GenericSpecialController for HTTP handling
 * with custom bulk import endpoints
 */
export class IQADataController extends GenericSpecialController<IQAData> implements ISpecialController {

  protected iqaDataService: IQADataService;

  constructor(service: IQADataService) {
    super(service, DEFAULT_IQADATA_CONFIG);
    this.iqaDataService = service;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * GET /api/iqadata
   * Get all IQA data
   */
  getAll = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const searchTerm = req.query.search as string;

      console.log(`📋 Getting all IQA data [User: ${userId}]`, searchTerm ? `with search: "${searchTerm}"` : '');

      const result = await this.iqaDataService.getAll(searchTerm);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'IQA data retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to get IQA data',
          error: 'GET_ALL_FAILED'
        });
      }
    } catch (error: any) {
      console.error('❌ Error getting all IQA data:', error);
      next(error);
    }
  };

  /**
   * GET /api/iqadata/:id
   * Get IQA data by id
   */
  getByKey = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const { id } = req.params;

      console.log(`📋 Getting IQA data by id: ${id} [User: ${userId}]`);

      const result = await this.iqaDataService.getByKey({ id });

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'IQA data retrieved successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error || 'IQA data not found',
          error: 'IQA_DATA_NOT_FOUND'
        });
      }
    } catch (error: any) {
      console.error('❌ Error getting IQA data by key:', error);
      next(error);
    }
  };

  /**
   * POST /api/iqadata
   * Create new IQA data
   */
  create = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const createData = req.body as CreateIQADataRequest;

      console.log(`🔧 Creating IQA data [User: ${userId}]`);

      const result = await this.iqaDataService.create(createData, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'IQA data created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to create IQA data',
          error: 'CREATE_FAILED'
        });
      }
    } catch (error: any) {
      console.error('❌ Error creating IQA data:', error);
      next(error);
    }
  };

  /**
   * PUT /api/iqadata/:id
   * Update IQA data by id
   */
  update = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const { id } = req.params;
      const updateData = req.body as UpdateIQADataRequest;

      console.log(`🔧 Updating IQA data: ${id} [User: ${userId}]`);

      const result = await this.iqaDataService.update({ id }, updateData, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'IQA data updated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to update IQA data',
          error: 'UPDATE_FAILED'
        });
      }
    } catch (error: any) {
      console.error('❌ Error updating IQA data:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/iqadata/:id
   * Delete IQA data by id
   */
  delete = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const { id } = req.params;

      console.log(`🗑️ Deleting IQA data: ${id} [User: ${userId}]`);

      const result = await this.iqaDataService.delete({ id }, (req as any).user ?? null, req);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'IQA data deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to delete IQA data',
          error: 'DELETE_FAILED'
        });
      }
    } catch (error: any) {
      console.error('❌ Error deleting IQA data:', error);
      next(error);
    }
  };

  // ==================== IQA-SPECIFIC ENDPOINTS ====================

  /**
   * POST /api/iqadata/bulk
   * Bulk import IQA data from Excel
   */
  bulkImport = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const request: BulkImportRequest = req.body;

      console.log('🔧 IQADataController.bulkImport called:', {
        userId,
        recordCount: request?.data?.length || 0
      });

      // Validate request
      if (!request.data || !Array.isArray(request.data)) {
        res.status(400).json({
          success: false,
          message: 'Request body must contain a "data" array',
          error: 'INVALID_REQUEST'
        });
        return;
      }

      if (request.data.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Data array cannot be empty',
          error: 'EMPTY_DATA'
        });
        return;
      }

      // Execute bulk import
      const result = await this.iqaDataService.bulkImport(request, userId);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Bulk import completed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Bulk import failed',
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in bulkImport:', error);
      next(error);
    }
  };

  /**
   * POST /api/iqadata/upsert
   * Upsert (Insert or Update) IQA data from Excel
   * RULE 1: If data in all columns is same as existing, update it
   * RULE 2: Do not insert record if first column (FW) is blank or null
   */
  upsert = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const request: BulkImportRequest = req.body;

      console.log('🔧 IQADataController.upsert called:', {
        userId,
        recordCount: request?.data?.length || 0
      });

      // Debug: Log first record to verify data from client
      if (request?.data?.length > 0) {
        const firstRecord = request.data[0];
        console.log('🔍 DEBUG - First record from client:', {
          lotno: firstRecord.lotno,
          qty: firstRecord.qty,
          age: firstRecord.age,
          model: firstRecord.model,
          location: firstRecord.location,
          expense: firstRecord.expense,
          date_iqa: firstRecord.date_iqa
        });
      }

      // Validate request
      if (!request.data || !Array.isArray(request.data)) {
        res.status(400).json({
          success: false,
          message: 'Request body must contain a "data" array',
          error: 'INVALID_REQUEST'
        });
        return;
      }

      if (request.data.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Data array cannot be empty',
          error: 'EMPTY_DATA'
        });
        return;
      }

      // Execute upsert
      const result = await this.iqaDataService.upsert(request, userId);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Upsert completed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Upsert failed',
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in upsert:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/iqadata/all
   * Delete all IQA data records
   */
  deleteAll = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;

      console.log('🔧 IQADataController.deleteAll called:', { userId });

      // Execute delete all
      const result = await this.iqaDataService.deleteAll(userId, (req as any).user ?? null, req);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: { deletedCount: result.data },
          message: 'All IQA data deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to delete all IQA data',
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in deleteAll:', error);
      next(error);
    }
  };

  /**
   * POST /api/iqadata/bulk-delete
   * Bulk delete IQA data records by IDs
   */
  bulkDelete = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const { ids } = req.body;

      console.log('🔧 IQADataController.bulkDelete called:', { userId, idCount: ids?.length || 0 });

      // Validate request
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Request body must contain a non-empty "ids" array',
          error: 'INVALID_REQUEST'
        });
        return;
      }

      // Execute bulk delete
      const result = await this.iqaDataService.bulkDelete(ids, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: `Successfully deleted ${result.data.deletedCount} record(s)`
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to bulk delete IQA data',
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in bulkDelete:', error);
      next(error);
    }
  };

  /**
   * GET /api/iqadata/distinct-fy
   * Get distinct FY values for filter dropdown
   */
  getDistinctFY = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔧 IQADataController.getDistinctFY called');

      const result = await this.iqaDataService.getDistinctFY();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Distinct FY values retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to retrieve distinct FY values',
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in getDistinctFY:', error);
      next(error);
    }
  };

  /**
   * GET /api/iqadata/distinct-ww
   * Get distinct WW values for filter dropdown
   * Optional query parameter: fy (to filter WW by fiscal year)
   */
  getDistinctWW = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fy = req.query.fy as string | undefined;

      console.log('🔧 IQADataController.getDistinctWW called', fy ? `with FY filter: ${fy}` : '');

      const result = await this.iqaDataService.getDistinctWW(fy);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Distinct WW values retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to retrieve distinct WW values',
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in getDistinctWW:', error);
      next(error);
    }
  };
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create IQA Data Controller
 */
export function createIQADataController(iqaDataService: IQADataService): IQADataController {
  return new IQADataController(iqaDataService);
}

// ==================== DEFAULT EXPORT ====================

export default IQADataController;
