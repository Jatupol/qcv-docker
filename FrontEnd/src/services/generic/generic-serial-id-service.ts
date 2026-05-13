// client/src/services/generic/generic-serial-id-service.ts

/**
 * Generic Serial ID Service
 * 
 * Base service class for all SERIAL ID entities (Pattern 1):
 * - users, defects, defect_types, models, product_families, sampling_reasons
 * 
 * Provides complete CRUD operations with proper typing and error handling
 * Individual entity services extend this class for specific customizations
 */

import type {
  BaseSerialIdEntity,
  CreateSerialIdRequest,
  UpdateSerialIdRequest,
  SerialIdFormData,
  UpdateSerialIdFormData,
  SerialIdQueryParams,
  SerialIdResponse,
  BaseSerialIdStats,
  ValidationResult,
  DropdownOption
} from './serial-id-service-types';

// ==================== ABSTRACT BASE SERVICE ====================

export abstract class GenericSerialIdService<
  TEntity extends BaseSerialIdEntity = BaseSerialIdEntity,
  TStats extends BaseSerialIdStats = BaseSerialIdStats
> {
  protected readonly baseUrl: string;
  protected readonly entityName: string;
  protected readonly entityNamePlural: string;

  constructor(baseUrl: string, entityName: string, entityNamePlural?: string) {
    this.baseUrl = baseUrl;
    this.entityName = entityName;
    this.entityNamePlural = entityNamePlural || `${entityName}s`;
  }

  // ==================== HELPER METHODS ====================

  protected async makeRequest<T>(url: string, options: RequestInit = {}): Promise<SerialIdResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // ==================== CRUD OPERATIONS ====================

  public async get(params: SerialIdQueryParams<TEntity> = {}): Promise<SerialIdResponse<TEntity[]>> {
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return this.makeRequest<TEntity[]>(url);
  }

  public async getById(id: number): Promise<SerialIdResponse<TEntity>> {
    return this.makeRequest<TEntity>(`${this.baseUrl}/${id}`);
  }

  public async create(data: SerialIdFormData): Promise<SerialIdResponse<TEntity>> {
    return this.makeRequest<TEntity>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async update(id: number, data: UpdateSerialIdFormData): Promise<SerialIdResponse<TEntity>> {
    return this.makeRequest<TEntity>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async delete(id: number): Promise<SerialIdResponse<any>> {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  public async toggleStatus(id: number): Promise<SerialIdResponse<TEntity>> {
    return this.makeRequest<TEntity>(`${this.baseUrl}/${id}/toggle`, {
      method: 'PUT',
    });
  }

  // ==================== UTILITY OPERATIONS ====================

  public async getActive(): Promise<SerialIdResponse<TEntity[]>> {
    return this.makeRequest<TEntity[]>(`${this.baseUrl}/utils/active`);
  }

  public async getStats(): Promise<SerialIdResponse<TStats>> {
    return this.makeRequest<TStats>(`${this.baseUrl}/stats`);
  }

  // ==================== VALIDATION OPERATIONS ====================

  public async validateName(name: string, excludeId?: number): Promise<SerialIdResponse<ValidationResult>> {
    const params: Record<string, string> = { name };
    if (excludeId) {
      params.excludeId = String(excludeId);
    }
    
    const queryString = this.buildQueryString(params);
    return this.makeRequest<ValidationResult>(`${this.baseUrl}/validate/name?${queryString}`);
  }

  // ==================== DROPDOWN HELPER ====================

  public async getDropdown(): Promise<DropdownOption[]> {
    try {
      const result = await this.getActive();
      if (result.success && result.data) {
        return result.data.map(entity => ({
          value: entity.id,
          label: `${entity.id} - ${entity.name}`
        }));
      }
      return [];
    } catch (error) {
      console.error(`${this.entityName}Service.getDropdown error:`, error);
      return [];
    }
  }

  // ==================== VIRTUAL METHODS FOR CUSTOMIZATION ====================

  /**
   * Override this method in child classes for entity-specific validation
   */
  protected async customValidation?(data: SerialIdFormData): Promise<ValidationResult>;

  /**
   * Override this method in child classes for entity-specific formatting
   */
  protected formatEntityForDropdown?(entity: TEntity): DropdownOption;
}