// client/src/pages/dashboard/LARDashboardPage.tsx
// ===== LAR DASHBOARD WITH FILTERS =====
// Complete Separation Entity Architecture - LAR Dashboard Page
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
import GroupByTimePeriodBar from '../../components/dashboard/GroupByTimePeriodBar';
import { formatDateTimeFull } from '../../utils/formatUtils';
import { formatPeriodKey, getDefaultDateRange } from '../../utils/dashboardUtils';
import type { GroupByDimension, TimePeriod } from '../../types/report';

// ============ INTERFACES ============

interface LARDashboardRecord {
  period_key: string;
  dimension_value: string;
  lar_achieve_threshold?: number | null;
  lar_accept_min_threshold?: number | null;
  lar_accept_max_threshold?: number | null;
  lar_abnormal_threshold?: number | null;
  lar: number;
  status?: string | null;
}

interface LARSummary {
  totalModels: number;
  modelsAboveTarget: number;
  modelsAccept: number;
  modelsAbnormal: number;
  averageLAR: number;
}

// ============ COMPONENT ============

const LARDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [latestMonthOnly, setLatestMonthOnly] = useState(true);
  const [showThresholds, setShowThresholds] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByDimension>('model');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

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

  // Data states
  const [larData, setLarData] = useState<LARDashboardRecord[]>([]);
  const [summaryData, setSummaryData] = useState<LARSummary>({
    totalModels: 0,
    modelsAboveTarget: 0,
    modelsAccept: 0,
    modelsAbnormal: 0,
    averageLAR: 0
  });

  // ============ FETCH DATA ============

  const fetchLARData = async (overrideDates?: { dateFrom?: string; dateTo?: string }) => {
    setLoading(true);
    setError(null);

    const from = overrideDates?.dateFrom ?? dateFrom;
    const to = overrideDates?.dateTo ?? dateTo;

    try {
      const result = await reportService.getLARDashboard({
        dateFrom: from,
        dateTo: to,
        models: groupBy === 'model' && selectedModels.length > 0 ? selectedModels : undefined,
        productionSites: selectedProductionSites.length > 0 ? selectedProductionSites : undefined,
        customerSites: selectedCustomerSites.length > 0 ? selectedCustomerSites : undefined,
        productFamilies: selectedProductFamilies.length > 0 ? selectedProductFamilies : undefined,
        productTypes: selectedProductTypes.length > 0 ? selectedProductTypes : undefined,
        groupBy,
        timePeriod,
      });

      if (result.success && result.data) {
        // Ensure LAR values are numbers
        const normalizedData = result.data.map(item => ({
          ...item,
          lar: typeof item.lar === 'string' ? parseFloat(item.lar) : item.lar,
          lar_achieve_threshold: item.lar_achieve_threshold ?
            (typeof item.lar_achieve_threshold === 'string' ? parseFloat(item.lar_achieve_threshold) : item.lar_achieve_threshold) :
            undefined,
          lar_accept_min_threshold: item.lar_accept_min_threshold ?
            (typeof item.lar_accept_min_threshold === 'string' ? parseFloat(item.lar_accept_min_threshold) : item.lar_accept_min_threshold) :
            undefined,
          lar_accept_max_threshold: item.lar_accept_max_threshold ?
            (typeof item.lar_accept_max_threshold === 'string' ? parseFloat(item.lar_accept_max_threshold) : item.lar_accept_max_threshold) :
            undefined,
          lar_abnormal_threshold: item.lar_abnormal_threshold ?
            (typeof item.lar_abnormal_threshold === 'string' ? parseFloat(item.lar_abnormal_threshold) : item.lar_abnormal_threshold) :
            undefined
        }));
        setLarData(normalizedData);
        calculateSummary(normalizedData);
      } else {
        setError(result.message || 'Failed to fetch LAR data');
      }
    } catch (err) {
      setError('Failed to refresh LAR data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: LARDashboardRecord[]) => {
    if (data.length === 0) {
      setSummaryData({ totalModels: 0, modelsAboveTarget: 0, modelsAccept: 0, modelsAbnormal: 0, averageLAR: 0 });
      return;
    }

    const latestPeriod = data.map(d => d.period_key).sort().pop()!;
    const latestData = data.filter(d => d.period_key === latestPeriod);

    const aboveTarget = groupBy === 'model' ? latestData.filter(d => d.status === 'Achieve').length : 0;
    const abnormal = groupBy === 'model' ? latestData.filter(d => d.status === 'Abnormal').length : 0;
    const accept = groupBy === 'model' ? latestData.filter(d => d.status === 'Accept').length : 0;
    const overallAvg = latestData.reduce((sum, d) => sum + d.lar, 0) / latestData.length;

    setSummaryData({
      totalModels: latestData.length,
      modelsAboveTarget: aboveTarget,
      modelsAccept: accept,
      modelsAbnormal: abnormal,
      averageLAR: overallAvg
    });
  };

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ===== INIT: Load production sites from sysconfig =====
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await getSiteOptions();
        const opts = sites.map(s => ({ value: s.value, label: s.label }));
        setAvailableProductionSites(opts);
        // Auto-select all on initial load
        setSelectedProductionSites(opts.map(s => s.value));
      } catch (err) {
        console.error('Error fetching site options:', err);
      }
    };
    loadSites();
  }, []);

  // ===== CASCADE 1: Production Sites → Customer Sites =====
  useEffect(() => {
    // Reset downstream
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
    // Reset downstream
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
    // Reset downstream
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
    // Reset downstream
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
      fetchLARData();
    }
  }, [selectedModels]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Refetch when groupBy changes =====
  useEffect(() => {
    if (!isInitialLoad) {
      fetchLARData();
    }
  }, [groupBy]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Reset dates and refetch when timePeriod changes =====
  useEffect(() => {
    if (!isInitialLoad) {
      const { from, to } = getDefaultDateRange(timePeriod);
      setDateFrom(from);
      setDateTo(to);
      fetchLARData({ dateFrom: from, dateTo: to });
    }
  }, [timePeriod]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const getCellColor = (status?: string | null) => {
    if (!status) return 'bg-white text-gray-900';
    if (status === 'Achieve') return 'bg-green-100 text-green-600';
    if (status === 'Accept') return 'bg-yellow-100 text-yellow-600';
    if (status === 'Abnormal') return 'bg-red-100 text-red-600';
    return 'text-gray-900';
  };

  const formatPercentage = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue.toFixed(2)}%`;
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

  const clearFilters = () => {
    const { from, to } = getDefaultDateRange(timePeriod);
    setSelectedModels([]);
    setDateFrom(from);
    setDateTo(to);
    setSelectedProductionSites([]);
    setSelectedCustomerSites([]);
    setSelectedProductFamilies([]);
    setSelectedProductTypes([]);
  };

  const getTableData = () => {
    if (larData.length === 0) return { models: [], months: [] };

    const months = Array.from(new Set(larData.map(d => d.period_key)))
      .sort()
      .map(m => ({ key: m, label: formatPeriodKey(m, timePeriod) }));

    const getRowKey = (d: LARDashboardRecord) =>
      groupBy === 'model'
        ? `${d.dimension_value}|${d.lar_achieve_threshold ?? ''}|${d.lar_accept_min_threshold ?? ''}|${d.lar_accept_max_threshold ?? ''}|${d.lar_abnormal_threshold ?? ''}`
        : d.dimension_value;

    const filteredData = latestMonthOnly
      ? larData.filter(d => d.period_key === months[months.length - 1]?.key)
      : larData;
    const uniqueKeys = Array.from(new Set(filteredData.map(d => getRowKey(d)))).sort();

    const models = uniqueKeys.map(key => {
      const rowData = larData.filter(d => getRowKey(d) === key);
      const first = rowData[0];
      const thresholds = {
        achieve: first.lar_achieve_threshold,
        acceptMin: first.lar_accept_min_threshold,
        acceptMax: first.lar_accept_max_threshold,
        abnormal: first.lar_abnormal_threshold
      };

      const monthsData: { [key: string]: { value: number; status?: string | null } | null } = {};
      months.forEach(month => {
        const record = rowData.find(d => d.period_key === month.key);
        monthsData[month.key] = record ? { value: record.lar, status: record.status } : null;
      });

      return { model: first.dimension_value, key, thresholds, months: monthsData };
    });

    return { models, months };
  };

  const tableData = getTableData();
  const effectiveShowThresholds = showThresholds && groupBy === 'model';

  // ============ RENDER HELPERS ============

  const getLatestPeriodLabel = (): string => {
    if (larData.length === 0) return '';
    const latest = larData.map(d => d.period_key).sort().pop()!;
    return formatPeriodKey(latest, timePeriod);
  };

  const latestPeriodCheckboxLabel = {
    daily: 'Only latest day', fiscal_weekly: 'Only latest week',
    monthly: 'Only latest month', quarterly: 'Only latest quarter', yearly: 'Only latest year',
  }[timePeriod];

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
            <p className="text-2xl font-bold text-green-700">{summaryData.modelsAboveTarget}</p>
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
            <p className="text-2xl font-bold text-gray-900">{summaryData.averageLAR.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Average LAR</p>
          </div>
        </div>
      </Card>
      {larData.length > 0 && (
        <p className="col-span-full text-xs text-gray-400 italic">* Calculated by latest period ({getLatestPeriodLabel()})</p>
      )}
    </div>
  );

  const renderLARTable = () => (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Line Acceptance Rate (LAR) Dashboard
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm">
              {groupBy === 'model' && (
                <>
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
                </>
              )}
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
              <span className="text-gray-700 font-medium">{latestPeriodCheckboxLabel}</span>
            </label>
            {groupBy === 'model' && (
              <>
                <div className="w-px h-5 bg-gray-300" />
                <label className="flex items-center cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={showThresholds}
                    onChange={(e) => setShowThresholds(e.target.checked)}
                    className="mr-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Show Achieve / Accept / Abnormal</span>
                </label>
              </>
            )}
            <Button
              onClick={fetchLARData}
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

      {/* LAR Table */}
      <div className="overflow-x-auto">
        {larData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                <th className="px-6 py-3 text-left text-base font-bold text-white uppercase tracking-wider sticky left-0 bg-slate-700 z-10 border-r border-slate-600">
                  {groupBy === 'production_site' ? 'Production Site' : groupBy === 'customer_site' ? 'Customer Site' : groupBy === 'product_family' ? 'Product Family' : groupBy === 'product_type' ? 'Product Type' : 'Model'}
                </th>
                {effectiveShowThresholds && (
                  <th className="px-6 py-3 text-center text-base font-bold text-green-300 uppercase tracking-wider bg-slate-700/80">
                    Achieve
                  </th>
                )}
                {effectiveShowThresholds && (
                  <th className="px-6 py-3 text-center text-base font-bold text-yellow-300 uppercase tracking-wider bg-slate-700/80">
                    Accept
                  </th>
                )}
                {effectiveShowThresholds && (
                  <th className="px-6 py-3 text-center text-base font-bold text-red-300 uppercase tracking-wider bg-slate-700/80">
                    Abnormal
                  </th>
                )}
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
                  {effectiveShowThresholds && (
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-semibold bg-inherit border-x border-green-100">
                      {item.thresholds.achieve != null ? `>${item.thresholds.achieve}%` : 'N/A'}
                    </td>
                  )}
                  {effectiveShowThresholds && (
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-semibold bg-inherit border-x border-yellow-100">
                      {item.thresholds.acceptMin != null && item.thresholds.acceptMax != null
                        ? `${item.thresholds.acceptMin}-${item.thresholds.acceptMax}%`
                        : 'N/A'}
                    </td>
                  )}
                  {effectiveShowThresholds && (
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-semibold bg-inherit border-x border-red-100">
                      {item.thresholds.abnormal != null ? `<${item.thresholds.abnormal}%` : 'N/A'}
                    </td>
                  )}
                  {tableData.months.map((month) => {
                    const cell = item.months[month.key];
                    return (
                      <td
                        key={month.key}
                        className={`px-6 py-4 whitespace-nowrap text-lg text-center font-bold ${
                          cell !== null ? getCellColor(cell.status) : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {cell !== null ? formatPercentage(cell.value) : ''}
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
              <h1 className="text-3xl font-bold text-gray-900">LAR Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Line Acceptance Rate monitoring and analysis
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
          onApplyFilters={fetchLARData}
          timePeriod={timePeriod}
          loading={loading}
          productionSiteRef={productionSiteRef}
          customerSiteRef={customerSiteRef}
          productFamilyRef={productFamilyRef}
          productTypeRef={productTypeRef}
          modelRef={modelRef}
        />

        {/* Group By / Time Period Bar */}
        <div className="mb-6">
          <GroupByTimePeriodBar
            groupBy={groupBy}
            timePeriod={timePeriod}
            onGroupByChange={setGroupBy}
            onTimePeriodChange={setTimePeriod}
          />
        </div>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* LAR Table */}
        {renderLARTable()}

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

export default LARDashboardPage;
