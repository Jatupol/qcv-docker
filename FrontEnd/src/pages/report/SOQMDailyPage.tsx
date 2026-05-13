// client/src/pages/report/SOQMDailyPage.tsx
// ===== SOQM - Daily Report =====
// Shows NG qty summary from OQA station with fiscal year/ww, model, lot filters

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Table, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  getSOQMDaily,
  getModelsLAR,
  getFiscalYearsSOQMDaily,
  getWorkWeeksSOQMDaily,
} from '../../services/reportService';
import customerSiteService from '../../services/customerSiteService';
import { exportToExcel } from '../../utils/excelUtils';
import { formatDate } from '../../utils/formatUtils';

// ============ INTERFACES ============

interface SOQMDailyRecord {
  ww: number;
  inspection_date: string;
  model: string;
  inspector_id: string;
  lotno: string;
  total_ng: number;
}

interface CustomerSiteRecord {
  code: string;
  customers: string;
}

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

const SOQMDailyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SOQMDailyRecord[]>([]);

  // Filter states
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [selectedYearFrom, setSelectedYearFrom] = useState<string | undefined>();
  const [selectedWWFrom, setSelectedWWFrom] = useState<string | undefined>();
  const [selectedYearTo, setSelectedYearTo] = useState<string | undefined>();
  const [selectedWWTo, setSelectedWWTo] = useState<string | undefined>();
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [allCustomerSites, setAllCustomerSites] = useState<CustomerSiteRecord[]>([]);
  const [customerSiteCodes, setCustomerSiteCodes] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [lotSearch, setLotSearch] = useState('');

  // Work weeks for from/to selectors
  const [workWeeksFrom, setWorkWeeksFrom] = useState<string[]>([]);
  const [workWeeksTo, setWorkWeeksTo] = useState<string[]>([]);

  // ============ SUMMARY CARDS (computed from data) ============

  const summary = useMemo(() => {
    if (data.length === 0) return null;

    const totalNG = data.reduce((sum, r) => sum + Number(r.total_ng), 0);
    const uniqueWeeks = new Set(data.map(r => r.ww));
    const uniqueModels = new Set(data.map(r => r.model));
    const uniqueLots = new Set(data.map(r => r.lotno));

    // Top Lot NG
    const lotNGMap: Record<string, number> = {};
    data.forEach(r => { lotNGMap[r.lotno] = (lotNGMap[r.lotno] || 0) + Number(r.total_ng); });
    const topLot = Object.entries(lotNGMap).sort((a, b) => b[1] - a[1])[0];

    // Top Inspector NG
    const inspectorNGMap: Record<string, number> = {};
    data.forEach(r => {
      if (r.inspector_id) {
        inspectorNGMap[r.inspector_id] = (inspectorNGMap[r.inspector_id] || 0) + Number(r.total_ng);
      }
    });
    const topInspector = Object.entries(inspectorNGMap).sort((a, b) => b[1] - a[1])[0];

    // Top Model NG
    const modelNGMap: Record<string, number> = {};
    data.forEach(r => { modelNGMap[r.model] = (modelNGMap[r.model] || 0) + Number(r.total_ng); });
    const topModel = Object.entries(modelNGMap).sort((a, b) => b[1] - a[1])[0];

    return {
      totalWeeks: uniqueWeeks.size,
      totalModels: uniqueModels.size,
      totalLots: uniqueLots.size,
      totalNG,
      topLot: topLot ? { name: topLot[0], ng: topLot[1] } : null,
      topInspector: topInspector ? { name: topInspector[0], ng: topInspector[1] } : null,
      topModel: topModel ? { name: topModel[0], ng: topModel[1] } : null,
    };
  }, [data]);

  // ============ LOAD FILTER OPTIONS ============

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [fyResult, csResult] = await Promise.all([
          getFiscalYearsSOQMDaily(),
          customerSiteService.getCustomerSites({ isActive: true, limit: 1000 }),
        ]);

        if (fyResult.success && fyResult.data) {
          setFiscalYears(fyResult.data.map(String));
        }
        if (csResult.success && csResult.data) {
          setAllCustomerSites(csResult.data.map(cs => ({ code: cs.code, customers: cs.customers })));
          const uniqueCustomers = [...new Set(csResult.data.map(cs => cs.customers))].sort();
          const opts = uniqueCustomers.map(c => ({ value: c, label: c }));
          setCustomerOptions(opts);
          // Default: select all customers
          setSelectedCustomers(uniqueCustomers);
        }
      } catch {
        // silently ignore
      }
    };
    loadFilters();
  }, []);

  // Load work weeks when year changes
  useEffect(() => {
    if (selectedYearFrom) {
      getWorkWeeksSOQMDaily(selectedYearFrom).then((result) => {
        if (result.success && result.data) {
          setWorkWeeksFrom(result.data.map((ww: any) => String(ww).padStart(2, '0')));
        }
      });
    } else {
      setWorkWeeksFrom([]);
    }
  }, [selectedYearFrom]);

  useEffect(() => {
    if (selectedYearTo) {
      getWorkWeeksSOQMDaily(selectedYearTo).then((result) => {
        if (result.success && result.data) {
          setWorkWeeksTo(result.data.map((ww: any) => String(ww).padStart(2, '0')));
        }
      });
    } else {
      setWorkWeeksTo([]);
    }
  }, [selectedYearTo]);

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
      } catch {
        // silently ignore
      }
    };
    fetchModels();
  }, [selectedCustomers, allCustomerSites]);

  // ============ DATA FETCHING ============

  const fetchData = useCallback(async () => {
    if (!selectedYearFrom || !selectedWWFrom || !selectedYearTo || !selectedWWTo) {
      message.warning('Please select Year and WW range');
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        yearFrom: selectedYearFrom,
        wwFrom: selectedWWFrom,
        yearTo: selectedYearTo,
        wwTo: selectedWWTo,
      };
      if (customerSiteCodes.length > 0) {
        params.customerSites = customerSiteCodes;
      }
      if (selectedModels.length > 0) {
        params.models = selectedModels;
      }
      if (lotSearch.trim()) {
        params.lotno = lotSearch.trim();
      }

      const result = await getSOQMDaily(params);

      if (result.success && result.data) {
        setData(result.data);
        if (result.data.length === 0) {
          message.info('No data found for the selected filters');
        }
      } else {
        message.error(result.message || 'Failed to fetch data');
        setData([]);
      }
    } catch {
      message.error('Failed to fetch SOQM Daily data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYearFrom, selectedWWFrom, selectedYearTo, selectedWWTo, customerSiteCodes, selectedModels, lotSearch]);

  // ============ EXPORT ============

  const handleExport = () => {
    if (data.length === 0) {
      message.warning('No data to export');
      return;
    }

    exportToExcel(data, {
      filename: `SOQM_Daily_FY${selectedYearFrom}_WW${selectedWWFrom}-FY${selectedYearTo}_WW${selectedWWTo}`,
      sheetName: 'SOQM Daily',
      columns: [
        { key: 'ww', header: 'WW', width: 8 },
        { key: 'inspection_date', header: 'Inspection Date', width: 14, formatter: (val: string) => val ? formatDate(val) : '' },
        { key: 'model', header: 'Model', width: 20 },
        { key: 'inspector_id', header: 'Inspector ID', width: 14 },
        { key: 'lotno', header: 'Lot no.', width: 18 },
        { key: 'total_ng', header: 'Total NG', width: 10 },
      ],
    });
  };

  // ============ CLEAR ============

  const handleClear = () => {
    setSelectedYearFrom(undefined);
    setSelectedWWFrom(undefined);
    setSelectedYearTo(undefined);
    setSelectedWWTo(undefined);
    const allCusts = customerOptions.map(o => o.value);
    setSelectedCustomers(allCusts);
    setModelOptions([]);
    setSelectedModels([]);
    setLotSearch('');
    setData([]);
  };

  // ============ TABLE COLUMNS ============

  const columns: ColumnsType<SOQMDailyRecord> = [
    {
      title: 'WW',
      dataIndex: 'ww',
      key: 'ww',
      width: 70,
      align: 'center',
      sorter: (a, b) => a.ww - b.ww,
      filters: [...new Set(data.map((r) => r.ww))].sort((a, b) => a - b).map((ww) => ({ text: String(ww), value: ww })),
      onFilter: (value, record) => record.ww === value,
    },
    {
      title: 'Inspection Date',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      width: 130,
      sorter: (a, b) => (a.inspection_date || '').localeCompare(b.inspection_date || ''),
      render: (val: string) => val ? formatDate(val) : '',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 180,
      sorter: (a, b) => a.model.localeCompare(b.model),
      filters: [...new Set(data.map((r) => r.model))].sort().map((m) => ({ text: m, value: m })),
      onFilter: (value, record) => record.model === value,
    },
    {
      title: 'Inspector ID',
      dataIndex: 'inspector_id',
      key: 'inspector_id',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.inspector_id || '').localeCompare(b.inspector_id || ''),
    },
    {
      title: 'Lot no.',
      dataIndex: 'lotno',
      key: 'lotno',
      width: 160,
      sorter: (a, b) => a.lotno.localeCompare(b.lotno),
    },
    {
      title: 'Total NG',
      dataIndex: 'total_ng',
      key: 'total_ng',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.total_ng - b.total_ng,
      defaultSortOrder: 'descend',
      render: (val: number) => {
        const num = Number(val);
        const color = num >= 10 ? '#f5222d' : num >= 5 ? '#fa8c16' : '#333';
        return <span style={{ color, fontWeight: num >= 10 ? 700 : 400 }}>{num.toLocaleString()}</span>;
      },
    },
  ];

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SOQM - Daily</h1>
              <p className="text-gray-500 text-sm">Daily NG quantity report from OQA Station</p>
            </div>
            <button
              onClick={handleExport}
              disabled={data.length === 0}
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
              {/* Year From */}
              <div className="w-28">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Year From <span className="text-red-400">*</span></label>
                <select
                  value={selectedYearFrom || ''}
                  onChange={(e) => { setSelectedYearFrom(e.target.value || undefined); setSelectedWWFrom(undefined); }}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40"
                >
                  <option value="">Select</option>
                  {fiscalYears.map(fy => <option key={fy} value={fy}>FY{fy}</option>)}
                </select>
              </div>

              {/* WW From */}
              <div className="w-24">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">WW From <span className="text-red-400">*</span></label>
                <select
                  value={selectedWWFrom || ''}
                  onChange={(e) => setSelectedWWFrom(e.target.value || undefined)}
                  disabled={!selectedYearFrom}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400"
                >
                  <option value="">Select</option>
                  {workWeeksFrom.map(ww => <option key={ww} value={ww}>WW{ww}</option>)}
                </select>
              </div>

              <span className="text-gray-400 pb-1.5 font-bold">-</span>

              {/* Year To */}
              <div className="w-28">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Year To <span className="text-red-400">*</span></label>
                <select
                  value={selectedYearTo || ''}
                  onChange={(e) => { setSelectedYearTo(e.target.value || undefined); setSelectedWWTo(undefined); }}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40"
                >
                  <option value="">Select</option>
                  {fiscalYears.map(fy => <option key={fy} value={fy}>FY{fy}</option>)}
                </select>
              </div>

              {/* WW To */}
              <div className="w-24">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">WW To <span className="text-red-400">*</span></label>
                <select
                  value={selectedWWTo || ''}
                  onChange={(e) => setSelectedWWTo(e.target.value || undefined)}
                  disabled={!selectedYearTo}
                  className="w-full px-2 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400"
                >
                  <option value="">Select</option>
                  {workWeeksTo.map(ww => <option key={ww} value={ww}>WW{ww}</option>)}
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

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Lot search */}
              <div className="w-40">
                <label className="block text-xs font-semibold text-teal-600 mb-0.5">Lot no.</label>
                <input
                  type="text"
                  value={lotSearch}
                  onChange={(e) => setLotSearch(e.target.value)}
                  placeholder="Search lot..."
                  className="w-full px-2 py-1.5 border border-teal-300 rounded-lg text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 bg-teal-50/40"
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
            {/* Total Week */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Week</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary.totalWeeks}</div>
            </div>
            {/* Total Model */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Model</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary.totalModels}</div>
            </div>
            {/* Total Lot */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Lot</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary.totalLots.toLocaleString()}</div>
            </div>
            {/* Total NG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total NG</div>
              <div className="text-2xl font-bold text-red-500 mt-1">{summary.totalNG.toLocaleString()}</div>
            </div>
            {/* Top Lot NG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Top Lot NG</div>
              {summary.topLot ? (
                <>
                  <div className="text-lg font-bold text-orange-600 mt-1 truncate" title={summary.topLot.name}>{summary.topLot.name}</div>
                  <div className="text-xs text-gray-500">{summary.topLot.ng.toLocaleString()} NG</div>
                </>
              ) : (
                <div className="text-lg font-bold text-gray-300 mt-1">-</div>
              )}
            </div>
            {/* Top Inspector NG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Top Inspector NG</div>
              {summary.topInspector ? (
                <>
                  <div className="text-lg font-bold text-purple-600 mt-1 truncate" title={summary.topInspector.name}>{summary.topInspector.name}</div>
                  <div className="text-xs text-gray-500">{summary.topInspector.ng.toLocaleString()} NG</div>
                </>
              ) : (
                <div className="text-lg font-bold text-gray-300 mt-1">-</div>
              )}
            </div>
            {/* Top Model NG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Top Model NG</div>
              {summary.topModel ? (
                <>
                  <div className="text-lg font-bold text-rose-600 mt-1 truncate" title={summary.topModel.name}>{summary.topModel.name}</div>
                  <div className="text-xs text-gray-500">{summary.topModel.ng.toLocaleString()} NG</div>
                </>
              ) : (
                <div className="text-lg font-bold text-gray-300 mt-1">-</div>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <Spin spinning={loading}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900">
                SOQM Daily Data
                {data.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({data.length} records)</span>
                )}
              </h3>
            </div>
            <Table
              columns={columns}
              dataSource={data}
              rowKey={(_record, index) => `${index}`}
              size="small"
              scroll={{ x: 800 }}
              pagination={{
                defaultPageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ['20', '50', '100', '200'],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default SOQMDailyPage;
