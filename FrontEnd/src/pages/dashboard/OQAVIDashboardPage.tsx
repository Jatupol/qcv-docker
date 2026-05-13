// client/src/pages/dashboard/OQAVIDashboardPage.tsx
// ===== OQA VISUAL INSPECTION DASHBOARD =====
// Combo charts (DPPM bar + LAR% line) per model, grouped by month_year

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import reportService, { getPartsFilterOptions } from '../../services/reportService';
import { getSiteOptions } from '../../services/sysconfigService';
import customerSiteService from '../../services/customerSiteService';
import DashboardFilters from '../../components/dashboard/DashboardFilters';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { formatDateTimeFull } from '../../utils/formatUtils';
import { formatNumber } from '../../utils';

// ============ INTERFACES ============

interface ModalData {
  model: string;
  records: OQAVIRecord[];
  highlightMonth?: string;
}

interface OQAVIRecord {
  month_year: string;
  product_family: string;
  customer_site: string;
  site: string;
  model: string;
  total_pass_lot: number;
  total_lot: number;
  lar: number;
  total_ng: number;
  total_inspection: number;
  dppm: number;
}

interface OQAVIDashboardProps {
  isCustomerReport?: boolean;
}

// ============ COMPONENT ============

const OQAVIDashboardPage: React.FC<OQAVIDashboardProps> = ({ isCustomerReport = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  // Cascading filter states
  const [selectedProductionSites, setSelectedProductionSites] = useState<string[]>([]);
  const [selectedCustomerSites, setSelectedCustomerSites] = useState<string[]>([]);
  const [selectedProductFamilies, setSelectedProductFamilies] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);

  // Show/hide dropdowns
  const [showProductionSiteSelect, setShowProductionSiteSelect] = useState(false);
  const [showCustomerSiteSelect, setShowCustomerSiteSelect] = useState(false);
  const [showProductFamilySelect, setShowProductFamilySelect] = useState(false);
  const [showProductTypeSelect, setShowProductTypeSelect] = useState(false);

  // Available options for filters
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

  // Data state
  const [viData, setViData] = useState<OQAVIRecord[]>([]);

  // Modal state
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // ============ FETCH DATA ============

  const fetchVIData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await reportService.getOQAVIDashboard({
        dateFrom,
        dateTo,
        models: selectedModels.length > 0 ? selectedModels : undefined,
        isCustomerReport,
        productionSites: selectedProductionSites.length > 0 ? selectedProductionSites : undefined,
        customerSites: selectedCustomerSites.length > 0 ? selectedCustomerSites : undefined,
        productFamilies: selectedProductFamilies.length > 0 ? selectedProductFamilies : undefined,
        productTypes: selectedProductTypes.length > 0 ? selectedProductTypes : undefined,
      });

      if (result.success && result.data) {
        const normalizedData = result.data.map((item: any) => ({
          ...item,
          lar: typeof item.lar === 'string' ? parseFloat(item.lar) : item.lar,
          dppm: typeof item.dppm === 'string' ? parseFloat(item.dppm) : item.dppm,
          total_pass_lot: typeof item.total_pass_lot === 'string' ? parseInt(item.total_pass_lot) : item.total_pass_lot,
          total_lot: typeof item.total_lot === 'string' ? parseInt(item.total_lot) : item.total_lot,
          total_ng: typeof item.total_ng === 'string' ? parseInt(item.total_ng) : item.total_ng,
          total_inspection: typeof item.total_inspection === 'string' ? parseInt(item.total_inspection) : item.total_inspection,
        }));
        setViData(normalizedData);
      } else {
        setError(result.message || 'Failed to fetch OQA VI data');
      }
    } catch (err) {
      setError('Failed to refresh OQA Visual Inspection data');
    } finally {
      setLoading(false);
    }
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
        setSelectedProductionSites(opts.map(s => s.value));
      } catch (err) {
        console.error('Error fetching site options:', err);
      }
    };
    loadSites();
  }, []);

  // ===== CASCADE 1: Production Sites -> Customer Sites =====
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

  // ===== CASCADE 2: Customer Sites -> Product Families =====
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

  // ===== CASCADE 3: Product Families -> Product Types =====
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

  // ===== CASCADE 4: Product Types -> Models =====
  useEffect(() => {
    setAvailableModels([]);
    setSelectedModels([]);

    if (selectedProductTypes.length === 0) return;

    const fetchModels = async () => {
      try {
        const result = await reportService.getModelsLAR({
          isCustomerReport,
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
      fetchVIData();
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

  // ============ HELPERS ============

  const formatMonthYear = (monthYear: string): string => {
    // Convert "202411" or "2024-11" to "Nov'2024"
    let year: string, month: string;
    if (monthYear.includes('-')) {
      [year, month] = monthYear.split('-');
    } else if (monthYear.length === 6) {
      year = monthYear.substring(0, 4);
      month = monthYear.substring(4, 6);
    } else {
      return monthYear;
    }
    const date = new Date(`${year}-${month}-01`);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    return `${monthName}'${year}`;
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
    setSelectedModels([]);
    setDateFrom(`${currentYear}-01`);
    setDateTo(`${currentYear}-${currentMonth}`);
    setSelectedProductionSites([]);
    setSelectedCustomerSites([]);
    setSelectedProductFamilies([]);
    setSelectedProductTypes([]);
  };

  // ============ CUSTOM LABEL RENDERER ============

  const renderBoxLabel = (color: string, offsetY: number) => (props: any) => {
    const { x, y, value } = props;
    if (value == null) return null;
    const text = `${value}%`;
    const boxW = text.length * 6.5 + 8;
    const boxH = 16;
    const bx = x - boxW / 2;
    const by = y + offsetY - boxH / 2;
    return (
      <g>
        <rect x={bx} y={by} width={boxW} height={boxH} rx={2} fill="#fff" stroke={color} strokeWidth={1.5} />
        <text x={x} y={by + boxH / 2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 10, fill: color, fontWeight: 600 }}>{text}</text>
      </g>
    );
  };

  // ============ SITE COLORS ============

  const SITE_COLOR_MAP: Record<string, { bar: string; line: string }> = {
    JNHK: { bar: '#2563EB', line: '#3B82F6' },   // Blue theme
    TNHK: { bar: '#EA580C', line: '#F97316' },   // Orange theme
  };
  const DEFAULT_SITE_COLORS = [
    { bar: '#8E44AD', line: '#A855F7' },
    { bar: '#27AE60', line: '#22C55E' },
    { bar: '#C0392B', line: '#EF4444' },
    { bar: '#2C3E50', line: '#64748B' },
  ];

  const getSiteColors = (site: string, fallbackIdx: number) => {
    if (SITE_COLOR_MAP[site]) return SITE_COLOR_MAP[site];
    return DEFAULT_SITE_COLORS[fallbackIdx % DEFAULT_SITE_COLORS.length];
  };

  // ============ GROUP DATA BY PRODUCT FAMILY -> MODEL ============

  const getFamilyModelGroups = (): Map<string, Map<string, OQAVIRecord[]>> => {
    const families = new Map<string, Map<string, OQAVIRecord[]>>();
    viData.forEach(record => {
      const family = record.product_family || 'Other';
      if (!families.has(family)) {
        families.set(family, new Map<string, OQAVIRecord[]>());
      }
      const modelMap = families.get(family)!;
      const existing = modelMap.get(record.model) || [];
      existing.push(record);
      modelMap.set(record.model, existing);
    });
    return families;
  };

  // Build pivoted chart data for a model: one row per month, columns per site
  const buildModelChartData = (records: OQAVIRecord[]) => {
    const sites = Array.from(new Set(records.map(r => r.site))).sort();
    const months = Array.from(new Set(records.map(r => r.month_year))).sort();

    const chartData = months.map(m => {
      const row: Record<string, any> = { month: formatMonthYear(m) };
      sites.forEach(site => {
        const rec = records.find(r => r.month_year === m && r.site === site);
        row[`dppm_${site}`] = rec ? Math.round(rec.dppm) : null;
        row[`lar_${site}`] = rec ? parseFloat(rec.lar.toFixed(2)) : null;
      });
      return row;
    });

    return { chartData, sites };
  };

  const familyGroups = getFamilyModelGroups();

  // Handle chart data point click - open modal with model summary
  const handleChartClick = (model: string, records: OQAVIRecord[], monthLabel?: string) => {
    // Reverse-lookup month_year from formatted label
    const allMonths = Array.from(new Set(records.map(r => r.month_year))).sort();
    const highlightMonth = monthLabel
      ? allMonths.find(m => formatMonthYear(m) === monthLabel)
      : undefined;
    setModalData({ model, records, highlightMonth });
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isCustomerReport ? 'Customer Graph OQA' : 'Graph OQA'}
              </h1>
              <p className="mt-2 text-gray-600">
                DPPM and LAR% trend by model (Only Round 1) {isCustomerReport ? ' (Customer Report)' : ''}
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
            selectedModels,
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
          onApplyFilters={fetchVIData}
          loading={loading}
          productionSiteRef={productionSiteRef}
          customerSiteRef={customerSiteRef}
          productFamilyRef={productFamilyRef}
          productTypeRef={productTypeRef}
          modelRef={modelRef}
        />

        {/* Charts grouped by Product Family, multi-bar per site */}
        {viData.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">No data available for the selected filters</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Array.from(familyGroups.entries()).map(([family, modelMap]) => (
              <div key={family}>
                {/* Product Family Header */}
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">{family}</h2>
                  <span className="text-xs text-gray-500">({modelMap.size})</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Model Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Array.from(modelMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([model, records]) => {
                    const { chartData, sites } = buildModelChartData(records);

                    const allDppmValues = sites.flatMap(site =>
                      chartData.map(d => d[`dppm_${site}`] as number).filter(v => v != null)
                    );
                    const maxDppm = Math.max(...allDppmValues, 100);
                    const yAxisMaxDppm = Math.ceil(maxDppm / 100) * 100;

                    return (
                      <Card key={model} className="overflow-hidden">
                        <div className="px-3 py-1.5 border-b border-gray-200 bg-gray-50">
                          <h3 className="text-sm font-semibold text-gray-900 text-center">
                            {model}
                            {sites.length > 1 && (
                              <span className="ml-1.5 text-xs font-normal text-gray-400">({sites.join(', ')})</span>
                            )}
                          </h3>
                        </div>
                        <div className="px-2 py-1">
                          <ResponsiveContainer width="100%" height={240}>
                            <ComposedChart
                              data={chartData}
                              margin={{ top: 20, right: 5, left: -5, bottom: 0 }}
                              barCategoryGap="20%"
                              onClick={(e: any) => {
                                if (e?.activeLabel) handleChartClick(model, records, e.activeLabel);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 9 }}
                                angle={-35}
                                textAnchor="end"
                                height={40}
                                interval={0}
                                padding={{ left: 30, right: 30 }}
                              />
                              <YAxis
                                yAxisId="left"
                                domain={[0, 100]}
                                tick={{ fontSize: 9 }}
                                width={30}
                                tickFormatter={(v: number) => `${v}`}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, yAxisMaxDppm]}
                                tick={{ fontSize: 9 }}
                                width={35}
                              />
                              <Tooltip
                                contentStyle={{ fontSize: 11, padding: '4px 8px' }}
                                formatter={(value: number, name: string) => {
                                  if (name.startsWith('LAR%')) return [`${value.toFixed(2)}%`, name];
                                  return [value.toLocaleString(), name];
                                }}
                              />
                              <Legend
                                iconSize={10}
                                wrapperStyle={{ fontSize: 10, paddingTop: 0 }}
                              />
                              {sites.map((site, idx) => {
                                const colors = getSiteColors(site, idx);
                                return (
                                  <Bar
                                    key={`dppm-${site}`}
                                    yAxisId="right"
                                    dataKey={`dppm_${site}`}
                                    name={`DPPM ${site}`}
                                    fill={colors.bar}
                                    barSize={sites.length > 1 ? 45 : 60}
                                  >
                                    <LabelList dataKey={`dppm_${site}`} position="inside" style={{ fontSize: 12, fill: '#ffffff', fontWeight: 'bold' }} formatter={(v: number) => v?.toLocaleString()} />
                                  </Bar>
                                );
                              })}
                              {sites.map((site, idx) => {
                                const colors = getSiteColors(site, idx);
                                return (
                                  <Line
                                    key={`lar-${site}`}
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey={`lar_${site}`}
                                    name={`LAR% ${site}`}
                                    stroke={colors.line}
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: colors.line }}
                                    connectNulls
                                  >
                                    <LabelList dataKey={`lar_${site}`} content={renderBoxLabel(colors.line, idx % 2 === 0 ? -16 : 16)} />
                                  </Line>
                                );
                              })}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDateTimeFull(new Date())} | Data refreshed on demand
          </p>
        </div>
      </div>

      {/* Data Source Modal */}
      {modalData && (() => {
        const modalSites = Array.from(new Set(modalData.records.map(r => r.site))).sort();
        const siteColorMap: Record<string, string> = {};
        modalSites.forEach((site, idx) => {
          siteColorMap[site] = getSiteColors(site, idx).bar;
        });
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setModalData(null)}>
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-800 rounded-t-lg">
                <div>
                  <h3 className="text-lg font-bold text-white">{modalData.model}</h3>
                  <p className="text-sm text-slate-300">Data source summary by month and site</p>
                </div>
                <button onClick={() => setModalData(null)} className="p-1 hover:bg-slate-600 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Modal Body */}
              <div className="overflow-auto flex-1 p-4">
                <table className="min-w-full divide-y divide-gray-300 text-sm">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="px-3 py-2 text-left font-semibold">Month</th>
                      <th className="px-3 py-2 text-left font-semibold">Site</th>
                      <th className="px-3 py-2 text-right font-semibold">Total Lot</th>
                      <th className="px-3 py-2 text-right font-semibold">Pass Lot</th>
                      <th className="px-3 py-2 text-right font-semibold">LAR%</th>
                      <th className="px-3 py-2 text-right font-semibold">Total Insp.</th>
                      <th className="px-3 py-2 text-right font-semibold">Total NG</th>
                      <th className="px-3 py-2 text-right font-semibold">DPPM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...modalData.records]
                      .sort((a, b) => a.month_year.localeCompare(b.month_year) || a.site.localeCompare(b.site))
                      .map((r, i) => {
                        const isHighlight = modalData.highlightMonth === r.month_year;
                        const rowColor = siteColorMap[r.site] || '#374151';
                        return (
                          <tr key={i} className={isHighlight ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ color: rowColor }}>
                            <td className="px-3 py-2 font-semibold">{formatMonthYear(r.month_year)}</td>
                            <td className="px-3 py-2 font-bold">{r.site}</td>
                            <td className="px-3 py-2 text-right">{r.total_lot != null ? formatNumber(r.total_lot.toString(), 0) : '-'}</td>
                            <td className="px-3 py-2 text-right">{r.total_pass_lot != null ? formatNumber(r.total_pass_lot.toString(), 0) : '-'}</td>
                            <td className="px-3 py-2 text-right font-semibold">{r.lar != null ? `${r.lar.toFixed(2)}%` : '-'}</td>
                            <td className="px-3 py-2 text-right">{r.total_inspection != null ? formatNumber(r.total_inspection.toString(), 0) : '-'}</td>
                            <td className="px-3 py-2 text-right">{r.total_ng != null ? formatNumber(r.total_ng.toString(), 0) : '-'}</td>
                            <td className="px-3 py-2 text-right font-semibold">{r.dppm != null ? formatNumber(Math.round(r.dppm).toString(), 0) : '-'}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OQAVIDashboardPage;
