// client/src/pages/report/TopDefectPage.tsx
// ===== TOP DEFECT REPORT WITH DASHBOARD FILTERS =====

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import reportService, { getTopDefect, getPartsFilterOptions } from '../../services/reportService';
import { getSiteOptions } from '../../services/sysconfigService';
import customerSiteService from '../../services/customerSiteService';
import DashboardFilters from '../../components/dashboard/DashboardFilters';

// ============ INTERFACES ============

interface TopDefectAPIRecord {
  month_year: string;
  model: string;
  defect_id: number;
  defect_name: string;
  defect_description: string;
  total_ng: number;
}

interface TopDefectData {
  product: string;
  months: {
    [key: string]: string | null;
  };
}

// ============ COMPONENT ============

const TopDefectPage: React.FC = () => {
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

  // Available options
  const [availableProductionSites, setAvailableProductionSites] = useState<Array<{ value: string; label: string }>>([]);
  const [availableCustomerSites, setAvailableCustomerSites] = useState<Array<{ value: string; label: string }>>([]);
  const [availableProductFamilies, setAvailableProductFamilies] = useState<Array<{ value: string; label: string }>>([]);
  const [availableProductTypes, setAvailableProductTypes] = useState<Array<{ value: string; label: string }>>([]);

  // Refs for click-outside
  const productionSiteRef = useRef<HTMLDivElement>(null);
  const customerSiteRef = useRef<HTMLDivElement>(null);
  const productFamilyRef = useRef<HTMLDivElement>(null);
  const productTypeRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Data states
  const [topDefectData, setTopDefectData] = useState<TopDefectData[]>([]);
  const [uniqueDefects, setUniqueDefects] = useState<string[]>([]);

  // Dynamic color palette for defects
  const defectColorPalette = [
    { bg: 'bg-gradient-to-br from-red-100 to-red-200', text: 'text-red-900', border: 'border-red-300', swatch: 'from-red-100 to-red-200 border-red-300' },
    { bg: 'bg-gradient-to-br from-amber-100 to-yellow-200', text: 'text-amber-900', border: 'border-yellow-400', swatch: 'from-amber-100 to-yellow-200 border-yellow-400' },
    { bg: 'bg-gradient-to-br from-blue-100 to-blue-200', text: 'text-blue-900', border: 'border-blue-300', swatch: 'from-blue-100 to-blue-200 border-blue-300' },
    { bg: 'bg-gradient-to-br from-purple-100 to-purple-200', text: 'text-purple-900', border: 'border-purple-300', swatch: 'from-purple-100 to-purple-200 border-purple-300' },
    { bg: 'bg-gradient-to-br from-orange-100 to-orange-200', text: 'text-orange-900', border: 'border-orange-300', swatch: 'from-orange-100 to-orange-200 border-orange-300' },
    { bg: 'bg-gradient-to-br from-pink-100 to-pink-200', text: 'text-pink-900', border: 'border-pink-300', swatch: 'from-pink-100 to-pink-200 border-pink-300' },
    { bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200', text: 'text-indigo-900', border: 'border-indigo-300', swatch: 'from-indigo-100 to-indigo-200 border-indigo-300' },
    { bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200', text: 'text-emerald-900', border: 'border-emerald-300', swatch: 'from-emerald-100 to-emerald-200 border-emerald-300' },
    { bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200', text: 'text-cyan-900', border: 'border-cyan-300', swatch: 'from-cyan-100 to-cyan-200 border-cyan-300' },
    { bg: 'bg-gradient-to-br from-teal-100 to-teal-200', text: 'text-teal-900', border: 'border-teal-300', swatch: 'from-teal-100 to-teal-200 border-teal-300' },
    { bg: 'bg-gradient-to-br from-lime-100 to-lime-200', text: 'text-lime-900', border: 'border-lime-300', swatch: 'from-lime-100 to-lime-200 border-lime-300' },
    { bg: 'bg-gradient-to-br from-rose-100 to-rose-200', text: 'text-rose-900', border: 'border-rose-300', swatch: 'from-rose-100 to-rose-200 border-rose-300' },
  ];

  // ============ FETCH DATA ============

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTopDefect({
        dateFrom,
        dateTo,
        models: selectedModels.length > 0 ? selectedModels : undefined,
        productionSites: selectedProductionSites.length > 0 ? selectedProductionSites : undefined,
        customerSites: selectedCustomerSites.length > 0 ? selectedCustomerSites : undefined,
        productFamilies: selectedProductFamilies.length > 0 ? selectedProductFamilies : undefined,
        productTypes: selectedProductTypes.length > 0 ? selectedProductTypes : undefined,
      });

      if (response.success && response.data) {
        const { tableData, defects } = transformAPIDataToTableData(response.data);
        setTopDefectData(tableData);
        setUniqueDefects(defects);
      } else {
        setError(response.message || 'Failed to fetch top defect data');
      }
    } catch (err) {
      setError('Failed to refresh top defect data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ===== INIT: Load production sites =====
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

  // ===== CASCADE 4: Product Types -> Products/Models =====
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
      refreshData();
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

  const generateMonthColumns = (start: string, end: string): string[] => {
    const columns: string[] = [];
    const [startYear, startMonth] = start.split('-').map(Number);
    const [endYear, endMonth] = end.split('-').map(Number);

    let curYear = startYear;
    let curMonth = startMonth;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
      const monthLabel = `${monthNames[curMonth - 1]}'${curYear}`;
      columns.push(monthLabel);
      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }

    return columns;
  };

  const monthColumns = generateMonthColumns(dateFrom, dateTo);

  const getDefectColor = (defect: string | null) => {
    if (defect === null || defect === undefined || defect.trim() === '') {
      return 'bg-gray-600 text-white border border-gray-700';
    }

    if (defect === 'LAR = 100%') {
      return 'bg-gray-500 text-white font-semibold border-2 border-gray-600 shadow-sm';
    }

    if (defect === 'N/A') {
      return 'bg-white text-black font-semibold border-2 border-gray-300 shadow-sm';
    }

    const realDefects = uniqueDefects.filter(d => d !== 'LAR = 100%' && d !== 'N/A');
    const defectIndex = realDefects.indexOf(defect);
    if (defectIndex === -1) {
      return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 font-semibold border-2 border-gray-300 shadow-sm';
    }

    const colorIndex = defectIndex % defectColorPalette.length;
    const color = defectColorPalette[colorIndex];
    return `${color.bg} ${color.text} font-semibold border-2 ${color.border} shadow-sm`;
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

  // ============ DATA TRANSFORMATION ============

  const transformAPIDataToTableData = (apiData: TopDefectAPIRecord[]): { tableData: TopDefectData[], defects: string[] } => {
    // Debug: log unique models from API
    const apiModels = new Set(apiData.map(r => r.model));
    console.log(`[DEBUG] TopDefect API returned ${apiData.length} records, ${apiModels.size} unique models:`, Array.from(apiModels).sort());

    const modelMap = new Map<string, Map<string, string>>();
    const defectSet = new Set<string>();

    apiData.forEach(record => {
      if (!record.model || record.model.trim() === '') return;

      const product = record.model;
      const defectName = record.defect_name && record.defect_name.trim() !== '' ? record.defect_name : 'LAR = 100%';
      defectSet.add(defectName);

      const [year, monthStr] = record.month_year.split('-');
      const month = parseInt(monthStr);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[month - 1]}'${year}`;

      if (!modelMap.has(product)) {
        modelMap.set(product, new Map<string, string>());
      }

      const productMonths = modelMap.get(product)!;
      if (!productMonths.has(monthLabel) || record.total_ng > 0) {
        productMonths.set(monthLabel, defectName);
      }
    });

    const tableData = Array.from(modelMap.entries())
      .map(([product, monthsMap]) => ({
        product,
        months: Object.fromEntries(monthsMap)
      }))
      .sort((a, b) => a.product.localeCompare(b.product));

    const defects = Array.from(defectSet).sort();

    console.log(`[DEBUG] TopDefect transform result: ${tableData.length} products in table, models:`, tableData.map(t => t.product));
    return { tableData, defects };
  };

  // ============ RENDER ============

  // Filter table data by latest month if checkbox is checked
  const latestMonth = monthColumns[monthColumns.length - 1];
  const filteredTopDefectData = latestMonthOnly
    ? topDefectData.filter(item => {
        const defect = item.months[latestMonth];
        return defect !== undefined && defect !== null;
      })
    : topDefectData;

  const renderTopDefectTable = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Defect by Product ({filteredTopDefectData.length})
          </h3>
          <div className="flex items-center space-x-4">
            {uniqueDefects.length > 0 && (
              <div className="flex items-center flex-wrap gap-3 text-sm">
                {uniqueDefects.filter(d => d !== 'LAR = 100%' && d !== 'N/A').map((defect, index) => {
                  const colorIndex = index % defectColorPalette.length;
                  const color = defectColorPalette[colorIndex];
                  return (
                    <div key={defect} className="flex items-center">
                      <div className={`w-3 h-3 bg-gradient-to-br ${color.swatch} border rounded mr-1.5`}></div>
                      <span className="text-gray-700 font-medium">{defect}</span>
                    </div>
                  );
                })}
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 border border-gray-600 rounded mr-1.5"></div>
                  <span className="text-gray-600 font-medium">LAR = 100%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-1.5"></div>
                  <span className="text-gray-600 font-medium">N/A</span>
                </div>
              </div>
            )}
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
              onClick={refreshData}
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

      <div className="overflow-x-auto">
        {filteredTopDefectData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                <th className="px-6 py-3 text-left text-base font-bold text-white uppercase tracking-wider sticky left-0 bg-slate-700 z-10 border-r border-slate-600">
                  Product
                </th>
                {monthColumns.map((month) => (
                  <th key={month} className="px-6 py-3 text-center text-base font-bold text-white uppercase tracking-wider">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTopDefectData.map((item, index) => (
                <tr key={item.product} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                    {item.product}
                  </td>
                  {monthColumns.map((month) => {
                    const defect = item.months[month] || 'N/A';
                    return (
                      <td
                        key={month}
                        className={`px-6 py-4 whitespace-nowrap text-lg text-center ${getDefectColor(defect)}`}
                      >
                        {defect}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Top Defect Report</h1>
              <p className="text-gray-600 mt-2">
                Top defects by product
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
          onApplyFilters={refreshData}
          loading={loading}
          productionSiteRef={productionSiteRef}
          customerSiteRef={customerSiteRef}
          productFamilyRef={productFamilyRef}
          productTypeRef={productTypeRef}
          modelRef={modelRef}
        />

        {/* Top Defect Table */}
        {renderTopDefectTable()}
      </div>
    </div>
  );
};

export default TopDefectPage;
