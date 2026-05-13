// client/src/types/import-inspection.ts
// Type definitions for Import Inspection Page
// Manufacturing Quality Control System - Inspection Data Import

import type { StationTheme, StationConfig, StationType } from './inspection-station';

/**
 * Inspection data from database
 */
export interface InspectionData {
  id: number;
  station: string;
  inspection_no: string;
  inspection_no_ref: string;
  inspection_date: Date;
  fy: string;
  ww: string;
  month_year: string;
  shift: string;
  lotno: string;
  partsite: string;
  mclineno: string;
  itemno: string;
  model: string;
  version: string;
  fvilineno: string;
  round: number;
  qc_id: number;
  fvi_lot_qty: number;
  general_sampling_qty: number;
  crack_sampling_qty: number;
  judgment: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

/**
 * Inspection record for display
 */
export interface InspectionRecord {
  id: string;
  timestamp: string;
  inspectionDate: Date;
  inspector: string;
  model: string;
  samplingRound: number;
  fviLotQty: number;
  generalSamplingQty: number;
  crackSamplingQty: number;
  judgment: 'Pass' | 'Reject' | null;
  lotno: string;
  itemno: string;
  inspectionNo: string;
  inspectionNoRef: string;
  ww: string;
  mclineno: string;
  shift: string;
  ngDetails?: NGRecord;
  // Additional database fields for detail modal
  station: string;
  fy: string;
  month_year: string;
  partsite: string;
  version: string;
  fvilineno: string;
  qc_id: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

/**
 * NG (defect) record
 */
export interface NGRecord {
  id: string;
  tray: string;
  positionOnTray: string;
  colorGroup: string;
  qcRejectName: string;
  qcLeaderConfirmName: string;
  mrbConfirmName?: string;
  rejectPhoto?: string;
  inspectorId: string;
  timestamp: string;
}

/**
 * Filter options
 */
export interface FilterOptions {
  dateRange: 'today' | 'week' | 'month' | 'all';
  judgment: 'all' | 'pass' | 'reject';
  inspector: string;
  model: string;
}

/**
 * Statistics
 */
export interface InspectionStatistics {
  total: number;
  passed: number;
  rejected: number;
  passRate: string;
}

/**
 * Import progress
 */
export interface ImportProgress {
  current: number;
  total: number;
  status: string;
}

/**
 * Station configurations for Import Inspection Page
 * Different color scheme than InspectionStationPage
 */
export const IMPORT_STATION_CONFIGS: Record<StationType, StationConfig> = {
  OQA: {
    code: 'OQA',
    name: 'OQA',
    title: 'OQA Sampling Lists',
    subtitle: 'View OQA sampling inspection results',
    breadcrumbName: 'Final visual inspection',
    newButtonLabel: 'New OQA',
    pageRoute: '/inspection/oqa/new',
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
  },
  OBA: {
    code: 'OBA',
    name: 'OBA',
    title: 'OBA Sampling Lists',
    subtitle: 'View OBA sampling inspection results',
    breadcrumbName: 'Final visual inspection',
    newButtonLabel: 'New OBA',
    pageRoute: '/inspection/oba/new',
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
  }
};
