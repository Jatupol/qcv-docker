// client/src/pages/report/ProductQualityScorecardPage.tsx
// Product Quality Scorecard - Executive Dashboard
// Shows product quality status vs targets with trends

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getProductQualityScorecard } from '../../services/reportService';
import { formatNumber } from '../../utils';
import { formatDateTimeFull } from '../../utils/formatUtils';

// ============ INTERFACES ============

interface ScorecardRecord {
  model: string;
  current_lar: number;
  target_lar: number;
  lar_status: 'excellent' | 'good' | 'warning' | 'critical';
  lar_trend: 'up' | 'down' | 'stable';
  current_dppm: number;
  target_dppm: number;
  dppm_status: 'excellent' | 'good' | 'warning' | 'critical';
  dppm_trend: 'up' | 'down' | 'stable';
  total_lot: number;
  total_lotpass: number;
  total_inspections: number;
  total_defects: number;
  month_year: string;
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
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// ============ COMPONENT ============

const ProductQualityScorecardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date range filter states
  const [startMonthYear, setStartMonthYear] = useState(getJanFirstCurrentYear());
  const [endMonthYear, setEndMonthYear] = useState(getCurrentMonthYear());

  // Data state
  const [scorecardData, setScorecardData] = useState<ScorecardRecord[]>([]);

  // Auto-refresh when date range changes
  useEffect(() => {
    refreshData();
  }, [startMonthYear, endMonthYear]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductQualityScorecard({
        dateFrom: startMonthYear,
        dateTo: endMonthYear
      });

      if (response.success && response.data) {
        setScorecardData(response.data);
        console.log('Scorecard data:', response.data);
      } else {
        setError(response.message || 'Failed to fetch scorecard data');
      }
    } catch (err) {
      setError('Failed to refresh scorecard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER HELPERS ============

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'good':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      case 'critical':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderSummaryCards = () => {
    const excellentCount = scorecardData.filter(d => d.lar_status === 'excellent').length;
    const criticalCount = scorecardData.filter(d => d.lar_status === 'critical' || d.dppm_status === 'critical').length;
    const totalLotPass = scorecardData.reduce((sum, d) => sum + (d.total_lotpass ? Math.floor(d.total_lotpass) : 0), 0);
    const totalLotInspections = scorecardData.reduce((sum, d) => sum + (d.total_lot ? Math.floor(d.total_lot) : 0), 0);
    const totalNG = scorecardData.reduce((sum, d) => sum + (d.total_defects ? Math.floor(d.total_defects) : 0), 0);
    const totalInspections = scorecardData.reduce((sum, d) => sum + (d.total_inspections ? Math.floor(d.total_inspections) : 0), 0);
    const avgLAR = totalLotInspections > 0
      ? ((totalLotPass / totalLotInspections) * 100.0)
      : 0;
    const avgDPPM = totalInspections > 0
      ? ((totalNG / totalInspections) * 1000000.0)
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> 
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl shadow-lg p-5 border-2 border-emerald-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-900">{excellentCount}</p>
              <p className="text-sm font-medium text-emerald-700">Excellent Products</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-lg p-5 border-2 border-red-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-red-400 to-red-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
              <p className="text-sm font-medium text-red-700">Critical Issues</p>
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

        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-5 border-2 border-purple-200">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{formatNumber(avgDPPM.toString(),0)}</p>
              <p className="text-sm font-medium text-purple-700">Average DPPM</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScorecardCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scorecardData.map((item, index) => (
        <div key={`${item.model}-${item.month_year}-${index}`} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow">
          {/* Product Header */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
            <h3 className="text-lg font-bold text-white">{item.model}</h3>
            <p className="text-sm text-gray-300">{formatMonthYear(item.month_year)}</p>
          </div>

          {/* Metrics */}
          <div className="p-6 space-y-4">
            {/* LAR Metric */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">LAR (Line Acceptance Rate)</span>
                {getTrendIcon(item.lar_trend)}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(item.current_lar.toString(),2)}%</p>
                  <p className="text-xs text-gray-500">Target: {item.target_lar}%</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.lar_status)}`}>
                  {item.lar_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* DPPM Metric */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">DPPM (Defects Per Million)</span>
                {getTrendIcon(item.dppm_trend)}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(item.current_dppm.toString(),0)}</p>
                  <p className="text-xs text-gray-500">Target: {item.target_dppm}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.dppm_status)}`}>
                  {item.dppm_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Inspections</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(item.total_inspections.toString(),0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Defects</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(item.total_defects.toString(),0)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
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
              <h1 className="text-3xl font-bold text-gray-900">Product Quality Scorecard</h1>
              <p className="text-gray-600 mt-2">
                Executive dashboard showing product quality status vs targets
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

        {/* Scorecard Cards */}
        {renderScorecardCards()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDateTimeFull(new Date())} | Quality metrics updated daily
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductQualityScorecardPage;
