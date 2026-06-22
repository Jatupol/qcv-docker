// server/src/entities/defectdatacustomer/service.ts
/**
 * DefectDataCustomer Entity Service - Complete Separation Entity Architecture
 * SPECIAL Pattern Implementation
 *
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSpecialService for maximum code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained defectdatacustomer business logic layer
 * ✅ Manufacturing Quality Control domain optimized
 *
 * Database Schema Compliance:
 * - Table: defectdatacustomer
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SPECIAL Entity (SERIAL ID with complex structure)
 * - API Routes: /api/defectdatacustomer/:id
 */

import { GenericSpecialService } from '../../generic/entities/special-entity/generic-service';
import {
  SpecialServiceResult,
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  ISpecialService,
  EntityHealthResult,
  EntityStatisticsResult
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
  DEFAULT_DEFECTDATA_CONFIG,
  DEFECTDATA_VALIDATION_RULES,
  DEFECTDATA_BUSINESS_RULES
} from './types';

import { DefectDataCustomerModel } from './model';
import DefectModel from '../defect/model';
import { DefectCustomerImageModel } from '../defect-customer-image/model';

// ==================== DEFECTDATA SERVICE CLASS ====================

/**
 * DefectData Service - Business logic layer for DefectData entity
 *
 * Provides defect data-specific business operations while extending
 * the generic SPECIAL service pattern for maximum code reuse.
 *
 * Features:
 * - Complete CRUD operations via generic pattern
 * - DefectData-specific business logic
 * - Manufacturing Quality Control optimized operations
 * - Enhanced validation and error handling
 * - Analytics and reporting capabilities
 */
export class DefectDataService extends GenericSpecialService<DefectData> implements ISpecialService<DefectData> {

  private defectDataModel: DefectDataCustomerModel;
  private defectImageModel?: DefectCustomerImageModel;

  constructor(defectDataModel: DefectDataCustomerModel, defectImageModel?: DefectCustomerImageModel) {
    // Pass the model to the generic service
    super(defectDataModel as any, DEFAULT_DEFECTDATA_CONFIG);
    this.defectDataModel = defectDataModel;
    this.defectImageModel = defectImageModel;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create new defect data with validation
   */
  async create(data: CreateDefectDataRequest, userId?: number): Promise<SpecialServiceResult<DefectData>> {
    try {
      // Validate the data
      const validation = this.validateDefectDataCreate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Business rule validation
      const businessValidation = await this.validateBusinessRules(data);
      if (!businessValidation.isValid) {
        return {
          success: false,
          error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
        };
      }

      // Create the defect data
      const createdData = await this.defectDataModel.create(data, userId);

      return {
        success: true,
        data: createdData
      };
    } catch (error) {
      console.error('Error creating defect data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create defect data'
      };
    }
  }

  /**
   * Update defect data with validation
   */
  async update(id: number, data: UpdateDefectDataRequest, userId?: number): Promise<SpecialServiceResult<DefectData>> {
    try {
      // Validate ID
      if (!this.validateIdFormat(id)) {
        return {
          success: false,
          error: 'Invalid defect data ID'
        };
      }

      // Validate the data
      const validation = this.validateDefectDataUpdate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Business rule validation
      const businessValidation = await this.validateBusinessRules(data);
      if (!businessValidation.isValid) {
        return {
          success: false,
          error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
        };
      }

      // Update the defect data
      const updatedData = await this.defectDataModel.update(id, data, userId);

      if (!updatedData) {
        return {
          success: false,
          error: 'Defect data not found'
        };
      }

      return {
        success: true,
        data: updatedData
      };
    } catch (error) {
      console.error('Error updating defect data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update defect data'
      };
    }
  }

   /**
    * Delete part by partno
    */
   async delete(id: string, actor?: any, req?: any): Promise< SpecialServiceResult<boolean> > {
     try {
       
 
       console.log('🔧 DefectdataService.delete called:', { id });
 
       if (!id) {
         return {
           success: false 
         };
       }
        
 
       const result = await this.defectDataModel.delete(id, actor ?? null, req);
 
       if (result.success) {
         return {
           success: true,
           data: true 
         };
       } else {
         return {
           success: false 
         };
       }
     } catch (error: any) {
       console.error('❌ Error deleting defectdata:', error);
 
       return {
         success: false
       };
     }
   } 
  
  // ==================== DEFECTDATA-SPECIFIC OPERATIONS ====================

  /**
   * Get defect data by inspection number
   *
   * Business logic wrapper for inspection-based retrieval
   */
  async getByInspectionNo(inspectionNo: string, userId: number): Promise<SpecialServiceResult<DefectData[]>> {
    try {
      // Validate inputs
      if (!inspectionNo || typeof inspectionNo !== 'string' || inspectionNo.trim().length === 0) {
        return {
          success: false,
          error: 'Inspection number is required'
        };
      }

      if (inspectionNo.length > 20) {
        return {
          success: false,
          error: 'Inspection number cannot exceed 20 characters'
        };
      }
 
      const data = await this.defectDataModel.getByInspectionNo(inspectionNo.trim());

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data by inspection number: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get defect detail data by inspection number
   *
   * Business logic wrapper for inspection-based retrieval
   */
  async getDetailByInspectionNo(inspectionNo: string): Promise<SpecialServiceResult<DefectDetail[]>> {
    try {
      // Validate inputs
      if (!inspectionNo || typeof inspectionNo !== 'string' || inspectionNo.trim().length === 0) {
        return {
          success: false,
          error: 'Inspection number is required'
        };
      }

      if (inspectionNo.length > 20) {
        return {
          success: false,
          error: 'Inspection number cannot exceed 20 characters'
        };
      }

      const data = await this.defectDataModel.getDetailByInspectionNo(inspectionNo.trim());
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data by inspection number: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

    /**
   * Get defect Email data by inspection number
   *
   * Business logic wrapper for inspection-based retrieval
   */
  async getEmailDetailById(defectId: number): Promise<SpecialServiceResult<DefectEmail[]>> {
    try {
      const data = await this.defectDataModel.getEmailById(defectId);
      console.log(`📧 getEmailDetailById for defect ID ${defectId}: found ${data.length} records`);
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`❌ getEmailDetailById failed for defect ID ${defectId}:`, error);
      return {
        success: false,
        error: `Failed to get defect data by defect ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }


  /**
   * Get defect data by station and date range
   *
   * Station-based reporting with business logic validation
   */
  async getByStationAndDateRange(
    station: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100,
    userId: number
  ): Promise<SpecialServiceResult<DefectData[]>> {
    try {
      // Validate station
      if (!station || !DEFECTDATA_BUSINESS_RULES.valid_stations.includes(station)) {
        return {
          success: false,
          error: `Invalid station. Must be one of: ${DEFECTDATA_BUSINESS_RULES.valid_stations.join(', ')}`
        };
      }

      // Validate dates
      if (!startDate || !endDate) {
        return {
          success: false,
          error: 'Start date and end date are required'
        };
      }

      if (startDate > endDate) {
        return {
          success: false,
          error: 'Start date cannot be after end date'
        };
      }

      // Validate date range (not more than 1 year)
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() > oneYear) {
        return {
          success: false,
          error: 'Date range cannot exceed one year'
        };
      }

      // Validate limit
      if (limit <= 0 || limit > 1000) {
        return {
          success: false,
          error: 'Limit must be between 1 and 1000'
        };
      }

      const data = await this.defectDataModel.getByStationAndDateRange(
        station,
        startDate,
        endDate,
        limit
      );

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data by station and date range: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get defect data by inspector
   *
   * Inspector performance analysis with validation
   */
  async getByInspector(inspector: string, limit: number = 100, userId: number): Promise<SpecialServiceResult<DefectData[]>> {
    try {
      // Validate inspector
      if (!inspector || typeof inspector !== 'string' || inspector.trim().length === 0) {
        return {
          success: false,
          error: 'Inspector name is required'
        };
      }

      if (inspector.length > 20) {
        return {
          success: false,
          error: 'Inspector name cannot exceed 20 characters'
        };
      }

      if (!DEFECTDATA_BUSINESS_RULES.inspector_name_pattern.test(inspector)) {
        return {
          success: false,
          error: 'Inspector name contains invalid characters'
        };
      }

      // Validate limit
      if (limit <= 0 || limit > 1000) {
        return {
          success: false,
          error: 'Limit must be between 1 and 1000'
        };
      }

      const data = await this.defectDataModel.getByInspector(inspector.trim(), limit);

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data by inspector: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get defect data profile with detailed information
   *
   * Enhanced profile retrieval with business logic
   */
  async getProfile(id: number, userId: number): Promise<SpecialServiceResult<DefectDataProfile>> {
    try {
      // Validate ID
      if (!this.validateIdFormat(id)) {
        return {
          success: false,
          error: 'Invalid defect data ID'
        };
      }

      const profile = await this.defectDataModel.getProfile(id);

      if (!profile) {
        return {
          success: false,
          error: 'Defect data not found'
        };
      }

      return {
        success: true,
        data: profile
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get defect data summary for analytics
   *
   * Business logic wrapper for summary statistics
   */
  async getSummary(
    startDate?: Date,
    endDate?: Date,
    userId?: number
  ): Promise<SpecialServiceResult<DefectDataSummary>> {
    try {
      // Validate date range if provided
      if (startDate && endDate) {
        if (startDate > endDate) {
          return {
            success: false,
            error: 'Start date cannot be after end date'
          };
        }

        // Validate date range (not more than 2 years for summary)
        const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
        if (endDate.getTime() - startDate.getTime() > twoYears) {
          return {
            success: false,
            error: 'Date range for summary cannot exceed two years'
          };
        }
      }

      const summary = await this.defectDataModel.getSummary(startDate, endDate);

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data summary: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get defect data trends for charts
   *
   * Trend analysis with business logic validation
   */
  async getTrends(days: number = 7, userId?: number): Promise<SpecialServiceResult<DefectDataTrend[]>> {
    try {
      // Validate days parameter
      if (days <= 0 || days > 365) {
        return {
          success: false,
          error: 'Days must be between 1 and 365'
        };
      }

      const trends = await this.defectDataModel.getTrends(days);

      return {
        success: true,
        data: trends
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get defect data trends: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get inspector performance data
   *
   * Inspector analysis with validation
   */
  async getInspectorPerformance(inspector: string, userId: number): Promise<SpecialServiceResult<InspectorPerformance>> {
    try {
      // Validate inspector
      if (!inspector || typeof inspector !== 'string' || inspector.trim().length === 0) {
        return {
          success: false,
          error: 'Inspector name is required'
        };
      }

      if (inspector.length > 20) {
        return {
          success: false,
          error: 'Inspector name cannot exceed 20 characters'
        };
      }

      const performance = await this.defectDataModel.getInspectorPerformance(inspector.trim());

      if (!performance) {
        return {
          success: false,
          error: 'No performance data found for this inspector'
        };
      }

      return {
        success: true,
        data: performance
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get inspector performance: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create defect data with enhanced validation
   *
   * Extends generic create with defect-data specific business rules
   */
  async createDefectData(data: CreateDefectDataRequest, userId: number): Promise<SpecialServiceResult<DefectData>> {
    try {
      // Enhanced validation
      const validation = this.validateDefectDataCreate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Business rule validation
      const businessValidation = await this.validateBusinessRules(data);
      if (!businessValidation.isValid) {
        return {
          success: false,
          error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
        };
      }

      // Use generic create method
      return await this.create(data, userId);
    } catch (error) {
      return {
        success: false,
        error: `Failed to create defect data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update defect data with enhanced validation
   *
   * Extends generic update with defect-data specific business rules
   */
  async updateDefectData(id: number, data: UpdateDefectDataRequest, userId: number): Promise<SpecialServiceResult<DefectData>> {
    try {
      // Enhanced validation
      const validation = this.validateDefectDataUpdate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Business rule validation
      const businessValidation = await this.validateBusinessRules(data);
      if (!businessValidation.isValid) {
        return {
          success: false,
          error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
        };
      }

      // Use generic update method
      return await this.update(id, data, userId);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update defect data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Advanced search with business logic
   */
  async searchDefectData(
    options: DefectDataQueryOptions,
    userId: number
  ): Promise<SpecialServiceResult<SpecialPaginatedResponse<DefectData>>> {
    try {
      // Validate search options
      const validation = this.validateSearchOptions(options);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Search validation failed: ${validation.errors.join(', ')}`
        };
      }

      const { data, total } = await (this.defectDataModel as any).getByFilters?.(options) || { data: [], total: 0 };

      const pagination = {
        currentPage: options.page || 1,
        totalPages: Math.ceil(total / (options.limit || 50)),
        totalCount: total,
        hasNextPage: (options.page || 1) < Math.ceil(total / (options.limit || 50)),
        hasPreviousPage: (options.page || 1) > 1
      };

      return {
        success: true,
        data: { data, pagination }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search defect data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ==================== ENHANCED VALIDATION METHODS ====================

  /**
   * Validate defect data create request
   */
  private validateDefectDataCreate(data: CreateDefectDataRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = DEFECTDATA_VALIDATION_RULES;

    // Required field validation
    if (!data.inspection_no || data.inspection_no.trim().length === 0) {
      errors.push('Inspection number is required');
    } else if (data.inspection_no.length > rules.inspection_no.max_length) {
      errors.push(`Inspection number cannot exceed ${rules.inspection_no.max_length} characters`);
    } else if (rules.inspection_no.pattern && !rules.inspection_no.pattern.test(data.inspection_no)) {
      errors.push('Inspection number format is invalid');
    }

    if (!data.qc_name || data.qc_name.trim().length === 0) {
      errors.push('QC name is required');
    } else if (data.qc_name.length > rules.qc_name.max_length) {
      errors.push(`QC name cannot exceed ${rules.qc_name.max_length} characters`);
    }

    if (!data.qclead_name || data.qclead_name.trim().length === 0) {
      errors.push('QC lead name is required');
    } else if (data.qclead_name.length > rules.qclead_name.max_length) {
      errors.push(`QC lead name cannot exceed ${rules.qclead_name.max_length} characters`);
    }

    if (!data.mbr_name || data.mbr_name.trim().length === 0) {
      errors.push('MBR name is required');
    } else if (data.mbr_name.length > rules.mbr_name.max_length) {
      errors.push(`MBR name cannot exceed ${rules.mbr_name.max_length} characters`);
    }
    if (!data.inspector || data.inspector.trim().length === 0) {
      errors.push('Inspector is required');
    } else if (data.inspector.length > rules.inspector.max_length) {
      errors.push(`Inspector name cannot exceed ${rules.inspector.max_length} characters`);
    }

    if (data.defect_id === undefined || data.defect_id === null) {
      errors.push('Defect ID is required');
    } else if (!Number.isInteger(data.defect_id) || data.defect_id <= 0) {
      errors.push('Defect ID must be a positive integer');
    }

    // Optional field validation
    if (data.ng_qty !== undefined) {
      if (data.ng_qty < rules.ng_qty.min_value || data.ng_qty > rules.ng_qty.max_value) {
        errors.push(`NG quantity must be between ${rules.ng_qty.min_value} and ${rules.ng_qty.max_value}`);
      }
    }

    if (data.trayno && data.trayno.length > rules.trayno.max_length) {
      errors.push(`Tray number cannot exceed ${rules.trayno.max_length} characters`);
    }

    if (data.tray_position && data.tray_position.length > rules.tray_position.max_length) {
      errors.push(`Tray position cannot exceed ${rules.tray_position.max_length} characters`);
    }

    if (data.color && data.color.length > rules.color.max_length) {
      errors.push(`Color cannot exceed ${rules.color.max_length} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate defect data update request
   */
  private validateDefectDataUpdate(data: UpdateDefectDataRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = DEFECTDATA_VALIDATION_RULES;

    // Validate only provided fields for update
    if (data.inspection_no !== undefined) {
      if (!data.inspection_no || data.inspection_no.trim().length === 0) {
        errors.push('Inspection number cannot be empty');
      } else if (data.inspection_no.length > rules.inspection_no.max_length) {
        errors.push(`Inspection number cannot exceed ${rules.inspection_no.max_length} characters`);
      } else if (rules.inspection_no.pattern && !rules.inspection_no.pattern.test(data.inspection_no)) {
        errors.push('Inspection number format is invalid');
      }
    }

    if (data.qc_name !== undefined) {
      if (!data.qc_name || data.qc_name.trim().length === 0) {
        errors.push('QC name cannot be empty');
      } else if (data.qc_name.length > rules.qc_name.max_length) {
        errors.push(`QC name cannot exceed ${rules.qc_name.max_length} characters`);
      }
    }

 

    if (data.defect_id !== undefined) {
      if (!Number.isInteger(data.defect_id) || data.defect_id <= 0) {
        errors.push('Defect ID must be a positive integer');
      }
    }

    if (data.ng_qty !== undefined) {
      if (data.ng_qty < rules.ng_qty.min_value || data.ng_qty > rules.ng_qty.max_value) {
        errors.push(`NG quantity must be between ${rules.ng_qty.min_value} and ${rules.ng_qty.max_value}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(data: CreateDefectDataRequest | UpdateDefectDataRequest): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate defect ID exists if provided
      if (data.defect_id !== undefined) {
        const defectExists = await (this.defectDataModel as any).validateDefectId?.(data.defect_id) ?? true;
        if (!defectExists) {
          errors.push('Referenced defect does not exist');
        }
      }

      // Validate tray requirements
      if (data.trayno && !data.tray_position) {
        errors.push('Tray position is required when tray number is provided');
      }

      if (data.tray_position && !data.trayno) {
        errors.push('Tray number is required when tray position is provided');
      }

      // Validate quantity constraints
      if (data.ng_qty !== undefined && data.ng_qty > DEFECTDATA_BUSINESS_RULES.max_ng_qty_per_record) {
        errors.push(`NG quantity cannot exceed ${DEFECTDATA_BUSINESS_RULES.max_ng_qty_per_record}`);
      }

    } catch (error) {
      errors.push('Failed to validate business rules');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate search options
   */
  private validateSearchOptions(options: DefectDataQueryOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate pagination
    if (options.page !== undefined && (options.page < 1 || !Number.isInteger(options.page))) {
      errors.push('Page must be a positive integer');
    }

    if (options.limit !== undefined && (options.limit < 1 || options.limit > 1000 || !Number.isInteger(options.limit))) {
      errors.push('Limit must be between 1 and 1000');
    }

    // Validate date range
    if (options.defect_date_from && options.defect_date_to) {
      if (options.defect_date_from > options.defect_date_to) {
        errors.push('Start date cannot be after end date');
      }
    }

    // Validate quantity range
    if (options.ng_qty_min !== undefined && options.ng_qty_max !== undefined) {
      if (options.ng_qty_min > options.ng_qty_max) {
        errors.push('Minimum NG quantity cannot be greater than maximum');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validate ID format
   */
  private validateIdFormat(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a defect data service instance
 *
 * Provides dependency injection pattern for defect data service creation
 */
export function createDefectDataService(defectDataModel: DefectDataCustomerModel, defectImageModel?: DefectCustomerImageModel): DefectDataService {
  return new DefectDataService(defectDataModel, defectImageModel);
}

// ==================== DEFAULT EXPORT ====================

export default DefectDataService;
