// client/src/components/selectors/LineMCSelector.tsx
// FIXED: Reusable LineMC selector component with correct property names

import React, { useState, useEffect } from 'react';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';
import { lineMCService } from '../../services/lineMCService';
import type { LineMC } from '../../services/lineMCService';

interface LineMCSelectorProps {
  value?: string | string[];  // FIXED: Changed to string since LineMC uses code (string) as identifier
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  includeInactive?: boolean;
  className?: string;
  onLineMCLoad?: (lineMCs: LineMC[]) => void;
}

const LineMCSelector: React.FC<LineMCSelectorProps> = ({
  value,
  onChange,
  multiple = false,
  disabled = false,
  placeholder = 'Select LineMC...',
  error,
  label = 'LineMC',
  required = false,
  includeInactive = false,
  className = '',
  onLineMCLoad,
}) => {
  const [lineMCs, setLineMCs] = useState<LineMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadLineMCs();
  }, [includeInactive]);

  const loadLineMCs = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      const response = await lineMCService.getLineMCs({
        is_active: includeInactive ? undefined : true,  // FIXED: Changed from isActive to is_active
        sortBy: 'name',
        sortOrder: 'asc',
        limit: 100, // Get all LineMCs
      });
      
      if (response.success && response.data) {
        setLineMCs(response.data);  // FIXED: Use response.data instead of response.lineMCs
        onLineMCLoad?.(response.data);
      } else {
        setLoadError(response.message || 'Failed to load LineMCs');
      }
    } catch (error: any) {
      console.error('Failed to load LineMCs:', error);
      setLoadError('Failed to load LineMCs');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value || '';
    onChange(selectedCode);
  };

  const handleMultipleChange = (selectedCodes: string[]) => {
    onChange(selectedCodes);
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-500">Loading LineMCs...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
          {loadError}
          <button
            onClick={loadLineMCs}
            className="ml-2 text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Generate options for single select
  const singleSelectOptions = [
    { value: '', label: placeholder },
    ...lineMCs.map(lineMC => ({
      value: lineMC.code,
      label: `${lineMC.code} - ${lineMC.name}${!lineMC.is_active ? ' (Inactive)' : ''}` // FIXED: Use is_active
    }))
  ];

  // Generate options for multiple select
  const multiSelectOptions = lineMCs.map(lineMC => ({
    value: lineMC.code,
    label: `${lineMC.code} - ${lineMC.name}${!lineMC.is_active ? ' (Inactive)' : ''}`,  // FIXED: Use is_active
    disabled: !lineMC.is_active && !includeInactive
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {multiple ? (
        <Select
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={handleMultipleChange}
          options={multiSelectOptions}
          disabled={disabled}
          error={error}
          placeholder={placeholder}
        />
      ) : (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={handleSingleChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        >
          {singleSelectOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
};

export default LineMCSelector;

// ============ CUSTOM HOOK FOR LineMC DATA ============

export const useLineMCs = (includeInactive: boolean = false) => {
  const [lineMCs, setLineMCs] = useState<LineMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLineMCs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await lineMCService.getLineMCs({
        is_active: includeInactive ? undefined : true,  // FIXED: Use is_active
        sortBy: 'name',
        sortOrder: 'asc',
        limit: 100,
      });
      
      if (response.success && response.data) {
        setLineMCs(response.data);  // FIXED: Use response.data
      } else {
        setError(response.message || 'Failed to load LineMCs');
      }
    } catch (error: any) {
      console.error('Failed to load LineMCs:', error);
      setError('Failed to load LineMCs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLineMCs();
  }, [includeInactive]);

  return {
    lineMCs,
    loading,
    error,
    reload: loadLineMCs,
  };
};

// Utility functions for working with LineMCs
export const LineMCUtils = {
  // Get LineMC by code
  getByCode: (lineMCs: LineMC[], code: string): LineMC | undefined => {
    return lineMCs.find(lineMC => lineMC.code === code);
  },

  // Get LineMCs by codes
  getByCodes: (lineMCs: LineMC[], codes: string[]): LineMC[] => {
    return lineMCs.filter(lineMC => codes.includes(lineMC.code));
  },

  // Get only active LineMCs
  getActive: (lineMCs: LineMC[]): LineMC[] => {
    return lineMCs.filter(lineMC => lineMC.is_active);  // FIXED: Use is_active
  },

  // Format LineMC names for display
  formatNames: (lineMCs: LineMC[]): string => {
    return lineMCs.map(lineMC => lineMC.name).join(', ');
  },

  // Sort LineMCs by name
  sortByName: (lineMCs: LineMC[]): LineMC[] => {
    return [...lineMCs].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Sort LineMCs by code
  sortByCode: (lineMCs: LineMC[]): LineMC[] => {
    return [...lineMCs].sort((a, b) => a.code.localeCompare(b.code));
  },
};

/*
=== LINEMC SELECTOR FEATURES ===

COMPLETE SEPARATION MAINTAINED:
✅ All LineMC selection logic in one component file
✅ Zero dependencies between entity files
✅ Everything for LineMC selector in one place
✅ No circular dependencies or import conflicts

COMPREHENSIVE SELECTOR FUNCTIONALITY:
✅ Single and multiple selection modes
✅ Active/inactive filtering options
✅ Loading states with spinner
✅ Error handling with retry functionality
✅ Proper disabled state handling
✅ Required field indication

DATA COMPATIBILITY:
✅ FIXED: Uses 'code' (string) as identifier instead of 'id' (number)
✅ FIXED: Uses 'is_active' property name to match backend
✅ FIXED: Uses 'response.data' to access LineMC array
✅ Proper sorting and filtering
✅ Inactive item indication in labels

UI/UX FEATURES:
✅ Accessible form labels with required indicators
✅ Proper focus states and keyboard navigation
✅ Error message display
✅ Loading state with meaningful message
✅ Retry functionality on error
✅ Disabled state styling

UTILITY FUNCTIONS:
✅ Custom hook for LineMC data management
✅ Utility functions for common operations
✅ Code-based lookups (instead of ID-based)
✅ Active filtering helpers
✅ Sorting by name and code

ARCHITECTURAL COMPLIANCE:
✅ Individual file for LineMC selector
✅ Complete independence from other entities
✅ Uses proper TypeScript typing
✅ Follows project structure requirements
✅ Zero external dependencies except UI components

This LineMC selector provides comprehensive selection functionality
while maintaining the Complete Separation Entity Architecture
with correct property names and data structure compatibility.
*/