// server/src/entities/parts/controller.ts
/**
 * SIMPLIFIED: Parts Entity Controller - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import { Request, Response, NextFunction } from 'express';
import { GenericSpecialController } from '../../generic/entities/special-entity/generic-controller';
import {
  ISpecialController,
  SpecialEntityRequest
} from '../../generic/entities/special-entity/generic-types';

import {
  Parts,
  CreatePartsRequest,
  UpdatePartsRequest,
  PartsEntityRequest,
  PARTS_ENTITY_CONFIG
} from './types';

import { PartsService } from './service';

// ==================== SIMPLE PARTS CONTROLLER CLASS ====================

/**
 * Simple Parts Entity Controller - extends GenericSpecialController for HTTP handling
 */
export class PartsController extends GenericSpecialController<Parts> implements ISpecialController {

  protected partsService: PartsService;

  constructor(service: PartsService) {
    super(service, PARTS_ENTITY_CONFIG);
    this.partsService = service;
  }

  // ==================== REQUIRED ISPECIALCONTROLLER METHODS ====================

  /**
   * GET /api/parts
   * Get all parts with optional search and pagination
   */
  getAll = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const searchTerm = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

      console.log(`📋 Getting all parts [User: ${userId}]`, {
        search: searchTerm || 'none',
        page,
        limit
      });

      const result = await this.partsService.getAll(searchTerm, page, limit);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result,
          message: 'Parts retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to get parts',
          error: 'GET_ALL_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error getting all parts:', error);
      next(error);
    }
  };

  /**
   * GET /api/parts/:partno
   * Get part by partno
   */
  getByKey = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { partno } = req.params;

      console.log(`📋 Getting part by partno: ${partno} [User: ${userId}]`);

      const result = await this.partsService.getByKey({ partno });

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Part retrieved successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Part not found',
          error: 'PART_NOT_FOUND'
        });
      }
    } catch (error) {
      console.error('❌ Error getting part by key:', error);
      next(error);
    }
  };

  /**
   * POST /api/parts/import
   * Import new part
   */
  import = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const createData = req.body as CreatePartsRequest;

      console.log(`🔧 Creating part:`, createData, `[User: ${userId}]`);

      const result = await this.partsService.import(createData, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Part created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to create part',
          error: 'CREATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error creating part:', error);
      next(error);
    }
  };

  /**
   * POST /api/parts
   * Create new part
   */
  create = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const createData = req.body as CreatePartsRequest;

      console.log(`🔧 Creating part:`, createData, `[User: ${userId}]`);

      const result = await this.partsService.create(createData, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Part created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to create part',
          error: 'CREATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error creating part:', error);
      next(error);
    }
  };

  /**
   * PUT /api/parts/:partno
   * Update part by partno
   */
  update = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { partno } = req.params;
      const updateData = req.body as UpdatePartsRequest;

      console.log(`🔧 Updating part: ${partno}`, updateData, `[User: ${userId}]`);

      const result = await this.partsService.update({ partno }, updateData, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Part updated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to update part',
          error: 'UPDATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error updating part:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/parts/:partno
   * Delete part by partno
   */
  delete = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { partno } = req.params;

      console.log(`🗑️ Deleting part: ${partno} [User: ${userId}]`);

      const result = await this.partsService.delete({ partno }, (req as any).user ?? null, req);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Part deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to delete part',
          error: 'DELETE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error deleting part:', error);
      next(error);
    }
  };
  /*
   * SYSNC /api/parts/sysnc
   * Synchronize data method from  inf_lotinput 
   */
  sync = async (res: Response, next: NextFunction): Promise<void> => {
    try {

      console.log(`🗑️ Synchronize data part`);

      const result = await this.partsService.synceData();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Part Synchronize data successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to Synchronize data part',
          error: 'SYSNC_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error Synchronize data part:', error);
      next(error);
    }
  };
  // ==================== ADDITIONAL UTILITY METHODS ====================

  /**
   * GET /api/parts/customer-sites
   * Get available customer-sites for parts form
   */
  getCustomerSites = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.partsService.getCustomerSites();

      res.status(200).json({
        success: true,
        data: result?.rows || [],
        message: 'Customer-sites retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting customer-sites:', error);
      next(error);
    }
  };

  /**
   * GET /api/parts/health
   * Health check endpoint
   */
  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Parts service is healthy',
        timestamp: new Date().toISOString(),
        service: 'parts'
      });
    } catch (error) {
      console.error('❌ Error in parts health check:', error);
      next(error);
    }
  };

  /**
   * GET /api/parts/statistics
   * Get basic parts statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user!.id;

      console.log(`📊 Getting parts statistics [User: ${userId}]`);

      // Get all parts for basic statistics
      const result = await this.partsService.getAll();

      if (result.success && result.data) {
        const parts = result.data;
        const statistics = {
          total: parts.length,
          active: parts.filter(p => p.is_active).length,
          inactive: parts.filter(p => !p.is_active).length,
          byCustomer: this.groupByField(parts, 'customer'),
          byProductionSite: this.groupByField(parts, 'production_site'),
          byProductType: this.groupByField(parts, 'product_type')
        };

        res.status(200).json({
          success: true,
          data: statistics,
          message: 'Parts statistics retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to get parts statistics',
          error: 'STATISTICS_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error getting parts statistics:', error);
      next(error);
    }
  };

  // ==================== HELPER METHODS ====================

  /**
   * Group parts by a specific field for statistics
   */
  private groupByField(parts: Parts[], field: keyof Parts): Array<{ key: string; count: number }> {
    const groups = parts.reduce((acc, part) => {
      const key = String(part[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Parts controller instance
 */
export function createPartsController(service: PartsService): PartsController {
  return new PartsController(service);
}

export default PartsController;