// server/src/entities/inf/inf-lotinput/controller.ts
// ===== SIMPLIFIED INF LOT INPUT CONTROLLER =====
// Data Display Only - HTTP Request Handling for Search and Retrieval
// Sampling Inspection Control System - Simplified Read-Only Controller

import { Request, Response, NextFunction } from 'express';
import {
  InfLotInputQueryParams
} from './types';
import { InfLotInputService } from './service';
import { formatDateLocal } from '../../../utils/dateTimeUtils';

/**
 * Simplified INF Lot Input Controller - Focus on HTTP handling for data retrieval only
 */
export class InfLotInputController {
  private service: InfLotInputService;

  constructor(service: InfLotInputService) {
    this.service = service;
  }

  // ==================== CORE HTTP ENDPOINTS ====================

  /**
   * GET /api/inf-lotinput
   * Get all records with filtering and pagination
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-lotinput - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: InfLotInputQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,

        // Search parameters
        lotNoSearch: req.query.lotNoSearch as string,
        itemNoSearch: req.query.itemNoSearch as string,
        globalSearch: req.query.globalSearch as string,

        // Filter parameters
        partSite: req.query.partSite as string,
        lineNo: req.query.lineNo as string,
        model: req.query.model as string,
        version: req.query.version as string,
        status: req.query.status as 'ALL' | 'IN_PROGRESS' | 'FINISHED' | 'EXPIRED',

        // Date parameters
        inputDateFrom: req.query.inputDateFrom as string,
        inputDateTo: req.query.inputDateTo as string,

        // Legacy support
        lotNo: req.query.lotNo as string,
        itemNo: req.query.itemNo as string,
        search: req.query.search as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof InfLotInputQueryParams] === undefined) {
          delete queryParams[key as keyof InfLotInputQueryParams];
        }
      });

      const result = await this.service.getAll(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/inf-lotinput - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-lotinput - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.getAll:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-lotinput/lot/:lotNumber
   * Get records by lot number
   */
  getByLotNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lotNumber } = req.params;
      console.log(`📋 GET /api/inf-lotinput/lot/${lotNumber}`);

      const result = await this.service.getByLotNumber(lotNumber);

      if (result.success) {
        console.log(`✅ GET /api/inf-lotinput/lot/${lotNumber} - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-lotinput/lot/${lotNumber} - Error: ${result.message}`);
        res.status(404).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.getByLotNumber:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-lotinput/statistics
   * Get statistics for dashboard
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/inf-lotinput/statistics`);

      const result = await this.service.getStatistics();

      if (result.success) {
        console.log(`✅ GET /api/inf-lotinput/statistics - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-lotinput/statistics - Error: ${result.message}`);
        res.status(500).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.getStatistics:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-lotinput/filter-options
   * Get available filter options for dropdowns
   */
  getFilterOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔧 GET /api/inf-lotinput/filter-options`);

      const result = await this.service.getFilterOptions();

      if (result.success) {
        console.log(`✅ GET /api/inf-lotinput/filter-options - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-lotinput/filter-options - Error: ${result.message}`);
        res.status(500).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.getFilterOptions:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-lotinput/health
   * Health check endpoint
   */
  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🏥 GET /api/inf-lotinput/health`);

      const result = await this.service.healthCheck();

      if (result.success) {
        console.log(`✅ GET /api/inf-lotinput/health - Healthy`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-lotinput/health - Unhealthy: ${result.message}`);
        res.status(503).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.getHealth:', error);
      res.status(503).json({
        success: false,
        message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
        service: 'inf-lotinput'
      });
    }
  };

  // ==================== UTILITY METHODS ====================

  /**
   * Parse integer with default value
   */
  private parseIntWithDefault(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate required parameters
   */
  private validateRequired(params: Record<string, any>, requiredFields: string[]): string | null {
    for (const field of requiredFields) {
      if (!params[field]) {
        return `Missing required parameter: ${field}`;
      }
    }
    return null;
  }

  // ==================== IMPORT ENDPOINTS ====================

  /**
   * GET/POST /api/inf-lotinput/sync
   * Check if import should run based on last import time and sync interval
   * GET: Just checks status (autoImport=false)
   * POST: Checks and imports if needed (autoImport=true, forceSync available)
   */
  sync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔍 ${req.method} /api/inf-lotinput/sync`);

      // Extract parameters from body (POST) or query (GET)
      // For POST, merge query params with body (query params take precedence for flexibility)
      const params = req.method === 'POST'
        ? { ...req.body, ...req.query }  // Allow both body and query params for POST
        : req.query;
      const { dateFrom, dateTo, forceSync } = params;

      // GET = just check status (for login trigger)
      // POST = check and auto-import if needed (for manual sync button)
      const autoImport = req.method === 'POST';

      console.log(`📋 Sync params:`, { dateFrom, dateTo, forceSync, autoImport });

      const result = await this.service.sync(autoImport, {
        dateFrom,
        dateTo,
        forceSync: forceSync === true || forceSync === 'true'
      });

      if (result.success) {
        console.log(`✅ ${req.method} /api/inf-lotinput/sync - Success: ${result.shouldImport}`);
        res.status(200).json(result);
      } else {
        console.log(`❌ ${req.method} /api/inf-lotinput/sync - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.sync:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-lotinput/import
   * Import data from MSSQL database
   */
  importFromMssql = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tableName, dateFrom, dateTo } = req.body;
      console.log(`📥 POST /api/inf-lotinput/import - Params:`, { tableName, dateFrom, dateTo });

      const result = await this.service.importFromMssql({
        tableName,
        dateFrom,
        dateTo
      });

      if (result.success) {
        console.log(`✅ POST /api/inf-lotinput/import - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-lotinput/import - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.importFromMssql:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-lotinput/import/today
   * Import today's data from MSSQL
   */
  importTodayData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const today = formatDateLocal(new Date());
      console.log(`📥 POST /api/inf-lotinput/import/today - Importing data for ${today}`);

      const result = await this.service.importFromMssql({
        dateFrom: today,
        dateTo: today
      });

      if (result.success) {
        console.log(`✅ POST /api/inf-lotinput/import/today - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-lotinput/import/today - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.importTodayData:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-lotinput/import/range
   * Import data by date range from MSSQL
   */
  importDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { dateFrom, dateTo } = req.body;
      console.log(`📥 POST /api/inf-lotinput/import/range - Params:`, { dateFrom, dateTo });

      // Validate required parameters
      if (!dateFrom || !dateTo) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: dateFrom and dateTo are required'
        });
        return;
      }

      const result = await this.service.importFromMssql({
        dateFrom,
        dateTo
      });

      if (result.success) {
        console.log(`✅ POST /api/inf-lotinput/import/range - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-lotinput/import/range - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfLotInputController.importDateRange:', error);
      next(error);
    }
  };

  // ==================== EXCLUDE KEYWORDS & CLEANUP ====================

  getExcludeKeywords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getExcludeKeywords();
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error in getExcludeKeywords:', error);
      next(error);
    }
  };

  updateExcludeKeywords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { keywords } = req.body;
      if (keywords === undefined) {
        res.status(400).json({ success: false, message: 'Missing required field: keywords' });
        return;
      }
      const result = await this.service.updateExcludeKeywords(keywords);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error in updateExcludeKeywords:', error);
      next(error);
    }
  };

  cleanupByKeywords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🧹 POST /api/inf-lotinput/cleanup');
      const result = await this.service.cleanupByKeywords();
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error in cleanupByKeywords:', error);
      next(error);
    }
  };
}

export default InfLotInputController;