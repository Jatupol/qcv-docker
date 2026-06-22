// client/src/components/dashboard/DashboardFilters.tsx
// Reusable Dashboard Filter Component for LAR, DPPM, and UnderKill Dashboards

import React from 'react';
import type { TimePeriod } from '../../types/report';

// ============ INTERFACES ============

export interface DashboardFilterValues {
  dateFrom: string;
  dateTo: string;
  selectedProductionSites: string[];
  selectedCustomerSites: string[];
  selectedProductFamilies: string[];
  selectedProductTypes: string[];
  selectedModels: string[];
}

export interface FilterOption {
  value: string;
  label: string;
}

interface DashboardFiltersProps {
  // Filter values
  filters: DashboardFilterValues;

  // Available options
  availableProductionSites: FilterOption[];
  availableCustomerSites: FilterOption[];
  availableProductFamilies: FilterOption[];
  availableProductTypes: FilterOption[];
  availableModels: string[];

  // Show/hide states
  showProductionSiteSelect: boolean;
  showCustomerSiteSelect: boolean;
  showProductFamilySelect: boolean;
  showProductTypeSelect: boolean;
  showModelSelect: boolean;

  // Callbacks
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onToggleProductionSite: (site: string) => void;
  onToggleCustomerSite: (site: string) => void;
  onToggleProductFamily: (family: string) => void;
  onToggleProductType: (type: string) => void;
  onToggleModel: (model: string) => void;

  // Dropdown toggle callbacks
  onToggleProductionSiteDropdown: () => void;
  onToggleCustomerSiteDropdown: () => void;
  onToggleProductFamilyDropdown: () => void;
  onToggleProductTypeDropdown: () => void;
  onToggleModelDropdown: () => void;

  // Bulk selection callbacks
  onClearProductionSites: () => void;
  onSelectAllProductionSites: () => void;
  onClearCustomerSites: () => void;
  onSelectAllCustomerSites: () => void;
  onClearProductFamilies: () => void;
  onSelectAllProductFamilies: () => void;
  onClearProductTypes: () => void;
  onSelectAllProductTypes: () => void;
  onClearModels: () => void;
  onSelectAllModels: () => void;

  // Time period for date input format
  timePeriod: TimePeriod;

  // Action callbacks
  onClearFilters: () => void;
  onApplyFilters: () => void;

  // State
  loading?: boolean;

  // Refs for click-outside (passed from parent)
  productionSiteRef: React.RefObject<HTMLDivElement>;
  customerSiteRef: React.RefObject<HTMLDivElement>;
  productFamilyRef: React.RefObject<HTMLDivElement>;
  productTypeRef: React.RefObject<HTMLDivElement>;
  modelRef: React.RefObject<HTMLDivElement>;
}

// ============ COLOR CONFIGS ============

const dropdownColors = {
  blue:   { border: 'border-blue-300',   focus: 'focus:ring-blue-400',   check: 'text-blue-500 focus:ring-blue-400',     hover: 'hover:bg-blue-50',   badge: 'bg-blue-100 text-blue-700',     label: 'text-blue-600',   btnHover: 'hover:bg-blue-50',   ring: 'focus:ring-blue-500' },
  purple: { border: 'border-purple-300', focus: 'focus:ring-purple-400', check: 'text-purple-500 focus:ring-purple-400', hover: 'hover:bg-purple-50', badge: 'bg-purple-100 text-purple-700', label: 'text-purple-600', btnHover: 'hover:bg-purple-50', ring: 'focus:ring-purple-500' },
  teal:   { border: 'border-teal-300',   focus: 'focus:ring-teal-400',   check: 'text-teal-500 focus:ring-teal-400',     hover: 'hover:bg-teal-50',   badge: 'bg-teal-100 text-teal-700',     label: 'text-teal-600',   btnHover: 'hover:bg-teal-50',   ring: 'focus:ring-teal-500' },
  rose:   { border: 'border-rose-300',   focus: 'focus:ring-rose-400',   check: 'text-rose-500 focus:ring-rose-400',     hover: 'hover:bg-rose-50',   badge: 'bg-rose-100 text-rose-700',     label: 'text-rose-600',   btnHover: 'hover:bg-rose-50',   ring: 'focus:ring-rose-500' },
  indigo: { border: 'border-indigo-300', focus: 'focus:ring-indigo-400', check: 'text-indigo-500 focus:ring-indigo-400', hover: 'hover:bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', label: 'text-indigo-600', btnHover: 'hover:bg-indigo-50', ring: 'focus:ring-indigo-500' },
};

// ============ COMPONENT ============

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  availableProductionSites,
  availableCustomerSites,
  availableProductFamilies,
  availableProductTypes,
  availableModels,
  showProductionSiteSelect,
  showCustomerSiteSelect,
  showProductFamilySelect,
  showProductTypeSelect,
  showModelSelect,
  timePeriod,
  onDateFromChange,
  onDateToChange,
  onToggleProductionSite,
  onToggleCustomerSite,
  onToggleProductFamily,
  onToggleProductType,
  onToggleModel,
  onToggleProductionSiteDropdown,
  onToggleCustomerSiteDropdown,
  onToggleProductFamilyDropdown,
  onToggleProductTypeDropdown,
  onToggleModelDropdown,
  onClearProductionSites,
  onSelectAllProductionSites,
  onClearCustomerSites,
  onSelectAllCustomerSites,
  onClearProductFamilies,
  onSelectAllProductFamilies,
  onClearProductTypes,
  onSelectAllProductTypes,
  onClearModels,
  onSelectAllModels,
  onClearFilters,
  onApplyFilters,
  loading = false,
  productionSiteRef,
  customerSiteRef,
  productFamilyRef,
  productTypeRef,
  modelRef
}) => {
  const activeFilterCount =
    filters.selectedProductionSites.length +
    filters.selectedCustomerSites.length +
    filters.selectedProductFamilies.length +
    filters.selectedProductTypes.length +
    filters.selectedModels.length;

  const baseInputClass = "px-2 py-1.5 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40";

  const DAILY_MAX_DAYS = 30;

  const clampDailyFrom = (newFrom: string) => {
    onDateFromChange(newFrom);
    const from = new Date(newFrom);
    const to = new Date(filters.dateTo);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      const diff = (to.getTime() - from.getTime()) / 86400000;
      if (diff > DAILY_MAX_DAYS) {
        const clamped = new Date(from);
        clamped.setDate(clamped.getDate() + DAILY_MAX_DAYS);
        onDateToChange(clamped.toISOString().slice(0, 10));
      }
    }
  };

  const clampDailyTo = (newTo: string) => {
    onDateToChange(newTo);
    const from = new Date(filters.dateFrom);
    const to = new Date(newTo);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      const diff = (to.getTime() - from.getTime()) / 86400000;
      if (diff > DAILY_MAX_DAYS) {
        const clamped = new Date(to);
        clamped.setDate(clamped.getDate() - DAILY_MAX_DAYS);
        onDateFromChange(clamped.toISOString().slice(0, 10));
      }
    }
  };

  const dailyMaxTo = timePeriod === 'daily' && filters.dateFrom
    ? (() => { const d = new Date(filters.dateFrom); if (isNaN(d.getTime())) return undefined; d.setDate(d.getDate() + DAILY_MAX_DAYS); return d.toISOString().slice(0, 10); })()
    : undefined;

  const WEEKLY_MAX_WEEKS = 13;

  const parseYYYYWW = (s: string): { year: number; week: number } | null => {
    if (s.length !== 6) return null;
    const year = parseInt(s.slice(0, 4), 10);
    const week = parseInt(s.slice(4, 6), 10);
    if (isNaN(year) || isNaN(week) || week < 1 || week > 52) return null;
    return { year, week };
  };

  const addWeeks = (year: number, week: number, delta: number): { year: number; week: number } => {
    let w = week + delta;
    let y = year;
    while (w > 52) { w -= 52; y++; }
    while (w <= 0) { w += 52; y--; }
    return { year: y, week: w };
  };

  const weekDiff = (fY: number, fW: number, tY: number, tW: number) => (tY - fY) * 52 + (tW - fW);
  const toYYYYWW = (y: number, w: number) => `${y}${String(w).padStart(2, '0')}`;

  const clampWeeklyFrom = (newFrom: string) => {
    onDateFromChange(newFrom);
    const from = parseYYYYWW(newFrom);
    const to = parseYYYYWW(filters.dateTo);
    if (from && to && weekDiff(from.year, from.week, to.year, to.week) > WEEKLY_MAX_WEEKS) {
      const c = addWeeks(from.year, from.week, WEEKLY_MAX_WEEKS);
      onDateToChange(toYYYYWW(c.year, c.week));
    }
  };

  const clampWeeklyTo = (newTo: string) => {
    onDateToChange(newTo);
    const from = parseYYYYWW(filters.dateFrom);
    const to = parseYYYYWW(newTo);
    if (from && to && weekDiff(from.year, from.week, to.year, to.week) > WEEKLY_MAX_WEEKS) {
      const c = addWeeks(to.year, to.week, -WEEKLY_MAX_WEEKS);
      onDateFromChange(toYYYYWW(c.year, c.week));
    }
  };

  const renderDateInput = (label: string, value: string, onChange: (v: string) => void, maxDate?: string) => {
    const labelEl = (
      <label className="block text-xs font-semibold text-orange-600 mb-0.5">
        {label} <span className="text-red-400">*</span>
      </label>
    );
    switch (timePeriod) {
      case 'daily':
        return (
          <div className="w-36">
            {labelEl}
            <input type="date" value={value} onChange={e => onChange(e.target.value)} max={maxDate} className={`w-full ${baseInputClass}`} />
          </div>
        );
      case 'fiscal_weekly': {
        const yr = value.length >= 4 ? value.slice(0, 4) : String(new Date().getFullYear());
        const wk = value.length >= 6 ? value.slice(4, 6) : '01';
        return (
          <div>
            {labelEl}
            <div className="flex items-center gap-1">
              <input
                type="number" value={yr} min="2020" max="2035" placeholder="YYYY"
                onChange={e => { const v = e.target.value; if (v.length <= 4) onChange(v.padStart(4, '0') + wk); }}
                className={`w-20 ${baseInputClass}`}
              />
              <span className="text-xs font-semibold text-orange-500">W</span>
              <input
                type="number" value={parseInt(wk) || 1} min="1" max="52"
                onChange={e => onChange(yr + String(e.target.value).padStart(2, '0'))}
                className={`w-14 ${baseInputClass}`}
              />
            </div>
          </div>
        );
      }
      case 'quarterly': {
        const yr = value.length >= 4 ? value.slice(0, 4) : String(new Date().getFullYear());
        const qtr = value.length >= 6 ? value.slice(4) : 'Q1';
        return (
          <div>
            {labelEl}
            <div className="flex items-center gap-1">
              <input
                type="number" value={yr} min="2020" max="2035" placeholder="YYYY"
                onChange={e => { const v = e.target.value; if (v.length <= 4) onChange(v.padStart(4, '0') + qtr); }}
                className={`w-20 ${baseInputClass}`}
              />
              <select value={qtr} onChange={e => onChange(yr + e.target.value)} className={`w-16 ${baseInputClass}`}>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
          </div>
        );
      }
      case 'yearly':
        return (
          <div className="w-24">
            {labelEl}
            <input
              type="number" value={value} min="2020" max="2035"
              onChange={e => onChange(e.target.value)}
              className={`w-full ${baseInputClass}`}
            />
          </div>
        );
      default:
        return (
          <div className="w-36">
            {labelEl}
            <input type="month" value={value} onChange={e => onChange(e.target.value)} className={`w-full ${baseInputClass}`} />
          </div>
        );
    }
  };

  const cs = {
    site: dropdownColors.blue,
    customer: dropdownColors.purple,
    family: dropdownColors.teal,
    type: dropdownColors.rose,
    model: dropdownColors.indigo,
  };

  return (
    <div className="rounded-xl shadow-sm mb-6 border border-gray-200">
      {/* Gradient header bar */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 px-4 py-2.5 flex items-center gap-2 rounded-t-xl">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-white text-sm font-semibold tracking-wide">Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full">
            {activeFilterCount} active
          </span>
        )}
      </div>

      {/* Filter content */}
      <div className="bg-white p-4 rounded-b-xl">
        <div className="flex flex-wrap items-end gap-3">
          {/* Period From */}
          {renderDateInput('From', filters.dateFrom,
            timePeriod === 'daily' ? clampDailyFrom
            : timePeriod === 'fiscal_weekly' ? clampWeeklyFrom
            : onDateFromChange)}

          {/* Period To */}
          {renderDateInput('To', filters.dateTo,
            timePeriod === 'daily' ? clampDailyTo
            : timePeriod === 'fiscal_weekly' ? clampWeeklyTo
            : onDateToChange,
            timePeriod === 'daily' ? dailyMaxTo : undefined)}

          {/* Range limit hint */}
          {timePeriod === 'daily' && (
            <div className="self-end pb-1.5 text-xs text-orange-500 font-medium">≤ {DAILY_MAX_DAYS} days</div>
          )}
          {timePeriod === 'fiscal_weekly' && (
            <div className="self-end pb-1.5 text-xs text-orange-500 font-medium">≤ {WEEKLY_MAX_WEEKS} weeks</div>
          )}

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Production Site */}
          <div className="relative overflow-visible" ref={productionSiteRef}>
            <label className={`block text-xs font-semibold ${cs.site.label} mb-0.5`}>Production Site</label>
            <button
              onClick={onToggleProductionSiteDropdown}
              className={`px-2 py-1.5 text-sm border ${cs.site.border} rounded-lg bg-white ${cs.site.btnHover} focus:outline-none focus:ring-2 ${cs.site.ring} flex items-center gap-1`}
            >
              <span className="text-gray-700">
                {filters.selectedProductionSites.length === 0
                  ? 'All'
                  : filters.selectedProductionSites.length === availableProductionSites.length
                    ? 'All'
                    : (
                      <>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1 ${cs.site.badge}`}>
                          {filters.selectedProductionSites.length}
                        </span>
                        selected
                      </>
                    )}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProductionSiteSelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showProductionSiteSelect && (
              <div className={`absolute z-50 mt-1 w-56 bg-white border ${cs.site.border} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                <div className="p-2 flex gap-2 border-b border-gray-200">
                  <button onClick={onClearProductionSites} className="text-xs text-red-600 hover:underline font-medium">Clear</button>
                  <button onClick={onSelectAllProductionSites} className={`text-xs ${cs.site.label} hover:underline font-medium`}>All</button>
                </div>
                {availableProductionSites.map((site) => (
                  <label key={site.value} className={`flex items-center px-3 py-1.5 ${cs.site.hover} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={filters.selectedProductionSites.includes(site.value)}
                      onChange={() => onToggleProductionSite(site.value)}
                      className={`mr-2 rounded border-gray-300 ${cs.site.check}`}
                    />
                    <span className="text-sm text-gray-700">{site.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Customer Site */}
          <div className="relative overflow-visible" ref={customerSiteRef}>
            <label className={`block text-xs font-semibold ${cs.customer.label} mb-0.5`}>Customer Site</label>
            <button
              onClick={onToggleCustomerSiteDropdown}
              className={`px-2 py-1.5 text-sm border ${cs.customer.border} rounded-lg bg-white ${cs.customer.btnHover} focus:outline-none focus:ring-2 ${cs.customer.ring} flex items-center gap-1`}
            >
              <span className="text-gray-700">
                {filters.selectedCustomerSites.length === 0
                  ? 'All'
                  : filters.selectedCustomerSites.length === availableCustomerSites.length
                    ? 'All'
                    : (
                      <>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1 ${cs.customer.badge}`}>
                          {filters.selectedCustomerSites.length}
                        </span>
                        selected
                      </>
                    )}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showCustomerSiteSelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCustomerSiteSelect && (
              <div className={`absolute z-50 mt-1 w-56 bg-white border ${cs.customer.border} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                <div className="p-2 flex gap-2 border-b border-gray-200">
                  <button onClick={onClearCustomerSites} className="text-xs text-red-600 hover:underline font-medium">Clear</button>
                  <button onClick={onSelectAllCustomerSites} className={`text-xs ${cs.customer.label} hover:underline font-medium`}>All</button>
                </div>
                {availableCustomerSites.map((cs_item) => (
                  <label key={cs_item.value} className={`flex items-center px-3 py-1.5 ${cs.customer.hover} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={filters.selectedCustomerSites.includes(cs_item.value)}
                      onChange={() => onToggleCustomerSite(cs_item.value)}
                      className={`mr-2 rounded border-gray-300 ${cs.customer.check}`}
                    />
                    <span className="text-sm text-gray-700">{cs_item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Product Family */}
          <div className="relative overflow-visible" ref={productFamilyRef}>
            <label className={`block text-xs font-semibold ${cs.family.label} mb-0.5`}>Product Family</label>
            <button
              onClick={onToggleProductFamilyDropdown}
              className={`px-2 py-1.5 text-sm border ${cs.family.border} rounded-lg bg-white ${cs.family.btnHover} focus:outline-none focus:ring-2 ${cs.family.ring} flex items-center gap-1`}
            >
              <span className="text-gray-700">
                {filters.selectedProductFamilies.length === 0
                  ? 'All'
                  : filters.selectedProductFamilies.length === availableProductFamilies.length
                    ? 'All'
                    : (
                      <>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1 ${cs.family.badge}`}>
                          {filters.selectedProductFamilies.length}
                        </span>
                        selected
                      </>
                    )}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProductFamilySelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showProductFamilySelect && (
              <div className={`absolute z-50 mt-1 w-56 bg-white border ${cs.family.border} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                <div className="p-2 flex gap-2 border-b border-gray-200">
                  <button onClick={onClearProductFamilies} className="text-xs text-red-600 hover:underline font-medium">Clear</button>
                  <button onClick={onSelectAllProductFamilies} className={`text-xs ${cs.family.label} hover:underline font-medium`}>All</button>
                </div>
                {availableProductFamilies.map((family) => (
                  <label key={family.value} className={`flex items-center px-3 py-1.5 ${cs.family.hover} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={filters.selectedProductFamilies.includes(family.value)}
                      onChange={() => onToggleProductFamily(family.value)}
                      className={`mr-2 rounded border-gray-300 ${cs.family.check}`}
                    />
                    <span className="text-sm text-gray-700">{family.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Product Type */}
          <div className="relative overflow-visible" ref={productTypeRef}>
            <label className={`block text-xs font-semibold ${cs.type.label} mb-0.5`}>Product Type</label>
            <button
              onClick={onToggleProductTypeDropdown}
              className={`px-2 py-1.5 text-sm border ${cs.type.border} rounded-lg bg-white ${cs.type.btnHover} focus:outline-none focus:ring-2 ${cs.type.ring} flex items-center gap-1`}
            >
              <span className="text-gray-700">
                {filters.selectedProductTypes.length === 0
                  ? 'All'
                  : filters.selectedProductTypes.length === availableProductTypes.length
                    ? 'All'
                    : (
                      <>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1 ${cs.type.badge}`}>
                          {filters.selectedProductTypes.length}
                        </span>
                        selected
                      </>
                    )}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProductTypeSelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showProductTypeSelect && (
              <div className={`absolute z-50 mt-1 w-56 bg-white border ${cs.type.border} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                <div className="p-2 flex gap-2 border-b border-gray-200">
                  <button onClick={onClearProductTypes} className="text-xs text-red-600 hover:underline font-medium">Clear</button>
                  <button onClick={onSelectAllProductTypes} className={`text-xs ${cs.type.label} hover:underline font-medium`}>All</button>
                </div>
                {availableProductTypes.map((type) => (
                  <label key={type.value} className={`flex items-center px-3 py-1.5 ${cs.type.hover} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={filters.selectedProductTypes.includes(type.value)}
                      onChange={() => onToggleProductType(type.value)}
                      className={`mr-2 rounded border-gray-300 ${cs.type.check}`}
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Products/Models */}
          <div className="relative overflow-visible" ref={modelRef}>
            <label className={`block text-xs font-semibold ${cs.model.label} mb-0.5`}>Products</label>
            <button
              onClick={onToggleModelDropdown}
              className={`px-2 py-1.5 text-sm border ${cs.model.border} rounded-lg bg-white ${cs.model.btnHover} focus:outline-none focus:ring-2 ${cs.model.ring} flex items-center gap-1`}
            >
              <span className="text-gray-700">
                {filters.selectedModels.length === 0
                  ? 'All'
                  : filters.selectedModels.length === availableModels.length
                    ? 'All'
                    : (
                      <>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1 ${cs.model.badge}`}>
                          {filters.selectedModels.length}
                        </span>
                        selected
                      </>
                    )}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showModelSelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showModelSelect && (
              <div className={`absolute z-50 mt-1 w-56 bg-white border ${cs.model.border} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                <div className="p-2 flex gap-2 border-b border-gray-200">
                  <button onClick={onClearModels} className="text-xs text-red-600 hover:underline font-medium">Clear</button>
                  <button onClick={onSelectAllModels} className={`text-xs ${cs.model.label} hover:underline font-medium`}>All</button>
                </div>
                {availableModels.map((model) => (
                  <label key={model} className={`flex items-center px-3 py-1.5 ${cs.model.hover} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={filters.selectedModels.includes(model)}
                      onChange={() => onToggleModel(model)}
                      className={`mr-2 rounded border-gray-300 ${cs.model.check}`}
                    />
                    <span className="text-sm text-gray-700">{model}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={onApplyFilters}
              disabled={loading}
              className="flex items-center px-5 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg hover:from-orange-600 hover:to-rose-600 shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Apply
                </>
              )}
            </button>
            <button
              onClick={onClearFilters}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Selected filter values display */}
        {(() => {
          const isPartialSite = filters.selectedProductionSites.length > 0 && filters.selectedProductionSites.length < availableProductionSites.length;
          const isPartialCustomer = filters.selectedCustomerSites.length > 0 && filters.selectedCustomerSites.length < availableCustomerSites.length;
          const isPartialFamily = filters.selectedProductFamilies.length > 0 && filters.selectedProductFamilies.length < availableProductFamilies.length;
          const isPartialType = filters.selectedProductTypes.length > 0 && filters.selectedProductTypes.length < availableProductTypes.length;
          const isPartialModel = filters.selectedModels.length > 0 && filters.selectedModels.length < availableModels.length;
          const hasPartial = isPartialSite || isPartialCustomer || isPartialFamily || isPartialType || isPartialModel;

          if (!hasPartial) return null;

          return (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-start">
              <span className="text-xs text-gray-400 mt-0.5">Selected:</span>
              {isPartialSite && filters.selectedProductionSites.map(val => {
                const opt = availableProductionSites.find(o => o.value === val);
                return (
                  <span key={`site-${val}`} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cs.site.badge}`}>
                    {opt?.label || val}
                    <button onClick={() => onToggleProductionSite(val)} className="ml-1 hover:text-blue-900">&times;</button>
                  </span>
                );
              })}
              {isPartialCustomer && filters.selectedCustomerSites.map(val => {
                const opt = availableCustomerSites.find(o => o.value === val);
                return (
                  <span key={`cust-${val}`} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cs.customer.badge}`}>
                    {opt?.label || val}
                    <button onClick={() => onToggleCustomerSite(val)} className="ml-1 hover:text-purple-900">&times;</button>
                  </span>
                );
              })}
              {isPartialFamily && filters.selectedProductFamilies.map(val => {
                const opt = availableProductFamilies.find(o => o.value === val);
                return (
                  <span key={`fam-${val}`} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cs.family.badge}`}>
                    {opt?.label || val}
                    <button onClick={() => onToggleProductFamily(val)} className="ml-1 hover:text-teal-900">&times;</button>
                  </span>
                );
              })}
              {isPartialType && filters.selectedProductTypes.map(val => {
                const opt = availableProductTypes.find(o => o.value === val);
                return (
                  <span key={`type-${val}`} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cs.type.badge}`}>
                    {opt?.label || val}
                    <button onClick={() => onToggleProductType(val)} className="ml-1 hover:text-rose-900">&times;</button>
                  </span>
                );
              })}
              {isPartialModel && filters.selectedModels.map(val => (
                <span key={`model-${val}`} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cs.model.badge}`}>
                  {val}
                  <button onClick={() => onToggleModel(val)} className="ml-1 hover:text-indigo-900">&times;</button>
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DashboardFilters;
