// client/src/components/inspection/sampling-reason/SamplingReasonBrowseModal.tsx
// Sampling Reason Browse Modal Component - DATABASE SCHEMA COMPLIANT
// Complete Separation Entity Architecture - Modal for browsing and selecting sampling reasons

import React, { useState, useEffect, useMemo } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  TagIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  type SamplingReason,
  type SamplingReasonBrowseModalProps,
  type SamplingReasonFilters,
  DEFAULT_SAMPLING_REASON_FILTERS
} from '../../../types/sampling-reason';
import { samplingReasonService } from '../../../services/samplingReasonService';
import { formatDate } from '../../../utils/formatUtils';

// ============ TYPES ============

interface ModalState {
  reasons: SamplingReason[];
  filteredReasons: SamplingReason[];
  loading: boolean;
  error: string | null;
  filters: SamplingReasonFilters;
}

const DEFAULT_MODAL_STATE: Omit<ModalState, 'filters'> = {
  reasons: [],
  filteredReasons: [],
  loading: false,
  error: null
};

// ============ COMPONENT ============

/**
 * Sampling Reason Browse Modal Component
 * Complete Separation Entity Architecture - Browse and select sampling reasons with filtering
 * 
 * Database Schema Compliant:
 * - id SERIAL PRIMARY KEY
 * - name VARCHAR(100) UNIQUE NOT NULL
 * - description TEXT
 * - is_active BOOLEAN DEFAULT true
 * - created_by, updated_by, created_at, updated_at
 */
const SamplingReasonBrowseModal: React.FC<SamplingReasonBrowseModalProps> = ({
  isOpen,
  onClose,
  onReasonSelect,
  selectedReason
}) => {
  const [state, setState] = useState<ModalState>({
    ...DEFAULT_MODAL_STATE,
    filters: DEFAULT_SAMPLING_REASON_FILTERS
  });

  // ============ EFFECTS ============

  // Load reasons when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSamplingReasons();
    }
  }, [isOpen]);

  // Apply filters when filters or reasons change
  useEffect(() => {
    applyFilters();
  }, [state.reasons, state.filters]);

  // ============ API FUNCTIONS ============

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
        // Transform server data to match frontend interface
        const transformedReasons = result.data.map((reason: any) => ({
          id: reason.id,
          name: reason.name,
          description: reason.description,
          isActive: reason.is_active ?? reason.isActive ?? true,
          created_by: reason.created_by,
          updated_by: reason.updated_by,
          created_at: reason.created_at,
          updated_at: reason.updated_at
        }));

        setState(prev => ({
          ...prev,
          reasons: transformedReasons,
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
      console.error('Failed to load sampling reasons:', error);
      setState(prev => ({
        ...prev,
        error: 'Network error: Failed to connect to server',
        loading: false
      }));
    }
  };

  // ============ FILTER FUNCTIONS ============

  const applyFilters = () => {
    let filtered = [...state.reasons];

    // Apply search filter (search in name and description only)
    if (state.filters.search.trim()) {
      const searchTerm = state.filters.search.toLowerCase().trim();
      filtered = filtered.filter(reason =>
        reason.name.toLowerCase().includes(searchTerm) ||
        reason.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply active status filter
    if (state.filters.isActive !== null) {
      filtered = filtered.filter(reason => reason.isActive === state.filters.isActive);
    }

    setState(prev => ({
      ...prev,
      filteredReasons: filtered
    }));
  };

  const handleFilterChange = (field: keyof SamplingReasonFilters, value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  const handleClearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_SAMPLING_REASON_FILTERS
    }));
  };

  // ============ SELECTION HANDLERS ============

  const handleReasonSelect = (reason: SamplingReason) => {
    if (reason.isActive) {
      onReasonSelect(reason);
    }
  };

  // ============ RENDER HELPERS ============

  const hasActiveFilters = useMemo(() => {
    return Object.values(state.filters).some(value => 
      value !== null && value !== '' && value !== true
    );
  }, [state.filters]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <TagIcon className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Select Sampling Reason
              </h2>
              <p className="text-sm text-gray-600">
                Choose the appropriate reason for this inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={state.filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={state.filters.isActive === null ? '' : state.filters.isActive.toString()}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {state.filteredReasons.length} of {state.reasons.length} reasons shown
              </div>
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-orange-600 hover:text-orange-700"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading sampling reasons...</p>
              </div>
            </div>
          ) : state.error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Sampling Reasons
              </h3>
              <p className="text-gray-600 mb-4">{state.error}</p>
              <button
                onClick={loadSamplingReasons}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : state.filteredReasons.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sampling reasons found
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : 'No sampling reasons are currently available'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Available Sampling Reasons
                  </h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    {state.filteredReasons.length}
                  </span>
                </div>
                <button
                  onClick={loadSamplingReasons}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* 4-Column Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {state.filteredReasons.map((reason) => (
                  <div
                    key={reason.id}
                    onClick={() => handleReasonSelect(reason)}
                    className={`
                      relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                      ${!reason.isActive 
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' 
                        : selectedReason?.id === reason.id
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }
                    `}
                  >
                    {/* Selection Indicator */}
                    {selectedReason?.id === reason.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="h-5 w-5 text-orange-500" />
                      </div>
                    )}

                    {/* Reason Header */}
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                        {reason.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        ID: #{reason.id}
                      </p>
                    </div>

                    {/* Description */}
                    {reason.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                        {reason.description}
                      </p>
                    )}

                    {/* Status and Date */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reason.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {reason.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {reason.created_at && (
                        <span className="text-xs text-gray-500">
                          {formatDate(reason.created_at, '')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedReason 
              ? `Selected: ${selectedReason.name} (#${selectedReason.id})`
              : 'No reason selected'
            }
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {selectedReason && (
              <button
                onClick={() => handleReasonSelect(selectedReason)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Confirm Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamplingReasonBrowseModal;