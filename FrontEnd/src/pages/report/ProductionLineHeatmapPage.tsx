// client/src/pages/report/ProductionLineHeatmapPage.tsx
// Production Line Quality Heatmap - Analytics Dashboard
// Shows DPPM and defect counts by production line, group, and station

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getProductionLineHeatmap } from '../../services/reportService';
import { formatNumber } from '../../utils';
import { formatDateTimeFull } from '../../utils/formatUtils';

// ============ INTERFACES ============

interface HeatmapRecord {
  linevi: string;
  groupvi: string;
  station: string;
  total_inspections: number;
  total_ng: number;
  dppm: number;
  defect_count: number;
  top_defect: string | null;
  alert_status: 'normal' | 'warning' | 'critical';
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

const ProductionLineHeatmapPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date range filter states
  const [startMonthYear, setStartMonthYear] = useState(getJanFirstCurrentYear());
  const [endMonthYear, setEndMonthYear] = useState(getCurrentMonthYear());

  // Data state
  const [heatmapData, setHeatmapData] = useState<HeatmapRecord[]>([]);

  // Auto-refresh when date range changes
  useEffect(() => {
    refreshData();
  }, [startMonthYear, endMonthYear]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductionLineHeatmap({
        dateFrom: startMonthYear,
        dateTo: endMonthYear
      });

      if (response.success && response.data) {
        setHeatmapData(response.data);
        console.log('Heatmap data:', response.data);
      } else {
        setError(response.message || 'Failed to fetch heatmap data');
      }
    } catch (err) {
      setError('Failed to refresh heatmap data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER HELPERS ============

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-gradient-to-br from-red-100 to-red-200 text-red-900 border-2 border-red-400';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-100 to-amber-200 text-yellow-900 border-2 border-yellow-400';
      case 'normal':
        return 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-900 border-2 border-green-400';
      default:
        return 'bg-gray-100 text-gray-900 border-2 border-gray-300';
    }
  };

  const renderSummaryCards = () => {
    const totalLines = new Set(heatmapData.map(d => d.linevi)).size;
    const criticalCount = heatmapData.filter(d => d.alert_status === 'critical').length;
    const warningCount = heatmapData.filter(d => d.alert_status === 'warning').length;

    // Calculate avgDPPM = (sum of total_ng / sum of total_inspections) * 1000000.0
    const totalNG = heatmapData.reduce((sum, d) => sum + Math.floor(d.total_ng ?? 0), 0);
    const totalInspections = heatmapData.reduce((sum, d) => sum + Math.floor(d.total_inspections ?? 0), 0);
    const avgDPPM = totalInspections > 0
      ? ((totalNG / totalInspections) * 1000000.0)
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> 
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-blue-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">{totalLines}</p>
              <p className="text-sm font-medium text-blue-700">Production Lines</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-lg p-5 border-2 border-red-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-red-400 to-red-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L5.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
              <p className="text-sm font-medium text-red-700">Critical Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-lg p-5 border-2 border-yellow-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-900">{warningCount}</p>
              <p className="text-sm font-medium text-amber-700">Warning Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-purple-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{formatNumber(avgDPPM.toString(),0)}</p>
              <p className="text-sm font-medium text-purple-700">Avg DPPM</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeatmapTable = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Production Line Quality Heatmap
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
                Line
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inspections
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total NG
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                DPPM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Defect
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {heatmapData.map((item, index) => (
              <tr key={`${item.linevi}-${item.groupvi}-${item.station}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.linevi}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.groupvi}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.station}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatNumber((item.total_inspections ?? 0).toString(), 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatNumber((item.total_ng ?? 0).toString(), 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatNumber((item.dppm ?? 0).toString(), 2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.top_defect || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.alert_status ?? 'normal')}`}>
                    {(item.alert_status ?? 'normal').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-green-400 rounded mr-2"></div>
            <span className="text-gray-800 font-medium">Normal (&lt; 500 DPPM)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-400 rounded mr-2"></div>
            <span className="text-gray-800 font-medium">Warning (500-1000 DPPM)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 rounded mr-2"></div>
            <span className="text-gray-800 font-medium">Critical (&gt; 1000 DPPM)</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Production Line Quality Heatmap</h1>
              <p className="text-gray-600 mt-2">
                DPPM and defect tracking by production line, group, and station
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

        {/* Heatmap Table */}
        {renderHeatmapTable()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDateTimeFull(new Date())} | Data refreshed in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductionLineHeatmapPage;
