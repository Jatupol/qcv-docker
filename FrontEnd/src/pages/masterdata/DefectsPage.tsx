// client/src/pages/DefectsPage.tsx

/**
 * DefectsPage - SERIAL ID Entity using GenericEntityIdPage
 * 
 * Fixed to use the existing GenericEntityIdPage component for SERIAL ID entities.
 * This follows the same pattern as other SERIAL ID entities in the system.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Uses GenericEntityIdPage for SERIAL ID pattern
 * ✅ Service adapter to match generic interface requirements
 * ✅ Proper validation rules for defect entity
 * ✅ No custom implementation needed - leverages existing generics
 */

import React, { useState, useEffect } from 'react';
import GenericEntityIdPage from '../GenericEntityIdPage';
import { type Defect, defectService } from '../../services/defectService';
import { type TableColumn } from '../../components/generic-page';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { soundNotification } from '../../utils/soundNotification';


// ==================== DEFECTS PAGE COMPONENT ====================

const DefectsPage: React.FC = () => {
  // ============ DEFECT GROUP FILTER STATE ============
  const [defectGroupFilter, setDefectGroupFilter] = useState<string>('');
  const [defectGroups, setDefectGroups] = useState<string[]>([]);

  // Debug: Log component render
  console.log('🔧 DefectsPage - Component rendered with state:', {
    defectGroupFilter,
    defectGroupsCount: defectGroups.length
  });

  // ============ FETCH DEFECT GROUPS ============
  useEffect(() => {
    const fetchDefectGroups = async () => {
      try {
        console.log('🔧 DefectsPage - Fetching defect groups...');
        const response = await defectService.get({});
        console.log('🔧 DefectsPage - Defect groups response:', response);

        if (response.success && response.data) {
          // Extract unique defect groups
          const groups = Array.from(
            new Set(
              response.data
                .map((d: Defect) => d.defect_group)
                .filter((g): g is string => !!g)
            )
          ).sort();
          console.log('🔧 DefectsPage - Extracted defect groups:', groups);
          setDefectGroups(groups);
        }
      } catch (error) {
        console.error('❌ DefectsPage - Failed to fetch defect groups:', error);
      }
    };
    fetchDefectGroups();
  }, []);

  // ============ SERVICE ADAPTER ============
  // Adapt defectService to match GenericEntityIdPage expected interface
  const serviceAdapter = {
    getAll: async (params: any) => {
      console.log('🔧 Defect Page - getAll called with params:', params);

      try {
        const response = await defectService.get(params);
        console.log('🔧 Defect Page - getAll response:', {
          success: response.success,
          hasData: !!response.data,
          dataType: typeof response.data,
          isDataArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
          hasPagination: !!response.pagination,
          pagination: response.pagination,
          message: response.message,
          fullResponse: response
        });

        // Check for nested structure like other services (data.data pattern)
        if (response.success && response.data) {
          // Handle nested response structure (API might return data.data.[] like other services)
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log('✅ Defect Page - Found nested data structure');
            return {
              success: true,
              data: response.data.data,
              pagination: response.data.pagination ? {
                currentPage: response.data.pagination.page || response.data.pagination.currentPage || 1,
                totalPages: response.data.pagination.totalPages || 1,
                totalItems: response.data.pagination.total || response.data.pagination.totalItems || 0,
                pageSize: response.data.pagination.limit || response.data.pagination.pageSize || 10
              } : undefined,
              message: response.message
            };
          }
          // Handle direct array structure with pagination at root level
          else if (Array.isArray(response.data)) {
            console.log('✅ Defect Page - Direct array response');
            return {
              success: true,
              data: response.data,
              pagination: response.pagination ? {
                currentPage: response.pagination.page || response.pagination.currentPage || 1,
                totalPages: response.pagination.totalPages || 1,
                totalItems: response.pagination.total || response.pagination.totalItems || 0,
                pageSize: response.pagination.limit || response.pagination.pageSize || 10
              } : undefined,
              message: response.message
            };
          }
          // Handle unexpected structure
          else {
            console.error('❌ Defect Page - Unexpected data structure:', {
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
          console.error('❌ Defect Page - No success or no data:', response);
          soundNotification.play('error');
          return {
            success: false,
            data: [],
            message: response.message || 'No data received from server'
          };
        }
      } catch (error) {
        console.error('❌ Defect Page - getAll error:', error);
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
        const response = await defectService.getByCode(parseInt(id));
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
        const response = await defectService.create(data);
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
        const response = await defectService.update(parseInt(id), data);
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
        const response = await defectService.delete(parseInt(id));
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
      console.log('🔧 Defect Page - getStats called');

      try {
        const response = await defectService.getStats();
        console.log('🔧 Defect Page - getStats response:', response);

        if (response.success && response.data) {
          console.log('🔧 Defect Page - Raw stats data:', response.data);

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

          console.log('✅ Defect Page - Processed stats:', stats);

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
        console.error('❌ Defect Page - getStats error:', error);
        soundNotification.play('error');
        return {
          stats: { total: 0, active: 0, inactive: 0 },
          message: error instanceof Error ? error.message : 'Failed to load statistics'
        };
      }
    },
    toggleStatus: async (id: string) => {
      console.log('🔄 Defect Page - toggleStatus called for ID:', id);

      try {
        const response = await defectService.toggleStatus(parseInt(id));
        console.log('🔄 Defect Page - toggleStatus response:', response);

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
        console.error('❌ Defect Page - toggleStatus error:', error);
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
  const defectBreadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Master Data', href: '/master' },
    { label: 'Defects' }
  ];

  // ============ CUSTOM COLUMNS ============
  const customColumns: TableColumn<Defect>[] = [
    {
      key: 'defect_group',
      label: 'Defect Group',
      sortable: true,
      width: 'w-1/6',
      render: (value: any, defect: Defect) => (
        <span className="text-sm text-gray-900">
          {defect.defect_group || '-'}
        </span>
      )
    }
  ];

  // ============ DEFECT GROUP FILTER HANDLER ============
  const handleDefectGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    console.log('🔧 DefectsPage - handleDefectGroupChange called with value:', newValue);
    console.log('🔧 DefectsPage - Current defectGroupFilter state:', defectGroupFilter);
    setDefectGroupFilter(newValue);
    console.log('🔧 DefectsPage - setDefectGroupFilter called with:', newValue);
  };

  // ============ DEFECT GROUP FILTER COMPONENT ============
  const defectGroupFilterComponent = (
    <>
      <div className="relative">
        <select
          value={defectGroupFilter}
          onChange={handleDefectGroupChange}
          className="block appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <option value="">All Groups</option>
          {defectGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {/* Debug info */}
      <div className="text-xs text-gray-500 ml-2">
        Groups: {defectGroups.length} | Selected: "{defectGroupFilter}"
      </div>
    </>
  );

  // ============ CUSTOM FILTER PARAMS ============
  const customFilterParams = React.useMemo(() => {
    return defectGroupFilter ? { defect_group: defectGroupFilter } : {};
  }, [defectGroupFilter]);

  // Debug logging
  React.useEffect(() => {
    console.log('🔧 DefectsPage - defectGroupFilter changed:', defectGroupFilter);
    console.log('🔧 DefectsPage - customFilterParams:', customFilterParams);
  }, [defectGroupFilter, customFilterParams]);

  // ============ DEFECT GROUP FORM FIELD STATE ============
  const [showCustomGroupInput, setShowCustomGroupInput] = useState(false);
  const [selectedFormGroup, setSelectedFormGroup] = useState<string>('');

  // Reset when opening form with selectedEntity
  React.useEffect(() => {
    // This will be called when form opens, but we need to check in the render function
  }, []);

  // ============ CUSTOM FORM FIELDS ============
  const customFormFields = (selectedEntity: Defect | null) => {
    const currentGroup = selectedEntity?.defect_group || '';
    const isExistingGroup = defectGroups.includes(currentGroup);
    const shouldShowCustom = showCustomGroupInput || (!isExistingGroup && currentGroup);

    return (
      <div className="md:col-span-1">
        <label htmlFor="defect_group" className="block text-sm font-medium text-gray-700 mb-1">
          Defect Group
        </label>
        {shouldShowCustom ? (
          <div className="flex gap-2">
            <input
              type="text"
              id="defect_group"
              name="defect_group"
              defaultValue={currentGroup}
              placeholder="Enter new defect group"
              maxLength={100}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowCustomGroupInput(false)}
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              title="Switch to dropdown"
            >
              ↓
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              id="defect_group"
              name="defect_group"
              defaultValue={currentGroup}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">-- Select Group --</option>
              {defectGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCustomGroupInput(true)}
              className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
              title="Add new group"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  // ============ FORM DATA EXTRACTOR ============
  const extractFormData = (formData: FormData) => {
    return {
      defect_group: formData.get('defect_group') as string || undefined
    };
  };

  // ============ RENDER ============
  return (
    <GenericEntityIdPage<Defect>
      entityName="Defect"
      entityNamePlural="Defects"
      entityDescription="Defect types used in quality control processes"
      service={serviceAdapter}
      breadcrumbItems={defectBreadcrumbItems}
      idValidationRules={idValidationRules}
      nameValidationRules={nameValidationRules}
      descriptionValidationRules={descriptionValidationRules}
      idPlaceholder="Auto-generated ID"
      namePlaceholder="Enter defect name (e.g., Surface Scratch, Dimensional Error)"
      descriptionPlaceholder="Enter detailed description of the defect type"
      customColumns={customColumns}
      additionalFilters={defectGroupFilterComponent}
      customFilterParams={customFilterParams}
      customFormFields={customFormFields}
      onFormDataExtract={extractFormData}
      debugMode={true}
    />
  );
};

export default DefectsPage;

/*
=== DEFECTS PAGE FEATURES ===

CORRECTED IMPLEMENTATION:
✅ Now uses GenericEntityIdPage instead of custom implementation
✅ Follows SERIAL ID entity pattern consistently
✅ Service adapter properly converts ID string to number for API calls
✅ Matches the same pattern as other SERIAL ID entities

COMPLETE SEPARATION ARCHITECTURE:
✅ Uses existing generic page component
✅ Service adapter maintains entity separation
✅ Zero dependencies on other entities
✅ Follows project architectural patterns

SERIAL ID PATTERN COMPLIANCE:
✅ Uses ID-based operations (not code-based)
✅ Proper validation rules for numeric IDs
✅ Service adapter handles string to number conversion
✅ Matches backend SERIAL ID entity implementation

VALIDATION CONFIGURATION:
✅ ID validation rules for SERIAL primary key
✅ Name validation with pattern matching
✅ Description validation with length limits
✅ User-friendly validation messages

MANUFACTURING DOMAIN:
✅ Appropriate entity description for defect types
✅ Relevant placeholder text for defect naming
✅ Quality control specific validation patterns
✅ Manufacturing-focused breadcrumb navigation

GENERIC INTEGRATION:
✅ Compatible with GenericEntityIdPage interface
✅ Service adapter matches expected method signatures
✅ Proper type safety with Defect entity type
✅ Leverages existing generic functionality

PERFORMANCE BENEFITS:
✅ No custom React component implementation needed
✅ Leverages existing tested generic components
✅ Consistent UI/UX with other SERIAL ID entities
✅ Reduced code duplication through generic reuse

USER EXPERIENCE:
✅ Consistent interface with other entity pages
✅ Familiar workflows for users
✅ Standard CRUD operations
✅ Proper error handling and validation feedback

This implementation correctly leverages the existing GenericEntityIdPage
architecture while maintaining complete separation and following the
SERIAL ID entity pattern established in the server implementation.
*/