// client/src/components/inspection/sampling-reason/SamplingReasonSearch.tsx
// Sampling Reason Search Component - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Search and filter functionality

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { 
  type SamplingReason,
  type SamplingReasonSearchProps,
  type SamplingReasonFilters,
  SAMPLING_REASON_CATEGORIES,
  SAMPLING_REASON_PRIORITIES,
  filterSamplingReasons
} from '../../../types/sampling-reason';

/**
 * Sampling Reason Search Component
 * Complete Separation Entity Architecture - Search and filter functionality
 */

const SamplingReasonSearch: React.FC<SamplingReasonSearchProps> = ({
  reasons,
  onFilter,
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<SamplingReasonFilters>(filters);

  // Apply filters when they change
  useEffect(() => {
    const filteredReasons = filterSamplingReasons(reasons, localFilters);
    onFilter(filteredReasons);
    onFiltersChange(localFilters);
  }, [localFilters, reasons, onFilter, onFiltersChange]);

  const handleFilterChange = (field: keyof SamplingReasonFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    const clearedFilters: SamplingReasonFilters = {
      search: '',
      category: '',
      priority: '',
      isActive: true // Keep active filter as default
    };
    setLocalFilters(clearedFilters);
  };

  const hasActiveFilters = localFilters.search || 
                          localFilters.category || 
                          localFilters.priority || 
                          localFilters.isActive === false;

  const filteredCount = filterSamplingReasons(reasons, localFilters).length;

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localFilters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search by name, description, or code..."
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-1 rounded transition-colors ${
              showAdvancedFilters ? 'text-orange-600 bg-orange-100' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Toggle advanced filters"
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {SAMPLING_REASON_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={localFilters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {SAMPLING_REASON_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={localFilters.isActive === null ? '' : localFilters.isActive.toString()}
                onChange={(e) => handleFilterChange('isActive', 
                  e.target.value === '' ? null : e.target.value === 'true'
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredCount}</span> of{' '}
              <span className="font-medium">{reasons.length}</span> reasons
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters (always visible) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Active Filter Pills */}
        {localFilters.search && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
            <span>Search: "{localFilters.search}"</span>
            <button
              onClick={() => handleFilterChange('search', '')}
              className="text-orange-600 hover:text-orange-800"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {localFilters.category && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            <span>Category: {SAMPLING_REASON_CATEGORIES.find(c => c.value === localFilters.category)?.label}</span>
            <button
              onClick={() => handleFilterChange('category', '')}
              className="text-blue-600 hover:text-blue-800"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {localFilters.priority && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
            <span>Priority: {SAMPLING_REASON_PRIORITIES.find(p => p.value === localFilters.priority)?.label}</span>
            <button
              onClick={() => handleFilterChange('priority', '')}
              className="text-purple-600 hover:text-purple-800"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {localFilters.isActive === false && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            <span>Status: Inactive</span>
            <button
              onClick={() => handleFilterChange('isActive', true)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Reset All Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium text-orange-600">{filteredCount}</span> of{' '}
          <span className="font-medium">{reasons.length}</span> sampling reasons
        </div>
      )}
    </div>
  );
};

export default SamplingReasonSearch;