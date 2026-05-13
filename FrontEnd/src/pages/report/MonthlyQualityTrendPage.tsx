// client/src/pages/report/MonthlyQualityTrendPage.tsx
// Monthly Quality Trend - Analytics Dashboard
// Month-over-month quality metrics and trends

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getMonthlyQualityTrend } from '../../services/reportService';
import { formatNumber } from '../../utils';
import { formatDateTimeFull } from '../../utils/formatUtils';

// ============ INTERFACES ============

interface TrendRecord {
  month_year: string;
  total_lot: number;
  total_lotpass: number;
  total_inspections: number;
  total_ng: number;
  lar: number;
  dppm: number;
  lar_change: number | null;
  dppm_change: number | null;
  rolling_3month_lar: number | null;
  rolling_3month_dppm: number | null;
  top_defect: string | null;
  defect_count: number;
}

// ============ HELPER FUNCTIONS ============

const getCurrentMonthYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getJanFirstCurrentYear = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-01`;
};

const formatMonthYear = (monthYear: string): string => {
  if (monthYear.length !== 6) return monthYear;
  const year = monthYear.substring(0, 4);
  const month = monthYear.substring(4, 6);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// ============ COMPONENT ============

const MonthlyQualityTrendPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date range filter states
  const [startMonthYear, setStartMonthYear] = useState(getJanFirstCurrentYear());
  const [endMonthYear, setEndMonthYear] = useState(getCurrentMonthYear());

  // Data state
  const [trendData, setTrendData] = useState<TrendRecord[]>([]);

  // Auto-refresh when date range changes
  useEffect(() => {
    refreshData();
  }, [startMonthYear, endMonthYear]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMonthlyQualityTrend({
        dateFrom: startMonthYear,
        dateTo: endMonthYear
      });

      if (response.success && response.data) {
        setTrendData(response.data);
        console.log('Trend data:', response.data);
      } else {
        setError(response.message || 'Failed to fetch trend data');
      }
    } catch (err) {
      setError('Failed to refresh trend data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER HELPERS ============

  const getChangeIndicator = (change: number | null) => {
    if (change === null || change === 0) {
      return (
        <span className="text-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
          0
        </span>
      );
    }

    if (change > 0) {
      return (
        <span className="text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          +{formatNumber(Math.abs(change).toString(), 2)}
        </span>
      );
    }

    return (
      <span className="text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        {formatNumber(change.toString(),2)}
      </span>
    );
  };

  const renderSummaryCards = () => {
    const latestMonth = trendData.length > 0 ? trendData[trendData.length - 1] : null;
    const totalLotPass = trendData.reduce((sum, d) => sum + (d.total_lotpass ? Math.floor(d.total_lotpass) : 0), 0);
    const totalLotInspections = trendData.reduce((sum, d) => sum + (d.total_lot ? Math.floor(d.total_lot) : 0), 0);
    const totalNG = trendData.reduce((sum, d) => sum + (d.total_ng ? Math.floor(d.total_ng) : 0), 0);
    const totalInspections = trendData.reduce((sum, d) => sum + (d.total_inspections ? Math.floor(d.total_inspections) : 0), 0);
    const avgLAR = totalLotInspections > 0
      ? ((totalLotPass / totalLotInspections) * 100.0)
      : 0;
    const avgDPPM = totalInspections > 0
      ? ((totalNG / totalInspections) * 1000000.0)
      : 0;
    const improving = trendData.filter(d => d.lar_change && d.lar_change > 0).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"> 
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-blue-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">{trendData.length}</p>
              <p className="text-sm font-medium text-blue-700">Months Tracked</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl shadow-lg p-5 border-2 border-emerald-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-900">{formatNumber(latestMonth?.lar.toString(),2)}%</p>
              <p className="text-sm font-medium text-emerald-700">Current LAR</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-purple-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{improving}</p>
              <p className="text-sm font-medium text-purple-700">Improving Months</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-blue-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">{formatNumber(avgLAR.toString(),2)}%</p>
              <p className="text-sm font-medium text-blue-700">Average LAR</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-lg p-5 border-2 border-amber-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-900">{formatNumber(avgDPPM.toString(),0)}</p>
              <p className="text-sm font-medium text-amber-700">Avg DPPM</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendTable = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Quality Trend Analysis
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 bg-white">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="month"
                value={startMonthYear}
                onChange={(e) => setStartMonthYear(e.target.value)}
                className="text-sm focus:outline-none focus:ring-0 border-0 p-0"
              />
              <span className="text-gray-400">—</span>
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="month"
                value={endMonthYear}
                onChange={(e) => setEndMonthYear(e.target.value)}
                className="text-sm focus:outline-none focus:ring-0 border-0 p-0"
              />
            </div>

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inspections
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total NG
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                LAR %
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                LAR Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                DPPM
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DPPM Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                3M Avg LAR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Defect
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trendData.map((item, index) => (
              <tr key={`${item.month_year}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatMonthYear(item.month_year)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatNumber(item.total_inspections.toString(), 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatNumber(item.total_ng.toString(), 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatNumber(item.lar.toString(),2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  {getChangeIndicator(item.lar_change)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatNumber(item.dppm.toString(),0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  {getChangeIndicator(item.dppm_change)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                  {item.rolling_3month_lar ? `${formatNumber(item.rolling_3month_lar.toString(),2)}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.top_defect || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Trend Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <div>
              <p className="font-medium text-gray-700">LAR Change shows month-over-month improvement</p>
              <p className="text-xs text-gray-600">Positive values indicate quality improvement</p>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-700">3-Month Rolling Average smooths out variations</p>
              <p className="text-xs text-gray-600">Helps identify longer-term trends</p>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-gray-700">Top Defect changes monthly</p>
              <p className="text-xs text-gray-600">Focus prevention efforts on recurring issues</p>
            </div>
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Monthly Quality Trend</h1>
              <p className="text-gray-600 mt-2">
                Month-over-month quality metrics and trends analysis
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

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Trend Table */}
        {renderTrendTable()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDateTimeFull(new Date())} | Trend data refreshed daily
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyQualityTrendPage;
