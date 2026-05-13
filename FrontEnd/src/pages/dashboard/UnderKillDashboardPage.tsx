// client/src/pages/dashboard/UnderKillDashboardPage.tsx
// ===== UNDERKILL DASHBOARD WITH FILTERS =====
// Complete Separation Entity Architecture - UnderKill Dashboard Page
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import reportService, { getPartsFilterOptions } from '../../services/reportService';
import { getSiteOptions } from '../../services/sysconfigService';
import customerSiteService from '../../services/customerSiteService';
import DashboardFilters from '../../components/dashboard/DashboardFilters';
import { formatNumber } from '../../utils';
import { formatDateTimeFull } from '../../utils/formatUtils';
// ============ INTERFACES ============

interface UnderkillDashboardRecord {
  month_year: string;
  model: string;
  underkill_achieve_threshold?: number;
  underkill_accept_min_threshold?: number;
  underkill_accept_max_threshold?: number;
  underkill_abnormal_threshold?: number;
  underkill: number;
  status: 'Achieve' | 'Accept' | 'Abnormal';
}

interface UnderkillSummary {
  totalModels: number;
  modelsAchieve: number;
  modelsAccept: number;
  modelsAbnormal: number;
  averageUnderkill: number;
}

// ============ COMPONENT ============

const UnderKillDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [latestMonthOnly, setLatestMonthOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current year for default date range
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  // Filter states
  const [dateFrom, setDateFrom] = useState(`${currentYear}-01`);
  const [dateTo, setDateTo] = useState(`${currentYear}-${currentMonth}`);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showModelSelect, setShowModelSelect] = useState(false);

  // New filter states - changed to arrays for multi-select
  const [selectedProductionSites, setSelectedProductionSites] = useState<string[]>([]);
  const [selectedCustomerSites, setSelectedCustomerSites] = useState<string[]>([]);
  const [selectedProductFamilies, setSelectedProductFamilies] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);

  // Show/hide dropdowns
  const [showProductionSiteSelect, setShowProductionSiteSelect] = useState(false);
  const [showCustomerSiteSelect, setShowCustomerSiteSelect] = useState(false);
  const [showProductFamilySelect, setShowProductFamilySelect] = useState(false);
  const [showProductTypeSelect, setShowProductTypeSelect] = useState(false);

  // Available options for filters (from database)
  const [availableProductionSites, setAvailableProductionSites] = useState<Array<{ value: string; label: string }>>([]);
  const [availableCustomerSites, setAvailableCustomerSites] = useState<Array<{ value: string; label: string }>>([]);
  const [availableProductFamilies, setAvailableProductFamilies] = useState<Array<{ value: string; label: string }>>([]);
  const [availableProductTypes, setAvailableProductTypes] = useState<Array<{ value: string; label: string }>>([]);

  // Refs for click-outside detection
  const productionSiteRef = useRef<HTMLDivElement>(null);
  const customerSiteRef = useRef<HTMLDivElement>(null);
  const productFamilyRef = useRef<HTMLDivElement>(null);
  const productTypeRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Initial load flag for auto-select all
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Data states
  const [underkillData, setUnderkillData] = useState<UnderkillDashboardRecord[]>([]);
  const [summaryData, setSummaryData] = useState<UnderkillSummary>({
    totalModels: 0,
    modelsAchieve: 0,
    modelsAccept: 0,
    modelsAbnormal: 0,
    averageUnderkill: 0
  });

  // ============ FETCH DATA ============

  const fetchUnderkillData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await reportService.getUnderkillDashboard({
        dateFrom,
        dateTo,
        models: selectedModels.length > 0 ? selectedModels : undefined,
        productionSites: selectedProductionSites.length > 0 ? selectedProductionSites : undefined,
        customerSites: selectedCustomerSites.length > 0 ? selectedCustomerSites : undefined,
        productFamilies: selectedProductFamilies.length > 0 ? selectedProductFamilies : undefined,
        productTypes: selectedProductTypes.length > 0 ? selectedProductTypes : undefined
      });

      if (result.success && result.data) {
        // Ensure Underkill values are numbers
        const normalizedData = result.data.map(item => ({
          ...item,
          underkill: typeof item.underkill === 'string' ? parseFloat(item.underkill) : item.underkill,
          underkill_achieve_threshold: item.underkill_achieve_threshold ?
            (typeof item.underkill_achieve_threshold === 'string' ? parseFloat(item.underkill_achieve_threshold) : item.underkill_achieve_threshold) :
            undefined,
          underkill_accept_min_threshold: item.underkill_accept_min_threshold ?
            (typeof item.underkill_accept_min_threshold === 'string' ? parseFloat(item.underkill_accept_min_threshold) : item.underkill_accept_min_threshold) :
            undefined,
          underkill_accept_max_threshold: item.underkill_accept_max_threshold ?
            (typeof item.underkill_accept_max_threshold === 'string' ? parseFloat(item.underkill_accept_max_threshold) : item.underkill_accept_max_threshold) :
            undefined,
          underkill_abnormal_threshold: item.underkill_abnormal_threshold ?
            (typeof item.underkill_abnormal_threshold === 'string' ? parseFloat(item.underkill_abnormal_threshold) : item.underkill_abnormal_threshold) :
            undefined
        }));
        setUnderkillData(normalizedData);
        calculateSummary(normalizedData);
      } else {
        setError(result.message || 'Failed to fetch Underkill data');
      }
    } catch (err) {
      setError('Failed to refresh Underkill data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: UnderkillDashboardRecord[]) => {
    if (data.length === 0) {
      setSummaryData({
        totalModels: 0,
        modelsAchieve: 0,
        modelsAccept: 0,
        modelsAbnormal: 0,
        averageUnderkill: 0
      });
      return;
    }

    // Use latest month's data for status breakdown
    const latestMonth = data.map(d => d.month_year).sort().pop()!;
    const latestData = data.filter(d => d.month_year === latestMonth);

    const achieve = latestData.filter(d => d.status === 'Achieve').length;
    const abnormal = latestData.filter(d => d.status === 'Abnormal').length;
    const accept = latestData.filter(d => d.status === 'Accept').length;
    const overallAvg = latestData.reduce((sum, d) => sum + d.underkill, 0) / latestData.length;

    setSummaryData({
      totalModels: latestData.length,
      modelsAchieve: achieve,
      modelsAccept: accept,
      modelsAbnormal: abnormal,
      averageUnderkill: overallAvg
    });
  };

  // ===== INIT: Load production sites from sysconfig =====
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await getSiteOptions();
        const opts = sites.map(s => ({ value: s.value, label: s.label }));
        setAvailableProductionSites(opts);
        setSelectedProductionSites(opts.map(s => s.value));
      } catch (err) {
        console.error('Error fetching site options:', err);
      }
    };
    loadSites();
  }, []);

  // ===== CASCADE 1: Production Sites → Customer Sites =====
  useEffect(() => {
    setAvailableCustomerSites([]);
    setSelectedCustomerSites([]);
    setAvailableProductFamilies([]);
    setSelectedProductFamilies([]);
    setAvailableProductTypes([]);
    setSelectedProductTypes([]);
    setAvailableModels([]);
    setSelectedModels([]);

    if (selectedProductionSites.length === 0) return;

    const fetchCustomerSites = async () => {
      try {
        const result = await customerSiteService.getCustomerSites({ isActive: true, limit: 1000 });
        if (result.success && result.data) {
          const filtered = result.data.filter(cs => selectedProductionSites.includes(cs.site));
          const opts = filtered.map(cs => ({ value: cs.code, label: `${cs.customers} - (${cs.site})` }));
          setAvailableCustomerSites(opts);
          setSelectedCustomerSites(opts.map(o => o.value));
        }
      } catch (err) {
        console.error('Error fetching customer sites:', err);
      }
    };
    fetchCustomerSites();
  }, [selectedProductionSites]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== CASCADE 2: Customer Sites → Product Families =====
  useEffect(() => {
    setAvailableProductFamilies([]);
    setSelectedProductFamilies([]);
    setAvailableProductTypes([]);
    setSelectedProductTypes([]);
    setAvailableModels([]);
    setSelectedModels([]);

    if (selectedCustomerSites.length === 0) return;

    const fetchFamilies = async () => {
      try {
        const result = await getPartsFilterOptions({ customerSites: selectedCustomerSites });
        if (result.success && result.data) {
          const opts = result.data.productFamilies.map(f => ({ value: f, label: f }));
          setAvailableProductFamilies(opts);
          setSelectedProductFamilies(result.data.productFamilies);
        }
      } catch (err) {
        console.error('Error fetching product families:', err);
      }
    };
    fetchFamilies();
  }, [selectedCustomerSites]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== CASCADE 3: Product Families → Product Types =====
  useEffect(() => {
    setAvailableProductTypes([]);
    setSelectedProductTypes([]);
    setAvailableModels([]);
    setSelectedModels([]);

    if (selectedProductFamilies.length === 0) return;

    const fetchTypes = async () => {
      try {
        const result = await getPartsFilterOptions({
          customerSites: selectedCustomerSites,
          productFamilies: selectedProductFamilies,
        });
        if (result.success && result.data) {
          const opts = result.data.productTypes.map(t => ({ value: t, label: t }));
          setAvailableProductTypes(opts);
          setSelectedProductTypes(result.data.productTypes);
        }
      } catch (err) {
        console.error('Error fetching product types:', err);
      }
    };
    fetchTypes();
  }, [selectedProductFamilies]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== CASCADE 4: Product Types → Products/Models =====
  useEffect(() => {
    setAvailableModels([]);
    setSelectedModels([]);

    if (selectedProductTypes.length === 0) return;

    const fetchModels = async () => {
      try {
        const result = await reportService.getModelsDashboard({
          productionSites: selectedProductionSites,
          customerSites: selectedCustomerSites,
          productFamilies: selectedProductFamilies,
          productTypes: selectedProductTypes,
        });
        if (result.success && result.data) {
          setAvailableModels(result.data);
          setSelectedModels(result.data);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };
    fetchModels();
  }, [selectedProductTypes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Initial data fetch after cascade completes =====
  useEffect(() => {
    if (isInitialLoad && selectedModels.length > 0) {
      setIsInitialLoad(false);
      fetchUnderkillData();
    }
  }, [selectedModels]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productionSiteRef.current && !productionSiteRef.current.contains(event.target as Node)) {
        setShowProductionSiteSelect(false);
      }
      if (customerSiteRef.current && !customerSiteRef.current.contains(event.target as Node)) {
        setShowCustomerSiteSelect(false);
      }
      if (productFamilyRef.current && !productFamilyRef.current.contains(event.target as Node)) {
        setShowProductFamilySelect(false);
      }
      if (productTypeRef.current && !productTypeRef.current.contains(event.target as Node)) {
        setShowProductTypeSelect(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setShowModelSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ============ HELPER FUNCTIONS ============

  const getCellColor = (status: string) => {
    if (status === 'Achieve') return 'bg-green-100 text-green-600';
    if (status === 'Accept') return 'bg-yellow-100 text-yellow-600';
    if (status === 'Abnormal') return 'bg-red-100 text-red-600';
    return 'text-gray-900';
  };


  const toggleModelSelection = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const toggleProductionSiteSelection = (site: string) => {
    if (selectedProductionSites.includes(site)) {
      setSelectedProductionSites(selectedProductionSites.filter(s => s !== site));
    } else {
      setSelectedProductionSites([...selectedProductionSites, site]);
    }
  };

  const toggleCustomerSiteSelection = (site: string) => {
    if (selectedCustomerSites.includes(site)) {
      setSelectedCustomerSites(selectedCustomerSites.filter(s => s !== site));
    } else {
      setSelectedCustomerSites([...selectedCustomerSites, site]);
    }
  };

  const toggleProductFamilySelection = (family: string) => {
    if (selectedProductFamilies.includes(family)) {
      setSelectedProductFamilies(selectedProductFamilies.filter(f => f !== family));
    } else {
      setSelectedProductFamilies([...selectedProductFamilies, family]);
    }
  };

  const toggleProductTypeSelection = (type: string) => {
    if (selectedProductTypes.includes(type)) {
      setSelectedProductTypes(selectedProductTypes.filter(t => t !== type));
    } else {
      setSelectedProductTypes([...selectedProductTypes, type]);
    }
  };

  const formatMonthYear = (monthYear: string): string => {
    // Convert "202411" to "Nov 2024"
    if (monthYear.length === 6) {
      const year = monthYear.substring(0, 4);
      const month = monthYear.substring(4, 6);
      const date = new Date(`${year}-${month}-01`);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return monthYear;
  };

  const clearFilters = () => {
    setSelectedModels([]);
    setDateFrom(`${currentYear}-01`);
    setDateTo(`${currentYear}-${currentMonth}`);
    setSelectedProductionSites([]);
    setSelectedCustomerSites([]);
    setSelectedProductFamilies([]);
    setSelectedProductTypes([]);
  };

  // Transform data for table display: group by model, create columns for each month
  const getTableData = () => {
    if (underkillData.length === 0) return { models: [], months: [] };

    // Get unique months and sort them
    const months = Array.from(new Set(underkillData.map(d => d.month_year)))
      .sort()
      .map(m => ({
        key: m,
        label: formatMonthYear(m)
      }));

    // Create unique row key from model + thresholds (same model with different thresholds = separate rows)
    const getRowKey = (d: UnderkillDashboardRecord) =>
      `${d.model}|${d.underkill_achieve_threshold ?? ''}|${d.underkill_accept_min_threshold ?? ''}|${d.underkill_accept_max_threshold ?? ''}|${d.underkill_abnormal_threshold ?? ''}`;

    // Filter by latest month or show all
    const filteredData = latestMonthOnly
      ? underkillData.filter(d => d.month_year === months[months.length - 1]?.key)
      : underkillData;
    const uniqueKeys = Array.from(new Set(filteredData.map(d => getRowKey(d)))).sort();

    // Build table rows
    const models = uniqueKeys.map(key => {
      const rowData = underkillData.filter(d => getRowKey(d) === key);
      const first = rowData[0];
      const thresholds = {
        achieve: first.underkill_achieve_threshold,
        acceptMin: first.underkill_accept_min_threshold,
        acceptMax: first.underkill_accept_max_threshold,
        abnormal: first.underkill_abnormal_threshold
      };

      // Create months object with Underkill values and status
      const monthsData: { [key: string]: { value: number; status: string } | null } = {};
      months.forEach(month => {
        const record = rowData.find(d => d.month_year === month.key);
        monthsData[month.key] = record ? { value: record.underkill, status: record.status } : null;
      });

      return {
        model: first.model,
        key,
        thresholds,
        months: monthsData
      };
    });

    return { models, months };
  };

  const tableData = getTableData();

  // ============ RENDER HELPERS ============

  const getLatestMonthLabel = (): string => {
    if (underkillData.length === 0) return '';
    const latestMonth = underkillData.map(d => d.month_year).sort().pop()!;
    return formatMonthYear(latestMonth);
  };

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{tableData.models.length}</p>
            <p className="text-sm text-gray-600">Total Models</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{summaryData.modelsAchieve}</p>
            <p className="text-sm text-gray-600">ACHIEVE</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-700">{summaryData.modelsAccept}</p>
            <p className="text-sm text-gray-600">ACCEPT</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{summaryData.modelsAbnormal}</p>
            <p className="text-sm text-gray-600">ABNORMAL</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        <div className="flex items-center">
          <div className="p-3 bg-primary-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber((summaryData.averageUnderkill * 100).toString(),2)}%</p>
            <p className="text-sm text-gray-600">Average UnderKill</p>
          </div>
        </div>
      </Card>
      {underkillData.length > 0 && (
        <p className="col-span-full text-xs text-gray-400 italic">* Calculated by latest month ({getLatestMonthLabel()}) Only latest month</p>
      )}
    </div>
  );

  const renderUnderKillTable = () => (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            UnderKill Rate Dashboard
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1.5"></div>
                <span className="text-gray-700 font-medium">Achieve</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-1.5"></div>
                <span className="text-gray-700 font-medium">Accept</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1.5"></div>
                <span className="text-gray-700 font-medium">Abnormal</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1.5"></div>
                <span className="text-gray-700 font-medium">No Data</span>
              </div>
            </div>
            <label className="flex items-center cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={latestMonthOnly}
                onChange={(e) => setLatestMonthOnly(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Only latest month</span>
            </label>
            <Button
              onClick={fetchUnderkillData}
              isLoading={loading}
              size="sm"
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* UnderKill Table */}
      <div className="overflow-x-auto">
        {underkillData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                <th className="px-6 py-3 text-left text-base font-bold text-white uppercase tracking-wider sticky left-0 bg-slate-700 z-10 border-r border-slate-600">
                  Model
                </th>
                <th className="px-6 py-3 text-center text-base font-bold text-green-300 uppercase tracking-wider bg-slate-700/80">
                  Achieve
                </th>
                <th className="px-6 py-3 text-center text-base font-bold text-yellow-300 uppercase tracking-wider bg-slate-700/80">
                  Accept
                </th>
                <th className="px-6 py-3 text-center text-base font-bold text-red-300 uppercase tracking-wider bg-slate-700/80">
                  Abnormal
                </th>
                {tableData.months.map((month) => (
                  <th key={month.key} className="px-6 py-3 text-center text-base font-bold text-white uppercase tracking-wider">
                    {month.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.models.map((item, index) => (
                <tr key={item.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                    {item.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-semibold bg-inherit text-gray-900 border-x border-green-100">
                    {item.thresholds.achieve != null ? `<${formatNumber((item.thresholds.achieve * 100).toString(),2)}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-semibold bg-inherit text-gray-900 border-x border-yellow-100">
                    {item.thresholds.acceptMin != null && item.thresholds.acceptMax != null
                      ? `${formatNumber((item.thresholds.acceptMin * 100).toString(),2)}-${formatNumber((item.thresholds.acceptMax * 100).toString(),2)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-semibold bg-inherit text-gray-900 border-x border-red-100">
                    {item.thresholds.abnormal != null ? `>${formatNumber((item.thresholds.abnormal * 100).toString(),2)}%` : 'N/A'}
                  </td>
                  {tableData.months.map((month) => {
                    const cell = item.months[month.key];
                    return (
                      <td
                        key={month.key}
                        className={`px-6 py-4 whitespace-nowrap text-lg text-center font-bold ${
                          cell !== null ? getCellColor(cell.status) : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {cell !== null ? `${formatNumber((cell.value*100).toString(),2)}%` : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </Card>
  );

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">UnderKill Dashboard</h1>
              <p className="text-gray-600 mt-2">
                UnderKill rate monitoring and quality control analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
              </Button>
              <Button
                variant="ghost"
                onClick={() => {/* Export to Excel */}}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              variant="error"
              title="Error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Filters */}
        <DashboardFilters
          filters={{
            dateFrom,
            dateTo,
            selectedProductionSites,
            selectedCustomerSites,
            selectedProductFamilies,
            selectedProductTypes,
            selectedModels
          }}
          availableProductionSites={availableProductionSites}
          availableCustomerSites={availableCustomerSites}
          availableProductFamilies={availableProductFamilies}
          availableProductTypes={availableProductTypes}
          availableModels={availableModels}
          showProductionSiteSelect={showProductionSiteSelect}
          showCustomerSiteSelect={showCustomerSiteSelect}
          showProductFamilySelect={showProductFamilySelect}
          showProductTypeSelect={showProductTypeSelect}
          showModelSelect={showModelSelect}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onToggleProductionSite={toggleProductionSiteSelection}
          onToggleCustomerSite={toggleCustomerSiteSelection}
          onToggleProductFamily={toggleProductFamilySelection}
          onToggleProductType={toggleProductTypeSelection}
          onToggleModel={toggleModelSelection}
          onToggleProductionSiteDropdown={() => setShowProductionSiteSelect(!showProductionSiteSelect)}
          onToggleCustomerSiteDropdown={() => setShowCustomerSiteSelect(!showCustomerSiteSelect)}
          onToggleProductFamilyDropdown={() => setShowProductFamilySelect(!showProductFamilySelect)}
          onToggleProductTypeDropdown={() => setShowProductTypeSelect(!showProductTypeSelect)}
          onToggleModelDropdown={() => setShowModelSelect(!showModelSelect)}
          onClearProductionSites={() => setSelectedProductionSites([])}
          onSelectAllProductionSites={() => setSelectedProductionSites(availableProductionSites.map(s => s.value))}
          onClearCustomerSites={() => setSelectedCustomerSites([])}
          onSelectAllCustomerSites={() => setSelectedCustomerSites(availableCustomerSites.map(cs => cs.value))}
          onClearProductFamilies={() => setSelectedProductFamilies([])}
          onSelectAllProductFamilies={() => setSelectedProductFamilies(availableProductFamilies.map(f => f.value))}
          onClearProductTypes={() => setSelectedProductTypes([])}
          onSelectAllProductTypes={() => setSelectedProductTypes(availableProductTypes.map(t => t.value))}
          onClearModels={() => setSelectedModels([])}
          onSelectAllModels={() => setSelectedModels([...availableModels])}
          onClearFilters={clearFilters}
          onApplyFilters={fetchUnderkillData}
          loading={loading}
          productionSiteRef={productionSiteRef}
          customerSiteRef={customerSiteRef}
          productFamilyRef={productFamilyRef}
          productTypeRef={productTypeRef}
          modelRef={modelRef}
        />

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* UnderKill Table */}
        {renderUnderKillTable()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDateTimeFull(new Date())} | Data refreshed on demand
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderKillDashboardPage;

/*
=== UNDERKILL DASHBOARD FEATURES ===

COMPREHENSIVE UNDERKILL TRACKING WITH FILTERS:
✅ Complete filter integration matching DPPM and LAR dashboards
✅ Multi-select filters for production sites, customer sites, product families, and product types
✅ Dynamic model filtering based on other filter selections
✅ Date range filtering with month period selection
✅ API integration with getUnderkillDashboard endpoint
✅ Real-time data fetching with loading states

DATA PRESENTATION:
✅ Color-coded cells (Green <0.02%, Yellow 0.02-0.1%, Red >0.1%, Gray empty)
✅ Dynamic table generation based on filtered data
✅ Month columns automatically generated from data
✅ Threshold values displayed for each model
✅ Professional Manufacturing Quality Control layout

SUMMARY ANALYTICS:
✅ Total models count and performance distribution
✅ Within target vs above target breakdowns
✅ Average UnderKill calculation across filtered data
✅ Real-time summary updates based on current filters

FILTER FEATURES:
✅ Production site filtering
✅ Customer site filtering (cascading based on production sites)
✅ Product family filtering
✅ Product type filtering
✅ Model multi-select filtering
✅ Date range filtering (month-based)
✅ Clear filters functionality
✅ Select all/clear all for each filter category

USER EXPERIENCE:
✅ Responsive design for all devices
✅ Click-outside to close dropdowns
✅ Loading states during data fetching
✅ Error handling with dismissible alerts
✅ Refresh functionality
✅ Print report capability
✅ Export Excel placeholder for future implementation

INTEGRATION:
✅ Uses DashboardFilters component for consistent UI
✅ Integrates with reportService for API calls
✅ Follows Complete Separation Entity Architecture
✅ TypeScript interfaces for type safety
✅ Matches project styling patterns
*/
