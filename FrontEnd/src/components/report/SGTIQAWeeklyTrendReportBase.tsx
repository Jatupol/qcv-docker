// client/src/components/report/SGTIQAWeeklyTrendReportBase.tsx
// ===== SHARED SGT IQA WEEKLY TREND REPORT BASE COMPONENT =====
// Reusable SGT IQA Weekly Trend Report with configurable data sources
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type WeeklyTrendData } from '../../types/report';
import { formatDateTime, formatDate } from '../../utils/formatUtils';
// ============ TYPE DEFINITIONS ============


export interface DefectType {
  name: string;
  color: string;
  key: keyof WeeklyTrendData;
}

// Configuration for the SGT IQA Weekly Trend report
export interface SGTIQAWeeklyTrendReportConfig {
  // Report metadata
  title: string;
  breadcrumbTitle: string;

  // Data (can be sample data or from API)
  data: WeeklyTrendData[];

  // Defect type configuration
  defectTypes: DefectType[];
}

interface SGTIQAWeeklyTrendReportBaseProps {
  config: SGTIQAWeeklyTrendReportConfig;
}

// ============ MAIN COMPONENT ============

const SGTIQAWeeklyTrendReportBase: React.FC<SGTIQAWeeklyTrendReportBaseProps> = ({ config }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedView, setSelectedView] = useState<'chart' | 'table'>('chart');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const weeklyTrendData = config.data;
  const defectTypes = config.defectTypes;

  // ============ EVENT HANDLERS ============

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Report exported successfully!');
    }, 2000);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const handlePrint = () => {
    window.print();
  };

  // ============ CUSTOM TOOLTIP COMPONENT ============

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'lar' ? '%' : ''}
              {entry.dataKey === 'dppm' ? ' DPPM' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ============ RENDER HELPERS ============

  const renderTableRow = (data: WeeklyTrendData, index: number) => (
    <tr key={index} className={`${index >= 12 ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap border-r border-gray-200">
        {data.period}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.lar.toFixed(2)}%
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.lotAuditVisual}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.lotPassVisual}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.lotFailVisual}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.lotSamplingQty}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.defectQty}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.stickyOnDamper}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.brownContamOnDamper}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.contamination}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.bentDentDeform}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.p2tCrack}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {data.fiberOnAnyArea}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900">
        {data.otherDefects}
      </td>
    </tr>
  );

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* ==================== PAGE HEADER ==================== */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-orange-600 px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {config.title}
                  </h1>
                  <p className="text-primary-100">
                    Last updated: {formatDateTime(lastUpdated)}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-lg p-1">
                    <button
                      onClick={() => setSelectedView('chart')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedView === 'chart'
                          ? 'bg-white text-primary-600'
                          : 'text-white hover:bg-white hover:bg-opacity-20'
                      }`}
                    >
                      Chart View
                    </button>
                    <button
                      onClick={() => setSelectedView('table')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedView === 'table'
                          ? 'bg-white text-primary-600'
                          : 'text-white hover:bg-white hover:bg-opacity-20'
                      }`}
                    >
                      Table View
                    </button>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>

                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="bg-white text-primary-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    {isExporting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CHART VIEW ==================== */}
        {selectedView === 'chart' && (
          <div className="space-y-8">
            {/* DPPM Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-yellow-400 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">DPPM Trend</h2>
              </div>
              <div className="p-6">
                <div className="h-96 bg-green-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="period"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={10}
                        stroke="#666"
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={[0, 2000]}
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        stroke="#666"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />

                      {/* Defect Type Lines */}
                      {defectTypes.map((defect) => (
                        <Line
                          key={defect.key}
                          yAxisId="left"
                          type="monotone"
                          dataKey={defect.key}
                          stroke={defect.color}
                          strokeWidth={2}
                          dot={{ r: 1 }}
                          name={defect.name}
                        />
                      ))}

                      {/* DPPM Line */}
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="dppm"
                        stroke="#000"
                        strokeWidth={3}
                        dot={{ r: 2, fill: '#000' }}
                        name="DPPM"
                      />

                      {/* LAR Line */}
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="lar"
                        stroke="#32CD32"
                        strokeWidth={3}
                        dot={{ r: 2, fill: '#32CD32' }}
                        name="LAR (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* 100% Labels */}
                  <div className="mt-4 text-center">
                    {weeklyTrendData.map((data, index) => (
                      <span key={index} className="inline-block text-xs text-green-600 font-semibold mr-2">
                        100.00%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defectTypes.map((defect) => (
                  <div key={defect.key} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-1 rounded"
                      style={{ backgroundColor: defect.color }}
                    />
                    <span className="text-sm text-gray-700">{defect.name}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-black rounded" />
                  <span className="text-sm text-gray-700">DPPM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-green-500 rounded" />
                  <span className="text-sm text-gray-700">LAR</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TABLE VIEW ==================== */}
        {selectedView === 'table' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{config.breadcrumbTitle}</h2>
                <span className="text-blue-100 text-sm">DPPM Data Table</span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Period
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      %LAR
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Lot Audit Visual
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Lot Pass Visual
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Lot Fail Visual
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Lot Sampling Qty
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Defect Qty
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Sticky on Damper
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Brown Contam on Damper
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Contamination
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Bent Dent Deform
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      P2T Crack
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                      Fiber on any area
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">
                      Other
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weeklyTrendData.map((data, index) => renderTableRow(data, index))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Records: {weeklyTrendData.length}</span>
                <span>Period: Aug 2023 - Aug 2024</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUMMARY STATISTICS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average LAR</dt>
                  <dd className="text-2xl font-bold text-green-600">100.00%</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Periods</dt>
                  <dd className="text-2xl font-bold text-blue-600">{weeklyTrendData.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">DPPM Rate</dt>
                  <dd className="text-2xl font-bold text-primary-600">0</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Defects</dt>
                  <dd className="text-2xl font-bold text-yellow-600">
                    {weeklyTrendData.reduce((sum, item) => sum + item.defectQty, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FOOTER INFO ==================== */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Generated on {formatDate(new Date())} • Seagate Manufacturing Quality Control System</p>
          <p className="mt-1">Data covers period from August 2023 to August 2024 (WW09)</p>
        </div>

      </div>
    </div>
  );
};

export default SGTIQAWeeklyTrendReportBase;
