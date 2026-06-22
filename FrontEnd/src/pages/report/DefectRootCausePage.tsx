// client/src/pages/report/DefectRootCausePage.tsx
// Defect Root Cause Analysis - Analytics Dashboard
// Analyzes defect patterns by type, product, location, and trends

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getDefectRootCause } from '../../services/reportService';
import { formatNumber } from '../../utils';

// ============ INTERFACES ============

interface RootCauseRecord {
  defect_name: string;
  defect_group: string | null;
  total_occurrences: number;
  total_ng_qty: number;
  affected_products: number;
  top_product: string | null;
  top_line: string | null;
  top_station: string | null;
  trend: 'increasing' | 'decreasing' | 'stable';
  avg_ng_per_occurrence: number;
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

// ============ COMPONENT ============

const DefectRootCausePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date range filter states
  const [startMonthYear, setStartMonthYear] = useState(getJanFirstCurrentYear());
  const [endMonthYear, setEndMonthYear] = useState(getCurrentMonthYear());

  // Data state
  const [rootCauseData, setRootCauseData] = useState<RootCauseRecord[]>([]);

  // Auto-refresh when date range changes
  useEffect(() => {
    refreshData();
  }, [startMonthYear, endMonthYear]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDefectRootCause({
        dateFrom: startMonthYear,
        dateTo: endMonthYear
      });

      if (response.success && response.data) {
        setRootCauseData(response.data);
        console.log('Root cause data:', response.data);
      } else {
        setError(response.message || 'Failed to fetch root cause data');
      }
    } catch (err) {
      setError('Failed to refresh root cause data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER HELPERS ============

  const getDefectColor = (defectName: string) => {
    const lowerName = defectName.toLowerCase();
    if (lowerName.includes('contamination')) {
      return 'bg-gradient-to-br from-red-100 to-red-200 text-red-900 border-2 border-red-300';
    } else if (lowerName.includes('crack') || lowerName.includes('pzt')) {
      return 'bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-900 border-2 border-yellow-400';
    } else if (lowerName.includes('dent')) {
      return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900 border-2 border-blue-300';
    } else if (lowerName.includes('scratch')) {
      return 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900 border-2 border-purple-300';
    } else {
      return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 border-2 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <div className="flex items-center text-red-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="text-xs font-semibold">Increasing</span>
          </div>
        );
      case 'decreasing':
        return (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-semibold">Decreasing</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center text-blue-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
            <span className="text-xs font-semibold">Stable</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSummaryCards = () => {
    const totalDefectTypes = rootCauseData.length;
    const totalOccurrences = rootCauseData.reduce((sum, d) => sum + Math.floor(d.total_occurrences), 0);
    const totalNG = rootCauseData.reduce((sum, d) => sum + Math.floor(d.total_ng_qty), 0);
    const topDefect = rootCauseData.length > 0 ? rootCauseData[0].defect_name : 'N/A';

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-purple-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{totalDefectTypes}</p>
              <p className="text-sm font-medium text-purple-700">Defect Types</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl shadow-lg p-5 border-2 border-orange-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-900">{formatNumber(totalOccurrences.toString(),0)}</p>
              <p className="text-sm font-medium text-orange-700">Total Occurrences</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-lg p-5 border-2 border-red-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-red-400 to-red-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-900">{formatNumber(totalNG.toString(),0)}</p>
              <p className="text-sm font-medium text-red-700">Total NG Quantity</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-lg p-5 border-2 border-amber-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900 truncate" title={topDefect}>{topDefect}</p>
              <p className="text-sm font-medium text-amber-700">Top Defect</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefectCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rootCauseData.slice(0, 9).map((item, index) => (
        <div key={`${item.defect_name}-${index}`} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow">
          {/* Defect Header */}
          <div className={`px-6 py-4 ${getDefectColor(item.defect_name)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.defect_name}</h3>
                {item.defect_group && (
                  <p className="text-sm opacity-75">{item.defect_group}</p>
                )}
              </div>
              <div className="text-2xl font-bold">#{index + 1}</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="p-6 space-y-4">
            {/* Occurrences and NG */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Occurrences</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(item.total_occurrences.toString(),0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total NG</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(item.total_ng_qty.toString(),0)}</p>
              </div>
            </div>

            {/* Average NG */}
            <div className="pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Avg NG per Occurrence</p>
              <p className="text-xl font-semibold text-gray-900">{formatNumber(item.avg_ng_per_occurrence.toString(),2)}</p>
            </div>

            {/* Trend */}
            <div className="pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Trend</p>
              {getTrendIcon(item.trend)}
            </div>

            {/* Impact Analysis */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Affected Products:</span>
                <span className="text-sm font-semibold text-gray-900">{item.affected_products}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Top Product:</span>
                <span className="text-sm font-semibold text-gray-900 truncate ml-2" title={item.top_product || 'N/A'}>
                  {item.top_product || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Top Line:</span>
                <span className="text-sm font-semibold text-gray-900">{item.top_line || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Top Station:</span>
                <span className="text-sm font-semibold text-gray-900">{item.top_station || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetailTable = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Complete Defect Analysis</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Defect Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Occurrences
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total NG
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg NG
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Line
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rootCauseData.map((item, index) => (
              <tr key={`${item.defect_name}-table-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.defect_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.defect_group || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatNumber(item.total_occurrences.toString(),0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatNumber(item.total_ng_qty.toString(),0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatNumber(item.avg_ng_per_occurrence.toString(),2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.top_product || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.top_line || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getTrendIcon(item.trend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <h1 className="text-3xl font-bold text-gray-900">Defect Root Cause Analysis</h1>
              <p className="text-gray-600 mt-2">
                Analyze defect patterns by type, product, location, and trends
              </p>
            </div>
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

              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
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

        {/* Top 9 Defect Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Defects Overview</h2>
          {renderDefectCards()}
        </div>

        {/* Complete Detail Table */}
        {renderDetailTable()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toString()} | Root cause analysis updated daily
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefectRootCausePage;
