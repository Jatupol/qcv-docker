// client/src/components/generic-page/EntitySearchControls.tsx
// Search and Filter Controls Component for Entity Pages
// Complete Separation Entity Architecture - Self-contained Search component

import React from 'react';
import Button from '../ui/Button';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// ============ INTERFACES ============

export interface SearchConfig {
  searchFields?: string[];
  enableAdvancedSearch?: boolean;
  searchMinLength?: number;
  searchPlaceholder?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface EntitySearchControlsProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchConfig?: SearchConfig;
  
  // Status Filter
  activeFilter: boolean | undefined;
  onFilterChange: (value: boolean | undefined) => void;
  
  // Clear Filters
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  
  // Create Action
  entityName: string;
  onCreateNew: () => void;
  
  // Additional Filters
  additionalFilters?: React.ReactNode;
  
  // Advanced Search
  showAdvancedSearch?: boolean;
  onToggleAdvancedSearch?: () => void;
  advancedSearchContent?: React.ReactNode;
  
  // Custom Actions
  customActions?: React.ReactNode;

  // Hide Create Button
  hideCreateButton?: boolean;

  // State
  loading?: boolean;

  // Layout
  className?: string;
}

// ============ COMPONENT ============

const EntitySearchControls: React.FC<EntitySearchControlsProps> = ({
  searchTerm,
  onSearchChange,
  searchConfig = {
    searchFields: ['code', 'name'],
    enableAdvancedSearch: false,
    searchMinLength: 1,
    searchPlaceholder: 'Search...'
  },
  activeFilter,
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
  entityName,
  onCreateNew,
  additionalFilters,
  showAdvancedSearch = false,
  onToggleAdvancedSearch,
  advancedSearchContent,
  customActions,
  hideCreateButton = false,
  loading = false,
  className = ''
}) => {
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    console.log('🔧 EntitySearchControls - handleStatusFilterChange called:', {
      value,
      entityName,
      currentActiveFilter: activeFilter
    });

    if (value === 'all') {
      console.log('🔧 EntitySearchControls - Setting filter to undefined (all)');
      onFilterChange(undefined);
    } else if (value === 'active') {
      console.log('🔧 EntitySearchControls - Setting filter to true (active)');
      onFilterChange(true);
    } else if (value === 'inactive') {
      console.log('🔧 EntitySearchControls - Setting filter to false (inactive)');
      onFilterChange(false);
    }
  };

  // Get current status filter value
  const getStatusFilterValue = () => {
    const value = activeFilter === undefined ? 'all' : (activeFilter ? 'active' : 'inactive');
    console.log('🔧 EntitySearchControls - getStatusFilterValue:', {
      activeFilter,
      value,
      entityName
    });
    return value;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Left Side - Search and Filters */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={searchConfig.searchPlaceholder || `Search ${entityName?.toLowerCase() || 'items'}s...`}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={getStatusFilterValue()}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Additional Filters */}
            {additionalFilters}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-3 sm:ml-6">
            {/* Custom Actions */}
            {customActions}

            {/* Create Button */}
            {!hideCreateButton && (
              <Button
                onClick={onCreateNew}
                className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create {entityName || 'New'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Search Section */}
      {showAdvancedSearch && advancedSearchContent && (
        <div className="border-t border-orange-200 px-6 py-4 bg-orange-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-orange-900">Advanced Search</h3>
              <button
                onClick={onToggleAdvancedSearch}
                className="text-orange-400 hover:text-orange-600 transition-colors"
              >
                ×
              </button>
            </div>
            {advancedSearchContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntitySearchControls;