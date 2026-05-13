// client/src/pages/customer-data/DefectCustomerInputPage.tsx
// Defect Input Page - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Defect Inspection Management
// Manufacturing/Quality Control System - Professional Orange Theme Implementation


import React, { useState, useRef, useEffect } from 'react';
import { validateSchema, required, type ValidationSchema } from '../../utils/validation';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CameraIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { sysconfigService, useDefectColorOptions } from '../../services/sysconfigService';
import { defectService, type Defect } from '../../services/defectService';
import { infCheckinService, type OperatorInfo, type DistinctFVILineInfo } from '../../services/infCheckinService';
import { defectCustomerDataService } from '../../services/defectCustomerDataService';
import FVILineLayout, { type InspectionStation } from '../../components/inspection/FVILineLayout';
import Toast, { useToast } from '../../components/ui/Toast';
import AutocompleteInput, { type AutocompleteOption } from '../../components/ui/AutocompleteInput';
import { useSoundNotification } from '../../hooks/useSoundNotification';
import { DefectsDataTable } from '../../components/inspection/DefectsDataTable';
import { type DefectDetail, type InspectionData } from '../../types/inspectiondata';
import { getTodayDateString, formatDate } from '../../utils/formatUtils';

// ==================== TYPE DEFINITIONS ====================

interface ImageTrayInfo {
  trayno: string;
  trayRow: string;
  trayPosition: string;
  photoMagnification: string;
  stamp: string;
}

interface DefectFormData {
  tray: string;
  positionOnTray: number;  // Changed to number for 1-20 selection
  colorGroup: string;      // Text input instead of dropdown
  qcName: string;          // Changed from qcRejectName
  qcLeaderConfirmName: string;
  mrbConfirmName: string;
  rejectPhotos: File[];    // Changed to array for multiple photos
  inspectorId: string;
  defectType: string;      // From sysconfig.defect_type
  defect: string;          // From defect entity
  defectQuantity: number;
  defectDetail: string;    // Detail description when "Etc." is selected
  imageTrayInfos: ImageTrayInfo[];  // Per-photo tray information
}

// ==================== MAIN COMPONENT ==================== 

const DefectCustomerInputPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);

  // Toast notifications (without sound)
  const toastFunctions = useToast();
  const { toasts, removeToast } = toastFunctions;

  // Toast notifications with sound
  const { success, error, warning, info } = useSoundNotification({
    success: toastFunctions.success,
    error: toastFunctions.error,
    warning: toastFunctions.warning,
    info: toastFunctions.info
  });

  // Defect color options from sysconfig
  const { options: colorOptions, loading: colorLoading } = useDefectColorOptions();

  const [formData, setFormData] = useState<DefectFormData>({
    tray: '',
    positionOnTray: 1,
    colorGroup: '',
    qcName: '',
    qcLeaderConfirmName: '',
    mrbConfirmName: '',
    rejectPhotos: [],
    inspectorId: '',
    defectType: '',
    defect: '',
    defectQuantity: 1,
    defectDetail: '',
    imageTrayInfos: []
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for dropdown options
  const [defectTypes, setDefectTypes] = useState<string[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<InspectionStation | null>(null);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [availableInspectors, setAvailableInspectors] = useState<string[]>([]);
  const [inspectorNameMap, setInspectorNameMap] = useState<Record<string, string>>({});

  // Operators for autocomplete - Separated by group code
  const [qcOperatorOptions, setQcOperatorOptions] = useState<AutocompleteOption[]>([]);
  const [mrbOperatorOptions, setMrbOperatorOptions] = useState<AutocompleteOption[]>([]);

  // FVI Line Mapping state
  const [fviLineParams, setFviLineParams] = useState({
    date: getTodayDateString(), // Today's date in YYYY-MM-DD
    line: '',
    shift: ''
  });
  const [availableLines, setAvailableLines] = useState<DistinctFVILineInfo[]>([]);
  const [fviStations, setFviStations] = useState<InspectionStation[]>([]);
  const [loadingFviStations, setLoadingFviStations] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);
  const [tableRefreshKey, setTableRefreshKey] = useState(0); // Add refresh key for table

  // Get inspection data from navigation state
  useEffect(() => {
    if (location.state?.inspectionData) {
      const data = location.state.inspectionData as InspectionData;
      setInspectionData(data);
      console.log('Received inspection data:', data);

      // Clear color group if station is not SIV
      if (data.station && data.station !== 'SIV') {
        setFormData(prev => ({ ...prev, colorGroup: '' }));
      }
    }
  }, [location.state]);


  // Load defect types, shifts from sysconfig and defects from defect entity
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load sysconfig for defect types and shifts
        const sysconfig = await sysconfigService.getSysconfig();

        if (sysconfig.defect_type) {
          const types = sysconfig.defect_type.split(',').map(t => t.trim()).filter(t => t);
          setDefectTypes(types);
        }

        if (sysconfig.shift) {
          const shiftList = sysconfig.shift.split(',').map(s => s.trim()).filter(s => s);
          setShifts(shiftList);
          // Set default shift to first available shift
          if (shiftList.length > 0 && !fviLineParams.shift) {
            setFviLineParams(prev => ({ ...prev, shift: shiftList[0] }));
          }
        }

        // Load defects using get() method instead of getAll()
        const defectResponse = await defectService.get({ isActive: true });
        console.log('Defect Response:', defectResponse);
        if (defectResponse.success && defectResponse.data) {
          console.log('Loaded defects:', defectResponse.data);
          setDefects(defectResponse.data);
        } else {
          console.error('Failed to load defects:', defectResponse.message);
          error('Failed to load defect types. Please refresh the page.');
        }

        // Load QC operators (gr_code = 'QC') for QC Name and QC Leader Name
        const qcOperatorsResponse = await infCheckinService.getOperators('QC');
        console.log('QC Operators Response:', qcOperatorsResponse);
        if (qcOperatorsResponse.success && qcOperatorsResponse.data) {
          console.log('Loaded QC operators:', qcOperatorsResponse.data);

          // Convert to autocomplete options
          const qcOptions: AutocompleteOption[] = qcOperatorsResponse.data.map(op => ({
            value: op.username,
            label: op.oprname
          }));
          setQcOperatorOptions(qcOptions);
        } else {
          console.error('Failed to load QC operators:', qcOperatorsResponse.message);
          warning('Failed to load QC operator list. You can still enter names manually.');
        }

        // Load MRB operators (gr_code = 'MRB') for FVI Leader Confirm Name
        const mrbOperatorsResponse = await infCheckinService.getOperators('MRB');
        console.log('MRB Operators Response:', mrbOperatorsResponse);
        if (mrbOperatorsResponse.success && mrbOperatorsResponse.data) {
          console.log('Loaded MRB operators:', mrbOperatorsResponse.data);

          // Convert to autocomplete options
          const mrbOptions: AutocompleteOption[] = mrbOperatorsResponse.data.map(op => ({
            value: op.username,
            label: op.oprname
          }));
          setMrbOperatorOptions(mrbOptions);
        } else {
          console.error('Failed to load MRB operators:', mrbOperatorsResponse.message);
          warning('Failed to load MRB operator list. You can still enter names manually.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        error('Error loading initial data. Please refresh the page.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load available FVI lines on component mount (all distinct lines)
  useEffect(() => {
    const loadAvailableLines = async () => {
      try {
        setLoadingLines(true);
        console.log('Loading available FVI lines (distinct)');

        const response = await infCheckinService.getDistinctFVILines();

        if (response.success && response.data) {
          console.log('Available lines:', response.data);
          setAvailableLines(response.data);

          // Auto-select first line if available and line is not set
          if (response.data.length > 0 && !fviLineParams.line) {
            setFviLineParams(prev => ({ ...prev, line: response.data![0].line_no_id }));
          }

          if (response.data.length === 0) {
            warning('No FVI lines available.');
          }
        } else {
          console.error('Failed to load lines:', response.message);
          error('Failed to load FVI lines. Please try again.');
          setAvailableLines([]);
        }

        setLoadingLines(false);
      } catch (err) {
        console.error('Error loading lines:', err);
        error('Network error loading FVI lines.');
        setAvailableLines([]);
        setLoadingLines(false);
      }
    };

    loadAvailableLines();
  }, []);

  // Load FVI Line Mapping when parameters change
  useEffect(() => {
    const loadFVILineMapping = async () => {
      // Only load if all parameters are filled
      if (!fviLineParams.line || !fviLineParams.date || !fviLineParams.shift) {
        console.log('Skipping FVI load - missing parameters:', fviLineParams);
        setFviStations([]);
        return;
      }

      try {
        setLoadingFviStations(true);
        console.log('Loading FVI Line Mapping:', fviLineParams);

        const response = await infCheckinService.getFVILineMapping(
          fviLineParams.line,
          fviLineParams.date,
          fviLineParams.shift
        );

        console.log('FVI API Response:', response);

        if (response.success && response.data) {
          // Map API data to InspectionStation format
          const stations: InspectionStation[] = response.data.map((mapping, index) => ({
            line: fviLineParams.line,
            group: mapping.group_code,
            id: index + 1,
            position: mapping.gr_code,
            inspectorId: mapping.username,
            oprname: mapping.oprname
          }));

          console.log('Mapped FVI Stations:', stations);
          setFviStations(stations);

          if (stations.length === 0) {
            info('No station assignments found for this line and shift.');
          }
        } else {
          console.error('Failed to load FVI mapping:', response.message);
          error('Failed to load FVI station mapping.');
          setFviStations([]);
        }

        setLoadingFviStations(false);
      } catch (err) {
        console.error('Error loading FVI mapping:', err);
        error('Network error loading station mapping.');
        setFviStations([]);
        setLoadingFviStations(false);
      }
    };


    loadFVILineMapping();
  }, [fviLineParams]);

  // Helper function to get operator name by username
  const getOperatorName = (username: string): string | null => {
    // Search in both QC and MRB operator options
    const qcOperator = qcOperatorOptions.find(op => op.value === username);
    if (qcOperator) return qcOperator.label;

    const mrbOperator = mrbOperatorOptions.find(op => op.value === username);
    if (mrbOperator) return mrbOperator.label;

    return null;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof DefectFormData, value: string | number | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle multiple photo uploads
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Please select valid image files only' }));
        hasError = true;
        return;
      }

      // Validate file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Each image must be less than 5MB' }));
        hasError = true;
        return;
      }

      newFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setPreviewImages(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (!hasError) {
      const newTrayInfos: ImageTrayInfo[] = newFiles.map(() => ({ trayno: '', trayRow: '', trayPosition: '', photoMagnification: '', stamp: '' }));
      setFormData(prev => ({
        ...prev,
        rejectPhotos: [...prev.rejectPhotos, ...newFiles],
        imageTrayInfos: [...prev.imageTrayInfos, ...newTrayInfos]
      }));

      // Clear photo error
      if (errors.photo) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.photo;
          return newErrors;
        });
      }
    }
  };

  // Remove single photo by index
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rejectPhotos: prev.rejectPhotos.filter((_, i) => i !== index),
      imageTrayInfos: prev.imageTrayInfos.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove all photos
  const removeAllPhotos = () => {
    setFormData(prev => ({ ...prev, rejectPhotos: [], imageTrayInfos: [] }));
    setPreviewImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  
// Create validation schema dynamically based on station type
const createDefectInputValidationSchema = (isSIVStation: boolean): ValidationSchema<typeof formData> => {
  const schema: any = {
    qcName: required('QC name is required'),
    qcLeaderConfirmName: required('QC leader name is required'),
    mrbConfirmName: required('FVI Leader confirm name is required'),
    defectType: required('Defect type is required'),
    defect: required('Defect is required'),
  };

  if (isSIVStation) {
    schema.colorGroup = required('Color group is required for SIV station');
  }

  return schema;
};


  // Validate form
  const validateForm = (): boolean => {
    const isSIVStation = inspectionData?.station === 'SIV';
    const schema = createDefectInputValidationSchema(isSIVStation);
    const validationErrors = validateSchema(formData, schema);
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Note: Record deletion is now handled by the table component

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Validate inspection data
    if (!inspectionData) {
      error('No inspection data found. Please start from OQA page.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find defect ID from defect name
      const selectedDefect = defects.find(d => d.name === formData.defect);
      if (!selectedDefect) {
        error('Invalid defect selection. Please select a valid defect.');
        setIsSubmitting(false);
        return;
      }

      // Map group code: '1' -> 'A', '2' -> 'B', etc.
      const groupMapping: { [key: string]: string } = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E'
      };

      const groupValue = selectedStation?.group ? groupMapping[selectedStation.group] || selectedStation.group : '';

      // GROUP_LAYOUTS definition (same as in FVILineLayout.tsx)
      const GROUP_LAYOUTS: { [key: string]: string[] } = {
        '1': ['a-gr-1', 'a-gr-2', 'a-gr-3', 'a-gr-4', 'a-gr-5', 'a-gr-6', 'a-gr-7', 'MRB'],
        '2': ['b-gr-1', 'b-gr-2', 'b-gr-3', 'b-gr-4', 'b-gr-5', 'b-gr-6', 'b-gr-7', 'QC']
      };

      // Find the station index based on the position in GROUP_LAYOUTS
      let stationIndex = 0;
      if (selectedStation?.group && selectedStation?.position) {
        const groupLayout = GROUP_LAYOUTS[selectedStation.group];
        if (groupLayout) {
          const positionIndex = groupLayout.indexOf(selectedStation.position);
          if (positionIndex !== -1) {
            stationIndex = positionIndex + 1; // 1-based index (1, 2, 3, ..., 8)
          }
        }
      }

      // Prepare data for API
      // Note: station is now based on the index of the position in GROUP_LAYOUTS
      const defectData = {
        inspection_no: inspectionData.inspection_no,
        defect_date: new Date(fviLineParams.date),
        qc_name: formData.qcName,
        qclead_name: formData.qcLeaderConfirmName,
        mbr_name: formData.mrbConfirmName,
        linevi: fviLineParams.line.toUpperCase(), // Ensure uppercase (A, B, etc.)
        groupvi: groupValue, // Mapped to A, B, C, D, E
        station: stationIndex.toString(), // Station based on index in GROUP_LAYOUTS (1-8)
        inspector: formData.inspectorId,
        defect_id: selectedDefect.id,
        ng_qty: formData.defectQuantity,
        trayno: '',
        tray_position: '',
        color: inspectionData.station === 'SIV' ? formData.colorGroup : '', // Only send color for SIV station
        defect_detail: formData.defect === 'Etc.' ? formData.defectDetail : '' // Include defect detail when "Etc." is selected
      };

      console.log('Submitting defect data:', defectData);

      // Call API to save defect record
      const response = await defectCustomerDataService.create(defectData);

      if (response.success && response.data && response.data.id) {
        const defectId: number = response.data.id;
        console.log('✅ Defect record created with ID:', defectId);

        // Upload images if there are any
        let uploadedImageUrls: string[] = [];
        if (formData.rejectPhotos.length > 0) {
          console.log('📤 Uploading', formData.rejectPhotos.length, 'images...');

          const imageUploadResponse = await defectCustomerDataService.uploadBulk(
            defectId,
            formData.rejectPhotos,
            formData.imageTrayInfos.map(info => ({
              trayno: info.trayno,
              tray_row: info.trayRow,
              tray_position: info.trayPosition,
              photo_magnification: info.photoMagnification,
              stamp: info.stamp
            }))
          );

          if (imageUploadResponse.success) {
            console.log('✅ Images uploaded successfully:', imageUploadResponse.data);

            // Fetch the uploaded images to get their URLs
            const imagesResponse = await defectCustomerDataService.getByDefectId(defectId);
            if (imagesResponse.success && imagesResponse.data) {
              uploadedImageUrls = imagesResponse.data.map(img => img.image_url);
              console.log('✅ Fetched image URLs:', uploadedImageUrls);
            }
          } else {
            console.error('⚠️ Image upload failed:', imageUploadResponse.message);
            warning('Defect saved, but some images failed to upload: ' + imageUploadResponse.message);
          }
        }

        // Add to local records for display
        const newRecord: DefectDetail = {
          id: defectId,
          defect_date:new Date(fviLineParams.date),
          trayno: '',
          tray_position: '',
          color: formData.colorGroup,
          qc_name: formData.qcName,
          qclead_name: formData.qcLeaderConfirmName,
          mbr_name: formData.mrbConfirmName,
          inspector: formData.inspectorId,
          defect_id: selectedDefect.id, // Use the actual defect ID from selected defect
          defect_name: selectedDefect.name, // Use the defect name from selected defect
          ng_qty: formData.defectQuantity,
          defect_detail: formData.defectDetail,
          inspection_no: inspectionData.inspection_no,
          groupvi: groupValue,
          linevi: fviLineParams.line.toUpperCase(),
          station: stationIndex.toString(), // Station based on index in GROUP_LAYOUTS (1-8)
          image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : []
        };

        console.log('📝 New defect record created:', newRecord);
        console.log('📝 defect_id:', newRecord.defect_id, 'defect_name:', newRecord.defect_name);

        // Reset form
        setFormData({
          tray: '',
          positionOnTray: 1,
          colorGroup: '',
          qcName: '',
          qcLeaderConfirmName: '',
          mrbConfirmName: '',
          rejectPhotos: [],
          inspectorId: '',
          defectType: '',
          defect: '',
          defectQuantity: 1,
          defectDetail: '',
          imageTrayInfos: []
        });
        setPreviewImages([]);
        setSelectedStation(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Trigger table refresh by incrementing the key
        setTableRefreshKey(prev => prev + 1);

        success('Defect record and images saved successfully!');
      } else {
        const errorMsg = response.errors?.map(e => e.message).join(', ') || response.message || 'Unknown error';
        error('Failed to save defect record: ' + errorMsg);
        console.error('API error:', response);
      }
    } catch (err) {
      console.error('Submit error:', err);
      error('Failed to submit defect record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-primary-50">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          position="top-right"
        />
      ))}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Defect Input (Customer Format)</h1>
                <p className="text-sm text-gray-500">Record and track defect inspection data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* SECTION 1: Inspection Information - Blue Theme */}
        {inspectionData && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-2xl border-2 border-purple-400 p-6 transform transition-all hover:scale-[1.01]">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                <InformationCircleIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Sampling Information</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Sampling No.</p>
                <p className="text-sm font-bold text-white">{inspectionData.inspection_no}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Lot No.</p>
                <p className="text-sm font-bold text-white">{inspectionData.lotno}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Item No.</p>
                <p className="text-sm font-bold text-white">{inspectionData.itemno}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Model</p>
                <p className="text-sm font-bold text-white">{inspectionData.model}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">FVI Line No</p>
                <p className="text-sm font-bold text-white">{inspectionData.fvilineno || 'N/A'}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Shift</p>
                <p className="text-sm font-bold text-white">{inspectionData.shift}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Round</p>
                <p className="text-sm font-bold text-white">{inspectionData.round}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">FVI Lot Qty</p>
                <p className="text-sm font-bold text-white">{inspectionData.fvi_lot_qty}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Judgment</p>
                <p className={`text-sm font-bold ${
                  inspectionData.judgment === 'Pass'
                    ? 'text-green-300'
                    : inspectionData.judgment === 'Reject'
                      ? 'text-red-300'
                      : 'text-gray-300'
                }`}>
                  {inspectionData.judgment || ''}
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">General Sampling</p>
                <p className="text-sm font-bold text-white">{inspectionData.general_sampling_qty}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Crack Sampling</p>
                <p className="text-sm font-bold text-white">{inspectionData.crack_sampling_qty}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-purple-100 mb-1">Sampling Date</p>
                <p className="text-sm font-bold text-white">
                  {formatDate(inspectionData.inspection_date)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Defect Input Form - Orange Theme */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-2xl border-2 border-orange-400 p-6 transform transition-all hover:scale-[1.01]">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">2. Defect Input Form</h2>
          </div>

          <div className="bg-white rounded-xl p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* SECTION A: QC Personnel */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">A</span>
                    QC Personnel
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* QC Name */}
                    <div>
                      <AutocompleteInput
                        label="QC Name"
                        required
                        value={formData.qcName}
                        onChange={(value) => handleFieldChange('qcName', value)}
                        options={qcOperatorOptions}
                        placeholder="Search by name or ID..."
                        error={!!errors.qcName}
                        className="text-sm"
                      />
                      {errors.qcName && <p className="mt-1 text-sm text-red-600">{errors.qcName}</p>}
                      {formData.qcName && getOperatorName(formData.qcName) && (
                        <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">
                            ✓ {getOperatorName(formData.qcName)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* QC Leader Name */}
                    <div>
                      <AutocompleteInput
                        label="QC Leader Name"
                        required
                        value={formData.qcLeaderConfirmName}
                        onChange={(value) => handleFieldChange('qcLeaderConfirmName', value)}
                        options={qcOperatorOptions}
                        placeholder="Search by name or ID..."
                        error={!!errors.qcLeaderConfirmName}
                        className="text-sm"
                      />
                      {errors.qcLeaderConfirmName && <p className="mt-1 text-sm text-red-600">{errors.qcLeaderConfirmName}</p>}
                      {formData.qcLeaderConfirmName && getOperatorName(formData.qcLeaderConfirmName) && (
                        <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-900">
                            ✓ {getOperatorName(formData.qcLeaderConfirmName)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* FVI Leader Confirm Name */}
                    <div>
                      <AutocompleteInput
                        label="FVI Leader Confirm Name"
                        required
                        value={formData.mrbConfirmName}
                        onChange={(value) => handleFieldChange('mrbConfirmName', value)}
                        options={mrbOperatorOptions}
                        maxResults={100}
                        placeholder="Search by name or ID..."
                        error={!!errors.mrbConfirmName}
                        className="text-sm"
                      />
                      {errors.mrbConfirmName && <p className="mt-1 text-sm text-red-600">{errors.mrbConfirmName}</p>}
                      {formData.mrbConfirmName && getOperatorName(formData.mrbConfirmName) && (
                        <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">
                            ✓ {getOperatorName(formData.mrbConfirmName)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                  {/* End Section A */}

                  {/* SECTION B: Defect Details */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">B</span>
                    Defect Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Defect Type *
                      </label>
                      <select
                        value={formData.defectType}
                        onChange={(e) => handleFieldChange('defectType', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.defectType ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <option value="">Select defect type</option>
                        {defectTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.defectType && <p className="mt-1 text-sm text-red-600">{errors.defectType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Defect *
                      </label>
                      <select
                        value={formData.defect}
                        onChange={(e) => {
                          handleFieldChange('defect', e.target.value);
                          // Clear defect detail when changing defect
                          if (e.target.value !== 'Etc.') {
                            handleFieldChange('defectDetail', '');
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.defect ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <option value="">Select defect</option>
                        {defects.map(defect => (
                          <option key={defect.id} value={defect.name}>{defect.name}</option>
                        ))}
                      </select>
                      {errors.defect && <p className="mt-1 text-sm text-red-600">{errors.defect}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Defect Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.defectQuantity}
                        onChange={(e) => handleFieldChange('defectQuantity', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.defectQuantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.defectQuantity && <p className="mt-1 text-sm text-red-600">{errors.defectQuantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Group {inspectionData?.station === 'SIV' ? '*' : ''}
                        {inspectionData?.station === 'SIV' && (
                          <span className="ml-1 text-xs text-purple-600">(Required for SIV)</span>
                        )}
                        {inspectionData?.station !== 'SIV' && (
                          <span className="ml-1 text-xs text-gray-500"> (Options)</span>
                        )}
                      </label>
                      <select
                        value={formData.colorGroup}
                        onChange={(e) => handleFieldChange('colorGroup', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-semibold ${
                          errors.colorGroup ? 'border-red-500' : 'border-gray-300'
                        } ${inspectionData?.station !== 'SIV' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: inspectionData?.station !== 'SIV' ? '#f3f4f6' : (formData.colorGroup ? formData.colorGroup.toLowerCase() : 'white'),
                          color: inspectionData?.station !== 'SIV' ? '#9ca3af' : (formData.colorGroup && ['black', 'purple', 'purple', 'brown', 'navy'].includes(formData.colorGroup.toLowerCase()) ? 'white' : 'black')
                        }}
                        disabled={colorLoading || inspectionData?.station !== 'SIV'}
                      >
                        <option value="" style={{ backgroundColor: 'white', color: 'black' }}>Select color group</option>
                        {colorOptions.map((option) => {
                          const bgColor = option.value.toLowerCase();
                          const textColor = ['black', 'purple', 'purple', 'brown', 'navy'].includes(bgColor) ? 'white' : 'black';
                          return (
                            <option
                              key={option.value}
                              value={option.value}
                              style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                fontWeight: 'bold'
                              }}
                            >
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                      {errors.colorGroup && <p className="mt-1 text-sm text-red-600">{errors.colorGroup}</p>}
                    </div>
                  </div>

                  {/* Defect Detail - Only shown when "Etc." is selected */}
                  {formData.defect === 'Etc.' && (
                    <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Defect Detail Description *
                        <span className="ml-2 text-xs text-yellow-700 font-semibold">
                          (Required for "Etc." defect)
                        </span>
                      </label>
                      <textarea
                        value={formData.defectDetail}
                        onChange={(e) => handleFieldChange('defectDetail', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                          errors.defectDetail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        rows={3}
                        placeholder="Please describe the defect in detail..."
                      />
                      {errors.defectDetail && <p className="mt-1 text-sm text-red-600">{errors.defectDetail}</p>}
                      <p className="mt-2 text-xs text-gray-600">
                        💡 Provide specific details about the defect to help with analysis and tracking.
                      </p>
                    </div>
                  )}
                  </div>
                  {/* End Section B */}

                  {/* SECTION C: Defect Photos */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">C</span>
                    Defect Photos (Multiple)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <CameraIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Upload Photos</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      {previewImages.length > 0 && (
                        <button
                          type="button"
                          onClick={removeAllPhotos}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="text-sm">Clear All ({previewImages.length})</span>
                        </button>
                      )}
                    </div>

                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="relative flex-shrink-0">
                              <img
                                src={preview}
                                alt={`Defect preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded-br-lg rounded-tl">
                                #{index + 1}
                              </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_2fr_2fr] gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tray No.</label>
                                <input
                                  type="text"
                                  value={formData.imageTrayInfos[index]?.trayno || ''}
                                  onChange={(e) => {
                                    setFormData(prev => {
                                      const updated = [...prev.imageTrayInfos];
                                      updated[index] = { ...updated[index], trayno: e.target.value };
                                      return { ...prev, imageTrayInfos: updated };
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Tray number"
                                  maxLength={20}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tray Row</label>
                                <input
                                  type="text"
                                  value={formData.imageTrayInfos[index]?.trayRow || ''}
                                  onChange={(e) => {
                                    setFormData(prev => {
                                      const updated = [...prev.imageTrayInfos];
                                      updated[index] = { ...updated[index], trayRow: e.target.value };
                                      return { ...prev, imageTrayInfos: updated };
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Row number"
                                  maxLength={20}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                                <input
                                  type="text"
                                  value={formData.imageTrayInfos[index]?.trayPosition || ''}
                                  onChange={(e) => {
                                    setFormData(prev => {
                                      const updated = [...prev.imageTrayInfos];
                                      updated[index] = { ...updated[index], trayPosition: e.target.value };
                                      return { ...prev, imageTrayInfos: updated };
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Position"
                                  maxLength={20}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Photo Mag.</label>
                                <input
                                  type="text"
                                  value={formData.imageTrayInfos[index]?.photoMagnification || ''}
                                  onChange={(e) => {
                                    setFormData(prev => {
                                      const updated = [...prev.imageTrayInfos];
                                      updated[index] = { ...updated[index], photoMagnification: e.target.value };
                                      return { ...prev, imageTrayInfos: updated };
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Magnification"
                                  maxLength={50}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">N Stamp</label>
                                <input
                                  type="text"
                                  value={formData.imageTrayInfos[index]?.stamp || ''}
                                  onChange={(e) => {
                                    setFormData(prev => {
                                      const updated = [...prev.imageTrayInfos];
                                      updated[index] = { ...updated[index], stamp: e.target.value };
                                      return { ...prev, imageTrayInfos: updated };
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="หมายเลข LB"
                                  maxLength={30}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
                  </div>
                  </div>
                  {/* End Section C */}

                {/* SECTION D: Inspector Station Selection - Full Width */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">D</span>
                    Inspector Station Selection
                  </h3>

                  {/* FVI Line Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Defect Date *
                      </label>
                      <input
                        type="date"
                        value={fviLineParams.date}
                        onChange={(e) => {
                          setFviLineParams(prev => ({ ...prev, date: e.target.value, line: '' }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        FVI Line *
                      </label>
                      <select
                        value={fviLineParams.line}
                        onChange={(e) => setFviLineParams(prev => ({ ...prev, line: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        disabled={loadingLines || availableLines.length === 0}
                      >
                        <option value="">
                          {loadingLines ? 'Loading lines...' : availableLines.length === 0 ? 'No lines available' : 'Select line'}
                        </option>
                        {availableLines.map(line => (
                          <option key={line.line_no_id} value={line.line_no_id}>{line.line_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Shift *
                      </label>
                      <select
                        value={fviLineParams.shift}
                        onChange={(e) => setFviLineParams(prev => ({ ...prev, shift: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        disabled={loading || shifts.length === 0}
                      >
                        <option value="">Select shift</option>
                        {shifts.map(shift => (
                          <option key={shift} value={shift}>{shift}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* FVI Line Layout */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative min-h-[200px]">
                    {loadingFviStations && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                          <span className="text-sm text-gray-600">Loading stations...</span>
                        </div>
                      </div>
                    )}

                    {!loadingFviStations && fviStations.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <InformationCircleIcon className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">No station data found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Please fill in Date, Line, and Shift above to load station assignments
                        </p>
                      </div>
                    )}

                    {!loadingFviStations && fviStations.length > 0 && (
                      <FVILineLayout
                        stations={fviStations}
                        selectedStation={selectedStation}
                        shift={fviLineParams.shift}
                        onStationSelect={(station) => {
                          setSelectedStation(station);
                          console.log('🔍 Station selected:', station);
                          if (station) {
                            // Check if multiple inspectors (comma-separated)
                            const inspectors = station.inspectorId.split(',').map(id => id.trim()).filter(id => id !== '-');
                            console.log('👥 Inspectors:', inspectors);

                            // Build inspector name mapping from station.oprname
                            const nameMap: Record<string, string> = {};
                            if (station.oprname) {
                              const names = station.oprname.split(',').map(name => name.trim());
                              console.log('📝 Operator names from station:', names);
                              inspectors.forEach((id, index) => {
                                if (names[index]) {
                                  nameMap[id] = names[index];
                                  console.log(`✅ Mapped: ${id} → ${names[index]}`);
                                }
                              });
                            } else {
                              console.log('⚠️ No oprname in station data');
                            }
                            console.log('🗺️ Final name map:', nameMap);
                            setInspectorNameMap(nameMap);

                            if (inspectors.length === 1) {
                              // Single inspector - auto-select
                              handleFieldChange('inspectorId', inspectors[0]);
                            } else if (inspectors.length > 1) {
                              // Multiple inspectors - show modal
                              setAvailableInspectors(inspectors);
                              setShowInspectorModal(true);
                              handleFieldChange('inspectorId', '');
                            } else {
                              // No inspector
                              handleFieldChange('inspectorId', '');
                            }
                          }
                        }}
                        showHeader={false}
                        compactMode={true}
                      />
                    )}

                    {/* Inspector Selection Prompt - Show when multiple inspectors and none selected */}
                    {selectedStation && selectedStation.inspectorId.includes(',') && !formData.inspectorId && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Multiple Inspectors Found
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              ⚠️ This station has multiple inspectors. Please select one.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowInspectorModal(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                          >
                            Select Inspector
                          </button>
                        </div>
                        {errors.inspectorId && <p className="mt-2 text-sm text-red-600">{errors.inspectorId}</p>}
                      </div>
                    )}

                    {/* Show selected inspector info */}
                    {selectedStation && formData.inspectorId && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Inspector Selected</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {inspectorNameMap[formData.inspectorId] || getOperatorName(formData.inspectorId) || formData.inspectorId}
                              </p>
                              {(inspectorNameMap[formData.inspectorId] || getOperatorName(formData.inspectorId)) && (
                                <p className="text-xs text-gray-500">ID: {formData.inspectorId}</p>
                              )}
                            </div>
                          </div>
                          {selectedStation.inspectorId.includes(',') && (
                            <button
                              type="button"
                              onClick={() => setShowInspectorModal(true)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Change
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit and Close Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const station = inspectionData?.station || '';
                        navigate(`/inspection/${station}`);
                      }}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                      <span>Close</span>
                    </button>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5" />
                          <span>Submit Defect Record</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
          </div>
        </div>
        {/* SECTION 4: Defect Data Table - Green Theme */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl border-2 border-green-400 p-6 transform transition-all hover:scale-[1.01]">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">3. Defect Data Table</h2>
          </div>

          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-6">
              <DefectsDataTable
                key={tableRefreshKey}
                inspectionNo={inspectionData?.inspection_no || ''}
                showHeader={false}
                showStatistics={true}
                showDelete={true}
                showResendEmail={true}
                serviceType="defectdata-customer"
                onSuccess={(message) => success(message)}
                onError={(message) => error(message)}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Inspector Selection Modal */}
      {showInspectorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowInspectorModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 text-white mr-2" />
                    <h3 className="text-lg font-semibold text-white">
                      Select Inspector
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowInspectorModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white px-6 py-6">
                <p className="text-sm text-gray-600 mb-4">
                  Multiple inspectors are assigned to this station. Please select the inspector responsible for this defect:
                </p>

                {/* Station Info */}
                {selectedStation && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Station Information</p>
                    <p className="text-sm font-medium text-gray-700">
                      Line {selectedStation.line} - Group {selectedStation.group} - Position {selectedStation.position}
                    </p>
                  </div>
                )}

                {/* Inspector Buttons */}
                <div className="grid grid-cols-1 gap-3">
                  {availableInspectors.map((inspector) => {
                    // Get inspector name from the station's oprname mapping
                    const inspectorName = inspectorNameMap[inspector] || getOperatorName(inspector);
                    console.log(`🔍 Inspector: ${inspector}, Name from map: ${inspectorNameMap[inspector]}, Name from getOperatorName: ${getOperatorName(inspector)}, Final: ${inspectorName}`);
                    return (
                      <button
                        key={inspector}
                        onClick={() => {
                          handleFieldChange('inspectorId', inspector);
                          setShowInspectorModal(false);
                          success(`Inspector ${inspectorName || inspector} selected`);
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                          formData.inspectorId === inspector
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 mr-3 text-gray-600" />
                            <div>
                              <p className="font-semibold">
                                {inspectorName || inspector}
                              </p>
                              <p className="text-xs text-gray-500">
                                {inspectorName ? `ID: ${inspector}` : 'Inspector ID'}
                              </p>
                            </div>
                          </div>
                          {formData.inspectorId === inspector && (
                            <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowInspectorModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectCustomerInputPage; 