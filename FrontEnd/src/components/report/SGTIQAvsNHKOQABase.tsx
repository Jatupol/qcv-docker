// client/src/components/report/SGTIQAvsNHKOQABase.tsx
 

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getMonthTrendName, formatNumber } from '../../utils';
import { getTodayDateString, formatDateTime } from '../../utils/formatUtils';
import { type DefectLegendItem, type IQAOQADPPMOverallRecord } from '../../types/report';

// ============ TYPE DEFINITIONS ============

export interface IQAOQADPPMOverallData  extends IQAOQADPPMOverallRecord{
  isHighlighted?: string;
}

export interface DataSourceFunctions {
  fetchChartData: (params: any) => Promise<any>;
  fetchFiscalYears: () => Promise<any>;
  fetchWorkWeeks: (year: string) => Promise<any>;
}

export interface SGTIQAvsNHKOQAConfig {
  // Report metadata
  title: string;
  breadcrumbTitle: string;

  // Data source configuration
  dataSource: DataSourceFunctions;

  // Filter configuration
  showFiscalYearFilter: boolean;
  showWorkWeekFilter: boolean;
  fiscalYearRequired: boolean;
  workWeekRequired: boolean;

  // Default date range (for customer reports)
  defaultDateRange?: {
    yearTo: string;
    wwTo: string;
  };

  // Auto-load data on mount (for customer reports)
  autoLoadOnMount?: boolean;

  // Additional parameters to pass to API calls
  additionalParams?: Record<string, any>;

  // Shared filters from parent (for embedded mode)
  sharedFilters?: {
    fiscalYear: string;
    workWeek: string;
  };

  // UI visibility options (for embedded mode in combined reports)
  hideUI?: {
    breadcrumb?: boolean;
    filters?: boolean;
    exportButton?: boolean;
    header?: boolean;
  };
}

export interface SGTIQAvsNHKOQABaseProps {
  config: SGTIQAvsNHKOQAConfig;
}

// ============ MAIN COMPONENT ============

const SGTIQAvsNHKOQABase: React.FC<SGTIQAvsNHKOQABaseProps> = ({ config }) => {
  const [loading, setLoading] = useState(false);
  const [oqaData, setOqaData] = useState<IQAOQADPPMOverallData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states - initialize with defaults if provided, prefer sharedFilters
  const [fiscalYear, setFiscalYear] = useState<string>(
    config.sharedFilters?.fiscalYear || config.defaultDateRange?.yearTo || ''
  );
  const [ww, setWw] = useState<string>(
    config.sharedFilters?.workWeek || config.defaultDateRange?.wwTo || ''
  );
  const [availableFiscalYears, setAvailableFiscalYears] = useState<string[]>([]);
  const [availableWorkWeeks, setAvailableWorkWeeks] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  // ============ DATA FETCHING ============

  // Handle shared filters from parent component (for embedded mode)
  useEffect(() => {
    if (config.sharedFilters) {
      console.log('🔄 Using shared filters:', config.sharedFilters);
      setFiscalYear(config.sharedFilters.fiscalYear);
      setWw(config.sharedFilters.workWeek);

      // Auto-fetch data
      setTimeout(() => {
        fetchData();
      }, 100);
    }
  }, [config.sharedFilters?.fiscalYear, config.sharedFilters?.workWeek]);

  // Fetch available filters on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      console.log('🔄 Fetching available filters...');

      // Fetch fiscal years
      const fyResult = await config.dataSource.fetchFiscalYears();
      console.log('📊 Fiscal Years API result:', fyResult);
      if (fyResult.success && fyResult.data) {
        console.log(`✅ Setting ${fyResult.data.length} fiscal years:`, fyResult.data);
        setAvailableFiscalYears(fyResult.data);
      } else {
        console.warn('⚠️ Failed to fetch fiscal years:', fyResult.message);
      }
    };
    fetchFilters();
  }, [config.dataSource]);

  // Fetch work weeks when fiscal year changes
  useEffect(() => {
    // Helper to find matching ww value in list (handles format differences: "01" vs "1")
    const findMatchingWw = (wwValue: string, list: string[]): string | undefined => {
      if (!wwValue) return undefined;
      const wwNum = parseInt(wwValue, 10).toString(); // Normalize: "01" -> "1"
      return list.find(item => parseInt(item, 10).toString() === wwNum);
    };

    const fetchWorkWeeks = async () => {
      if (fiscalYear) {
        console.log('🔄 Fetching work weeks for fiscal year:', fiscalYear);
        const wwResult = await config.dataSource.fetchWorkWeeks(fiscalYear);
        console.log('📊 Work Weeks API result:', wwResult);
        if (wwResult.success && wwResult.data && wwResult.data.length > 0) {
          console.log(`✅ Setting ${wwResult.data.length} work weeks:`, wwResult.data);
          setAvailableWorkWeeks(wwResult.data);

          // Check if current ww or default exists in the list
          const defaultWw = config.defaultDateRange?.wwTo;
          console.log(`🔍 Current ww: "${ww}", Default ww: "${defaultWw}"`);

          const currentMatchingWw = findMatchingWw(ww, wwResult.data);
          const defaultMatchingWw = findMatchingWw(defaultWw || '', wwResult.data);

          console.log(`🔍 Current matching: "${currentMatchingWw}", Default matching: "${defaultMatchingWw}"`);

          if (currentMatchingWw) {
            // Current ww exists in list - normalize format to match dropdown options
            if (ww !== currentMatchingWw) {
              console.log(`🔄 Normalizing ww: "${ww}" -> "${currentMatchingWw}"`);
              setWw(currentMatchingWw);
            }
          } else if (defaultMatchingWw) {
            // Use default if current doesn't exist
            console.log(`🔄 Setting ww to default: "${defaultMatchingWw}"`);
            setWw(defaultMatchingWw);
          } else if (config.defaultDateRange?.wwTo) {
            // Default week not in list - select the most recent available week
            const sortedWeeks = [...wwResult.data].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
            const mostRecentWw = sortedWeeks[0];
            console.log(`🔄 Default ww not available, selecting most recent: "${mostRecentWw}"`);
            setWw(mostRecentWw);
          } else {
            setWw('');
          }
        } else {
          console.warn('⚠️ Failed to fetch work weeks or empty list:', wwResult.message);
          setAvailableWorkWeeks([]);
        }
      } else {
        setAvailableWorkWeeks([]);
        setWw('');
      }
    };
    fetchWorkWeeks();
  }, [fiscalYear, config.dataSource]);

  // Auto-load data on mount if configured
  useEffect(() => {
    if (config.autoLoadOnMount && !initialLoadDone && fiscalYear && ww) {
      console.log('🔄 Auto-loading report data...');
      fetchReportData();
      setInitialLoadDone(true);
    }
  }, [config.autoLoadOnMount, initialLoadDone, fiscalYear, ww]);

  // Fetch report data
  // Optimized html2canvas configuration for high-quality PDF export
  const getOptimizedHtml2CanvasOptions = (element: HTMLElement, identifier?: string, highResolution: boolean = false, isTable: boolean = false, isChart: boolean = false) => ({
    scale: highResolution ? (isChart ? 4.0 : 2.5) : 0.2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 0,
    removeContainer: true,
    svgRendering: true,
    foreignObjectRendering: false,
    ignoreElements: (el: Element) => {
      const htmlEl = el as HTMLElement;
      return htmlEl.classList?.contains('hidden') ||
             htmlEl.style?.display === 'none' ||
             htmlEl.classList?.contains('tooltip') ||
             htmlEl.classList?.contains('recharts-tooltip-wrapper');
    },
    onclone: (clonedDoc: Document) => {
      if (identifier) {
        const clonedElement = clonedDoc.querySelector(identifier) as HTMLElement;
        if (clonedElement) {
          clonedElement.style.animation = 'none';
          clonedElement.style.transition = 'none';
          clonedElement.style.background = 'white';
          clonedElement.style.backgroundImage = 'none';

          const allGradients = clonedElement.querySelectorAll('[class*="bg-gradient"]');
          allGradients.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.closest('svg') && htmlEl.tagName !== 'svg') {
              htmlEl.style.background = 'white';
              htmlEl.style.backgroundImage = 'none';
              htmlEl.style.backgroundColor = 'white';
            }
          });
        }
      }
    }
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching report data...');

      // Build query parameters
      const queryParams: any = { ...config.additionalParams };

      if (fiscalYear) {
        queryParams.yearTo = fiscalYear;
      }

      if (ww) queryParams.wwTo = ww;

      console.log('🔒 API Request Parameters:', queryParams);
      console.log('🔒 fiscalYear:', fiscalYear, 'ww:', ww);

      // Fetch chart data from API
      const result = await config.dataSource.fetchChartData(queryParams);
      console.log('📊 Chart API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        console.log(`✅ Data fetched: ${result.data.length} records`);
        console.log('📋 First record data sample:', result.data[0]);

        // Group data by yearmonth
        const monthMap = new Map<string, IQAOQADPPMOverallData>();

        for (const record of result.data) {
          if (!monthMap.has(record.yearmonth)) {
            monthMap.set(record.yearmonth, {
              yearmonth: record.yearmonth,
              dppmTarget: record.dppmTarget,
              dppm_oqa: parseFloat(String(record.dppm_oqa)) || 0,
              dppm_iqa: parseFloat(String(record.dppm_iqa)) || 0,
            });
          }
        }



        const transformedData: IQAOQADPPMOverallData[] = Array.from(monthMap.values());

        console.log('🔄 Transformed data:', transformedData);
        setOqaData(transformedData);
        console.log('✅ oqaData state updated');
      } else {
        const errorMsg = result.message || 'No data available in database';
        console.warn('⚠️ Fetch warning:', errorMsg);
        setError(errorMsg);
        setOqaData([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching data';
      console.error('❌ Fetch exception:', errorMsg);
      setError(errorMsg);
      setOqaData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ CHART DATA TRANSFORMATION ============

  const chartData = oqaData.map(item => ({
    yearmonth: item.yearmonth,
    displayMonth: getMonthTrendName(item.yearmonth),
    dppm_oqa: item.dppm_oqa,
    dppm_iqa: item.dppm_iqa,
    dppmTarget: item.dppmTarget || 150,
    isHighlighted: item.isHighlighted
  }));


  // ============ CUSTOM TOOLTIP ============

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-2">{data.displayMonth}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-orange-600">NHK: {formatNumber((data.dppm_oqa || 0).toFixed(2))}</p>
            <p className="text-orange-600">SGT: {formatNumber((data.dppm_iqa || 0).toFixed(2))}</p>
            <p className="text-gray-600">DPPM Target: {data.dppmTarget || 150}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // ============ RENDER METHODS ============

  const renderHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-600 mt-1">Trend Analysis</p>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => {
    const isFilterValid = (): boolean => {
      let valid = true;
      if (config.fiscalYearRequired && !fiscalYear) valid = false;
      if (config.workWeekRequired && !ww) valid = false;
      return valid;
    };

    const handleApplyFilters = () => {
      // Validate all required fields
      if (config.fiscalYearRequired && !fiscalYear) {
        alert('Please select Fiscal Year');
        return;
      }
      if (config.workWeekRequired && !ww) {
        alert('Please select WW');
        return;
      }

      // All validations passed, fetch data
      fetchReportData();
    };

    const handleClearFilters = () => {
      setFiscalYear('');
      setWw('');
    };

    const handleExportPDF = async () => {
      if (!contentRef.current || oqaData.length === 0) {
        alert('No data to export');
        return;
      }

      setExportingPDF(true);
      setExportProgress(0);

      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const footerHeight = 15;
        let yPosition = margin;

        const addPageFooter = (currentPage: number, totalPages: number) => {
          const footerY = pageHeight - 8;
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(config.title, margin, footerY);
          const dateStr = formatDateTime(new Date());
          pdf.text(`Generated: ${dateStr}`, pageWidth / 2, footerY, { align: 'center' });
          pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
          pdf.setTextColor(0, 0, 0);
        };

        setExportProgress(10);

        pdf.setFontSize(16);
        pdf.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        pdf.setFontSize(10);
        if (fiscalYear) {
          pdf.text(`Fiscal Year: ${fiscalYear}${ww ? ` / WW${ww.padStart(2, '0')}` : ''}`, margin, yPosition);
          yPosition += 10;
        }

        setExportProgress(20);

        // Wait for DOM to fully render
        await new Promise(resolve => setTimeout(resolve, 500));

        const maxContentHeight = pageHeight - margin - footerHeight;

        // Capture chart and table elements
        const chartElement = contentRef.current?.querySelector('[data-chart="main"]') as HTMLElement;
        const tableElement = contentRef.current?.querySelector('[data-table="main"]') as HTMLElement;

        if (chartElement && tableElement) {
          // Force chart re-render by temporarily hiding/showing
          chartElement.style.visibility = 'hidden';
          await new Promise(resolve => setTimeout(resolve, 100));
          chartElement.style.visibility = 'visible';

          // Wait longer for ALL SVG paths to fully render
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Force another layout recalculation
          chartElement.getBoundingClientRect();

          // Capture chart and table in parallel with high quality
          const [chartCanvas, tableCanvas] = await Promise.all([
            html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, '[data-chart="main"]', true, false, true) as any),
            html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, '[data-table="main"]', true, true, false) as any)
          ]);

          setExportProgress(60);

          // Convert to JPEG for smaller file size
          const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
          const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);

          const chartImgWidth = pageWidth - (2 * margin);
          const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width;

          const tableImgWidth = pageWidth - (2 * margin);
          const tableImgHeight = (tableCanvas.height * tableImgWidth) / tableCanvas.width;

          // Add chart
          if (yPosition + chartImgHeight > maxContentHeight) {
            pdf.addPage('p');
            yPosition = margin;
          }
          pdf.addImage(chartImgData, 'JPEG', margin, yPosition, chartImgWidth, chartImgHeight);
          yPosition += chartImgHeight + 5;

          // Add table
          if (yPosition + tableImgHeight > maxContentHeight) {
            pdf.addPage('p');
            yPosition = margin;
          }
          pdf.addImage(tableImgData, 'JPEG', margin, yPosition, tableImgWidth, tableImgHeight);
        }

        setExportProgress(90);

        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          addPageFooter(i, totalPages);
        }

        const dateStr = getTodayDateString();
        const filename = `SGT_IQA_vs_NHK_OQA_Report_${dateStr}.pdf`;
        pdf.save(filename);

        setExportProgress(100);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
      } finally {
        setTimeout(() => {
          setExportingPDF(false);
          setExportProgress(0);
        }, 500);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Default Date Range Display (when filters are hidden) */}
          {!config.showFiscalYearFilter && !config.showWorkWeekFilter && config.defaultDateRange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">FY/WW:</span>
              <span className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                FY{config.defaultDateRange.yearTo} / WW{config.defaultDateRange.wwTo.padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Fiscal Year */}
          {config.showFiscalYearFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">FY:</span>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select</option>
                {availableFiscalYears.map((fy) => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </div>
          )}

          {/* WW */}
          {config.showWorkWeekFilter && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">WW:</span>
                <select
                  value={ww}
                  onChange={(e) => setWw(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
                  disabled={!fiscalYear}
                >
                  <option value="">{fiscalYear ? 'Select' : 'FY first'}</option>
                  {availableWorkWeeks.map((ww) => (
                    <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyFilters}
              disabled={!isFilterValid()}
              className="px-3 py-1 text-sm bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm bg-orange-500 text-white font-medium rounded hover:bg-orange-600"
            >
              Clear
            </button>
            {!config.hideUI?.exportButton && (
              <button
                onClick={handleExportPDF}
                disabled={oqaData.length === 0 || exportingPDF}
                className="px-3 py-1 text-sm bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {exportingPDF ? (
                  <>
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : 'PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-300 p-6 mb-6" data-chart="main">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          {config.title}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
           {/* Period: Apr'24 - May'24 */}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full relative">
        {/* Background green area */}
        <div className="absolute inset-0 bg-green-100 opacity-30 rounded"></div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 80, left: 60, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="displayMonth"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              angle={0}
              textAnchor="middle"
              height={60}
              interval={0}
            />
            {/* Left Y-axis for DPPM */}
            <YAxis
              yAxisId="left"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              label={{
                value: 'DPPM',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
              }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="rect"
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            />



            {/* DPPM Target Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="dppmTarget"
              stroke="#EF4444"
              strokeWidth={4}
              strokeDasharray="8 4"
              name="DPPM Target (150)"
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />

            {/* NHK DPPM Bar */}
            <Bar
              yAxisId="left"
              dataKey="dppm_oqa"
              fill="#211ed1ff"
              name="NHK DPPM"
              label={{
                position: 'top',
                content: ({ x, y, width, value }: any) => (
                  <text
                    x={x + width / 2}
                    y={y - 5}
                    fill="#211ed1ff"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value.toFixed(0)}
                  </text>
                )
              }}
            />
            {/* SGT DPPM Bar */}
            <Bar
              yAxisId="left"
              dataKey="dppm_iqa"
              fill="#8B5CF6"
              name="SGT DPPM"
              label={{
                position: 'top',
                content: ({ x, y, width, value }: any) => (
                  <text
                    x={x + width / 2}
                    y={y - 5}
                    fill="#8B5CF6"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value.toFixed(0)}
                  </text>
                )
              }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderSummaryCards = () => {
    // Get current FY/WW data
    const currentData = oqaData.find(item => {
      const monthWW = item.yearmonth.slice(-2);
      return monthWW === ww.padStart(2, '0');
    }) || (oqaData.length > 0 ? oqaData[0] : null);



    const fyww = fiscalYear && ww ? `${fiscalYear}/WW${ww.padStart(2, '0')}` : ww || 'N/A';

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FYWW Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Fiscal Year / Work Week</p>
              <p className="text-3xl font-bold text-white mt-2 drop-shadow-md">{fyww}</p>
            </div>
          </div>
        </div>

        {/* Total NG Card */}
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    const metrics = [
      { key: 'dppm_oqa', label: 'NHK DPPM', format: (val: number) => Math.round(val).toString() },
      { key: 'dppm_iqa', label: 'SGT DPPM', format: (val: number) => Math.round(val).toString() },
      { key: 'dppmTarget', label: 'DPPM Target', format: (val: number) => Math.round(val || 150).toString() },
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden" data-table="main">
        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
          <h3 className="text-lg font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
            Data Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-gray-300 w-48">
                  Metric
                </th>
                {oqaData.map((item, index) => (
                  <th
                    key={`${item.yearmonth}-${index}`}
                    className="px-3 py-2.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-gray-300 min-w-20"
                  >
                    {getMonthTrendName(item.yearmonth)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Metric Rows */}
              {metrics.map((metric, metricIndex) => (
                <tr
                  key={metric.key}
                  className={`border-b border-gray-200 ${metricIndex % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-slate-900 border-r border-gray-300">
                    {metric.label}
                  </td>
                  {oqaData.map((item, index) => {
                    const value = item[metric.key as keyof IQAOQADPPMOverallData] as number;

                    return (
                      <td
                        key={`${item.yearmonth}-${index}`}
                        className="px-3 py-2.5 whitespace-nowrap text-center text-sm font-medium text-slate-700 border-r border-gray-300"
                      >
                        {formatNumber(metric.format(value))}
                      </td>
                    );
                  })}
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============

  console.log('🎨 Rendering SGTIQAvsNHKOQABase - loading:', loading, 'oqaData.length:', oqaData.length);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold">Loading Report...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && oqaData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Reports</span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">{config.breadcrumbTitle}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Filters */}
          {renderFilters()}

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State Card */}
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl shadow-2xl border-4 border-yellow-300 p-12 text-center">
            <svg className="mx-auto h-28 w-28 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">No Data Loaded</h3>
            <p className="mt-4 text-base text-gray-700 font-medium">
              Please select filter criteria and click <strong className="text-orange-600">Apply</strong> to load report data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main render with data
  return (
    <div className={config.hideUI?.breadcrumb && config.hideUI?.filters ? "" : "min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6"}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {!config.hideUI?.breadcrumb && (
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Dashboard
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <a href="/reports" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Reports</a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">{config.breadcrumbTitle}</span>
                </div>
              </li>
            </ol>
          </nav>
        )}

        {/* Filters */}
        {!config.hideUI?.filters && renderFilters()}

        {/* Main Content */}
        <div ref={contentRef}>
          {renderChart()}
          {renderDataTable()}
        </div>
      </div>

      {/* Export Progress Modal */}
      {exportingPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <svg className="animate-spin h-16 w-16 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Exporting PDF</h3>
              <p className="text-gray-600 mb-6">Please wait while we generate your report...</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>

              {/* Progress Percentage */}
              <p className="text-lg font-semibold text-blue-600">{exportProgress}%</p>

              {/* Progress Status Text */}
              <p className="text-sm text-gray-500 mt-3">
                {exportProgress < 20 && "Initializing..."}
                {exportProgress >= 20 && exportProgress < 90 && "Capturing charts and tables..."}
                {exportProgress >= 90 && exportProgress < 100 && "Generating PDF file..."}
                {exportProgress === 100 && "Complete!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SGTIQAvsNHKOQABase;
