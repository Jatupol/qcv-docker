// client/src/pages/report/SOQMWeeklyPage.tsx
// ===== SOQM - Weekly Report =====
// Weekly summary pivot table: models as columns, metrics + defects as rows

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Spin, message } from 'antd';
import * as XLSX from 'xlsx';
import {
  getSOQMWeekly,
  getModelsLAR,
  getFiscalYearsSOQMDaily,
  getWorkWeeksSOQMDaily,
} from '../../services/reportService';
import customerSiteService from '../../services/customerSiteService';

// ============ INTERFACES ============

interface ModelSummary {
  model: string;
  inspection_lot: number;
  accept_lot: number;
  reject_lot: number;
  inspection_qty: number;
  ng_qty: number;
}

interface DefectRow {
  model: string;
  defect_name: string;
  ng_qty: number;
}

// ============ DEFECT COLORS (60) ============

const DEFECT_COLORS = [
  '#f5222d', '#52c41a', '#13c2c2', '#fa8c16', '#722ed1',
  '#1890ff', '#eb2f96', '#faad14', '#2f54eb', '#a0d911',
  '#fa541c', '#1677ff', '#36cfc9', '#9254de', '#ff7a45',
  '#73d13d', '#40a9ff', '#f759ab', '#ffc53d', '#597ef7',
  '#ff4d4f', '#95de64', '#5cdbd3', '#b37feb', '#ffa940',
  '#69c0ff', '#ff85c0', '#ffe58f', '#85a5ff', '#d3f261',
  '#cf1322', '#389e0d', '#08979c', '#d46b08', '#531dab',
  '#096dd9', '#c41d7f', '#d48806', '#1d39c4', '#7cb305',
  '#ad2102', '#0050b3', '#006d75', '#ad4e00', '#391085',
  '#003a8c', '#9e1068', '#ad6800', '#10239e', '#5b8c00',
  '#820014', '#135200', '#00474f', '#873800', '#22075e',
  '#002766', '#780650', '#874d00', '#061178', '#3f6600',
];

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
  color?: 'orange' | 'blue' | 'purple' | 'teal' | 'rose' | 'indigo';
}

const colorStyles = {
  orange: { focus: 'focus:ring-orange-400 focus:border-orange-400', check: 'text-orange-500 focus:ring-orange-400', hover: 'hover:bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-100 text-orange-700' },
  blue:   { focus: 'focus:ring-blue-400 focus:border-blue-400',     check: 'text-blue-500 focus:ring-blue-400',   hover: 'hover:bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700' },
  purple: { focus: 'focus:ring-purple-400 focus:border-purple-400', check: 'text-purple-500 focus:ring-purple-400', hover: 'hover:bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
  teal:   { focus: 'focus:ring-teal-400 focus:border-teal-400',     check: 'text-teal-500 focus:ring-teal-400',   hover: 'hover:bg-teal-50',   border: 'border-teal-300',   badge: 'bg-teal-100 text-teal-700' },
  rose:   { focus: 'focus:ring-rose-400 focus:border-rose-400',     check: 'text-rose-500 focus:ring-rose-400',   hover: 'hover:bg-rose-50',   border: 'border-rose-300',   badge: 'bg-rose-100 text-rose-700' },
  indigo: { focus: 'focus:ring-indigo-400 focus:border-indigo-400', check: 'text-indigo-500 focus:ring-indigo-400', hover: 'hover:bg-indigo-50', border: 'border-indigo-300', badge: 'bg-indigo-100 text-indigo-700' },
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

const SOQMWeeklyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<ModelSummary[]>([]);
  const [defectData, setDefectData] = useState<DefectRow[]>([]);
  const [allDefectNames, setAllDefectNames] = useState<string[]>([]);

  // Filter states
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedWW, setSelectedWW] = useState<string | undefined>();
  const [workWeeks, setWorkWeeks] = useState<string[]>([]);
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [allCustomerSites, setAllCustomerSites] = useState<{ code: string; customers: string }[]>([]);
  const [customerSiteCodes, setCustomerSiteCodes] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Derived data
  const models = summaryData.map((s) => s.model);
  const defectNames = allDefectNames;

  // Build defect map: defectName -> model -> ng_qty
  const defectMap: Record<string, Record<string, number>> = {};
  defectData.forEach((d) => {
    if (!defectMap[d.defect_name]) defectMap[d.defect_name] = {};
    defectMap[d.defect_name][d.model] = d.ng_qty;
  });

  // Build summary map: model -> ModelSummary
  const summaryMap: Record<string, ModelSummary> = {};
  summaryData.forEach((s) => {
    summaryMap[s.model] = s;
  });

  // ============ LOAD FILTER OPTIONS ============

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [fyResult, csResult] = await Promise.all([
          getFiscalYearsSOQMDaily(),
          customerSiteService.getCustomerSites({ isActive: true, limit: 1000 }),
        ]);
        if (fyResult.success && fyResult.data) setFiscalYears(fyResult.data.map(String));
        if (csResult.success && csResult.data) {
          setAllCustomerSites(csResult.data.map(cs => ({ code: cs.code, customers: cs.customers })));
          const uniqueCustomers = [...new Set(csResult.data.map(cs => cs.customers))].sort();
          setCustomerOptions(uniqueCustomers.map(c => ({ value: c, label: c })));
          setSelectedCustomers(uniqueCustomers);
        }
      } catch { /* ignore */ }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      getWorkWeeksSOQMDaily(selectedYear).then((r) => {
        if (r.success && r.data) setWorkWeeks(r.data.map((ww: any) => String(ww).padStart(2, '0')));
      });
    } else { setWorkWeeks([]); }
  }, [selectedYear]);

  // ============ CASCADE: Customers -> Models ============

  useEffect(() => {
    setModelOptions([]);
    setSelectedModels([]);
    setCustomerSiteCodes([]);

    if (selectedCustomers.length === 0) return;

    const codes = allCustomerSites
      .filter(cs => selectedCustomers.includes(cs.customers))
      .map(cs => cs.code);
    setCustomerSiteCodes(codes);

    if (codes.length === 0) return;

    const fetchModels = async () => {
      try {
        const modelsResult = await getModelsLAR({ customerSites: codes });
        if (modelsResult.success && modelsResult.data) {
          setModelOptions(modelsResult.data);
        }
      } catch { /* ignore */ }
    };
    fetchModels();
  }, [selectedCustomers, allCustomerSites]);

  // ============ DATA FETCHING ============

  const fetchData = useCallback(async () => {
    if (!selectedYear || !selectedWW) {
      message.warning('Please select Year and WW');
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        yearFrom: selectedYear,
        wwFrom: selectedWW,
        yearTo: selectedYear,
        wwTo: selectedWW,
      };
      if (customerSiteCodes.length > 0) params.customerSites = customerSiteCodes;
      if (selectedModels.length > 0) params.models = selectedModels;

      const result = await getSOQMWeekly(params);

      if (result.success && result.data) {
        setSummaryData(result.data.summary || []);
        setDefectData(result.data.defects || []);
        setAllDefectNames(result.data.allDefectNames || []);
        if ((result.data.summary || []).length === 0) {
          message.info('No data found for the selected filters');
        }
      } else {
        message.error(result.message || 'Failed to fetch data');
        setSummaryData([]);
        setDefectData([]);
        setAllDefectNames([]);
      }
    } catch {
      message.error('Failed to fetch SOQM Weekly data');
      setSummaryData([]);
      setDefectData([]);
      setAllDefectNames([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedWW, customerSiteCodes, selectedModels]);

  // ============ EXPORT ============

  const handleExport = () => {
    if (models.length === 0) {
      message.warning('No data to export');
      return;
    }

    const sheetData: any[][] = [];
    sheetData.push([`Weekly summary FY${selectedYear} WW${selectedWW}`]);
    sheetData.push([]);
    sheetData.push(['Model', ...models]);

    const metricRows = [
      { label: 'Inspection lot', key: 'inspection_lot' },
      { label: 'Accept lot', key: 'accept_lot' },
      { label: 'Reject lot', key: 'reject_lot' },
      { label: 'LAR%', key: 'lar' },
      { label: 'LRR%', key: 'lrr' },
    ];

    metricRows.forEach(({ label, key }) => {
      const row = [label];
      models.forEach((m) => {
        const s = summaryMap[m];
        if (key === 'lar') {
          row.push(s && s.inspection_lot > 0 ? `${((s.accept_lot / s.inspection_lot) * 100).toFixed(2)}%` : '0%');
        } else if (key === 'lrr') {
          row.push(s && s.inspection_lot > 0 ? `${((s.reject_lot / s.inspection_lot) * 100).toFixed(2)}%` : '0%');
        } else {
          row.push(s ? (s as any)[key] : 0);
        }
      });
      sheetData.push(row);
    });

    sheetData.push([]);
    sheetData.push(['INSPECTION Q\'TY', ...models.map((m) => summaryMap[m]?.inspection_qty || 0)]);
    sheetData.push(['NG Q\'TY', ...models.map((m) => summaryMap[m]?.ng_qty || 0)]);
    sheetData.push([]);

    defectNames.forEach((defectName) => {
      const row = [defectName];
      models.forEach((m) => {
        row.push(defectMap[defectName]?.[m] || 0);
      });
      sheetData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{ wch: 20 }, ...models.map(() => ({ wch: 16 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Weekly Summary');
    XLSX.writeFile(wb, `SOQM_Weekly_FY${selectedYear}_WW${selectedWW}.xlsx`);
  };

  // ============ CLEAR ============

  const handleClear = () => {
    setSelectedYear(undefined);
    setSelectedWW(undefined);
    setSelectedCustomers(customerOptions.map(o => o.value));
    setCustomerSiteCodes([]);
    setModelOptions([]);
    setSelectedModels([]);
    setSummaryData([]);
    setDefectData([]);
    setAllDefectNames([]);
  };

  // ============ HELPERS ============

  const formatPct = (numerator: number, denominator: number) => {
    if (denominator === 0) return '-';
    return `${((numerator / denominator) * 100).toFixed(2)}%`;
  };

  const fmtNum = (val: number) => Number(val).toLocaleString();

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SOQM - Weekly</h1>
              <p className="text-gray-500 text-sm">Weekly summary report from OQA Station</p>
            </div>
            <button
              onClick={handleExport}
              disabled={models.length === 0}
              className="flex items-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
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

          <div className="bg-white p-4 rounded-b-xl">
            <div className="flex flex-wrap items-end gap-3">
              {/* Year */}
              <div className="w-28">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Year <span className="text-red-400">*</span></label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => { setSelectedYear(e.target.value || undefined); setSelectedWW(undefined); }}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40"
                >
                  <option value="">Select</option>
                  {fiscalYears.map(fy => <option key={fy} value={fy}>FY{fy}</option>)}
                </select>
              </div>

              {/* WW */}
              <div className="w-24">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">WW <span className="text-red-400">*</span></label>
                <select
                  value={selectedWW || ''}
                  onChange={(e) => setSelectedWW(e.target.value || undefined)}
                  disabled={!selectedYear}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400"
                >
                  <option value="">Select</option>
                  {workWeeks.map(ww => <option key={ww} value={ww}>WW{ww}</option>)}
                </select>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Customer (Multi-Select) */}
              <div className="w-44">
                <label className="block text-xs font-semibold text-blue-600 mb-0.5">Customer</label>
                <MultiSelect
                  options={customerOptions}
                  selected={selectedCustomers}
                  onChange={setSelectedCustomers}
                  placeholder="All Customers"
                  color="blue"
                />
              </div>

              {/* Model */}
              <div className="w-52">
                <label className="block text-xs font-semibold text-purple-600 mb-0.5">Model</label>
                <MultiSelect
                  options={modelOptions.map(m => ({ value: m, label: m }))}
                  selected={selectedModels}
                  onChange={setSelectedModels}
                  placeholder="All Models"
                  disabled={selectedCustomers.length === 0}
                  color="purple"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button onClick={fetchData} disabled={loading}
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

        {/* Pivot Table */}
        <Spin spinning={loading}>
          {models.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Weekly Summary</h3>
              </div>
              <div style={{ overflowX: 'auto', padding: 16 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12, lineHeight: 1.3 }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, minWidth: 140, textAlign: 'left', backgroundColor: '#f0f0f0' }}>Model</th>
                      {models.map((m) => (
                        <th key={m} style={{ ...thStyle, minWidth: 100, backgroundColor: '#d9d9d9', fontWeight: 700 }}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={tdLabel}>Inspection lot</td>
                      {models.map((m) => <td key={m} style={tdNum}>{fmtNum(summaryMap[m]?.inspection_lot ?? 0)}</td>)}
                    </tr>
                    <tr>
                      <td style={tdLabel}>Accept lot</td>
                      {models.map((m) => <td key={m} style={tdNum}>{fmtNum(summaryMap[m]?.accept_lot ?? 0)}</td>)}
                    </tr>
                    <tr>
                      <td style={tdLabel}>Reject lot</td>
                      {models.map((m) => <td key={m} style={tdNum}>{fmtNum(summaryMap[m]?.reject_lot ?? 0)}</td>)}
                    </tr>
                    <tr style={{ backgroundColor: '#52c41a' }}>
                      <td style={{ ...tdLabel, fontWeight: 700, color: '#fff' }}>LAR%</td>
                      {models.map((m) => {
                        const s = summaryMap[m];
                        return <td key={m} style={{ ...tdNum, fontWeight: 700, color: '#fff' }}>
                          {s ? formatPct(s.accept_lot, s.inspection_lot) : '-'}
                        </td>;
                      })}
                    </tr>
                    <tr style={{ backgroundColor: '#eb2f96' }}>
                      <td style={{ ...tdLabel, fontWeight: 700, color: '#fff' }}>LRR%</td>
                      {models.map((m) => {
                        const s = summaryMap[m];
                        return <td key={m} style={{ ...tdNum, fontWeight: 700, color: '#fff' }}>
                          {s ? formatPct(s.reject_lot, s.inspection_lot) : '-'}
                        </td>;
                      })}
                    </tr>

                    <tr><td colSpan={models.length + 1} style={{ height: 8, border: 'none' }}></td></tr>

                    <tr>
                      <td style={{ ...tdLabel, fontWeight: 700 }}>INSPECTION Q'TY</td>
                      {models.map((m) => <td key={m} style={tdNum}>{fmtNum(summaryMap[m]?.inspection_qty ?? 0)}</td>)}
                    </tr>
                    <tr>
                      <td style={{ ...tdLabel, fontWeight: 700 }}>NG Q'TY</td>
                      {models.map((m) => <td key={m} style={tdNum}>{fmtNum(summaryMap[m]?.ng_qty ?? 0)}</td>)}
                    </tr>

                    {defectNames.length > 0 && (
                      <tr><td colSpan={models.length + 1} style={{ height: 8, border: 'none' }}></td></tr>
                    )}

                    {defectNames.map((defectName, idx) => {
                      const bg = DEFECT_COLORS[idx % DEFECT_COLORS.length];
                      return (
                        <tr key={defectName}>
                          <td style={{ ...tdLabel, fontWeight: 600, color: '#fff', backgroundColor: bg }}>
                            {defectName}
                          </td>
                          {models.map((m) => (
                            <td key={m} style={tdNum}>
                              {fmtNum(defectMap[defectName]?.[m] || 0)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Select filters and click Search to view the weekly summary</p>
              </div>
            )
          )}
        </Spin>
      </div>
    </div>
  );
};

// ============ STYLES ============

const thStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid #d9d9d9',
  textAlign: 'center',
};

const tdLabel: React.CSSProperties = {
  padding: '3px 8px',
  border: '1px solid #d9d9d9',
  fontWeight: 500,
};

const tdNum: React.CSSProperties = {
  padding: '3px 8px',
  border: '1px solid #d9d9d9',
  textAlign: 'right',
};

export default SOQMWeeklyPage;
