// server/src/entities/parts/service.ts
/**
 * SIMPLIFIED: Parts Entity Service - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import ISpecialService,{
  GenericSpecialService 
} from '../../generic/entities/special-entity/generic-service';

import {
  Parts,
  CreatePartsRequest,
  UpdatePartsRequest,
  PartsServiceResult,
  PartsListResult,
  PARTS_ENTITY_CONFIG
} from './types';

import { PartsModel } from './model';

// ==================== SIMPLE PARTS SERVICE CLASS ====================

/**
 * Simple Parts Entity Service - extends GenericSpecialService for basic business logic
 */
export class PartsService extends GenericSpecialService<Parts> implements ISpecialService<Parts> {

  protected partsModel: PartsModel;

  constructor(model: PartsModel) {
    super(model as any, PARTS_ENTITY_CONFIG);
    this.partsModel = model;
  }

  // ==================== REQUIRED ISPECIALSERVICE METHODS ====================

  /**
   * Get all parts with optional search and pagination
   */
  async getAll(searchTerm?: string, page?: number, limit?: number): Promise<PartsServiceResult<Parts[]>> {
    try {
      console.log('🔧 PartsService.getAll called', {
        searchTerm: searchTerm || 'none',
        page,
        limit
      });

      // Get paginated data
      const data = await this.partsModel.getAll(searchTerm, page, limit);

      // Get total count for pagination metadata
      let total = data.length;
      if (page && limit) {
        total = await this.partsModel.getCount(searchTerm);
      }

      const result: any = {
        success: true,
        data: data
      };

      // Add pagination metadata if pagination is requested
      if (page && limit) {
        result.pagination = {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        };
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error getting all parts:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve parts'
      };
    }
  }

  /**
   * Get part by partno
   */
  async getByKey(keyValues: Record<string, any>): Promise<PartsServiceResult<Parts>> {
    try {
      const { partno } = keyValues;

      console.log('🔧 PartsService.getByKey called:', { partno });

      if (!partno) {
        return {
          success: false,
          message: 'Part number is required' 
        };
      }

      const data = await this.partsModel.getByKey({ partno });

      if (data) {
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          message: 'Part not found' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error getting part by key:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve part' 
      };
    }
  }

  /**
   * Import part (upsert - insert or update if exists)
   */
  async import(data: CreatePartsRequest, userId: number = 0): Promise<PartsServiceResult<Parts>> {
    try {
      console.log('🔧 PartsService.import called:', { partno: data.partno, userId });

      // Basic validation
      const validation = this.validateImportData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Use upsert to handle both new and existing parts
      const result = await this.partsModel.upsert(data, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Part imported successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to import part'
        };
      }
    } catch (error: any) {
      console.error('❌ Error importing part:', error);

      return {
        success: false,
        message: error.message || 'Failed to import part'
      };
    }
  }

  /**
   * Create new part
   */
  async create(data: CreatePartsRequest, userId: number = 0): Promise<PartsServiceResult<Parts>> {
    try {
      console.log('🔧 PartsService.create called:', { partno: data.partno, userId });

      // Basic validation
      const validation = this.validateCreateData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Add audit fields
      const createData = {
        ...data,
        created_by: userId,
        updated_by: userId
      };

      const result = await this.partsModel.create(createData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Part created successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to create part'
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating part:', error);

      return {
        success: false,
        message: error.message || 'Failed to create part'
      };
    }
  }

  /**
   * Update part by partno
   */
  async update(keyValues: Record<string, any>, data: UpdatePartsRequest, userId: number = 0): Promise<PartsServiceResult<Parts>> {
    try {
      const { partno } = keyValues;

      console.log('🔧 PartsService.update called:', { partno, userId });

      if (!partno) {
        return {
          success: false,
          message: 'Part number is required' 
        };
      }

      // Add audit fields
      const updateData = {
        ...data,
        updated_by: userId
      };

      const result = await this.partsModel.update({ partno }, updateData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Part updated successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to update part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error updating part:', error);

      return {
        success: false,
        message: error.message || 'Failed to update part' 
      };
    }
  }

  /**
   * Delete part by partno
   */
  async delete(keyValues: Record<string, any>, actor?: any, req?: any): Promise<PartsServiceResult<boolean>> {
    try {
      const { partno } = keyValues;

      console.log('🔧 PartsService.delete called:', { partno });

      if (!partno) {
        return {
          success: false,
          message: 'Part number is required' 
        };
      }

      const result = await this.partsModel.delete({ partno }, actor ?? null, req);

      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Part deleted successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to delete part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error deleting part:', error);

      return {
        success: false,
        message: error.message || 'Failed to delete part' 
      };
    }
  }

  /**
   * Synchronize data method from  inf_lotinput 
   */
  async synceData(): Promise<PartsServiceResult<boolean>> {
    try {
      
      console.log('🔧 Executing parts Synchronize data  ');

      const result = await (this.partsModel as any).synceData?.() || { success: false };

      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Part dSynchronize data successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to Synchronize data part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error Synchronize data part:', error);

      return {
        success: false,
        message: error.message || 'Failed to Synchronize data part' 
      };
    }
  }

  /**
   * Check if part exists by partno
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        return false;
      }

      return await this.partsModel.exists({ partno });
    } catch (error: any) {
      console.error('❌ Error checking part existence:', error);
      return false;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * GET /api/parts/customer-sites
   * Get available customer-sites for parts form
   */
  async getCustomerSites(): Promise<any> {
    try {
   
      const result = await (this.partsModel as any).getCustomerSites?.() || { rows: [] };

      if (result.rows.length > 0) {
        return result;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error getting customer-sites:', error);
      return null;
    } 
  };

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate create data
   */
  private validateCreateData(data: CreatePartsRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation
    if (!data.partno?.trim()) {
      errors.push('Part number is required');
    }

    if (!data.product_families?.trim()) {
      errors.push('Product families is required');
    }

    if (!data.versions?.trim()) {
      errors.push('Versions is required');
    }

    if (!data.customers_site?.trim()) {
      errors.push('Customer-site is required');
    }

    if (!data.tab?.trim()) {
      errors.push('Tab is required');
    }

    if (!data.product_type?.trim()) {
      errors.push('Product type is required');
    }

    if (!data.customer_driver?.trim()) {
      errors.push('Customer driver is required');
    }

    // Length validations
    if (data.partno && data.partno.length > 25) {
      errors.push('Part number must be 25 characters or less');
    }

    if (data.product_families && data.product_families.length > 10) {
      errors.push('Product families must be 10 characters or less');
    }

    if (data.versions && data.versions.length > 10) {
      errors.push('Versions must be 10 characters or less');
    }

    if (data.customer_driver && data.customer_driver.length > 200) {
      errors.push('Customer driver must be 200 characters or less');
    }

    // Customer-site code validation (max 10 characters)
    if (data.customers_site && data.customers_site.length > 10) {
      errors.push('Customer-site code must be 10 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate import data
   */
  private validateImportData(data: CreatePartsRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation - Only partno is mandatory
    if (!data.partno?.trim()) {
      errors.push('Part number is required');
    }

 
    return {
      isValid: errors.length === 0,
      errors
    };
  }  
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Parts service instance
 */
export function createPartsService(model: PartsModel): PartsService {
  return new PartsService(model);
}

export default PartsService;