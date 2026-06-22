// client/src/pages/report/DefectImageSummaryPage.tsx
// ===== DEFECT IMAGE SUMMARY REPORT PAGE =====

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getDefectImageSummary, getPartsFilterOptions } from '../../services/reportService';
import { useSiteOptions } from '../../services/sysconfigService';
import { defectService } from '../../services/defectService';
import type { DefectImageSummaryRecord } from '../../types/report';
import { apiBaseUrl } from '../../services/api';

// ============ CONSTANTS ============

const IMAGE_BASE_URL = apiBaseUrl('defect-image');
const CUSTOMER_SITE_BASE_URL = apiBaseUrl('customer-sites');

// ============ MULTI-SELECT DROPDOWN ============

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  color?: 'orange' | 'blue' | 'purple' | 'teal' | 'rose' | 'indigo' | 'emerald';
}

const colorStyles = {
  orange: { focus: 'focus:ring-orange-400 focus:border-orange-400', check: 'text-orange-500 focus:ring-orange-400', hover: 'hover:bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-100 text-orange-700', label: 'text-orange-600' },
  blue:   { focus: 'focus:ring-blue-400 focus:border-blue-400',     check: 'text-blue-500 focus:ring-blue-400',   hover: 'hover:bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700',   label: 'text-blue-600' },
  purple: { focus: 'focus:ring-purple-400 focus:border-purple-400', check: 'text-purple-500 focus:ring-purple-400', hover: 'hover:bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700', label: 'text-purple-600' },
  teal:   { focus: 'focus:ring-teal-400 focus:border-teal-400',     check: 'text-teal-500 focus:ring-teal-400',   hover: 'hover:bg-teal-50',   border: 'border-teal-300',   badge: 'bg-teal-100 text-teal-700',   label: 'text-teal-600' },
  rose:   { focus: 'focus:ring-rose-400 focus:border-rose-400',     check: 'text-rose-500 focus:ring-rose-400',   hover: 'hover:bg-rose-50',   border: 'border-rose-300',   badge: 'bg-rose-100 text-rose-700',   label: 'text-rose-600' },
  indigo: { focus: 'focus:ring-indigo-400 focus:border-indigo-400', check: 'text-indigo-500 focus:ring-indigo-400', hover: 'hover:bg-indigo-50', border: 'border-indigo-300', badge: 'bg-indigo-100 text-indigo-700', label: 'text-indigo-600' },
  emerald:{ focus: 'focus:ring-emerald-400 focus:border-emerald-400', check: 'text-emerald-500 focus:ring-emerald-400', hover: 'hover:bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-100 text-emerald-700', label: 'text-emerald-600' },
};

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder = 'All', disabled = false, color = 'orange' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cs = colorStyles[color];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayText = selected.length === 0
    ? placeholder
    : selected.length <= 2
      ? selected.join(', ')
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full px-2 py-1.5 border rounded text-sm bg-white text-left flex items-center justify-between
          ${disabled ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : `${cs.border} ${cs.focus} cursor-pointer`}
          ${selected.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span className="truncate">
          {selected.length > 0 && selected.length < options.length && (
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1.5 ${cs.badge}`}>
              {selected.length}
            </span>
          )}
          {displayText}
        </span>
        <svg className={`w-3.5 h-3.5 ml-1 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: disabled ? '#d1d5db' : undefined }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && options.length > 0 && (
        <div className={`absolute z-30 mt-1 w-full bg-white border ${cs.border} rounded-lg shadow-lg max-h-52 overflow-y-auto`}>
          <div className="px-2 py-1.5 flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:underline font-medium"
            >Clear</button>
            <button
              type="button"
              onClick={() => onChange(options.map(o => o.value))}
              className={`text-xs ${cs.label} hover:underline font-medium`}
            >All</button>
          </div>
          {options.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center px-2 py-1.5 ${cs.hover} cursor-pointer text-sm`}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className={`mr-2 rounded border-gray-300 ${cs.check}`}
              />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ COMPONENT ============

const DefectImageSummaryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMode, setExportMode] = useState<'compact' | 'original'>('compact');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DefectImageSummaryRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state - default to current month
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  });
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedCustomerSites, setSelectedCustomerSites] = useState<string[]>([]);
  const [selectedProductFamilies, setSelectedProductFamilies] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);

  // Defect dropdown options
  const [defectOptions, setDefectOptions] = useState<string[]>([]);

  // Cascading dropdown options
  const [customerSiteOptions, setCustomerSiteOptions] = useState<{ code: string; customers: string }[]>([]);
  const [productFamilyOptions, setProductFamilyOptions] = useState<string[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);

  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load site dropdown options from sysconfig
  const { options: siteOptions } = useSiteOptions();

  // ============ LOAD DEFECT OPTIONS ============

  useEffect(() => {
    const loadDefects = async () => {
      try {
        const response = await defectService.get({ isActive: true, limit: 9999 });
        if (response.success && response.data) {
          const names = response.data.map(d => d.name).filter(Boolean).sort();
          setDefectOptions(names);
        }
      } catch (err) {
        console.error('Failed to load defect options:', err);
      }
    };
    loadDefects();
  }, []);

  // ============ DEFAULT: Auto-select all sites on initial load ============

  useEffect(() => {
    if (siteOptions.length > 0 && selectedSites.length === 0) {
      setSelectedSites(siteOptions.map(opt => opt.value));
    }
  }, [siteOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============ CASCADING: Sites -> Customer Sites ============

  useEffect(() => {
    // Reset downstream when sites change
    setSelectedCustomerSites([]);
    setSelectedProductFamilies([]);
    setSelectedProductTypes([]);
    setSelectedModels([]);
    setCustomerSiteOptions([]);
    setProductFamilyOptions([]);
    setProductTypeOptions([]);
    setModelOptions([]);

    if (selectedSites.length === 0) return;

    const fetchCustomerSites = async () => {
      try {
        // Fetch customer sites for each selected site and merge
        const allResults: { code: string; customers: string }[] = [];
        const seenCodes = new Set<string>();

        await Promise.all(
          selectedSites.map(async (siteCode) => {
            const response = await fetch(`${CUSTOMER_SITE_BASE_URL}/site/${encodeURIComponent(siteCode)}`, { credentials: 'include' });
            const result = await response.json();
            if (result.success && result.data) {
              for (const item of result.data) {
                if (!seenCodes.has(item.code)) {
                  seenCodes.add(item.code);
                  allResults.push(item);
                }
              }
            }
          })
        );

        setCustomerSiteOptions(allResults);
        // Default: auto-select all customer sites
        setSelectedCustomerSites(allResults.map(r => r.code));
      } catch (err) {
        console.error('Failed to fetch customer sites:', err);
      }
    };

    fetchCustomerSites();
  }, [selectedSites]);

  // ============ CASCADING: Customer Sites -> Product Family, Type, Model ============

  useEffect(() => {
    // Reset downstream when customerSites change
    setSelectedProductFamilies([]);
    setSelectedProductTypes([]);
    setSelectedModels([]);
    setProductFamilyOptions([]);
    setProductTypeOptions([]);
    setModelOptions([]);

    if (selectedCustomerSites.length === 0) return;

    const fetchPartsOptions = async () => {
      try {
        const result = await getPartsFilterOptions({ customerSites: selectedCustomerSites });
        if (result.success && result.data) {
          setProductFamilyOptions(result.data.productFamilies);
          setProductTypeOptions(result.data.productTypes);
          setModelOptions(result.data.models);
          // Default: auto-select all parts options
          setSelectedProductFamilies(result.data.productFamilies);
          setSelectedProductTypes(result.data.productTypes);
          setSelectedModels(result.data.models);
        }
      } catch (err) {
        console.error('Failed to fetch parts filter options:', err);
      }
    };

    fetchPartsOptions();
  }, [selectedCustomerSites]);

  // ============ GROUPED DATA ============

  const groupedData = useMemo(() => {
    const groups: Record<string, number[]> = {};
    for (const record of data) {
      const name = record.defectname || 'Unknown';
      if (!groups[name]) groups[name] = [];
      if (record.image_ids) {
        for (const id of record.image_ids) {
          if (!groups[name].includes(id)) {
            groups[name].push(id);
          }
        }
      }
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const totalImages = useMemo(() => {
    return groupedData.reduce((sum, [, ids]) => sum + ids.length, 0);
  }, [groupedData]);

  // ============ HANDLERS ============

  const handleSearch = async () => {
    if (!dateFrom || !dateTo) {
      setError('Please select both Date From and Date To');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: {
        dateFrom: string;
        dateTo: string;
        sites?: string[];
        customerSites?: string[];
        productFamilies?: string[];
        productTypes?: string[];
        models?: string[];
        defects?: string[];
      } = { dateFrom, dateTo };

      if (selectedSites.length > 0) params.sites = selectedSites;
      if (selectedCustomerSites.length > 0) params.customerSites = selectedCustomerSites;
      if (selectedProductFamilies.length > 0) params.productFamilies = selectedProductFamilies;
      if (selectedProductTypes.length > 0) params.productTypes = selectedProductTypes;
      if (selectedModels.length > 0) params.models = selectedModels;
      if (selectedDefects.length > 0) params.defects = selectedDefects;

      const response = await getDefectImageSummary(params);

      if (response.success && response.data) {
        setData(response.data);
        setHasSearched(true);
        if (response.data.length === 0) {
          setError('No records found for the given filters');
        }
      } else {
        setError(response.message || 'Failed to fetch defect image summary data');
      }
    } catch (err) {
      setError('Failed to fetch defect image summary data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const now = new Date();
    setDateFrom(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    setDateTo(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);
    setSelectedSites([]);
    setSelectedCustomerSites([]);
    setSelectedProductFamilies([]);
    setSelectedProductTypes([]);
    setSelectedModels([]);
    setSelectedDefects([]);
    setData([]);
    setHasSearched(false);
    setError(null);
  };

  const resizeImageBlob = (blob: Blob, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error('Canvas toBlob failed')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };

  const fetchImageAsBase64 = async (imageId: number, compact = false): Promise<{ base64: string; extension: 'jpeg' | 'png' } | null> => {
    try {
      const response = await fetch(`${IMAGE_BASE_URL}/${imageId}`, { credentials: 'include' });
      if (!response.ok) return null;
      let blob = await response.blob();

      if (compact) {
        // Resize to email-friendly resolution (max 480px, JPEG quality 0.6)
        blob = await resizeImageBlob(blob, 480, 480, 0.6);
      }

      const buffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const extension = compact ? 'jpeg' : (blob.type === 'image/png' ? 'png' : 'jpeg');
      return { base64, extension };
    } catch {
      return null;
    }
  };

  const handleExportExcel = async () => {
    if (groupedData.length === 0) return;
    setExporting(true);

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Defect Image Summary');

      const IMAGES_PER_ROW = 4;
      const IMG_WIDTH = 120;
      const IMG_HEIGHT = 110;

      let currentRow = 1;

      // Title row
      worksheet.getCell(currentRow, 1).value = 'Defect Image Summary Report';
      worksheet.getCell(currentRow, 1).font = { bold: true, size: 14 };
      worksheet.mergeCells(currentRow, 1, currentRow, IMAGES_PER_ROW);
      currentRow++;

      // Date range
      worksheet.getCell(currentRow, 1).value = `Date Range: ${dateFrom} to ${dateTo}`;
      worksheet.getCell(currentRow, 1).font = { size: 10, color: { argb: 'FF666666' } };
      worksheet.mergeCells(currentRow, 1, currentRow, IMAGES_PER_ROW);
      currentRow += 2;

      // Set column widths
      for (let col = 1; col <= IMAGES_PER_ROW; col++) {
        worksheet.getColumn(col).width = 20;
      }

      for (const [defectName, imageIds] of groupedData) {
        // Defect name header
        const headerCell = worksheet.getCell(currentRow, 1);
        headerCell.value = `${defectName} (${imageIds.length} images)`;
        headerCell.font = { bold: true, size: 11 };
        headerCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3E0' },
        };
        worksheet.mergeCells(currentRow, 1, currentRow, IMAGES_PER_ROW);
        currentRow++;

        // Fetch and embed images in rows of IMAGES_PER_ROW
        for (let i = 0; i < imageIds.length; i += IMAGES_PER_ROW) {
          const batch = imageIds.slice(i, i + IMAGES_PER_ROW);
          const isCompact = exportMode === 'compact';
          const imageResults = await Promise.all(batch.map(id => fetchImageAsBase64(id, isCompact)));

          worksheet.getRow(currentRow).height = 85;

          for (let j = 0; j < imageResults.length; j++) {
            const imgData = imageResults[j];
            if (!imgData) continue;

            const imageId = workbook.addImage({
              base64: imgData.base64,
              extension: imgData.extension,
            });

            worksheet.addImage(imageId, {
              tl: { col: j, row: currentRow - 1 },
              ext: { width: IMG_WIDTH, height: IMG_HEIGHT },
            });
          }
          currentRow++;
        }

        currentRow++;
      }

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Defect_Image_Summary_${dateFrom}_to_${dateTo}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export Excel file');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenImages = useCallback((imageIds: number[], startIndex = 0) => {
    if (imageIds && imageIds.length > 0) {
      setModalImages(imageIds);
      setCurrentImageIndex(startIndex);
      setIsImageModalOpen(true);
    }
  }, []);

  const handleCloseImages = () => {
    setIsImageModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Defect Image Summary</h1>
              <p className="text-gray-500 text-sm">Defect images grouped by defect name</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={exportMode}
                onChange={(e) => setExportMode(e.target.value as 'compact' | 'original')}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
              >
                <option value="compact">Compact</option>
                <option value="original">Original</option>
              </select>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={groupedData.length === 0 || exporting}
                isLoading={exporting}
                className="flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>
            </div>
          </div>
        </div>

        {/* Colorful Filter Section */}
        <div className="rounded-xl shadow-sm mb-4 border border-gray-200">
          {/* Filter header bar */}
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 px-4 py-2.5 flex items-center gap-2 rounded-t-xl">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-white text-sm font-semibold tracking-wide">Filters</span>
          </div>

          <div className="bg-white p-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Date From */}
              <div className="w-36">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Date From <span className="text-red-400">*</span></label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40" />
              </div>

              {/* Date To */}
              <div className="w-36">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Date To <span className="text-red-400">*</span></label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40" />
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Site */}
              <div className="w-36">
                <label className="block text-xs font-semibold text-blue-600 mb-0.5">Site</label>
                <MultiSelect
                  options={siteOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                  selected={selectedSites}
                  onChange={setSelectedSites}
                  placeholder="All"
                  color="blue"
                />
              </div>

              {/* Customer Site */}
              <div className="w-44">
                <label className="block text-xs font-semibold text-purple-600 mb-0.5">Customer Site</label>
                <MultiSelect
                  options={customerSiteOptions.map(opt => ({ value: opt.code, label: opt.code }))}
                  selected={selectedCustomerSites}
                  onChange={setSelectedCustomerSites}
                  placeholder="All"
                  disabled={selectedSites.length === 0}
                  color="purple"
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Product Family */}
              <div className="w-40">
                <label className="block text-xs font-semibold text-teal-600 mb-0.5">Product Family</label>
                <MultiSelect
                  options={productFamilyOptions.map(v => ({ value: v, label: v }))}
                  selected={selectedProductFamilies}
                  onChange={setSelectedProductFamilies}
                  placeholder="All"
                  disabled={selectedCustomerSites.length === 0}
                  color="teal"
                />
              </div>

              {/* Product Type */}
              <div className="w-36">
                <label className="block text-xs font-semibold text-rose-600 mb-0.5">Product Type</label>
                <MultiSelect
                  options={productTypeOptions.map(v => ({ value: v, label: v }))}
                  selected={selectedProductTypes}
                  onChange={setSelectedProductTypes}
                  placeholder="All"
                  disabled={selectedCustomerSites.length === 0}
                  color="rose"
                />
              </div>

              {/* Product (Model) */}
              <div className="w-44">
                <label className="block text-xs font-semibold text-indigo-600 mb-0.5">Product</label>
                <MultiSelect
                  options={modelOptions.map(v => ({ value: v, label: v }))}
                  selected={selectedModels}
                  onChange={setSelectedModels}
                  placeholder="All"
                  disabled={selectedCustomerSites.length === 0}
                  color="indigo"
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Defect */}
              <div className="w-44">
                <label className="block text-xs font-semibold text-emerald-600 mb-0.5">Defect</label>
                <MultiSelect
                  options={defectOptions.map(v => ({ value: v, label: v }))}
                  selected={selectedDefects}
                  onChange={setSelectedDefects}
                  placeholder="All"
                  color="emerald"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button onClick={handleSearch} disabled={loading}
                  className="flex items-center px-5 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg hover:from-orange-600 hover:to-rose-600 shadow-sm transition-all disabled:opacity-60">
                  {loading ? (
                    <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  Search
                </button>
                <button onClick={handleClear}
                  className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert variant="error" title="Error" message={error} dismissible onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Results Summary */}
        {hasSearched && groupedData.length > 0 && (
          <div className="mb-3 text-sm text-gray-600">
            Found {totalImages} images across {groupedData.length} defect types
          </div>
        )}

        {/* Results: Grouped defect images */}
        {hasSearched && groupedData.length > 0 && (
          <div className="space-y-4">
            {groupedData.map(([defectName, imageIds]) => (
              <div key={defectName} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-orange-50">
                  <h3 className="text-base font-semibold text-gray-900">
                    {defectName}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({imageIds.length} {imageIds.length === 1 ? 'image' : 'images'})
                    </span>
                  </h3>
                </div>
                <div className="p-3">
                  {imageIds.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {imageIds.map((imgId, idx) => (
                        <button
                          key={imgId}
                          onClick={() => handleOpenImages(imageIds, idx)}
                          className="group relative aspect-square rounded overflow-hidden border border-gray-200 hover:border-orange-400 transition-colors cursor-pointer"
                        >
                          <img
                            src={`${IMAGE_BASE_URL}/${imgId}`}
                            alt={`${defectName} #${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">No Image</text></svg>';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No images available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {hasSearched && groupedData.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No defect images found for the given filters</p>
          </div>
        )}

        {/* Image Modal */}
        {isImageModalOpen && modalImages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleCloseImages}>
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <span className="text-sm font-medium text-gray-700">
                  Photo {currentImageIndex + 1} of {modalImages.length}
                </span>
                <button onClick={handleCloseImages} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-center p-4 min-h-[400px]">
                <img
                  src={`${IMAGE_BASE_URL}/${modalImages[currentImageIndex]}`}
                  alt={`Defect photo ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              {modalImages.length > 1 && (
                <div className="flex items-center justify-center gap-4 px-4 py-3 bg-gray-50 border-t">
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : modalImages.length - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {modalImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < modalImages.length - 1 ? prev + 1 : 0)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefectImageSummaryPage;
