// client/src/pages/customer-data/InspectionCustomerEditPage.tsx
// Customer OQA Inspection Edit Page — updates judgment in inspectiondata_customer

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BeakerIcon,
  DocumentTextIcon,
  HomeIcon,
  ChevronRightIcon,
  ListBulletIcon,
  PencilIcon,
  ChartBarIcon,
  CubeIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationHelpers } from '../../components/common/NotificationSystem';
import { useSound } from '../../hooks/useSoundNotification';
import { inspectionDataService } from '../../services/inspectionDataService';
import { formatDateTimeFull, toLocalDate } from '../../utils/formatUtils';
import type { InspectionData } from '../../types/inspectiondata';

// ==================== PURPLE THEME ====================

const THEME = {
  header: 'from-purple-600 to-violet-700',
  headerText: 'text-purple-100',
  headerBorder: 'border-purple-300',
  infoSection: 'from-purple-50 to-violet-50',
  infoBorder: 'border-purple-200',
  infoText: 'text-purple-900',
  infoLabel: 'text-purple-800',
  step1Section: 'from-fuchsia-50 to-pink-50',
  step1Border: 'border-fuchsia-200',
  step1Text: 'text-fuchsia-900',
  step1Icon: 'bg-fuchsia-500',
  step2Section: 'from-violet-50 to-purple-50',
  step2Border: 'border-violet-200',
  step2Text: 'text-violet-900',
  step2Icon: 'bg-violet-500',
  step3Section: 'from-indigo-50 to-purple-50',
  step3Border: 'border-indigo-200',
  step3Text: 'text-indigo-900',
  step3Icon: 'bg-indigo-500',
  step4Border: 'border-purple-500',
  focusRing: 'focus:ring-purple-500 focus:border-purple-500',
  buttonGradient: 'from-purple-500 to-violet-600',
  buttonHover: 'hover:from-purple-600 hover:to-violet-700',
  loadingSpinner: 'text-purple-500',
};

// ==================== COMPONENT ====================

const InspectionCustomerEditPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotificationHelpers();
  const sound = useSound();

  // Edit data passed from list page
  const inspectionId: number | null = location.state?.inspectionId ?? null;

  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [judgment, setJudgment] = useState<'pass' | 'reject' | null>(null);

  // ==================== NAVIGATION ====================

  const handleGoHome = useCallback(() => navigate('/dashboard'), [navigate]);
  const handleGoToList = useCallback(() => navigate('/customer-data/oqa'), [navigate]);

  // ==================== LOAD INSPECTION DATA ====================

  useEffect(() => {
    const load = async () => {
      if (!inspectionId) {
        setError('No inspection ID provided. Please navigate from the OQA Customer list.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load full inspection data
        const result = await inspectionDataService.getById(inspectionId);
        if (!result.success || !result.data) {
          setError('Failed to load inspection data.');
          return;
        }

        setInspection(result.data);

        // Load judgment from inspectiondata_customer (authoritative source)
        const judgmentResult = await inspectionDataService.getCustomerJudgment(result.data.inspection_no);
        if (judgmentResult.success && judgmentResult.data) {
          const j = judgmentResult.data.judgment;
          setJudgment(j === true ? 'pass' : j === false ? 'reject' : null);
        } else {
          // Fallback to inspectiondata.judgment
          setJudgment(result.data.judgment === true ? 'pass' : result.data.judgment === false ? 'reject' : null);
        }
      } catch {
        setError('Failed to load inspection data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [inspectionId]);

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    if (!inspection || judgment === null) {
      showError('Incomplete', 'Please select a judgment before saving.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await inspectionDataService.updateCustomerJudgment(
        inspection.inspection_no,
        judgment === 'pass'
      );

      if (!result.success) {
        const msg = result.errors?.[0]?.message || 'Failed to update judgment';
        setError(msg);
        sound.playError();
        showError('Update Failed', msg);
        return;
      }

      sound.playSave();
      showSuccess('Judgment Updated', `Inspection ${inspection.inspection_no} updated to ${judgment.toUpperCase()}`);
      setTimeout(() => navigate('/customer-data/oqa'), 1500);
    } catch {
      sound.playError();
      showError('Error', 'Failed to update judgment');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== LOADING / ERROR STATES ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className={`w-8 h-8 animate-spin ${THEME.loadingSpinner} mx-auto mb-4`} />
          <p className="text-gray-600">Loading Customer Inspection...</p>
        </div>
      </div>
    );
  }

  if (error && !inspection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleGoToList} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            Back to OQA List
          </button>
        </div>
      </div>
    );
  }

  const inspectionDate = inspection?.inspection_date ? toLocalDate(inspection.inspection_date) : null;

  // ==================== STEP INDICATOR ====================

  const steps = [
    { id: 1, name: 'Inspection Info', done: true },
    { id: 2, name: 'Sampling Reason', done: !!inspection?.sampling_reason_id },
    { id: 3, name: 'Lot Selection', done: !!inspection?.lotno },
    { id: 4, name: 'Configuration', done: (inspection?.fvi_lot_qty ?? 0) > 0 },
    { id: 5, name: 'Judgment', done: judgment !== null },
  ];

  // ==================== RENDER ====================

  return (
    <div className="flex-1 -mx-6 -my-8 p-6">

      {/* Breadcrumb */}
      <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm">
            <button onClick={handleGoHome} className="flex items-center text-gray-600 hover:text-purple-600 transition-colors">
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <button onClick={handleGoToList} className="text-gray-600 hover:text-purple-600 transition-colors">
              Customer Data
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <button onClick={handleGoToList} className="text-gray-600 hover:text-purple-600 transition-colors">
              OQA Customer Lists
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <span className={`font-semibold ${THEME.infoText}`}>Edit OQA Customer</span>
          </nav>
          <button
            onClick={handleGoToList}
            className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${THEME.buttonGradient} text-white rounded-lg ${THEME.buttonHover} transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            <ListBulletIcon className="h-5 w-5" />
            <span>View OQA Lists</span>
          </button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      <div className="mb-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-3">
          <PencilIcon className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-lg font-bold text-white">Edit Mode — Customer Judgment</h3>
            <p className="text-purple-200 text-sm">Inspection: {inspection?.inspection_no}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className={`mb-6 bg-gradient-to-r ${THEME.header} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BeakerIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit OQA Inspection (Customer)</h1>
              <p className={`${THEME.headerText} mt-1`}>Outgoing Quality Assurance — Customer Lot Judgment</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 bg-white bg-opacity-10 rounded-lg px-6 py-3">
            <div className="text-sm">
              <div className={`${THEME.headerText} text-xs`}>Sampling No</div>
              <div className="font-semibold text-white mt-0.5">{inspection?.inspection_no || '---'}</div>
            </div>
            <div className={`text-sm border-l ${THEME.headerBorder} pl-6`}>
              <div className={`${THEME.headerText} text-xs`}>Date</div>
              <div className="font-semibold text-white mt-0.5">{inspectionDate ? formatDateTimeFull(inspectionDate) : '---'}</div>
            </div>
            <div className={`text-sm border-l ${THEME.headerBorder} pl-6`}>
              <div className={`${THEME.headerText} text-xs`}>FY/WW</div>
              <div className="font-semibold text-white mt-0.5">FY{inspection?.fy} / WW{inspection?.ww}</div>
            </div>
            <div className={`text-sm border-l ${THEME.headerBorder} pl-6`}>
              <div className={`${THEME.headerText} text-xs`}>Shift</div>
              <div className="font-semibold text-white mt-0.5">{inspection?.shift || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-500'}`}>
              {step.done ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-sm font-medium">{step.id}</span>}
            </div>
            <span className={`ml-2 text-sm font-medium ${step.done ? 'text-green-600' : 'text-gray-500'}`}>{step.name}</span>
            {index < steps.length - 1 && <div className={`ml-4 w-12 h-0.5 ${step.done ? 'bg-green-500' : 'bg-gray-300'}`} />}
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Step 1 — Inspection Information (read-only) */}
          <div className="space-y-6">
            <div className={`bg-gradient-to-br ${THEME.infoSection} rounded-xl border-2 ${THEME.infoBorder} shadow-md p-6`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 ${THEME.step1Icon} rounded-lg`}>
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${THEME.infoText}`}>Step 1: Inspection Information</h3>
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Read Only</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold ${THEME.infoLabel} mb-2`}>Inspection Number</label>
                  <div className={`px-4 py-3 bg-white border-2 ${THEME.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${THEME.infoText} font-mono text-base font-semibold`}>{inspection?.inspection_no || '---'}</span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold ${THEME.infoLabel} mb-2`}>Sampling Date & Time</label>
                  <div className={`px-4 py-3 bg-white border-2 ${THEME.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${THEME.infoText} font-semibold`}>{inspectionDate ? formatDateTimeFull(inspectionDate) : '---'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className={`block text-sm font-bold ${THEME.infoLabel} mb-2`}>Fiscal Year / WW</label>
                  <div className={`px-4 py-3 bg-gradient-to-r ${THEME.infoSection} border-2 ${THEME.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${THEME.infoText} font-mono text-base font-bold`}>{inspection?.fy}/{inspection?.ww}</span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold ${THEME.infoLabel} mb-2`}>Working Shift</label>
                  <div className={`px-4 py-3 bg-white border-2 ${THEME.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${THEME.infoText} font-semibold`}>{inspection?.shift || '-'}</span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold ${THEME.infoLabel} mb-2`}>Line</label>
                  <div className={`px-4 py-3 bg-white border-2 ${THEME.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${THEME.infoText} font-semibold`}>{inspection?.fvilineno || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Sampling Reason (read-only) */}
            <div className={`bg-gradient-to-br ${THEME.step1Section} rounded-xl border-2 ${THEME.step1Border} shadow-md p-6`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 ${THEME.step1Icon} rounded-lg`}>
                  <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${THEME.step1Text}`}>Step 2: Sampling Reason</h3>
                <span className="ml-auto text-xs bg-fuchsia-100 text-fuchsia-700 px-2 py-1 rounded-full font-medium">Read Only</span>
              </div>
              <div className={`p-4 bg-white border-2 ${THEME.step1Border} rounded-lg`}>
                <div className={`font-medium ${THEME.step1Text}`}>
                  {(inspection as any)?.sampling_reason_name || 'N/A'}
                </div>
                {(inspection as any)?.sampling_reason_description && (
                  <p className="text-sm text-gray-600 mt-1">{(inspection as any).sampling_reason_description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Step 3 — Lot Selection (read-only) */}
          <div className={`bg-gradient-to-br ${THEME.step2Section} rounded-xl border-2 ${THEME.step2Border} shadow-md p-6`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 ${THEME.step2Icon} rounded-lg`}>
                <CubeIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-bold ${THEME.step2Text}`}>Step 3: Lot Selection</h3>
              <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">Read Only</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Lot No', value: inspection?.lotno },
                { label: 'Part Site', value: inspection?.partsite },
                { label: 'Item No', value: inspection?.itemno },
                { label: 'Model', value: inspection?.model },
                { label: 'Version', value: inspection?.version },
                { label: 'FVI Line', value: inspection?.fvilineno },
                { label: 'Machine Line', value: inspection?.mclineno },
                { label: 'Round', value: inspection?.round?.toString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className={`block text-xs font-bold ${THEME.step2Text} mb-1`}>{label}</label>
                  <div className={`px-3 py-2 bg-white border ${THEME.step2Border} rounded-lg`}>
                    <span className="text-sm font-medium text-gray-800">{value || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Sampling Configuration (read-only) */}
        <div className={`bg-gradient-to-br ${THEME.step3Section} rounded-xl border-2 ${THEME.step3Border} shadow-md p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 ${THEME.step3Icon} rounded-lg`}>
              <Cog6ToothIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${THEME.step3Text}`}>Step 4: Sampling Configuration</h3>
            <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Read Only</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'FVI Lot Qty', value: inspection?.fvi_lot_qty?.toLocaleString() },
              { label: 'General Sampling Qty', value: inspection?.general_sampling_qty?.toLocaleString() },
              { label: 'Crack Sampling Qty', value: inspection?.crack_sampling_qty?.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className={`block text-sm font-bold ${THEME.step3Text} mb-2`}>{label}</label>
                <div className={`px-4 py-3 bg-white border-2 ${THEME.step3Border} rounded-lg text-center`}>
                  <span className="text-xl font-bold text-gray-900">{value ?? '0'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 5: Lot Judgment — Interactive */}
      <div className={`bg-gradient-to-br from-slate-50 to-gray-100 border-t-4 ${THEME.step4Border} mt-8 shadow-lg`}>
        <div className="mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Step 5: Lot Judgment</h3>
                <p className="text-gray-600 text-sm mt-1">Update the final inspection decision for customer record</p>
              </div>
            </div>
            {judgment && (
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-green-800 font-medium">Decision Made</span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* PASS / REJECT Buttons */}
            <div className="flex justify-center space-x-12">
              <button
                onClick={() => { setJudgment('pass'); sound.playSuccess(); }}
                className={`group relative p-10 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  judgment === 'pass'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 shadow-2xl ring-4 ring-emerald-200'
                    : 'border-gray-300 hover:border-emerald-400 bg-white hover:bg-emerald-50'
                }`}
              >
                <CheckCircleIcon className={`w-16 h-16 mx-auto mb-4 ${judgment === 'pass' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                <div className="font-bold text-2xl mb-2">PASS</div>
                <div className="text-sm opacity-80">Approve this lot for production</div>
              </button>

              <button
                onClick={() => { setJudgment('reject'); sound.playWarning(); }}
                className={`group relative p-10 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  judgment === 'reject'
                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-100 text-red-700 shadow-2xl ring-4 ring-red-200'
                    : 'border-gray-300 hover:border-red-400 bg-white hover:bg-red-50'
                }`}
              >
                <XCircleIcon className={`w-16 h-16 mx-auto mb-4 ${judgment === 'reject' ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500'}`} />
                <div className="font-bold text-2xl mb-2">REJECT</div>
                <div className="text-sm opacity-80">Reject this lot — requires rework</div>
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                disabled={judgment === null || submitting}
                className={`group relative px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-4 ${
                  judgment === null || submitting
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : `bg-gradient-to-r ${THEME.buttonGradient} ${THEME.buttonHover} text-white shadow-xl hover:shadow-2xl`
                }`}
              >
                {submitting ? (
                  <>
                    <ArrowPathIcon className="w-7 h-7 animate-spin" />
                    <span>Updating Judgment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-7 h-7" />
                    <span>Update Judgment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionCustomerEditPage;
