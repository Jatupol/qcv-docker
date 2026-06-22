// server/src/entities/inf/inf-useroperation/controller.ts
// ===== INF USER OPERATION CONTROLLER =====
// HTTP Request Handling for User Operation Data and MSSQL Sync
// User/Operator Management Interface

import { Request, Response, NextFunction } from 'express';
import { InfUserOperationQueryParams } from './types';
import { InfUserOperationService } from './service';

/**
 * INF User Operation Controller - HTTP handling for data retrieval and sync
 */
export class InfUserOperationController {
  private service: InfUserOperationService;

  constructor(service: InfUserOperationService) {
    this.service = service;
  }

  // ==================== CORE HTTP ENDPOINTS ====================

  /**
   * GET /api/inf-useroperation
   * Get all records with filtering and pagination
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-useroperation - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: InfUserOperationQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,

        // Search parameters
        usernameSearch: req.query.usernameSearch as string,
        operatorNameSearch: req.query.operatorNameSearch as string,
        globalSearch: req.query.globalSearch as string,

        // Filter parameters
        roleCode: req.query.roleCode as string,
        lineNoId: req.query.lineNoId as string,
        workShiftId: req.query.workShiftId as string,

        // Boolean filters
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        isSuperAdmin: req.query.isSuperAdmin !== undefined ? req.query.isSuperAdmin === 'true' : undefined,
        isMrb: req.query.isMrb !== undefined ? req.query.isMrb === 'true' : undefined
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof InfUserOperationQueryParams] === undefined) {
          delete queryParams[key as keyof InfUserOperationQueryParams];
        }
      });

      const result = await this.service.getAll(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/inf-useroperation - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-useroperation - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfUserOperationController.getAll:', error);
      next(error);
    }
  };


  /**
   * GET /api/inf-useroperation/:line_no_id
   * Get record by line_no_id
   */
  getByLineNoId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { line_no_id } = req.params;
      console.log(`📋 GET /api/inf-useroperation/${line_no_id}`);

      const result = await this.service.getByLineNoId(line_no_id);

      if (result.success) {
        console.log(`✅ GET /api/inf-useroperation/${line_no_id} - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-useroperation/${line_no_id} - Error: ${result.message}`);
        res.status(404).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfUserOperationController.getByLineNoId:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-useroperation/statistics
   * Get statistics for dashboard
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/inf-useroperation/statistics`);

      const result = await this.service.getStatistics();

      if (result.success) {
        console.log(`✅ GET /api/inf-useroperation/statistics - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-useroperation/statistics - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfUserOperationController.getStatistics:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-useroperation/filter-options
   * Get filter options for dropdowns
   */
  getFilterOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-useroperation/filter-options`);

      const result = await this.service.getFilterOptions();

      if (result.success) {
        console.log(`✅ GET /api/inf-useroperation/filter-options - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-useroperation/filter-options - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfUserOperationController.getFilterOptions:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-useroperation/health
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🏥 GET /api/inf-useroperation/health`);

      const result = await this.service.healthCheck();

      if (result.success) {
        console.log(`✅ GET /api/inf-useroperation/health - Healthy`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-useroperation/health - Unhealthy: ${result.message}`);
        res.status(503).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfUserOperationController.healthCheck:', error);
      res.status(503).json({
        success: false,
        message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
        service: 'inf-useroperation'
      });
    }
  };

  // ==================== SYNC ENDPOINTS ====================

  /**
   * POST /api/inf-useroperation/sync
   * Manually sync data from MSSQL database
   */
  sync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tableName, dateFrom, dateTo } = req.body;
      console.log(`🔄 POST /api/inf-useroperation/sync - Params:`, { tableName, dateFrom, dateTo });

      const result = await this.service.syncFromMssql({
        tableName,
        dateFrom,
        dateTo
      });

      if (result.success) {
        console.log(`✅ POST /api/inf-useroperation/sync - Success:`, result.data);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-useroperation/sync - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfUserOperationController.sync:', error);
      next(error);
    }
  };
}

export default InfUserOperationController;
