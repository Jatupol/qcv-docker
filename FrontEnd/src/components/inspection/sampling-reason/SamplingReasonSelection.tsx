// client/src/components/inspection/sampling-reason/SamplingReasonSelection.tsx
// Main Sampling Reason Selection Component - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Complete reason selection functionality

import React, { useState, useEffect } from 'react';
import { 
  TagIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  type SamplingReason,
  type SamplingReasonSelectionProps,
  type SamplingReasonState,
  type SamplingReasonFilters,
  DEFAULT_SAMPLING_REASON_FILTERS,
  DEFAULT_SAMPLING_REASON_STATE
} from '../../../types/sampling-reason';
import { samplingReasonService } from '../../../services/samplingReasonService';
import SamplingReasonCard from './SamplingReasonCard';
import SamplingReasonSearch from './SamplingReasonSearch';

/**
 * Main Sampling Reason Selection Component
 * Complete Separation Entity Architecture - Complete reason selection functionality
 */

const SamplingReasonSelection: React.FC<SamplingReasonSelectionProps> = ({
  selectedReason,
  onReasonSelect,
  disabled = false,
  className = '',
  layout = 'grid',
  showSearch = true,
  showFilters = true
}) => {
  const [state, setState] = useState<SamplingReasonState>({
    ...DEFAULT_SAMPLING_REASON_STATE,
    filters: DEFAULT_SAMPLING_REASON_FILTERS
  });

  // Load sampling reasons on component mount
  useEffect(() => {
    loadSamplingReasons();
  }, []);

  const loadSamplingReasons = async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      // Use real API call to get active sampling reasons
      const result = await samplingReasonService.get({ isActive: true });
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          reasons: result.data || [],
          filteredReasons: result.data || [],
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to load sampling reasons',
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load sampling reasons',
        loading: false
      }));
    }
  };

  const handleReasonSelect = (reason: SamplingReason) => {
    if (!disabled && reason.isActive) {
      onReasonSelect(reason);
    }
  };

  const handleFilteredReasonsChange = (filteredReasons: SamplingReason[]) => {
    setState(prev => ({
      ...prev,
      filteredReasons
    }));
  };

  const handleFiltersChange = (filters: SamplingReasonFilters) => {
    setState(prev => ({
      ...prev,
      filters
    }));
  };

  const handleRetry = () => {
    loadSamplingReasons();
  };

  // Get layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'list':
        return 'space-y-3';
      case 'grid':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Component Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TagIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Select Sampling Reason
            </h2>
          </div>
          
          {/* Refresh Button */}
          {!state.loading && (
            <button
              onClick={handleRetry}
              disabled={disabled}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        {showSearch && (
          <div className="mb-6">
            <SamplingReasonSearch
              reasons={state.reasons}
              onFilter={handleFilteredReasonsChange}
              filters={state.filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Loading State */}
        {state.loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading sampling reasons...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{state.error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!state.loading && !state.error && state.filteredReasons.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sampling reasons found</h3>
            <p className="text-gray-600 mb-4">
              {state.reasons.length === 0 
                ? 'No sampling reasons are available at this time.'
                : 'No reasons match your current search criteria.'
              }
            </p>
            {state.reasons.length > 0 && state.filteredReasons.length === 0 && (
              <button
                onClick={() => handleFiltersChange(DEFAULT_SAMPLING_REASON_FILTERS)}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear filters to see all reasons
              </button>
            )}
          </div>
        )}

        {/* Sampling Reasons Grid/List */}
        {!state.loading && !state.error && state.filteredReasons.length > 0 && (
          <div className={getLayoutClasses()}>
            {state.filteredReasons.map((reason) => (
              <SamplingReasonCard
                key={reason.id}
                reason={reason}
                isSelected={selectedReason?.id === reason.id}
                onSelect={handleReasonSelect}
                disabled={disabled || !reason.isActive}
              />
            ))}
          </div>
        )}

        {/* Selected Reason Summary */}
        {selectedReason && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Selected Sampling Reason</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <div className="text-gray-900">{selectedReason.name}</div>
                </div>
                {selectedReason.code && (
                  <div>
                    <span className="font-medium text-gray-700">Code:</span>
                    <div className="text-gray-900">{selectedReason.code}</div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <div className="text-gray-900">{selectedReason.category || 'Not specified'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <div className="text-gray-900">{selectedReason.priority || 'Not specified'}</div>
                </div>
              </div>
            </div>
            
            {selectedReason.description && (
              <div className="mt-3">
                <span className="font-medium text-gray-700">Description:</span>
                <div className="text-gray-900 mt-1">{selectedReason.description}</div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {!state.loading && !state.error && state.filteredReasons.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing <span className="font-medium text-orange-600">{state.filteredReasons.length}</span> of{' '}
            <span className="font-medium">{state.reasons.length}</span> sampling reasons
          </div>
        )}
      </div>
    </div>
  );
};

export default SamplingReasonSelection;