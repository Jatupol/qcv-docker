// client/src/components/inspection/lot-selection/LotInfoModal.tsx
// Reusable Lot Information Modal Component
// Complete Separation Entity Architecture - Displays comprehensive lot information

import React from 'react';
import {
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ClockIcon,
  PrinterIcon,
  CodeBracketSquareIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { LotData } from '../../../types/inf-lotinput';
import { formatDate } from '../../../utils/formatUtils';

// ==================== INTERFACES ====================

export interface LotInfoModalProps {
  lot: LotData | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  title?: string;
  showPrintButton?: boolean;
}

// ==================== HELPER FUNCTIONS ====================


const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'active':
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
    case 'pending':
      return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    default:
      return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
  }
};

// ==================== COMPONENT ====================

export const LotInfoModal: React.FC<LotInfoModalProps> = ({
  lot,
  isOpen,
  onClose,
  onPrint,
  title = 'Lot Information',
  showPrintButton = true
}) => {
  if (!isOpen || !lot) return null;

  // Debug log to see the lot data
  console.log('🔍 LotInfoModal - Lot data:', lot);

  // Handle both lowercase and PascalCase property names
  // Support both direct object and array[0] format
  const lotData: any = Array.isArray(lot) ? lot[0] : lot;

  const getLotValue = (pascalKey: string, lowerKey: string): string => {
    return lotData[pascalKey] || lotData[lowerKey] || 'N/A';
  };

  const lotno = getLotValue('LotNo', 'lotno');
  const itemno = getLotValue('ItemNo', 'itemno');
  const partsite = getLotValue('PartSite', 'partsite');
  const model = getLotValue('Model', 'model');
  const version = getLotValue('Version', 'version');
  const lineno = getLotValue('LineNo', 'lineno');
  const lotId = getLotValue('id', 'id');
  const inputdate = lotData.InputDate || lotData.inputdate;
  const finishOn = lotData.FinishOn || lotData.finish_on;
  const status = lotData.status;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header - Compact */}
        <div className="px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CubeIcon className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Content - Compact Layout */}
        <div className="p-4">
          {/* Lot Number - Prominent Display */}
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <TagIcon className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-800">Lot Number</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 font-mono tracking-wide">
                  {lotno}
                </div>
              </div>
              {status && (
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="capitalize">{status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Information Grid */}
          <div className="space-y-3">
            {/* Product Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <CpuChipIcon className="h-4 w-4 mr-1 text-blue-600" />
                Product Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <CompactField label="Item No" value={itemno} />
                <CompactField label="Part Site" value={partsite} />
                <CompactField label="Model" value={model} />
                <CompactField label="Version" value={version} />
              </div>
            </div>

            {/* Production Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1 text-green-600" />
                Production Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <CompactField label="Machine Line No" value={lineno} />
                <CompactField label="Lot ID" value={lotId} />
                <CompactField label="Input Date" value={formatDate(inputdate)} />
                <CompactField label="Finish Date" value={formatDate(finishOn)} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions - Compact */}
        <div className="flex justify-end space-x-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
            onClick={onClose}
          >
            Close
          </button>
          {showPrintButton && onPrint && (
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all duration-200 flex items-center space-x-1"
              onClick={onPrint}
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

interface CompactFieldProps {
  label: string;
  value: string;
}

const CompactField: React.FC<CompactFieldProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 font-medium mb-0.5">{label}:</span>
      <span className="text-gray-900 font-semibold">{value}</span>
    </div>
  );
};

LotInfoModal.displayName = 'LotInfoModal';

export default LotInfoModal;
