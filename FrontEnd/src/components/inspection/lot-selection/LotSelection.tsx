// client/src/components/inspection/lot-selection/LotSelection.tsx
// Main Lot Selection Component - FIXED VERSION with Heroicons
// Complete Separation Entity Architecture - Combined lot selection with both methods

import React, { useState, useCallback, memo } from 'react';
import {
  CubeIcon,
  CheckCircleIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import type { LotData, LotSelectionProps } from '../../../types/inf-lotinput';
import LotSearchInput from './LotSearchInput';
import LotBrowseModal from './LotBrowseModal';

/**
 * Main Lot Selection Component
 * Complete Separation Entity Architecture - Combined lot selection with both methods
 * Optimized with React.memo and useCallback
 */

const LotSelection: React.FC<LotSelectionProps> = memo(({
  selectedLot,
  onLotSelect,
  disabled = false,
  className = '',
  samplingRound = 1
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLotSelect = useCallback((lot: LotData) => {
    onLotSelect(lot);
  }, [onLotSelect]);

  const handleModalLotSelect = useCallback((lot: LotData) => {
    onLotSelect(lot);
    setIsModalOpen(false);
  }, [onLotSelect]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        
        {/* Component Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CubeIcon className="h-5 w-5 mr-2 text-orange-500" />
          Lot Selection
        </h2>

        <div className="space-y-6">
          
          {/* Lot Selection Methods - Same Row */}
          <div className="flex gap-3">
            {/* Method 1: Text Input Search */}
            <div className="flex-1">
              <LotSearchInput
                selectedLot={selectedLot}
                onLotSelect={handleLotSelect}
                disabled={disabled}
                placeholder="Enter lot number (min 3 characters)..."
                className="w-full"
              />
            </div>

            {/* Method 2: Browse Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleOpenModal}
                disabled={disabled}
                className="h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 rounded-lg font-medium transition-colors flex items-center space-x-2 group whitespace-nowrap"
              >
                <ListBulletIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Browse Lots</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Lot Display */}
        {selectedLot && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-green-800 text-lg">Selected Lot Information</span>
            </div>

            {/* Essential Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">

            {/* Primary Information - Lot Number */}
            <div className="mb-2 p-3 bg-white  rounded-lg border border-green-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Lot Number</div>
              <div className="text-2xl font-bold text-gray-900 font-mono tracking-wide">
                {selectedLot.lotno}
              </div> 
            </div>

              {/* Sampling Round */}
            <div className="mb-2 p-3 bg-black rounded-lg border border-green-200">
              <div className="text-sm font-medium text-white mb-1">Sampling Round</div>
              <div className="text-2xl font-bold text-white font-mono">
                 {samplingRound}
              </div> 
            </div>

              {/* Item Number */}
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm font-medium text-gray-600 mb-1">Item Number</div>
                <div className="text-lg font-semibold text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                  {selectedLot.itemno}
                </div>
              </div>

              {/* Part Site */}
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm font-medium text-gray-600 mb-1">Part Site</div>
                <div className="text-lg font-bold text-orange-700">
                  {selectedLot.partsite}
                </div>
              </div>

              {/* Model */}
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm font-medium text-gray-600 mb-1">Model</div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedLot.model} ({selectedLot.version})
                </div>
              </div>

              {/* Version */}
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm font-medium text-gray-600 mb-1">MC Line No.</div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedLot.lineno}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {selectedLot.status && (
              <div className="mt-4 flex justify-end">
                <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                  selectedLot.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedLot.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Status: {selectedLot.status}
                </span>
              </div>
            )}
          </div>
        )}

 
      </div>

      {/* Browse Modal */}
      <LotBrowseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLotSelect={handleModalLotSelect}
        selectedLot={selectedLot}
      />
    </div>
  );
});

LotSelection.displayName = 'LotSelection';

export default LotSelection;