// client/src/components/report/OQAVIReportBase.tsx
// ===== BASE COMPONENT FOR OQA VISUAL INSPECTION REPORTS =====
// Reusable component following LARReportBase pattern
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type DefectLegendItem } from '../../types/report';
// ============ TYPE DEFINITIONS ============

export interface IrisChartData {
  period: string;
  dppm: number;
  larPercent: number;
}

export interface IrisModel {
  name: string;
  data: IrisChartData[];
}

export interface SummaryStats {
  modelCount: number;
  avgLAR: number;
  peakDPPM: number;
  periodMonths: number;
}

export interface OQAVIReportConfig {
  title: string;
  breadcrumbTitle: string;
  irisModels: IrisModel[];
  summaryStats: SummaryStats;
  maxDPPM: number;
}

export interface OQAVIReportBaseProps {
  config: OQAVIReportConfig;
}

// ============ MAIN COMPONENT ============

const OQAVIReportBase: React.FC<OQAVIReportBaseProps> = ({ config }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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

  // ============ CUSTOM TOOLTIP ============

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'LAR%' ? `LAR: ${entry.value}%` : `DPPM: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ============ CHART COMPONENT ============

  const IrisChart: React.FC<{
    title: string;
    data: IrisChartData[];
    maxDPPM: number;
  }> = ({ title, data, maxDPPM }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Chart Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 text-center">{title}</h3>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                stroke="#666"
              />
              <YAxis
                yAxisId="dppm"
                orientation="right"
                domain={[0, maxDPPM]}
                stroke="#666"
                fontSize={10}
              />
              <YAxis
                yAxisId="lar"
                orientation="left"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="#666"
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* DPPM Bars */}
              <Bar
                yAxisId="dppm"
                dataKey="dppm"
                fill="#8BC34A"
                name="DPPM"
                radius={[2, 2, 0, 0]}
              />

              {/* LAR Line */}
              <Line
                yAxisId="lar"
                type="monotone"
                dataKey="larPercent"
                stroke="#2196F3"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2196F3' }}
                name="LAR%"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* ==================== PAGE HEADER ==================== */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Purple Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {config.title}
                    </h1>
                    <p className="text-purple-100 text-sm mt-1">
                      Last updated: {lastUpdated.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* NHIK Logo and Action Buttons */}
                <div className="flex items-center space-x-4">
                  {/* NHIK Logo */}
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-red-600">NHIK</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm">DS</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRefresh}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>

                    <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="bg-white text-purple-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
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
                          <span>Export</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Orange Accent Line */}
            <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>
          </div>
        </div>

        {/* ==================== SUMMARY STATISTICS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Iris Models</dt>
                  <dd className="text-2xl font-bold text-purple-600">{config.summaryStats.modelCount}</dd>
                </dl>
              </div>
            </div>
          </div>

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
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg LAR</dt>
                  <dd className="text-2xl font-bold text-green-600">{config.summaryStats.avgLAR}%</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Peak DPPM</dt>
                  <dd className="text-2xl font-bold text-yellow-600">{config.summaryStats.peakDPPM}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Period</dt>
                  <dd className="text-2xl font-bold text-blue-600">{config.summaryStats.periodMonths} Months</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CHARTS GRID ==================== */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {config.irisModels.map((model, index) => (
            <IrisChart
              key={index}
              title={model.name}
              data={model.data}
              maxDPPM={config.maxDPPM}
            />
          ))}
        </div>

        {/* ==================== LEGEND AND NOTES ==================== */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Legend & Notes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legend */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700">DPPM (Defects Per Million Parts)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-1 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-700">LAR% (Lot Acceptance Rate)</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Analysis Notes</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Overall LAR performance tracking across Iris family</li>
                  <li>• DPPM values indicate quality metrics</li>
                  <li>• Peak values highlight areas for improvement</li>
                  <li>• Trend analysis supports quality control decisions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FOOTER INFO ==================== */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()} • NHIK Manufacturing Quality Control System</p>
          <p className="mt-1">OQA Visual Inspection Report - Iris Family Product Line</p>
        </div>

      </div>
    </div>
  );
};

export default OQAVIReportBase;
