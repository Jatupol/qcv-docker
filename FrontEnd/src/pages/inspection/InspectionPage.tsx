// client/src/pages/inspection/InspectionPage.tsx
// Unified Inspection Page - OQA, OBA, and SIV with station-based theming
// Complete Separation Entity Architecture - Manufacturing Quality Control System

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UsersIcon,
  CubeIcon,
  ClockIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  BeakerIcon,
  PlusIcon,
  DocumentTextIcon,
  HomeIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ListBulletIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Import auth context
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationHelpers } from '../../components/common/NotificationSystem';
import { useSound } from '../../hooks/useSoundNotification';

// Import integrated components - Lazy load heavy modals
const SamplingReasonBrowseModal = lazy(() => import('../../components/inspection/sampling-reason/SamplingReasonBrowseModal'));
import LotSelection from '../../components/inspection/lot-selection/LotSelection';
import SamplingConfiguration from '../../components/inspection/config/SamplingConfiguration';

// Import types
import {
  type SamplingReason
} from '../../types/sampling-reason';
import {
  type LotData
} from '../../types/inf-lotinput';
import {
  type SamplingConfigData,
  type SysConfig,
  DEFAULT_SAMPLING_CONFIG
} from '../../types/sysconfig';

// Import services
import { sysconfigService, useDefectColorOptions } from '../../services/sysconfigService';
import { inspectionDataService } from '../../services/inspectionDataService';
import { infLotInputService } from '../../services/infLotInputService';

// Import utilities
import { calculateFiscalWeekNumber, getFiscalYear } from '@qcv/shared';
import { formatDateTimeForInput, formatDateForInput, formatDateTimeFull, toLocalDate } from '../../utils/formatUtils';

// ==================== AQL SAMPLING VALIDATION ====================

/**
 * AQL Sampling Validation Rules
 * Returns the minimum required General Sampling Qty based on FVI Lot Qty
 */
const getMinimumGeneralSamplingQty = (fviLotQty: number): number => {
  if (fviLotQty <= 280) return 32;
  if (fviLotQty <= 500) return 48;
  if (fviLotQty <= 3200) return 72;
  if (fviLotQty <= 10000) return 86;
  if (fviLotQty <= 35000) return 108;
  if (fviLotQty <= 150000) return 123;
  if (fviLotQty <= 500000) return 156;
  return 189; // > 500000
};

/**
 * Check if General Sampling Qty meets AQL requirements
 */
const isValidAQLSampling = (fviLotQty: number, generalSamplingQty: number): boolean => {
  const minRequired = getMinimumGeneralSamplingQty(fviLotQty);
  return generalSamplingQty >= minRequired;
};

/**
 * Get AQL range description for display
 */
const getAQLRangeDescription = (fviLotQty: number): string => {
  if (fviLotQty <= 280) return '0 - 280';
  if (fviLotQty <= 500) return '281 - 500';
  if (fviLotQty <= 3200) return '501 - 3,200';
  if (fviLotQty <= 10000) return '3,201 - 10,000';
  if (fviLotQty <= 35000) return '10,001 - 35,000';
  if (fviLotQty <= 150000) return '35,001 - 150,000';
  if (fviLotQty <= 500000) return '150,001 - 500,000';
  return '> 500,000';
};

// ============ STATION THEME CONFIGURATION ============

interface StationTheme {
  // Header colors
  header: string;
  headerText: string;
  headerBorder: string;

  // Section colors
  infoSection: string;
  infoBorder: string;
  infoText: string;
  infoLabel: string;

  step1Section: string;
  step1Border: string;
  step1Text: string;
  step1Icon: string;

  step2Section: string;
  step2Border: string;
  step2Text: string;
  step2Icon: string;

  step3Section: string;
  step3Border: string;
  step3Text: string;
  step3Icon: string;

  step4Border: string;

  // Interactive elements
  focusRing: string;
  buttonGradient: string;
  buttonHover: string;
  loadingSpinner: string;
}

interface StationConfig {
  code: string;
  name: string;
  fullName: string;
  description: string;
  breadcrumbName: string;
  stationListRoute: string;
  theme: StationTheme;
}

const STATION_CONFIGS: Record<string, StationConfig> = {
  OQA: {
    code: 'OQA',
    name: 'OQA',
    fullName: 'OQA Inspection',
    description: 'Outgoing Quality Assurance - Lot Inspection',
    breadcrumbName: 'Final visual inspection',
    stationListRoute: '/inspection/oqa',
    theme: {
      header: 'from-amber-600 to-orange-600',
      headerText: 'text-amber-100',
      headerBorder: 'border-amber-300',

      infoSection: 'from-amber-50 to-orange-50',
      infoBorder: 'border-amber-200',
      infoText: 'text-amber-900',
      infoLabel: 'text-amber-800',

      step1Section: 'from-rose-50 to-pink-50',
      step1Border: 'border-rose-200',
      step1Text: 'text-rose-900',
      step1Icon: 'bg-rose-500',

      step2Section: 'from-lime-50 to-amber-50',
      step2Border: 'border-lime-200',
      step2Text: 'text-lime-900',
      step2Icon: 'bg-lime-500',

      step3Section: 'from-indigo-50 to-purple-50',
      step3Border: 'border-indigo-200',
      step3Text: 'text-indigo-900',
      step3Icon: 'bg-indigo-500',

      step4Border: 'border-orange-500',

      focusRing: 'focus:ring-amber-500 focus:border-amber-500',
      buttonGradient: 'from-amber-500 to-orange-600',
      buttonHover: 'hover:from-amber-600 hover:to-orange-700',
      loadingSpinner: 'text-amber-500'
    }
  },
  OBA: {
    code: 'OBA',
    name: 'OBA',
    fullName: 'OBA Inspection',
    description: 'Outgoing Before Assembly - Lot Inspection',
    breadcrumbName: 'Final visual inspection',
    stationListRoute: '/inspection/oba',
    theme: {
      header: 'from-teal-600 to-emerald-600',
      headerText: 'text-teal-100',
      headerBorder: 'border-teal-300',

      infoSection: 'from-teal-50 to-emerald-50',
      infoBorder: 'border-teal-200',
      infoText: 'text-teal-900',
      infoLabel: 'text-teal-800',

      step1Section: 'from-amber-50 to-yellow-50',
      step1Border: 'border-amber-200',
      step1Text: 'text-amber-900',
      step1Icon: 'bg-amber-500',

      step2Section: 'from-sky-50 to-teal-50',
      step2Border: 'border-sky-200',
      step2Text: 'text-sky-900',
      step2Icon: 'bg-sky-500',

      step3Section: 'from-violet-50 to-fuchsia-50',
      step3Border: 'border-violet-200',
      step3Text: 'text-violet-900',
      step3Icon: 'bg-violet-500',

      step4Border: 'border-teal-500',

      focusRing: 'focus:ring-teal-500 focus:border-teal-500',
      buttonGradient: 'from-teal-500 to-emerald-600',
      buttonHover: 'hover:from-teal-600 hover:to-emerald-700',
      loadingSpinner: 'text-teal-500'
    }
  },
  SIV: {
    code: 'SIV',
    name: 'SIV',
    fullName: 'SIV Inspection',
    description: 'Shipping Inspection Verification - Lot Inspection',
    breadcrumbName: 'Final visual inspection',
    stationListRoute: '/inspection/siv',
    theme: {
      header: 'from-blue-600 to-indigo-600',
      headerText: 'text-blue-100',
      headerBorder: 'border-blue-300',

      infoSection: 'from-blue-50 to-indigo-50',
      infoBorder: 'border-blue-200',
      infoText: 'text-blue-900',
      infoLabel: 'text-blue-800',

      step1Section: 'from-orange-50 to-amber-50',
      step1Border: 'border-orange-200',
      step1Text: 'text-orange-900',
      step1Icon: 'bg-orange-500',

      step2Section: 'from-cyan-50 to-blue-50',
      step2Border: 'border-cyan-200',
      step2Text: 'text-cyan-900',
      step2Icon: 'bg-cyan-500',

      step3Section: 'from-purple-50 to-pink-50',
      step3Border: 'border-purple-200',
      step3Text: 'text-purple-900',
      step3Icon: 'bg-purple-500',

      step4Border: 'border-indigo-500',

      focusRing: 'focus:ring-blue-500 focus:border-blue-500',
      buttonGradient: 'from-blue-500 to-indigo-600',
      buttonHover: 'hover:from-blue-600 hover:to-indigo-700',
      loadingSpinner: 'text-blue-500'
    }    

  }
};

// ============ TYPES & INTERFACES ============

interface InspectionData {
  id?: number;
  station: string;
  inspection_no: string;
  inspection_no_ref?: string; // Reference inspection number (for SIV)
  inspection_date: Date;
  fy: string; // Fiscal year field
  ww: string;
  month_year: string;
  shift: string;
  lotno: string;
  partsite: string;
  mclineno: string;
  itemno: string; // Fixed: was itemNo, should be itemno to match database
  model: string;
  version: string;
  fvilineno: string;
  round: number;
  qc_id: number;
  fvi_lot_qty: number;
  general_sampling_qty: number;
  crack_sampling_qty: number;
  judgment: boolean;
  // Note: grps, zones, notes, and sampling_reason_id are NOT in the database table
}

interface InspectionSession {

  selectedReason: SamplingReason | null;
  selectedLot: LotData | null;
  samplingConfig: SamplingConfigData;
  lotJudgment: {
    result: 'pass' | 'reject' | null;
    notes: string;
  };
  formData: {
    station: string;
    shift: string;
    fvilineno: string;
    grps: string;
    zones: string;
    qc_id: number;
    color: string; // Color Group for SIV station
  };
  samplingRound: number;
  startedAt: Date | null;
}

// ============ COMPONENT ============

const InspectionPage: React.FC = () => {
  // ============ STATION DETECTION ============
  const location = useLocation();
  const navigate = useNavigate();

  // Detect station from URL path - Memoized to prevent recalculation
  const stationKey = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('oba')) return 'OBA';
    if (path.includes('siv')) return 'SIV';
    return 'OQA'; // default
  }, [location.pathname]);

  const config = useMemo(() => STATION_CONFIGS[stationKey], [stationKey]);
  const theme = useMemo(() => config.theme, [config]);

  // ============ NAVIGATION HANDLERS ============
  const handleGoHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleGoToStationList = useCallback(() => {
    navigate(config.stationListRoute);
  }, [navigate, config.stationListRoute]);

  // ============ AUTH CONTEXT ============
  const { user } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotificationHelpers();
  const sound = useSound();

  // ============ DEFECT COLOR OPTIONS FOR SIV ============
  const { options: colorOptions, loading: colorLoading } = useDefectColorOptions();

  // ============ STATE MANAGEMENT ============
  const [sysConfig, setSysConfig] = useState<SysConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showSamplingReasonModal, setShowSamplingReasonModal] = useState(false);
  const [showSIVConfirmation, setShowSIVConfirmation] = useState(false);
  const [savedInspectionId, setSavedInspectionId] = useState<number | null>(null);

  // Edit mode detection
  const editMode = location.state?.editMode || false;
  const editInspectionId = location.state?.inspectionId || null;
  const editData = location.state?.inspectionData || null;

  // Inspection information state - Initialize with user session defaults
  const [inspectionInfo, setInspectionInfo] = useState(() => {
    console.log('🔧 Initializing inspection info with user session:', {
      username: user?.username,
      work_shift: user?.work_shift,
      linevi: user?.linevi
    });

    return {
      inspectionNumber: '',
      inspectionNoRef: '', // Reference inspection number for SIV
      productionDate: formatDateTimeForInput(new Date()), // Use datetime format with time
      fiscalYear: getFiscalYear(new Date(), 6).toString(), // Saturday as fiscal year start
      wwNumber: calculateFiscalWeekNumber(new Date(), 6).toString().padStart(2, '0'), // Saturday as week start
      workingShift: user?.work_shift || ''
    };
  });

  const [session, setSession] = useState<InspectionSession>(() => {
    console.log('🔧 Initializing session with user defaults:', {
      username: user?.username,
      work_shift: user?.work_shift,
      linevi: user?.linevi
    });

    return {
      selectedReason: null,
      selectedLot: null,
      samplingConfig: {
        fviLotQty: 0,
        generalSamplingQty: 0,
        crackSamplingQty: 0,
        round: 1
      },
      lotJudgment: {
        result: null,
        notes: ''
      },
      formData: {
        station: stationKey,
        shift: user?.work_shift || 'A',
        fvilineno: user?.linevi || '',
        grps: 'A',
        zones: '1',
        qc_id: user?.id || 1,
        color: '' // Color Group for SIV station
      },
      samplingRound: 1,
      startedAt: null
    };
  });

  // ============ EFFECTS ============

  // Parallel load system configuration, inspection number, and trigger auto import for faster initial load
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Only generate new inspection number if not in edit mode
        if (!editMode) {
          await Promise.all([
            loadSystemConfiguration(),
            generateNewInspectionNumber()
          ]);
        } else {
          // In edit mode, only load system configuration
          await loadSystemConfiguration();
        }

      } catch (err) {
        console.error('Failed to initialize inspection page:', err);
      }
    };

    initializePage();
  }, [editMode]);

  // Generate new inspection number when date or WW changes (only if not in edit mode)
  useEffect(() => {
    if (!editMode && inspectionInfo.productionDate && inspectionInfo.wwNumber) {
      generateNewInspectionNumber();
    }
  }, [inspectionInfo.productionDate, inspectionInfo.wwNumber, editMode]);

  // Update inspection info and form data when user session data becomes available or changes
  useEffect(() => {
    if (user) {
      console.log('✅ User session data loaded, updating defaults:', {
        username: user.username,
        work_shift: user.work_shift,
        linevi: user.linevi
      });

      // Update inspection info with user's working shift
      setInspectionInfo(prev => {
        const shouldUpdate = user.work_shift && user.work_shift !== prev.workingShift;
        if (shouldUpdate) {
          console.log(`📝 Updating working shift: "${prev.workingShift}" → "${user.work_shift}"`);
        }
        return {
          ...prev,
          workingShift: user.work_shift || prev.workingShift
        };
      });

      // Update session form data with user's shift and line
      setSession(prev => {
        const shiftChanged = user.work_shift && user.work_shift !== prev.formData.shift;
        const lineChanged = user.linevi && user.linevi !== prev.formData.fvilineno;

        if (shiftChanged || lineChanged) {
          console.log('📝 Updating session defaults:', {
            shift: shiftChanged ? `"${prev.formData.shift}" → "${user.work_shift}"` : 'unchanged',
            fvilineno: lineChanged ? `"${prev.formData.fvilineno}" → "${user.linevi}"` : 'unchanged'
          });
        }

        return {
          ...prev,
          formData: {
            ...prev.formData,
            shift: user.work_shift || prev.formData.shift,
            fvilineno: user.linevi || prev.formData.fvilineno
          }
        };
      });
    } else {
      console.log('⏳ Waiting for user session data...');
    }
  }, [user]);

  // Load edit data when in edit mode
  useEffect(() => {
    const loadEditData = async () => {
      if (editMode && editData && editInspectionId) {
        console.log('📝 Loading inspection data for edit:', editData);

        try {
          // Fetch the full inspection record from the API
          const result = await inspectionDataService.getById(parseInt(editInspectionId));

          if (result.success && result.data) {
            const inspectionRecord = result.data;

            console.log('📝 Loaded inspection record for edit:', inspectionRecord);

            // Set inspection info
            const inspectionDate = toLocalDate(inspectionRecord.inspection_date);
            setInspectionInfo({
              inspectionNumber: inspectionRecord.inspection_no,
              inspectionNoRef: inspectionRecord.inspection_no_ref || '',
              productionDate: formatDateTimeForInput(inspectionDate), // Use datetime format with time
              fiscalYear: getFiscalYear(inspectionDate, 6).toString(),
              wwNumber: inspectionRecord.ww || calculateFiscalWeekNumber(inspectionDate, 6).toString().padStart(2, '0'),
              workingShift: inspectionRecord.shift
            });

            // Create lot data object
            const lotData: LotData = {
              id: inspectionRecord.id?.toString() || '',
              lotno: inspectionRecord.lotno,
              partsite: inspectionRecord.partsite,
              lineno: inspectionRecord.mclineno,
              itemno: inspectionRecord.itemno,
              model: inspectionRecord.model,
              version: inspectionRecord.version,
              inputdate: formatDateForInput(inspectionDate),
              finish_on: formatDateForInput(inspectionDate)
            };

            // Create sampling reason object from inspectionRecord
            // The view v_inspectiondata now includes sampling_reason_name and sampling_reason_description
            const samplingReason: SamplingReason | null = inspectionRecord.sampling_reason_id
              ? {
                  id: inspectionRecord.sampling_reason_id,
                  name: (inspectionRecord as any).sampling_reason_name || 'Unknown',
                  description: (inspectionRecord as any).sampling_reason_description || ''
                }
              : null;

            console.log('📋 Sampling Reason:', samplingReason);
            console.log('📊 Sampling Config:', {
              fviLotQty: inspectionRecord.fvi_lot_qty,
              generalSamplingQty: inspectionRecord.general_sampling_qty,
              crackSamplingQty: inspectionRecord.crack_sampling_qty,
              round: inspectionRecord.round
            });
            console.log('🎨 Color Group (SIV):', inspectionRecord.color || '(empty)');

            // Update session with loaded data
            setSession(prev => ({
              ...prev,
              selectedReason: samplingReason, // Set the sampling reason
              selectedLot: lotData,
              samplingRound: inspectionRecord.round,
              samplingConfig: {
                fviLotQty: inspectionRecord.fvi_lot_qty,
                generalSamplingQty: inspectionRecord.general_sampling_qty,
                crackSamplingQty: inspectionRecord.crack_sampling_qty,
                round: inspectionRecord.round
              },
              lotJudgment: {
                result: inspectionRecord.judgment ? 'pass' : 'reject',
                notes: ''
              },
              formData: {
                ...prev.formData,
                station: inspectionRecord.station,
                shift: inspectionRecord.shift,
                fvilineno: inspectionRecord.fvilineno,
                grps: 'A', // grps is not in database, use default
                zones: '1', // zones is not in database, use default
                qc_id: inspectionRecord.qc_id,
                color: inspectionRecord.color || '' // Load color group for SIV station
              },
              startedAt: new Date()
            }));

            setSavedInspectionId(parseInt(editInspectionId));
            sound.playInfo();
            showInfo('Edit Mode', `Loading inspection ${inspectionRecord.inspection_no} for editing`);
          } else {
            sound.playError();
            showError('Load Failed', 'Failed to load inspection data for editing');
          }
        } catch (err) {
          console.error('❌ Error loading inspection for edit:', err);
          sound.playError();
          showError('Load Error', 'Failed to load inspection data for editing');
        }
      }
    };

    if (editMode && !loading) {
      loadEditData();
    }
  }, [editMode, editData, editInspectionId, loading]);

  // ============ API FUNCTIONS ============

  const generateNewInspectionNumber = async () => {
    try {
      const date = inspectionInfo.productionDate || formatDateForInput(new Date());
      const ww = inspectionInfo.wwNumber || calculateFiscalWeekNumber(new Date()).toString().padStart(2, '0');

      console.log('🔄 Generating new inspection number...');

      const result = await inspectionDataService.generateInspectionNumber(stationKey, date, ww);

      if (result.success && result.data?.inspectionNo) {
        setInspectionInfo(prev => ({
          ...prev,
          inspectionNumber: result.data!.inspectionNo
        }));
        console.log('✅ Generated inspection number:', result.data.inspectionNo);
      }
    } catch (error) {
      console.error('❌ Failed to generate inspection number:', error);
      // Use fallback generation
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      setInspectionInfo(prev => ({
        ...prev,
        inspectionNumber: `${stationKey}${year}${month}${day}-${prev.wwNumber}${timestamp}`
      }));
    }
  };

  const loadSystemConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading system configuration from API...');

      // Get parsed sysconfig data from API
      const parsedConfig = await sysconfigService.getParsedSysconfig();
      console.log('📊 Received parsed sysconfig:', parsedConfig);

      // Get raw sysconfig data for additional fields
      const rawConfig = await sysconfigService.getSysconfig();
      console.log('📋 Received raw sysconfig:', rawConfig);

      // Create the SysConfig object for the sampling configuration component
      const sysConfig: SysConfig = {
        // Raw config data with proper field names for sampling configuration
        id: rawConfig.id || 1,
        fvi_lot_qty: rawConfig.fvi_lot_qty || '',
        general_oqa_qty: rawConfig.general_oqa_qty || '',
        crack_oqa_qty: rawConfig.crack_oqa_qty || '',
        general_siv_qty: rawConfig.general_siv_qty || '',  // Updated field name
        crack_siv_qty: rawConfig.crack_siv_qty || '',      // Updated field name
        shift: rawConfig.shift || '',
        defect_type: rawConfig.defect_type || '',
        site: rawConfig.site || '',
        tabs: rawConfig.tabs || '',
        product_type: rawConfig.product_type || '',
        product_families: rawConfig.product_families || '',
        smtp_server: null,
        smtp_port: 0,
        smtp_username: null,
        smtp_password: null,
        system_name: rawConfig.system_name || null,
        system_updated: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Create additional OQA-specific configuration for compatibility
      const oqaConfig = {
        station: 'OQA',
        shifts: parsedConfig.shift ,
        defaultShift: parsedConfig.shift?.[0] ,
        qcInspectors: [],
        sampling: {
          fviLotQuantities: parsedConfig.fvi_lot_qty  ,
          generalSamplingQuantities: parsedConfig.general_oqa_qty  ,
          crackSamplingQuantities: parsedConfig.crack_oqa_qty
        },
        autoCalculation: true,
        requireNotes: false
      };

      console.log('✅ Created SysConfig for ' + stationKey + ':', sysConfig);
      console.log('📊 Station-specific values:');
      console.log('  - Station:', stationKey);
      console.log('  - General SIV Qty:', sysConfig.general_siv_qty);  // Updated console log
      console.log('  - Crack SIV Qty:', sysConfig.crack_siv_qty);      // Updated console log
      console.log('  - General OQA Qty:', sysConfig.general_oqa_qty);
      console.log('  - Crack OQA Qty:', sysConfig.crack_oqa_qty);
      console.log('✅ Created OQA Config:', oqaConfig);
      setSysConfig(sysConfig);
   
    } catch (err) {
      console.error('❌ Failed to load system configuration:', err);
      const errorMsg = 'Failed to load system configuration. Please check your connection and try again.';
      setError(errorMsg);
      sound.playError();
      showError('Configuration Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ============ INSPECTION INFO HANDLERS ============

  const handleInspectionInfoChange = useCallback((field: keyof typeof inspectionInfo, value: string) => {
    setInspectionInfo(prev => {
      const updated = { ...prev, [field]: value };

      // Recalculate fiscal year and WW number when Sampling date changes
      if (field === 'productionDate') {
        const date = toLocalDate(value); // Use toLocalDate to preserve local timezone
        updated.fiscalYear = getFiscalYear(date, 6).toString(); // Saturday as fiscal year start
        updated.wwNumber = calculateFiscalWeekNumber(date, 6).toString().padStart(2, '0'); // Saturday as week start
      }

      return updated;
    });
  }, []);

  // ============ MODAL HANDLERS ============

  const handleOpenSamplingReasonModal = useCallback(() => {
    setShowSamplingReasonModal(true);
  }, []);

  const handleCloseSamplingReasonModal = useCallback(() => {
    setShowSamplingReasonModal(false);
  }, []);

  const handleSamplingReasonSelect = useCallback((reason: SamplingReason) => {
    setSession(prev => ({
      ...prev,
      selectedReason: reason,
      startedAt: prev.startedAt || new Date()
    }));
    setShowSamplingReasonModal(false);
  }, []);

  // ============ SESSION HANDLERS ============

  const handleLotSelect = useCallback(async (lot: LotData) => {
    try {
      // Fetch the next sampling round for this station+lotno
      const roundResult = await inspectionDataService.getNextSamplingRound(stationKey, lot.lotno);
      const nextRound = roundResult.data?.nextRound || 1;

      console.log(`📊 Next sampling round for lotno ${lot.lotno}: ${nextRound}`);

      setSession(prev => ({
        ...prev,
        selectedLot: lot,
        samplingRound: nextRound,
        startedAt: prev.startedAt || new Date()
      }));
    } catch (error) {
      console.error('Error fetching sampling round:', error);
      // Default to round 1 if there's an error
      setSession(prev => ({
        ...prev,
        selectedLot: lot,
        samplingRound: 1,
        startedAt: prev.startedAt || new Date()
      }));
    }
  }, [stationKey]);

  const handleSamplingConfigChange = useCallback((config: SamplingConfigData) => {
    setSession(prev => ({
      ...prev,
      samplingConfig: config
    }));
  }, []);

  const handleJudgmentChange = useCallback((result: 'pass' | 'reject' | null, notes: string = '') => {
    setSession(prev => ({
      ...prev,
      lotJudgment: { result, notes }
    }));

    // Play sound for judgment selection
    if (result === 'pass') {
      sound.playSuccess();
    } else if (result === 'reject') {
      sound.playWarning();
    }
  }, [sound]);

  const handleFormDataChange = useCallback((field: keyof InspectionSession['formData'], value: string | number) => {
    setSession(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      }
    }));
  }, []);

  // ============ SIV CONFIRMATION HANDLERS ============

  const handleCreateSIV = async () => {
    if (!savedInspectionId) {
      setError('No inspection ID found');
      sound.playError();
      showError('SIV Creation Failed', 'No inspection ID found');
      return;
    }

    try {
      setSubmitting(true);

      // Use service to create SIV
      const result = await inspectionDataService.createSIV(savedInspectionId);

      if (!result.success) {
        const errorMsg = result.errors?.[0]?.message || 'Failed to create SIV inspection';
        setError(errorMsg);
        sound.playError();
        showError('SIV Creation Failed', errorMsg);
        return;
      }

      // Check if SIV was skipped (SGT customer part)
      if (result.data === null) {
        console.log('⏭️ SIV creation skipped:', result.message);
        sound.playInfo();
        showInfo('SIV Skipped', result.message || 'SIV not created for this part');
      } else {
        console.log('✅ SIV inspection created successfully:', result.data);
        sound.playImportant();
        showSuccess('SIV Created', `SIV inspection created successfully from ${stationKey} inspection ${inspectionInfo.inspectionNumber}`);
      }

      // Reset and close
      handleCloseSIVConfirmation();
    } catch (err) {
      console.error('Failed to create SIV:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to create SIV inspection';
      setError(errorMsg);
      sound.playError();
      showError('SIV Creation Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipSIV = () => {
    // Just reset without creating SIV
    sound.playInfo();
    showInfo('SIV Skipped', `${stationKey} inspection saved. SIV creation skipped.`);
    handleCloseSIVConfirmation();
  };

  const handleCloseSIVConfirmation = () => {
    setShowSIVConfirmation(false);
    setSavedInspectionId(null);

    // Reset session after closing
    setSession(prev => ({
      selectedReason: null,
      selectedLot: null,
      samplingConfig: DEFAULT_SAMPLING_CONFIG,
      lotJudgment: { result: null, notes: '' },
      formData: {
        station: prev.formData.station,
        shift: prev.formData.shift,
        fvilineno: prev.formData.fvilineno, // Keep FVI Line
        grps: prev.formData.grps,
        zones: prev.formData.zones,
        qc_id: prev.formData.qc_id,
        color: prev.formData.color // Keep color for SIV
      },
      samplingRound: 1,
      startedAt: null
    }));

    // Generate new inspection number
    generateNewInspectionNumber();
  };

  // ============ FORM SUBMISSION ============

  const handleSubmitInspection = async () => {
    // Validate required fields
    if (!session.selectedReason || !session.selectedLot || !session.lotJudgment.result) {
      setError('Please complete all required fields before submitting');
      sound.playWarning();
      showError('Incomplete Form', 'Please complete all required fields before submitting');
      return;
    }

    // Validate FVI Line number (required for non-SIV stations)
    if (stationKey !== 'SIV' && !session.formData.fvilineno?.trim()) {
      setError('FVI Line number is required');
      sound.playWarning();
      showError('Missing Required Field', 'FVI Line number is required. Please enter the FVI Line number.');
      return;
    }

    // Validate Color Group (required for SIV station)
    if (stationKey === 'SIV' && !session.formData.color?.trim()) {
      setError('Color Group is required for SIV station');
      sound.playWarning();
      showError('Missing Required Field', 'Color Group is required for SIV station. Please select a color group.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Parse datetime for calculations, but send as string to preserve local timezone
      const prodDate = toLocalDate(inspectionInfo.productionDate);
      // Send datetime as string to prevent JSON serialization converting to UTC
      // inspectionInfo.productionDate is already in local format: "2026-01-27T15:56:05"
      const inspectionDateStr = inspectionInfo.productionDate.replace('T', ' '); // "2026-01-27 15:56:05"
      const inspectionData: InspectionData = {
        station: session.formData.station,
        inspection_no: `${inspectionInfo.inspectionNumber}`,
        inspection_no_ref: stationKey === 'SIV' ? inspectionInfo.inspectionNoRef : undefined,
        inspection_date: inspectionDateStr as any, // Send as string to preserve local time
        fy: inspectionInfo.fiscalYear, // Add fiscal year field
        ww: calculateFiscalWeekNumber(prodDate, 6).toString().padStart(2, '0'),
        month_year: `${prodDate.getFullYear()}-${String(prodDate.getMonth() + 1).padStart(2, '0')}`,
        shift: inspectionInfo.workingShift || session.formData.shift,
        lotno: session.selectedLot.lotno,
        partsite: session.selectedLot.partsite,
        mclineno: session.selectedLot.lineno,
        itemno: session.selectedLot.itemno,
        model: session.selectedLot.model,
        version: session.selectedLot.version,
        fvilineno: session.formData.fvilineno,
        round: session.samplingRound,
        qc_id: user?.id || session.formData.qc_id,
        fvi_lot_qty: session.samplingConfig.fviLotQty,
        general_sampling_qty: session.samplingConfig.generalSamplingQty,
        crack_sampling_qty: session.samplingConfig.crackSamplingQty,
        judgment: session.lotJudgment.result === 'pass',
        color: stationKey === 'SIV' ? session.formData.color : undefined // Color Group for SIV station
        // Note: grps, zones, notes, and sampling_reason_id are not saved to inspectiondata table
      };

      // Submit inspection data to API (create or update based on edit mode)
      console.log(editMode ? 'Updating inspection:' : 'Submitting inspection:', inspectionData);
      console.log('🎨 Color value being sent:', {
        stationKey,
        formDataColor: session.formData.color,
        finalColor: inspectionData.color
      });

      let result;
      if (editMode && savedInspectionId) {
        // Update existing inspection
        result = await inspectionDataService.update(savedInspectionId, {
          station: inspectionData.station,
          inspection_no: inspectionData.inspection_no,
          inspection_date: inspectionData.inspection_date,
          fy: inspectionData.fy, // Add fiscal year field
          ww: inspectionData.ww,
          month_year: inspectionData.month_year,
          shift: inspectionData.shift,
          lotno: inspectionData.lotno,
          partsite: inspectionData.partsite,
          mclineno: inspectionData.mclineno,
          itemno: inspectionData.itemno,
          model: inspectionData.model,
          version: inspectionData.version,
          fvilineno: inspectionData.fvilineno,
          sampling_reason_id: session.selectedReason!.id,
          round: inspectionData.round,
          qc_id: inspectionData.qc_id,
          fvi_lot_qty: inspectionData.fvi_lot_qty,
          general_sampling_qty: inspectionData.general_sampling_qty,
          crack_sampling_qty: inspectionData.crack_sampling_qty,
          judgment: inspectionData.judgment,
          color: inspectionData.color // Color Group for SIV station
          // Note: grps and zones are not saved to inspectiondata table
        });
      } else {
        // Create new inspection
        result = await inspectionDataService.create({
          station: inspectionData.station,
          inspection_no: inspectionData.inspection_no,
          inspection_date: inspectionData.inspection_date,
          fy: inspectionData.fy, // Add fiscal year field
          ww: inspectionData.ww,
          month_year: inspectionData.month_year,
          shift: inspectionData.shift,
          lotno: inspectionData.lotno,
          partsite: inspectionData.partsite,
          mclineno: inspectionData.mclineno,
          itemno: inspectionData.itemno,
          model: inspectionData.model,
          version: inspectionData.version,
          fvilineno: inspectionData.fvilineno,
          round: inspectionData.round,
          qc_id: inspectionData.qc_id.toString(),
          fvi_lot_qty: inspectionData.fvi_lot_qty,
          general_sampling_qty: inspectionData.general_sampling_qty,
          crack_sampling_qty: inspectionData.crack_sampling_qty,
          sampling_reason_id: session.selectedReason!.id,
          judgment: inspectionData.judgment,
          color: inspectionData.color // Color Group for SIV station
          // Note: grps and zones are not saved to inspectiondata table
        });
      }

      if (!result.success) {
        const errorMsg = result.errors?.[0]?.message || `Failed to ${editMode ? 'update' : 'save'} inspection data`;
        setError(errorMsg);
        sound.playError();
        showError('Submission Failed', errorMsg);
        return;
      }

      console.log(`✅ Inspection ${editMode ? 'updated' : 'saved'} successfully:`, result.data);

      // Store the saved inspection ID
      setSavedInspectionId(result.data?.id || savedInspectionId);

      // ==================== DUPLICATE DETECTION HANDLING ====================
      // Check if the inspection number was regenerated due to duplicate detection
      // TypeScript: Add type assertion for the extended response fields
      const resultWithMeta = result as typeof result & {
        regenerated?: boolean;
        originalInspectionNo?: string;
      };

      if (resultWithMeta.regenerated && resultWithMeta.originalInspectionNo) {
        // The inspection number was regenerated - update the UI and notify user
        const newInspectionNo = result.data?.inspection_no || '';

        console.log('⚠️ Inspection number was regenerated:', {
          original: resultWithMeta.originalInspectionNo,
          new: newInspectionNo
        });

        // Update the displayed inspection number
        setInspectionInfo(prev => ({
          ...prev,
          inspectionNumber: newInspectionNo
        }));

        // Show warning notification about the regeneration
        sound.playWarning();
        showWarning(
          'Inspection Number Regenerated',
          `The inspection number was automatically changed from "${resultWithMeta.originalInspectionNo}" to "${newInspectionNo}" because the original number already existed. This can happen when multiple users create inspections simultaneously.`
        );
      }

      // Show success notification with appropriate sound
      const judgmentText = session.lotJudgment.result === 'pass' ? 'PASS' : 'REJECT';
      const finalInspectionNo = result.data?.inspection_no || inspectionInfo.inspectionNumber;

      // Play save sound for successful inspection submission (only if not already played warning)
      if (!resultWithMeta.regenerated) {
        sound.playSave();
      }

      showSuccess(
        editMode ? 'Inspection Updated' : 'Inspection Saved',
        `${stationKey} Inspection ${finalInspectionNo} ${editMode ? 'updated' : 'saved'} successfully with judgment: ${judgmentText}`
      );

      // Handle post-save actions based on edit mode and judgment
      if (editMode) {
        // In edit mode, navigate back to the station list after a short delay
        setTimeout(() => {
          navigate(config.stationListRoute);
        }, 2000);
      } else {
        // BUSINESS LOGIC: Only OQA station with Pass judgment can create SIV
        // Show SIV confirmation dialog only if: station is OQA AND judgment is Pass
        if (stationKey === 'OQA' && session.lotJudgment.result === 'pass') {
          setShowSIVConfirmation(true);
        } else {
          // For all other cases (OBA Pass/Reject, OQA Reject), just reset the form
          setSavedInspectionId(null);
          setSession(prev => ({
            selectedReason: null,
            selectedLot: null,
            samplingConfig: DEFAULT_SAMPLING_CONFIG,
            lotJudgment: { result: null, notes: '' },
            formData: {
              station: prev.formData.station,
              shift: prev.formData.shift,
              fvilineno: prev.formData.fvilineno,
              grps: prev.formData.grps,
              zones: prev.formData.zones,
              qc_id: prev.formData.qc_id,
              color: prev.formData.color
            },
            samplingRound: 1,
            startedAt: null
          }));
          generateNewInspectionNumber();
        }
      }

    } catch (err) {
      console.error('Failed to submit inspection:', err);
      const errorMsg = 'Failed to submit inspection data';
      setError(errorMsg);
      sound.playError();
      showError('Submission Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RENDER HELPERS ============

  // Memoize step indicator to prevent re-renders
  const renderStepIndicator = useMemo(() => {
    const steps = [
      { id: 1, name: 'Inspection Information', completed: !!inspectionInfo.workingShift && !!session.formData.fvilineno?.trim() },
      { id: 2, name: 'Sampling Reason', completed: !!session.selectedReason },
      { id: 3, name: 'Lot Selection', completed: !!session.selectedLot },
      { id: 4, name: 'Configuration', completed: session.samplingConfig.fviLotQty > 0 },
      { id: 5, name: 'Judgment', completed: !!session.lotJudgment.result }
    ];

    return (
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {step.completed ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step.completed ? 'text-green-600' : 'text-gray-500'
            }`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`ml-4 w-12 h-0.5 ${
                step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  }, [inspectionInfo.workingShift, session.formData.fvilineno, session.selectedReason, session.selectedLot, session.samplingConfig.fviLotQty, session.lotJudgment.result]);

  // ============ LOADING STATE ============

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className={`w-8 h-8 animate-spin ${theme.loadingSpinner} mx-auto mb-4`} />
          <p className="text-gray-600">Loading {config.name} Inspection System...</p>
        </div>
      </div>
    );
  }

  // ============ ERROR STATE ============

  if (error && !sysConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSystemConfiguration}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER ============

  return (
    <div className="flex-1 -mx-6 -my-8 p-6">


      {/* Breadcrumb Navigation */}
      <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleGoHome}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <button
              onClick={handleGoToStationList}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {config.breadcrumbName}
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <button
              onClick={handleGoToStationList}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
               {config.name} Sampling Lists
            </button>

              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <span className={`font-semibold ${theme.infoText}`}>
                {editMode ? `Edit ${config.name} Sampling` : `New ${config.name} Sampling`}
              </span>
          </nav>

          {/* Back to Station List Button */}
          <button
            onClick={handleGoToStationList}
            className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg ${theme.buttonHover} transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            <ListBulletIcon className="h-5 w-5" />
            <span>View {config.name} Lists</span>
          </button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editMode && (
        <div className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <PencilIcon className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-bold text-white">Edit Mode</h3>
              <p className="text-amber-100 text-sm">
                You are editing inspection: {inspectionInfo.inspectionNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`mb-6 bg-gradient-to-r ${theme.header} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BeakerIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {editMode ? `Edit ${config.fullName}` : config.fullName}
              </h1>
              <p className={`${theme.headerText} mt-1`}>{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 bg-white bg-opacity-10 rounded-lg px-6 py-3">
            <div className="text-sm">
              <div className={`${theme.headerText} text-xs`}>Sampling No</div>
              <div className="font-semibold text-white mt-0.5">{inspectionInfo.inspectionNumber || '---'}</div>
            </div>
            <div className={`text-sm border-l ${theme.headerBorder} pl-6`}>
              <div className={`${theme.headerText} text-xs`}>Date</div>
              <div className="font-semibold text-white mt-0.5">{inspectionInfo.productionDate ? formatDateTimeFull(inspectionInfo.productionDate) : '---'}</div>
            </div>
            <div className={`text-sm border-l ${theme.headerBorder} pl-6`}>
              <div className={`${theme.headerText} text-xs`}>Fiscal Year</div>
              <div className="font-semibold text-white mt-0.5">FY {inspectionInfo.fiscalYear}</div>
            </div>
            <div className={`text-sm border-l ${theme.headerBorder} pl-6`}>
              <div className={`${theme.headerText} text-xs`}>WW</div>
              <div className="font-semibold text-white mt-0.5">WW{inspectionInfo.wwNumber}</div>
            </div>
            <div className={`text-sm border-l ${theme.headerBorder} pl-6`}>
              <div className={`${theme.headerText} text-xs`}>Shift</div>
              <div className="font-semibold text-white mt-0.5">{inspectionInfo.workingShift || '-'}</div>
            </div>
            <div className={`text-sm border-l ${theme.headerBorder} pl-6`}>
              <div className={`${theme.headerText} text-xs`}>Station</div>
              <div className="font-semibold text-white mt-0.5">{config.name}</div>
            </div>
          </div>
        </div>
      </div>


      {/* Progress Steps */}
      {renderStepIndicator}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Two Column Layout: Left (Inspection Info + Step 1) and Right (Step 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Inspection Information + Step 1 */}
          <div className="space-y-6">
            {/* Inspection Information Section */}
            <div className={`bg-gradient-to-br ${theme.infoSection} rounded-xl border-2 ${theme.infoBorder} shadow-md p-6`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 ${theme.step1Icon} rounded-lg`}>
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${theme.infoText}`}>Step 1:Inspection Information</h3>
              </div>

              {/* Row 1: Inspection Number, Sampling Date (50:50) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inspection Number */}
                <div>
                  <label className={`block text-sm font-bold ${theme.infoLabel} mb-2`}>
                    Inspection Number
                  </label>
                  <div className={`px-4 py-3 bg-white border-2 ${theme.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${theme.infoText} font-mono text-base font-semibold`}>{inspectionInfo.inspectionNumber || '---'}</span>
                  </div>
                </div>

                {/* Sampling Date & Time */}
                <div>
                  <label className={`block text-sm font-bold ${theme.infoLabel} mb-2`}>
                    Sampling Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={inspectionInfo.productionDate}
                    onChange={(e) => handleInspectionInfoChange('productionDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 ${theme.infoBorder} rounded-lg focus:ring-2 ${theme.focusRing} shadow-sm font-semibold`}
                    step="1"
                  />
                </div>

                {/* Reference Inspection Number - Only show for SIV */}
                {stationKey === 'SIV' && (
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-bold ${theme.infoLabel} mb-2`}>
                      Reference Inspection Number (OQA/OBA)
                    </label>
                    <div className={`px-4 py-3 bg-gray-50 border-2 ${theme.infoBorder} rounded-lg shadow-sm`}>
                      <span className={`${theme.infoText} font-mono text-base font-semibold`}>
                        {inspectionInfo.inspectionNoRef || '---'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Fiscal Year/WW, Working Shift, Line (3 equal columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Fiscal Year/WW */}
                <div>
                  <label className={`block text-sm font-bold ${theme.infoLabel} mb-2`}>
                    Fiscal Year/WW
                  </label>
                  <div className={`px-4 py-3 bg-gradient-to-r ${theme.infoSection} border-2 ${theme.infoBorder} rounded-lg shadow-sm`}>
                    <span className={`${theme.infoText} font-mono text-base font-bold`}>{inspectionInfo.fiscalYear}/{inspectionInfo.wwNumber}</span>
                  </div>
                </div>     

                {/* Working Shift */}
                <div>
                  <label className={`block text-sm font-bold ${theme.infoLabel} mb-2 flex items-center`}>
                    Working Shift <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={inspectionInfo.workingShift}
                    onChange={(e) => handleInspectionInfoChange('workingShift', e.target.value)}
                    placeholder="Enter shift (e.g., A, B, C)"
                    className={`w-full px-4 py-3 bg-white border-2 ${theme.infoBorder} rounded-lg focus:ring-2 ${theme.focusRing} shadow-sm font-semibold`}
                    title={user?.work_shift ? `Default from user session: ${user.work_shift}` : 'Enter working shift'}
                  />
                </div>

                {/* FVI Line */}
                <div>
                  <label className={`block text-sm font-bold ${theme.infoLabel} mb-2 flex items-center`}>
                    Line
                    {stationKey !== 'SIV' && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={session.formData.fvilineno}
                    onChange={(e) => handleFormDataChange('fvilineno', e.target.value)}
                    placeholder="Enter FVI Line"
                    required={stationKey !== 'SIV'}
                    className={`w-full px-4 py-3 bg-white border-2 ${theme.infoBorder} rounded-lg focus:ring-2 ${theme.focusRing} shadow-sm font-semibold ${
                      stationKey !== 'SIV' && !session.formData.fvilineno?.trim() ? 'border-red-300' : ''
                    }`}
                    title={user?.linevi ? `Default from user session: ${user.linevi}` : 'Enter FVI Line (Required)'}
                  />
                  {stationKey !== 'SIV' && !session.formData.fvilineno?.trim() && (
                    <p className="text-xs text-red-500 mt-1">FVI Line is required</p>
                  )}
                </div>

                {/* Color Group - Only for SIV Station */}
                {stationKey === 'SIV' && (
                  <div>
                    <label className={`block text-sm font-bold ${theme.infoLabel} mb-2 flex items-center`}>
                      Color Group
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={session.formData.color}
                      onChange={(e) => handleFormDataChange('color', e.target.value)}
                      required
                      disabled={colorLoading}
                      className={`w-full px-4 py-3 bg-white border-2 ${theme.infoBorder} rounded-lg focus:ring-2 ${theme.focusRing} shadow-sm font-semibold ${
                        !session.formData.color?.trim() ? 'border-red-300' : ''
                      }`}
                      title="Select Color Group (Required for SIV)"
                    >
                      <option value="">-- Select Color Group --</option>
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {!session.formData.color?.trim() && (
                      <p className="text-xs text-red-500 mt-1">Color Group is required for SIV station</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Sampling Reason Selection */}
            <div className={`bg-gradient-to-br ${theme.step1Section} rounded-xl border-2 ${theme.step1Border} shadow-md p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 ${theme.step1Icon} rounded-lg`}>
                    <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold ${theme.step1Text}`}>
                    Step 2: Sampling Reason
                  </h3>
                </div>
                {session.selectedReason && (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">Selected</span>
                  </div>
                )}
              </div>

              {/* Sampling Reason Display & Selection */}
              <div className="space-y-4">
                {session.selectedReason ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-orange-900">
                          {session.selectedReason.name}
                        </h4>
                        {session.selectedReason.description && (
                          <p className="text-sm text-orange-700 mt-1">
                            {session.selectedReason.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleOpenSamplingReasonModal}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleOpenSamplingReasonModal}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Select Sampling Reason</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Step 3 - Lot Selection */}
          <div className={`bg-gradient-to-br ${theme.step2Section} rounded-xl border-2 ${theme.step2Border} shadow-md p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 ${theme.step2Icon} rounded-lg`}>
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${theme.step2Text}`}>
                  Step 3: Lot Selection
                </h3>
              </div>
              {session.selectedLot && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm">Selected</span>
                </div>
              )}
            </div>

            <LotSelection
              selectedLot={session.selectedLot}
              onLotSelect={handleLotSelect}
              disabled={!session.selectedReason || (stationKey === 'SIV' && !!session.selectedLot)}
              samplingRound={session.samplingRound}
            />
          </div>
        </div>

        {/* Step 4: Sampling Configuration - Full Width */}
        <div className={`bg-gradient-to-br ${theme.step3Section} rounded-xl border-2 ${theme.step3Border} shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 ${theme.step3Icon} rounded-lg`}>
                <Cog6ToothIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-bold ${theme.step3Text}`}>
                Step 4: Sampling Configuration
              </h3>
            </div>
            {session.samplingConfig.fviLotQty > 0 && (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-1" />
                <span className="text-sm">Configured</span>
              </div>
            )}
          </div>

          <SamplingConfiguration
            config={session.samplingConfig}
            onChange={handleSamplingConfigChange}
            sysConfig={sysConfig}
            disabled={!session.selectedLot}
            station={stationKey}
            disableFviLotQty={stationKey === 'SIV' && !editMode}
          />

          {/* AQL Sampling Warning - Red Background */}
          {session.samplingConfig.fviLotQty > 0 &&
           session.samplingConfig.generalSamplingQty > 0 &&
           !isValidAQLSampling(session.samplingConfig.fviLotQty, session.samplingConfig.generalSamplingQty) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-800 mb-2">
                    ⚠ AQL Sampling Warning
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    The General Sampling Quantity is below the minimum AQL requirement for this FVI Lot size.
                  </p>
                  <div className="bg-white border border-red-200 rounded p-3 text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">FVI Lot Quantity:</span>
                      <span className="font-bold text-gray-900">
                        {session.samplingConfig.fviLotQty.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Current General Sampling:</span>
                      <span className="font-bold text-red-700">
                        {session.samplingConfig.generalSamplingQty}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Minimum Required (AQL):</span>
                      <span className="font-bold text-red-800">
                        {getMinimumGeneralSamplingQty(session.samplingConfig.fviLotQty)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-red-100">
                      <span className="text-gray-700">AQL Range:</span>
                      <span className="text-sm text-red-600">
                        {getAQLRangeDescription(session.samplingConfig.fviLotQty)} units
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
                    <strong>Note:</strong> AQL (Acceptable Quality Level) sampling requirements ensure statistically valid quality inspections.
                    Please increase the General Sampling Quantity to meet the minimum requirement.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 5: Lot Judgment - Full Width */}
      <div className={`bg-gradient-to-br from-slate-50 to-gray-100 border-t-4 ${theme.step4Border} mt-8 shadow-lg`}>
        <div className="mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <ChartBarIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Step 5: Lot Judgment
                </h3>
                <p className="text-gray-600 text-sm mt-1">Make your final inspection decision</p>
              </div>
            </div>
            {session.lotJudgment.result && (
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-green-800 font-medium">Decision Made</span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Judgment Selection */}
            <div className="flex justify-center space-x-12">
              <button
                onClick={() => handleJudgmentChange('pass', session.lotJudgment.notes)}
                disabled={!session.samplingConfig.fviLotQty}
                className={`group relative p-10 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  session.lotJudgment.result === 'pass'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 shadow-2xl ring-4 ring-emerald-200'
                    : 'border-gray-300 hover:border-emerald-400 disabled:opacity-50 bg-white hover:bg-emerald-50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CheckCircleIcon className={`w-16 h-16 mx-auto mb-4 ${
                  session.lotJudgment.result === 'pass' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'
                }`} />
                <div className="font-bold text-2xl mb-2">PASS</div>
                <div className="text-sm opacity-80">Approve this lot for production</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={() => handleJudgmentChange('reject', session.lotJudgment.notes)}
                disabled={!session.samplingConfig.fviLotQty}
                className={`group relative p-10 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  session.lotJudgment.result === 'reject'
                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-100 text-red-700 shadow-2xl ring-4 ring-red-200'
                    : 'border-gray-300 hover:border-red-400 disabled:opacity-50 bg-white hover:bg-red-50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <XCircleIcon className={`w-16 h-16 mx-auto mb-4 ${
                  session.lotJudgment.result === 'reject' ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500'
                }`} />
                <div className="font-bold text-2xl mb-2">REJECT</div>
                <div className="text-sm opacity-80">Reject this lot - requires rework</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmitInspection}
                disabled={!session.selectedReason || !session.selectedLot || !session.lotJudgment.result || submitting}
                className={`group relative px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-4 ${
                  !session.selectedReason || !session.selectedLot || !session.lotJudgment.result || submitting
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : `bg-gradient-to-r ${theme.buttonGradient} ${theme.buttonHover} text-white shadow-xl hover:shadow-2xl`
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.buttonGradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                {submitting ? (
                  <>
                    <ArrowPathIcon className="w-7 h-7 animate-spin" />
                    <span>{editMode ? 'Updating Inspection...' : 'Submitting Inspection...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-7 h-7" />
                    <span>{editMode ? 'Update Inspection' : 'Complete Inspection'}</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sampling Reason Browse Modal - Lazy loaded with Suspense */}
      {showSamplingReasonModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <ArrowPathIcon className={`w-8 h-8 animate-spin ${theme.loadingSpinner} mx-auto`} />
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          </div>
        }>
          <SamplingReasonBrowseModal
            isOpen={showSamplingReasonModal}
            onClose={handleCloseSamplingReasonModal}
            onReasonSelect={handleSamplingReasonSelect}
            selectedReason={session.selectedReason}
          />
        </Suspense>
      )}

      {/* SIV Confirmation Modal */}
      {showSIVConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">{config.name} Inspection Saved</h3>
            </div>

            <p className="text-gray-600 mb-6">
              The {config.name} inspection has been saved successfully. Would you like to create a SIV inspection record from this {config.name} data?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleSkipSIV}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                No, Skip
              </button>
              <button
                onClick={handleCreateSIV}
                className={`px-5 py-2.5 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg ${theme.buttonHover} transition-all duration-200 font-medium shadow-lg`}
              >
                Yes, Create SIV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionPage;