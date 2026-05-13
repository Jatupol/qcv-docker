// client\src\pages\masterdata\SamplingReasonPage.tsx
// Updated SamplingReasons CRUD management page with new interface (id-based, with description)
 

import React from 'react';
import GenericEntityIdPage from '../GenericEntityIdPage';
import { type SamplingReason, samplingReasonService } from '../../services/samplingReasonService';
import { soundNotification } from '../../utils/soundNotification';


// ==================== DEFECTS PAGE COMPONENT ====================

const SamplingReasonPage: React.FC = () => {
  // ============ SERVICE ADAPTER ============
  // Adapt samplingReasonService to match GenericEntityIdPage expected interface
  const serviceAdapter = {
    getAll: async (params: any) => {
      console.log('🔧 SamplingReason Page - getAll called with params:', params);

      try {
        const response = await samplingReasonService.get(params);
        console.log('🔧 SamplingReason Page - getAll response:', {
          success: response.success,
          hasData: !!response.data,
          dataType: typeof response.data,
          isDataArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
          message: response.message,
          fullResponse: response
        });

        // Check for nested structure like other services (data.data pattern)
        if (response.success && response.data) {
          // Handle nested response structure (API might return data.data.[] like other services)
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log('✅ SamplingReason Page - Found nested data structure');
            return {
              success: true,
              data: response.data.data,
              pagination: response.data.pagination,
              message: response.message
            };
          }
          // Handle direct array structure
          else if (Array.isArray(response.data)) {
            console.log('✅ SamplingReason Page - Direct array response');
            return response;
          }
          // Handle unexpected structure
          else {
            console.error('❌ SamplingReason Page - Unexpected data structure:', {
              dataType: typeof response.data,
              dataKeys: typeof response.data === 'object' ? Object.keys(response.data) : null,
              sampleData: response.data
            });
            soundNotification.play('error');
            return {
              success: false,
              data: [],
              message: 'Unexpected response structure from server'
            };
          }
        } else {
          console.error('❌ SamplingReason Page - No success or no data:', response);
          soundNotification.play('error');
          return {
            success: false,
            data: [],
            message: response.message || 'No data received from server'
          };
        }
      } catch (error) {
        console.error('❌ SamplingReason Page - getAll error:', error);
        soundNotification.play('error');
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : 'Failed to load data'
        };
      }
    },
    getById: async (id: string) => {
      try {
        const response = await samplingReasonService.getByCode(parseInt(id));
        if (!response.success) {
          soundNotification.play('error');
        }
        return response;
      } catch (error) {
        soundNotification.play('error');
        throw error;
      }
    },
    create: async (data: any) => {
      try {
        const response = await samplingReasonService.create(data);
        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }
        return response;
      } catch (error) {
        soundNotification.play('error');
        throw error;
      }
    },
    update: async (id: string, data: any) => {
      try {
        const response = await samplingReasonService.update(parseInt(id), data);
        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }
        return response;
      } catch (error) {
        soundNotification.play('error');
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
        const response = await samplingReasonService.delete(parseInt(id));
        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }
        return response;
      } catch (error) {
        soundNotification.play('error');
        throw error;
      }
    },
    getStats: async () => {
      console.log('🔧 SamplingReason Page - getStats called');

      try {
        const response = await samplingReasonService.getStats();
        console.log('🔧 SamplingReason Page - getStats response:', response);

        if (response.success && response.data) {
          console.log('🔧 SamplingReason Page - Raw stats data:', response.data);

          // Handle different possible response structures
          let stats;
          if (response.data.totals) {
            // Backend returns { totals: { all, active, inactive } }
            stats = {
              total: response.data.totals.all || 0,
              active: response.data.totals.active || 0,
              inactive: response.data.totals.inactive || 0
            };
          } else if (response.data.overview) {
            // Backend returns { overview: { total, active, inactive } }
            stats = {
              total: response.data.overview.total || 0,
              active: response.data.overview.active || 0,
              inactive: response.data.overview.inactive || 0
            };
          } else {
            // Backend returns { total, active, inactive } directly
            stats = {
              total: response.data.total || 0,
              active: response.data.active || 0,
              inactive: response.data.inactive || 0
            };
          }

          console.log('✅ SamplingReason Page - Processed stats:', stats);

          return {
            stats,
            message: response.message || 'Statistics retrieved successfully'
          };
        } else {
          soundNotification.play('error');
          return {
            stats: { total: 0, active: 0, inactive: 0 },
            message: response.message || 'Failed to load statistics'
          };
        }
      } catch (error) {
        console.error('❌ SamplingReason Page - getStats error:', error);
        soundNotification.play('error');
        return {
          stats: { total: 0, active: 0, inactive: 0 },
          message: error instanceof Error ? error.message : 'Failed to load statistics'
        };
      }
    },
    toggleStatus: async (id: string) => {
      console.log('🔄 SamplingReason Page - toggleStatus called for ID:', id);

      try {
        const response = await samplingReasonService.toggleStatus(parseInt(id));
        console.log('🔄 SamplingReason Page - toggleStatus response:', response);

        if (response.success) {
          soundNotification.play('success');
          // Backend only returns success message, not updated entity
          // GenericEntityIdPage will handle the data refresh
          return {
            data: {} as any, // Dummy data since backend doesn't return updated entity
            message: response.message || 'Status updated successfully'
          };
        } else {
          soundNotification.play('error');
          throw new Error(response.message || 'Failed to toggle status');
        }
      } catch (error) {
        console.error('❌ SamplingReason Page - toggleStatus error:', error);
        soundNotification.play('error');
        throw error;
      }
    }
  };

  // ============ VALIDATION RULES ============
  // ID validation rules for SERIAL ID entities
  const idValidationRules = {
    minValue: 1,
    maxValue: 2147483647, // PostgreSQL INTEGER max value
    required: true
  };

  const nameValidationRules = {
    minLength: 3,
    maxLength: 100,
    required: true,
    pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
    patternMessage: 'Name can only contain letters, numbers, spaces, and common punctuation (-, _, ., , ())'
  };

  const descriptionValidationRules = {
    minLength: 0,
    maxLength: 1000,
    required: false
  };

  // ============ BREADCRUMB CONFIGURATION ============
  const samplingReasonBreadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Master Data', href: '/master' },
    { label: 'Sampling Reason' }
  ];

  // ============ RENDER ============
  return (
    <GenericEntityIdPage<SamplingReason>
      entityName="SamplingReason"
      entityNamePlural="SamplingReason" 
      entityDescription="Defect types used in quality control processes"
      service={serviceAdapter}
      breadcrumbItems={samplingReasonBreadcrumbItems}
      idValidationRules={idValidationRules}
      nameValidationRules={nameValidationRules}
      descriptionValidationRules={descriptionValidationRules}
      idPlaceholder="Auto-generated ID"
      namePlaceholder="Enter samplingReason name (e.g., Surface Scratch, Dimensional Error)"
      descriptionPlaceholder="Enter detailed description of the samplingReason type"
      debugMode={true}
    />
  );
};

export default SamplingReasonPage;
 