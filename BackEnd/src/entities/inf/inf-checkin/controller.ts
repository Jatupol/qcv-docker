// server/src/entities/inf/inf-checkin/controller.ts
// ===== SIMPLIFIED INF CHECKIN CONTROLLER =====
// Data Display Only - HTTP Request Handling for Search and Retrieval
// Manufacturing Quality Control System - Simplified Read-Only Controller

import { Request, Response, NextFunction } from 'express';
import {
  InfCheckinQueryParams
} from './types';
import { InfCheckinService } from './service';
import { formatDateLocal } from '../../../utils/dateTimeUtils';

/**
 * Simplified INF CheckIn Controller - Focus on HTTP handling for data retrieval only
 */
export class InfCheckinController {
  private service: InfCheckinService;

  constructor(service: InfCheckinService) {
    this.service = service;
  }

  // ==================== CORE HTTP ENDPOINTS ====================

  /**
   * GET /api/inf-checkin
   * Get all records with filtering and pagination
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-checkin - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: InfCheckinQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,

        // Search parameters
        username: req.query.username as string,
        usernameSearch: req.query.usernameSearch as string,
        oprname: req.query.oprname as string,
        lineNoSearch: req.query.lineNoSearch as string,
        globalSearch: req.query.globalSearch as string,

        // Filter parameters
        line_no_id: req.query.line_no_id as string,
        work_shift_id: req.query.work_shift_id as string,
        group_code: req.query.group_code as string,
        team: req.query.team as string,
        status: req.query.status as 'all' | 'working' | 'checked_out',

        // Date parameters
        createdOnFrom: req.query.createdOnFrom as string,
        createdOnTo: req.query.createdOnTo as string,

        // Legacy support
        lineId: req.query.lineId as string,
        shiftId: req.query.shiftId as string,
        search: req.query.search as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof InfCheckinQueryParams] === undefined) {
          delete queryParams[key as keyof InfCheckinQueryParams];
        }
      });

      const result = await this.service.getAll(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getAll:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/user/:username
   * Get records by username
   */
  getByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;
      console.log(`📋 GET /api/inf-checkin/user/${username}`);

      const result = await this.service.getByUsername(username);

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/user/${username} - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/user/${username} - Error: ${result.message}`);
        res.status(404).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getByUsername:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/line/:lineId
   * Get records by line ID
   */
  getByLineId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lineId } = req.params;
      console.log(`📋 GET /api/inf-checkin/line/${lineId}`);

      const result = await this.service.getByLineId(lineId);

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/line/${lineId} - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/line/${lineId} - Error: ${result.message}`);
        res.status(404).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getByLineId:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/active
   * Get currently active workers
   */
  getActiveWorkers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-checkin/active`);

      const result = await this.service.getActiveWorkers();

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/active - Success: ${result.data?.length || 0} active workers`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/active - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getActiveWorkers:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/statistics
   * Get statistics for dashboard
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/inf-checkin/statistics`);

      const result = await this.service.getStatistics();

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/statistics - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/statistics - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getStatistics:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/filter-options
   * Get filter options for dropdowns
   */
  getFilterOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-checkin/filter-options`);

      const result = await this.service.getFilterOptions();

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/filter-options - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/filter-options - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getFilterOptions:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/search
   * Search records by multiple criteria
   */
  searchRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔍 GET /api/inf-checkin/search - Query params:`, req.query);

      const searchParams = {
        searchTerm: req.query.searchTerm as string,
        username: req.query.username as string,
        oprname: req.query.oprname as string,
        lineId: req.query.lineId as string,
        groupCode: req.query.groupCode as string,
        team: req.query.team as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string
      };

      // Remove undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key as keyof typeof searchParams] === undefined) {
          delete searchParams[key as keyof typeof searchParams];
        }
      });

      const result = await this.service.searchRecords(searchParams);

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/search - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/search - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.searchRecords:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/fvi-line-mapping
   * Get FVI line mapping for production line visualization
   */
  getFVILineMapping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { line, date, shift } = req.query;
      console.log(`📋 GET /api/inf-checkin/fvi-line-mapping - Params:`, { line, date, shift });

      // Validate required parameters
      if (!line || !date || !shift) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: line, date, and shift are required'
        });
        return;
      }

      const result = await this.service.getFVILineMapping({
        line: line as string,
        date: date as string,
        shift: shift as string
      });

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/fvi-line-mapping - Success: ${result.data?.length || 0} mappings`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/fvi-line-mapping - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getFVILineMapping:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/fvi-lines-by-date
   * Get list of FVI lines by date
   */
  getFVILinesByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date } = req.query;
      console.log(`📋 GET /api/inf-checkin/fvi-lines-by-date - Date:`, date);

      // Validate required parameter
      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: date is required'
        });
        return;
      }

      const result = await this.service.getFVILinesByDate(date as string);

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/fvi-lines-by-date - Success: ${result.data?.length || 0} lines`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/fvi-lines-by-date - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getFVILinesByDate:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/distinct-lines
   * Get distinct FVI lines (all lines with line_no_id length between 1 and 5)
   */
  getDistinctFVILines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-checkin/distinct-lines`);

      const result = await this.service.getDistinctFVILines();

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/distinct-lines - Success: ${result.data?.length || 0} lines`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/distinct-lines - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getDistinctFVILines:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/operators?gr_code=XXX
   * Get unique operators (username and oprname) for autocomplete
   * Query params:
   *   - gr_code: Optional group code filter (if blank, show all)
   */
  getOperators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const gr_code = req.query.gr_code as string | undefined;

      console.log(`📋 GET /api/inf-checkin/operators - gr_code: ${gr_code || 'all'}`);

      const result = await this.service.getOperators(gr_code);

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/operators - Success: ${result.data?.length || 0} operators`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/operators - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getOperators:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/fvi-leaders
   * Get FVI leader operators (username and oprname) for autocomplete
   * Used for QC Leader/FVI Leader Confirm Name field
   */
  getFVILeaderOperators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/inf-checkin/fvi-leaders`);

      const result = await this.service.getFVILeaderOperators();

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/fvi-leaders - Success: ${result.data?.length || 0} FVI leaders`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/fvi-leaders - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.getFVILeaderOperators:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/health
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🏥 GET /api/inf-checkin/health`);

      const result = await this.service.healthCheck();

      if (result.success) {
        console.log(`✅ GET /api/inf-checkin/health - Healthy`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/inf-checkin/health - Unhealthy: ${result.message}`);
        res.status(503).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.healthCheck:', error);
      res.status(503).json({
        success: false,
        message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
        service: 'inf-checkin'
      });
    }
  };

  // ==================== PLACEHOLDER METHODS ====================

  /**
   * POST /api/inf-checkin/import
   * Import data from MSSQL database
   */
  importFromMssql = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tableName, dateFrom, dateTo } = req.body;
      console.log(`📥 POST /api/inf-checkin/import - Params:`, { tableName, dateFrom, dateTo });

      const result = await this.service.importFromMssql({
        tableName,
        dateFrom,
        dateTo
      });

      if (result.success) {
        console.log(`✅ POST /api/inf-checkin/import - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-checkin/import - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.importFromMssql:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-checkin/import/today
   * Import today's data from MSSQL
   */
  importTodayData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const today = formatDateLocal(new Date());
      console.log(`📥 POST /api/inf-checkin/import/today - Importing data for ${today}`);

      const result = await this.service.importFromMssql({
        dateFrom: today,
        dateTo: today
      });

      if (result.success) {
        console.log(`✅ POST /api/inf-checkin/import/today - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-checkin/import/today - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.importTodayData:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-checkin/import/range
   * Import data by date range from MSSQL
   */
  importDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { dateFrom, dateTo } = req.body;
      console.log(`📥 POST /api/inf-checkin/import/range - Params:`, { dateFrom, dateTo });

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
        console.log(`✅ POST /api/inf-checkin/import/range - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-checkin/import/range - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.importDateRange:', error);
      next(error);
    }
  };

  /**
   * GET /api/inf-checkin/sync
   * Check if import should run based on last import time and sync interval
   * Only returns status without actually running the import
   */
  checkSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔍 GET /api/inf-checkin/sync - Checking sync status`);

      // Call sync with autoImport=false to only check status
      const result = await this.service.sync(false);

      console.log(`✅ GET /api/inf-checkin/sync - Success: shouldImport=${result.shouldImport}`);
      res.status(200).json(result);

    } catch (error) {
      console.error('❌ Error in InfCheckinController.checkSync:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-checkin/sync
   * Check sync status and automatically run import if needed
   * If forceSync is true (manual import), bypass time check
   */
  runSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔄 POST /api/inf-checkin/sync - Running sync with auto-import`);

      // Allow both body and query params for POST (query params take precedence for flexibility)
      const params = { ...req.body, ...req.query };
      const { dateFrom, dateTo, forceSync } = params;

      console.log(`📋 Sync params:`, { dateFrom, dateTo, forceSync });

      // Call sync with autoImport=true and date options including forceSync
      const result = await this.service.sync(true, { dateFrom, dateTo, forceSync: forceSync === true || forceSync === 'true' });

      if (result.success) {
        console.log(`✅ POST /api/inf-checkin/sync - Success: ${result.message}`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-checkin/sync - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.runSync:', error);
      next(error);
    }
  };

  /**
   * POST /api/inf-checkin/import/auto
   * Auto-import new data from MSSQL (continues from last CreatedOn)
   */
  importAuto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📥 POST /api/inf-checkin/import/auto - Auto-importing new records`);

      // Call importFromMssql without parameters to auto-continue from last CreatedOn
      const result = await this.service.importFromMssql();

      if (result.success) {
        console.log(`✅ POST /api/inf-checkin/import/auto - Success: ${result.imported} records imported`);
        res.status(200).json(result);
      } else {
        console.log(`❌ POST /api/inf-checkin/import/auto - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinController.importAuto:', error);
      next(error);
    }
  };
}

export default InfCheckinController;

/*
=== SIMPLIFIED INF CHECKIN CONTROLLER FEATURES ===

SIMPLIFIED ARCHITECTURE:
✅ Direct controller class without complex inheritance
✅ Simple method signatures matching inf-lotinput pattern
✅ Focus on HTTP handling for data retrieval only
✅ No complex generic patterns or abstractions

CORE HTTP ENDPOINTS:
✅ getAll() - GET /api/inf-checkin with filtering and pagination
✅ getByUsername() - GET /api/inf-checkin/user/:username
✅ getByLineId() - GET /api/inf-checkin/line/:lineId
✅ getActiveWorkers() - GET /api/inf-checkin/active
✅ getStatistics() - GET /api/inf-checkin/statistics
✅ getFilterOptions() - GET /api/inf-checkin/filter-options
✅ searchRecords() - GET /api/inf-checkin/search
✅ healthCheck() - GET /api/inf-checkin/health

REQUEST HANDLING:
✅ Query parameter extraction and validation
✅ Proper HTTP status codes
✅ Comprehensive error handling
✅ Detailed logging for debugging
✅ Standard JSON response format

MANUFACTURING FOCUS:
✅ Worker check-in/out tracking
✅ Production line monitoring
✅ Shift and team management
✅ Real-time active worker identification

The refactored controller follows the exact same pattern as inf-lotinput
with simple, direct HTTP endpoint handling and consistent error responses.
*/