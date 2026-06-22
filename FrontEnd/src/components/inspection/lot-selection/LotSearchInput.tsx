// client/src/components/inspection/lot-selection/LotSearchInput.tsx
// Lot Search Input Component - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Text input search for lots

import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import type { LotData, LotSearchInputProps, SearchState } from '../../../types/inf-lotinput';
import {   DEFAULT_SEARCH_STATE } from '../../../types/inf-lotinput';
import { infLotInputService } from '../../../services/infLotInputService';

/**
 * Lot Search Input Component
 * Complete Separation Entity Architecture - Text input search for lots
 */

const LotSearchInput: React.FC<LotSearchInputProps> = ({
  selectedLot,
  onLotSelect,
  disabled = false,
  placeholder = "Enter lot number (min 3 characters)...",
  className = ''
}) => {
  const [state, setState] = useState<SearchState>(DEFAULT_SEARCH_STATE);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Initialize input with selected lot
  useEffect(() => {
    if (selectedLot && state.input !== selectedLot.lotno) {
      setState(prev => ({ ...prev, input: selectedLot.lotno }));
    }
  }, [selectedLot]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Skip search if this is the initial load with a selected lot
    if (isInitialLoadRef.current && selectedLot && state.input === selectedLot.lotno) {
      isInitialLoadRef.current = false;
      return;
    }

    if (state.input.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(state.input.trim());
      }, 500);
    } else {
      setState(prev => ({
        ...prev,
        results: [],
        showDropdown: false,
        error: null
      }));
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [state.input]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setState(prev => ({ ...prev, showDropdown: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (lotNumber: string) => {
    setState(prev => ({
      ...prev,
      isSearching: true,
      error: null
    }));

    try {
      // Use mock search for now - replace with real API when available
      const result = await infLotInputService.searchLot(lotNumber);
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          results: result.data || [],
          showDropdown: true,
          isSearching: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Search failed',
          results: [],
          showDropdown: false,
          isSearching: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Search failed',
        results: [],
        showDropdown: false,
        isSearching: false
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      input: value,
      error: null
    }));
  };

  const handleLotSelect = (lot: LotData) => {
    setState(prev => ({
      ...prev,
      input: lot.lotno,
      results: [],
      showDropdown: false,
      error: null
    }));
    onLotSelect(lot);
  };

  const handleFocus = () => {
    if (state.results.length > 0) {
      setState(prev => ({ ...prev, showDropdown: true }));
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={state.input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />
        
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        
        {state.isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ArrowPathIcon className="h-5 w-5 text-orange-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      {state.showDropdown && state.results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto"
        >
          {state.results.map((lot) => (
            <button
              key={lot.id}
              onClick={() => handleLotSelect(lot)}
              className="w-full p-4 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              {/* Lot Number - Primary */}
              <div className="mb-3">
                <div className="font-bold text-lg text-gray-900">{lot.lotno}</div>
              </div>

              {/* Essential Information Only */}
              <div className="space-y-2 grid grid-cols-2 text-sm">
                {/* Item Number */}
                <div>
                  <span className="font-medium text-gray-600">Item No:</span>
                  <div className="text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                    {lot.itemno}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Model:</span>
                  <div className="text-gray-900 font-semibold mt-1 truncate">
                    {lot.model} -  {lot.version}
                  </div>
                </div>
 

       
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Search Results Count */}
      {state.results.length > 0 && state.showDropdown && (
        <div className="absolute z-10 w-full bg-gray-50 border-l border-r border-b border-gray-300 rounded-b-lg px-3 py-1">
          <div className="text-xs text-gray-600">
            {state.results.length} lot{state.results.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </div>
  );
};

export default LotSearchInput;