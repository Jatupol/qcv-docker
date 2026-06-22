// client/src/types/inspection-station.ts
// Type definitions for Inspection Station Page
// Generic Inspection Station Page - Unified component for OQA, OBA, and SIV
// Complete Separation Entity Architecture

/**
 * Filter options for inspection records
 */
export interface FilterOptions {
  dateStart: string;
  dateEnd: string;
  judgment: 'all' | 'pass' | 'reject' | 'pending';
  lotno: string;
  model: string;
  fvilineno: string;
  partsite: string;
  round?: string;
}

/**
 * Station theme configuration for UI styling
 */
export interface StationTheme {
  background: string;
  header: string;
  headerBorder: string;
  subtitle: string;
  spinner: string;
  breadcrumb: string;
  breadcrumbActive: string;
  focusRing: string;
  iconLegend: string;
  editButton: string;
  editButtonHover: string;
  pagination: string;
  modalButton: string;
  modalButtonHover: string;
  passRate: string;
  passRateHeader: string;
  passRateText: string;
  photoIcon: string;
}

/**
 * Station configuration
 */
export interface StationConfig {
  code: string;
  name: string;
  title: string;
  subtitle: string;
  breadcrumbName: string;
  newButtonLabel: string;
  pageRoute: string;
  defectRoute: string;
  theme: StationTheme;
}

/**
 * Station type
 */
export type StationType = 'OQA'|'OQA_CUSTOMER'| 'OBA' | 'SIV';

/**
 * Statistics calculated from filtered records
 */
export interface InspectionStatistics {
  total: number;
  passed: number;
  rejected: number;
  passRate: string;
}

/**
 * SIV creation result
 */
export interface SIVCreationResult {
  success: boolean;
  message: string;
  inspectionNo?: string;
}

/**
 * API response for SIV creation
 */
export interface SIVCreationResponse {
  success: boolean;
  message?: string;
  data?: {
    inspection_no: string;
    id: number;
    [key: string]: any;
  };
}
 
/**
 * Station Configurations (Constants)
 */
export const STATION_CONFIGS: Record<StationType, StationConfig> = {
  OQA: {
    code: 'OQA',
    name: 'OQA',
    title: 'OQA Sampling Lists',
    subtitle: 'View OQA sampling inspection results',
    breadcrumbName: 'Final visual inspection',
    newButtonLabel: 'New OQA',
    pageRoute: '/inspection/oqa/new',
    defectRoute: '/inspection/defect/new',
    theme: {
      background: 'from-amber-50 via-orange-50 to-yellow-50',
      header: 'from-amber-600 via-orange-600 to-yellow-600',
      headerBorder: 'border-amber-100',
      subtitle: 'text-amber-100',
      spinner: 'border-amber-600',
      breadcrumb: 'hover:text-amber-600',
      breadcrumbActive: 'text-amber-600',
      focusRing: 'focus:ring-amber-500 focus:border-amber-500',
      iconLegend: 'text-amber-600',
      editButton: 'text-amber-600 hover:bg-amber-50',
      editButtonHover: 'text-amber-600',
      pagination: 'bg-amber-600',
      modalButton: 'from-amber-500 to-orange-600',
      modalButtonHover: 'hover:from-amber-600 hover:to-orange-700',
      passRate: 'from-amber-100 to-orange-100',
      passRateHeader: 'text-amber-800',
      passRateText: 'text-amber-600',
      photoIcon: 'text-amber-600'
    }
  }, 
  OQA_CUSTOMER: {
    code: 'OQA',
    name: 'OQA',
    title: 'OQA Sampling (Customer) Lists',
  subtitle: 'View OQA sampling inspection results',
  breadcrumbName: 'Customer Data',
  newButtonLabel: 'New OQA',
  pageRoute: '/customer-data/oqa/new',
  defectRoute: '/customer-data/defect/new',
  theme: {
    background: 'from-violet-50 via-purple-50 to-fuchsia-50',
    header: 'from-violet-600 via-purple-600 to-fuchsia-600',
    headerBorder: 'border-violet-100',
    subtitle: 'text-violet-100',
    spinner: 'border-violet-600',
    breadcrumb: 'hover:text-violet-600',
    breadcrumbActive: 'text-violet-600',
    focusRing: 'focus:ring-violet-500 focus:border-violet-500',
    iconLegend: 'text-violet-600',
    editButton: 'text-violet-600 hover:bg-violet-50',
    editButtonHover: 'text-violet-600',
    pagination: 'bg-violet-600',
    modalButton: 'from-violet-500 to-purple-600',
    modalButtonHover: 'hover:from-violet-600 hover:to-purple-700',
    passRate: 'from-violet-100 to-purple-100',
    passRateHeader: 'text-violet-800',
    passRateText: 'text-violet-600',
    photoIcon: 'text-violet-600'
    }
  }, 
  OBA: {
    code: 'OBA',
    name: 'OBA',
    title: 'OBA Sampling Lists',
    subtitle: 'View OBA sampling inspection results',
    breadcrumbName: 'Final visual inspection',
    newButtonLabel: 'New OBA',
    pageRoute: '/inspection/oba/new',
    defectRoute: '/inspection/defect/new',
    theme: {
      background: 'from-teal-50 via-cyan-50 to-emerald-50',
      header: 'from-teal-600 via-cyan-600 to-emerald-600',
      headerBorder: 'border-teal-100',
      subtitle: 'text-teal-100',
      spinner: 'border-teal-600',
      breadcrumb: 'hover:text-teal-600',
      breadcrumbActive: 'text-teal-600',
      focusRing: 'focus:ring-teal-500 focus:border-teal-500',
      iconLegend: 'text-teal-600',
      editButton: 'text-teal-600 hover:bg-teal-50',
      editButtonHover: 'text-teal-600',
      pagination: 'bg-teal-600',
      modalButton: 'from-teal-500 to-cyan-600',
      modalButtonHover: 'hover:from-teal-600 hover:to-cyan-700',
      passRate: 'from-teal-100 to-cyan-100',
      passRateHeader: 'text-teal-800',
      passRateText: 'text-teal-600',
      photoIcon: 'text-teal-600'
    }
  },
  SIV: {
    code: 'SIV',
    name: 'SIV',
    title: 'SIV Sampling Lists',
    subtitle: 'View SIV sampling inspection results',
    breadcrumbName: 'Final visual inspection',
    newButtonLabel: 'New SIV',
    pageRoute: '/inspection/siv/new',
    defectRoute: '/inspection/defect/new',
    theme: {
      background: 'from-blue-50 via-indigo-50 to-purple-50',
      header: 'from-blue-600 via-indigo-600 to-purple-600',
      headerBorder: 'border-blue-100',
      subtitle: 'text-blue-100',
      spinner: 'border-blue-600',
      breadcrumb: 'hover:text-blue-600',
      breadcrumbActive: 'text-blue-600',
      focusRing: 'focus:ring-blue-500 focus:border-blue-500',
      iconLegend: 'text-blue-600',
      editButton: 'text-blue-600 hover:bg-blue-50',
      editButtonHover: 'text-blue-600',
      pagination: 'bg-blue-600',
      modalButton: 'from-blue-500 to-indigo-600',
      modalButtonHover: 'hover:from-blue-600 hover:to-indigo-700',
      passRate: 'from-blue-100 to-indigo-100',
      passRateHeader: 'text-blue-800',
      passRateText: 'text-blue-600',
      photoIcon: 'text-blue-600'
    }
  }
};
