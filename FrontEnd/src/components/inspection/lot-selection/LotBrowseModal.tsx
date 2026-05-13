// client/src/components/inspection/lot-selection/LotBrowseModal.tsx
// Lot Browse Modal Component - REAL DATABASE IMPLEMENTATION WITH FINISH DATE FILTER
// Complete Separation Entity Architecture - Modal for browsing lots from inf_lotinput table

import React, { useState, useEffect, useMemo } from 'react';
import { 
  XMarkIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  CpuChipIcon,
  Squares2X2Icon,
  CheckCircleIcon,
  SignalIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { type LotData, type LotBrowseModalProps, type ModalState, type LotFilters, DEFAULT_LOT_FILTERS } from '../../../types/inf-lotinput';
import { infLotInputService } from '../../../services/infLotInputService';

/**
 * Lot Browse Modal Component
 * Loads real data from inf_lotinput database table via /api/inf-lotinput
 * Now includes finish_on date filtering with today as default
 */

const LotBrowseModal: React.FC<LotBrowseModalProps> = ({
  isOpen,
  onClose,
  onLotSelect,
  selectedLot
}) => {
  const [state, setState] = useState<ModalState>({
    lots: [],
    loading: false,
    error: null,
    filters: {
      ...DEFAULT_LOT_FILTERS,
      // Start with no date filter to show all lots
      finishDateFrom: '',
      finishDateTo: ''
    }
  });

  const [dbStats, setDbStats] = useState<{
    totalRecords: number;
    todayImports: number;
    lastImportDate: Date | null;
  } | null>(null);

  // Load lots from database when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLotsFromDatabase();
      loadDatabaseStats();
    }
  }, [isOpen]);

  const loadLotsFromDatabase = async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      console.log('🔄 Loading lots from inf_lotinput database...');
      const result = await infLotInputService.getRecentLots(100);
      
      if (result.success && result.data) {
        console.log('✅ Database loaded:', result.data.length, 'lots found');
        setState(prev => ({
          ...prev,
          lots: result.data,
          loading: false,
          error: null
        }));
      } else {
        console.error('❌ Database load failed:', result.error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to load lots from database'
        }));
      }
    } catch (error) {
      console.error('💥 Database load exception:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error: Could not connect to database'
      }));
    }
  };

  const loadDatabaseStats = async () => {
    try {
      console.log('📊 Loading database statistics...');
      const stats = await infLotInputService.getStatistics();
      if (stats.success && stats.data) {
        console.log('📊 Database statistics:', stats.data);
        setDbStats(stats.data);
      }
    } catch (error) {
      console.warn('⚠️ Could not load database statistics:', error);
    }
  };

  const handleAdvancedSearch = async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      console.log('🔍 Searching lots in database with filters:', state.filters);
      
      // Build search filters including finish date filters
      const searchFilters = {
        ...state.filters,
        finishOnFrom: state.filters.finishDateFrom || undefined,
        finishOnTo: state.filters.finishDateTo || undefined
      };
      
      const result = await infLotInputService.getAllLots(searchFilters);
      
      if (result.success && result.data) {
        console.log('✅ Search completed:', result.data.length, 'lots found');
        setState(prev => ({
          ...prev,
          lots: result.data,
          loading: false,
          error: null
        }));
      } else {
        console.error('❌ Search failed:', result.error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Database search failed'
        }));
      }
    } catch (error) {
      console.error('💥 Search exception:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error: Database search failed'
      }));
    }
  };

  const handleFilterChange = (field: keyof LotFilters, value: string) => {
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
      filters: {
        ...DEFAULT_LOT_FILTERS,
        // Clear all date filters
        finishDateFrom: '',
        finishDateTo: ''
      }
    }));
    loadLotsFromDatabase();
  };

  const handleLotSelect = (lot: LotData) => {
    console.log('🎯 Lot selected from database:', lot.lotno, '-', lot.model);
    onLotSelect(lot);
    onClose();
  };

  const handleRefreshDatabase = () => {
    console.log('🔄 Manual database refresh requested');
    loadLotsFromDatabase();
  };

  // Highlight search matches utility function
  const highlightText = (text: string, searchTerm: string): JSX.Element => {
    if (!searchTerm || !text) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-yellow-900 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Enhanced client-side filtering for real-time results including comprehensive search
  const filteredLots = useMemo(() => {
    if (!state.lots.length) return [];

    return state.lots.filter(lot => {
      const searchLower = state.filters.search.toLowerCase();
      const partsiteLower = state.filters.partsite.toLowerCase();
      const modelLower = state.filters.model.toLowerCase();
      const linenoLower = state.filters.lineno.toLowerCase();

      // Enhanced comprehensive search - searches across multiple fields
      const globalSearch = searchLower && (
        lot.lotno.toLowerCase().includes(searchLower) ||
        lot.itemno.toLowerCase().includes(searchLower) ||
        lot.partsite.toLowerCase().includes(searchLower) ||
        lot.model.toLowerCase().includes(searchLower) ||
        lot.version.toLowerCase().includes(searchLower) ||
        lot.lineno.toLowerCase().includes(searchLower)
      );

      // Date filtering for finish_on
      const finishDate = new Date(lot.finish_on);
      const finishDateFromFilter = state.filters.finishDateFrom ? new Date(state.filters.finishDateFrom) : null;
      const finishDateToFilter = state.filters.finishDateTo ? new Date(state.filters.finishDateTo) : null;

      const matchesFinishDateFrom = !finishDateFromFilter || finishDate >= finishDateFromFilter;
      const matchesFinishDateTo = !finishDateToFilter || finishDate <= finishDateToFilter;

      return (!searchLower || globalSearch) &&
             (!partsiteLower || lot.partsite.toLowerCase().includes(partsiteLower)) &&
             (!modelLower || lot.model.toLowerCase().includes(modelLower)) &&
             (!linenoLower || lot.lineno.toLowerCase().includes(linenoLower)) &&
             matchesFinishDateFrom &&
             matchesFinishDateTo;
    });
  }, [state.lots, state.filters]);

  const hasActiveFilters = Object.values(state.filters).some(value => value.trim() !== '');


  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'active':
        return 'border-green-300 bg-green-50';
      case 'completed':
        return 'border-blue-300 bg-blue-50';
      case 'pending':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <SignalIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Live Database</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Filters - Updated with Finish Date Filter */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Global Search
                  <span className="text-xs text-gray-500 ml-2">
                    (Searches: Lot No, Item No, Part Site, Model, Version, Line No)
                  </span>
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={state.filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search across Lot No, Item No, Part Site, Model, Version, Line No..."
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                  />
                  {state.filters.search && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                      title="Clear search"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {state.filters.search && (
                  <div className="mt-1 text-xs text-orange-600">
                    Searching in: Lot Number, Item Number, Part Site, Model, Version, Line Number
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading lots from database...</p>
              </div>
            ) : state.error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Database Error</h3>
                <p className="text-red-600 mb-4">{state.error}</p>
                <button
                  onClick={loadLotsFromDatabase}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Retry Database Connection
                </button>
              </div>
            ) : filteredLots.length === 0 ? (
              <div className="text-center py-12">
                <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Lots Found</h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? 'No lots match your search criteria. Try adjusting your filters.'
                    : 'No production lots found in the database.'
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-medium text-gray-900">Production Lots</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {filteredLots.length}
                    </span>
                    {state.filters.search && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Search: "{state.filters.search}"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRefreshDatabase}
                    disabled={state.loading}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Lot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLots.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => handleLotSelect(lot)}
                      className={`
                        relative p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md
                        ${selectedLot?.id === lot.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : getStatusColor(lot.status)
                        }
                      `}
                    >
                      {/* Lot Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CubeIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <span className="font-bold text-gray-900 truncate text-lg">
                            {highlightText(lot.lotno, state.filters.search)}
                          </span>
                        </div>
                        {selectedLot?.id === lot.id && (
                          <CheckCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Essential Lot Information Only */}
                      <div className="space-y-3 text-sm grid grid-cols-2 gap-2">
                        {/* Item Number - Prominent */}
                        <div className="p-2 bg-gray-50 rounded border">
                          <div className="text-xs font-medium text-gray-600 mb-1">Item Number</div>
                          <div className="font-mono font-semibold text-gray-900">
                            {highlightText(lot.itemno, state.filters.search)}
                          </div>
                        </div>

                        {/* Part Site */}
                        <div className="flex items-center space-x-2">
                          <BuildingStorefrontIcon className="h-4 w-4 flex-shrink-0 text-orange-500" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-600">Part Site</div>
                            <div className="font-semibold text-orange-700">
                              {highlightText(lot.partsite, state.filters.search)}
                            </div>
                          </div>
                        </div>

                        {/* Model & Version - Combined */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-1">
                            <CpuChipIcon className="h-4 w-4 flex-shrink-0 text-purple-500" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-600">Model</div>
                              <div className="font-semibold text-gray-900 truncate">
                                {highlightText(lot.model, state.filters.search)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Squares2X2Icon className="h-4 w-4 flex-shrink-0 text-green-500" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-600">Version</div>
                              <div className="font-semibold text-gray-900 truncate">
                                {highlightText(lot.version, state.filters.search)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Line Number */}
                        <div className="flex items-center space-x-2">
                          <Squares2X2Icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-600">Line Number</div>
                            <div className="font-medium text-gray-900">
                              {highlightText(lot.lineno, state.filters.search)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedLot 
                ? `Selected: ${selectedLot.lotno} (${selectedLot.model}) from database`
                : 'No lot selected'
              }
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshDatabase}
                disabled={state.loading}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh Database</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotBrowseModal;