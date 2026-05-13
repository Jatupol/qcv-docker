// client/src/components/inspection/RecordDetailModal.tsx
// Record Detail Modal Component - Displays all inspection record fields from database
// Reusable component for OQA, OBA, and SIV inspection stations

import React, { useState, useEffect } from 'react';
import { XCircleIcon, CheckCircleIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import { type InspectionRecord } from '../../types/inspectiondata';
import { DefectsDataTable } from './DefectsDataTable';
import { formatDate, formatDateTime } from '../../utils/formatUtils';

// ==================== INTERFACES ====================

export interface StationTheme {
  modalButton: string;
  modalButtonHover: string;
}

interface RecordDetailModalProps {
  record: InspectionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  theme: StationTheme;
  stationCode: string;
  serviceType?: 'defectdata' | 'defectdata-customer'; // Optional: Which service to use (default: 'defectdata')
}

// ==================== HELPER FUNCTIONS ====================

const getStatusColor = (judgment: boolean | 'Pass' | 'Reject' | null) => {
  if (judgment === null) {
    return 'bg-gray-100 text-gray-600 border-gray-200';
  }
  const isPass = judgment === true || judgment === 'Pass';
  return isPass
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

const getStatusIcon = (judgment: boolean | 'Pass' | 'Reject' | null) => {
  if (judgment === null) {
    return <XCircleIcon className="h-5 w-5 text-gray-400" />;
  }
  const isPass = judgment === true || judgment === 'Pass';
  return isPass
    ? <CheckCircleIcon className="h-5 w-5 text-green-600" />
    : <XCircleIcon className="h-5 w-5 text-red-600" />;
};

const getStatusText = (judgment: boolean | 'Pass' | 'Reject' | null) => {
  if (judgment === null) {
    return '';
  }
  if (typeof judgment === 'boolean') {
    return judgment ? 'Pass' : 'Reject';
  }
  return judgment;
};

const formatNumber = (value: number | string): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return value.toLocaleString();
};


// ==================== COMPONENT ====================

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onPrint,
  theme,
  stationCode,
  serviceType = 'defectdata'
}) => {
  const [createdByName, setCreatedByName] = useState<string>('');
  const [updatedByName, setUpdatedByName] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Fetch user names when record changes
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!record) return;

      setLoadingUsers(true);

      try {
        // Fetch created_by user
        if (record.created_by) {
          const createdUserResponse = await userService.getUserById(record.created_by);
          if (createdUserResponse.success && createdUserResponse.data) {
            const user = createdUserResponse.data;
            setCreatedByName(`${user.name}`);
          } else {
            setCreatedByName(`User ${record.created_by}`);
          }
        }

        // Fetch updated_by user
        if (record.updated_by) {
          const updatedUserResponse = await userService.getUserById(record.updated_by);
          if (updatedUserResponse.success && updatedUserResponse.data) {
            const user = updatedUserResponse.data;
            setUpdatedByName(`${user.name}`);
          } else {
            setUpdatedByName(`User ${record.updated_by}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user names:', error);
        // Fallback to user IDs
        if (record.created_by) setCreatedByName(`User ${record.created_by}`);
        if (record.updated_by) setUpdatedByName(`User ${record.updated_by}`);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && record) {
      fetchUserNames();
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // Debug logging
  console.log('🔍 RecordDetailModal - record:', record);
  console.log('🔍 RecordDetailModal - defects:', record.defects);
  console.log('🔍 RecordDetailModal - defects length:', record.defects?.length);

  const judgmentStatus = getStatusText(record.judgment);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header - Compact */}
        <div className={`px-4 py-3 rounded-t-xl ${
          judgmentStatus === 'Pass'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : judgmentStatus === 'Reject'
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Inspection Details
              </h3>
              <p className="text-white/80 text-xs mt-0.5">
                {stationCode} Station - ID: {record.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Content - Compact */}
        <div className="p-4 space-y-3">
          {/* Section 1: Inspection Identification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-bold text-blue-900 mb-2">Inspection Identification</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <CompactField label="Station" value={record.station} />
              <CompactField label="Sampling No" value={record.inspectionNo} />
              <CompactField label="Inspection Ref" value={record.inspectionNoRef || 'N/A'} />
              <CompactField label="Date" value={formatDate(record.inspectionDate, 'N/A')} />
              <CompactField label="FY/WW" value={record.fy + '/' + record.ww}  />
              <CompactField label="Month/Year" value={record.month_year} />
              <CompactField label="Shift" value={record.shift} />
              <CompactField label="QC Inspector" value={`QC${record.qc_id}`} />
              <CompactField label="Sampling Reason" value={record.sampling_reason_description || 'N/A'}/>
              <CompactField label="FVI Lot Qty" value={formatNumber(record.fviLotQty)} highlight  />
              <CompactField label="General Sampling" value={formatNumber(record.generalSamplingQty)} highlight  />
              <CompactField label="Crack Sampling"  value={formatNumber(record.crackSamplingQty)} highlight />         

            </div>
          </div>

          {/* Section 2: Product Information */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="text-sm font-bold text-purple-900 mb-2">Product Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <CompactField label="Lot No" value={record.lotno} />
              <CompactField label="Item No" value={record.itemno} />
              <CompactField label="Model" value={record.model} />
              <CompactField label="Version" value={record.version} />
              <CompactField label="Part Site" value={record.partsite} />
              <CompactField label="Round" value={record.samplingRound.toString()} />
              <CompactField label="FVI Line No" value={record.fvilineno} />
              <CompactField label="MC Line No" value={record.mclineno} />
            </div>
          </div>

          {/* Section 3: Judgment & Audit Information */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <h4 className="text-sm font-bold text-indigo-900 mb-2">Judgment & Audit</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Judgment */}
              <div>
                <span className="text-xs font-semibold text-gray-600">Final Judgment:</span>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium mt-1 ${getStatusColor(record.judgment)}`}>
                  {getStatusIcon(record.judgment)}
                  <span className="font-bold">{judgmentStatus}</span>
                </div>
    
              </div>

              {/* Audit Information */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <CompactField
                  label="Created At"
                  value={formatDateTime(record.created_at, 'N/A')}
                />
                <CompactField
                  label="Created By "
                  value={loadingUsers ? 'Loading...' : (createdByName || (record.created_by ? `User ${record.created_by}` : 'N/A'))}
                />
                <CompactField
                  label="Updated At"
                  value={formatDateTime(record.updated_at, 'N/A')}
                />
                <CompactField
                  label="Updated By"
                  value={loadingUsers ? 'Loading...' : (updatedByName || (record.updated_by ? `User ${record.updated_by}` : 'N/A'))}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Defect Details DataTable */}
          <DefectsDataTable inspectionNo={record.inspectionNo} showHeader={true} serviceType={serviceType} />
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
          {onPrint && (
            <button
              type="button"
              className={`px-4 py-2 bg-gradient-to-r ${theme.modalButton} text-white rounded-lg text-sm font-medium ${theme.modalButtonHover} transition-all duration-200 flex items-center space-x-1`}
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
  value: string | number;
  highlight?: boolean;
}

const CompactField: React.FC<CompactFieldProps> = ({ label, value, highlight = false }) => {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 font-medium mb-0.5">{label}:</span>
      <span className={`${highlight ? 'font-bold text-blue-900' : 'text-gray-900 font-semibold'}`}>
        {value}
      </span>
    </div>
  );
};

export default RecordDetailModal;
