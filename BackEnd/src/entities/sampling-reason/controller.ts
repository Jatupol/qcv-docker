// server/src/entities/sampling-reason/controller.ts
/* Sampling Reason Entity Controller - Complete Separation Entity Architecture
 * SERIAL ID Pattern Implementation
 * HTTP Request/Response Handling for Sampling Reason Entity
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSerialIdController from SERIAL ID pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained HTTP request/response handling
 * ✅ Manufacturing domain-specific endpoint logic
 * 
 * Controller Responsibilities:
 * - HTTP request parsing and validation
 * - Response formatting and status codes
 * - Error handling and logging
 * - Request tracking and middleware integration
 */

import { Response, NextFunction } from 'express';
import {
  ISerialIdController,
  SerialIdEntityRequest,
  SerialIdApiResponse
} from '../../generic/entities/serial-id-entity/generic-types';
import { GenericSerialIdController } from '../../generic/entities/serial-id-entity/generic-controller';
import {
  SamplingReason,
  CreateSamplingReasonData,
  UpdateSamplingReasonData,
  SamplingReasonQueryOptions,
  DEFAULT_SAMPLING_REASON_CONFIG,
  isCreateSamplingReasonData,
  isUpdateSamplingReasonData
} from './types';
import type { SamplingReasonService } from './service';

/**
 * Sampling Reason Controller Implementation
 * 
 * Extends GenericSerialIdController with sampling reason-specific HTTP handling.
 * Handles requests for /api/sampling-reasons endpoints.
 */
export class SamplingReasonController extends GenericSerialIdController<SamplingReason> implements ISerialIdController {
  
  protected samplingReasonService: SamplingReasonService;

  constructor(service: SamplingReasonService) {
    super(service, DEFAULT_SAMPLING_REASON_CONFIG);
    this.samplingReasonService = service;
  }

  // ==================== CRUD ENDPOINTS ====================
  // Note: Base CRUD endpoints inherited from GenericSerialIdController
  // - create(req, res, next): POST /api/sampling-reasons
  // - getById(req, res, next): GET /api/sampling-reasons/:id
  // - getAll(req, res, next): GET /api/sampling-reasons
  // - update(req, res, next): PUT /api/sampling-reasons/:id
  // - delete(req, res, next): DELETE /api/sampling-reasons/:id

  // ==================== ENHANCED ENDPOINTS ====================

  // ==================== PRIVATE HELPER METHODS ====================

   
  /**
   * Check name uniqueness
   * GET /api/sampling-reasons/check-uniqueness/:name
   * 
   * Manufacturing domain validation endpoint.
   */
  checkNameUniqueness = async (
    req: SerialIdEntityRequest<{ name: string }, {}, { excludeId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate name parameter
      const name = req.params.name?.trim();
      if (!name || name.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid name parameter',
          message: 'Name parameter is required and cannot be empty',
          meta: {
            requestId: (req as any).requestId,
            timestamp: new Date().toISOString(),
            provided: req.params.name
          }
        } as SerialIdApiResponse);
        return;
      }

      // Parse optional excludeId parameter
      const excludeId = req.query.excludeId ? parseInt(req.query.excludeId as string) : undefined;

      // Check name uniqueness via service
      const result = await this.samplingReasonService.checkNameUniqueness(name, excludeId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: { isUnique: result.data },
          message: 'Name uniqueness check completed successfully',
          meta: {
            requestId: (req as any).requestId,
            timestamp: new Date().toISOString(),
            operation: 'checkNameUniqueness',
            name: name,
            excludeId: excludeId
          }
        } as SerialIdApiResponse);
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to check name uniqueness',
          meta: {
            requestId: (req as any).requestId,
            timestamp: new Date().toISOString(),
            operation: 'checkNameUniqueness',
            name: name
          }
        } as SerialIdApiResponse);
      }

    } catch (error: any) {
      console.error('Name uniqueness check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while checking name uniqueness',
        meta: {
          requestId: (req as any).requestId,
          timestamp: new Date().toISOString(),
          operation: 'checkNameUniqueness',
          name: req.params.name
        }
      } as SerialIdApiResponse);
    }
  };

 
}

/**
 * Factory function to create a sampling reason controller instance
 * 
 * Factory pattern for dependency injection.
 */
export function createSamplingReasonController(service: SamplingReasonService): SamplingReasonController {
  return new SamplingReasonController(service);
}

export default SamplingReasonController;

