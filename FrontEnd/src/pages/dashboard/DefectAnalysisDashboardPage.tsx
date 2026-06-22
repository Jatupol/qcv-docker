// client/src/pages/Dashboard/DefectAnalysisDashboardPage.tsx
// ===== DEFECT ANALYSIS DASHBOARD =====
// Placeholder for future defect analysis features

 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { formatDateTimeFull } from '../../utils/formatUtils';

// ============ INTERFACES ============

interface TopDefectData {
  product: string;
  months: {
    [key: string]: string | null; // defect type or null for empty
  };
}

interface DefectDetails {
  fwNumber: string;
  date: string;
  forA: string;
  shiftForShifterRequested: string;
  qcOwner: string;
  model: string;
  telexNumber: string;
  supplier: string;
  description: string;
  locationNumber: string;
  qty: string;
  supplierDoNumber: string;
  serialNumber: string;
  disposition: string;
  receiptDate: string;
  age: number;
  buildShould: string;
  buildTest: string;
  twoHundredUnits: string;
}

interface DefectSummary {
  totalProducts: number;
  contaminationCount: number;
  pztCrackCount: number;
  dentCount: number;
  mostCommonDefect: string;
}

// ============ COMPONENT ============

const DefectAnalysisDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [viewMode, setViewMode] = useState<'summary' | 'details'>('summary');
  const [summaryData, setSummaryData] = useState<DefectSummary>({
    totalProducts: 3,
    contaminationCount: 15,
    pztCrackCount: 1,
    dentCount: 1,
    mostCommonDefect: 'Contamination'
  });

  // ============ MOCK TOP DEFECT DATA ============

  const topDefectData: TopDefectData[] = [
    {
      product: 'Astra-S',
      months: {
        'Sep\'2023': 'Contamination',
        'Oct\'2023': 'Contamination',
        'Nov\'2023': 'Contamination',
        'Dec\'2023': 'Contamination',
        'Jan\'2024': 'Contamination',
        'Feb\'2024': 'Contamination',
        'Mar\'2024': 'Contamination'
      }
    },
    {
      product: 'Iris 20.4',
      months: {
        'Sep\'2023': 'Dent',
        'Oct\'2023': 'Contamination',
        'Nov\'2023': 'Contamination',
        'Dec\'2023': 'Contamination',
        'Jan\'2024': 'PZT crack',
        'Feb\'2024': 'Contamination',
        'Mar\'2024': 'Contamination'
      }
    },
    {
      product: 'Iris 20.5.2',
      months: {
        'Sep\'2023': null,
        'Oct\'2023': null,
        'Nov\'2023': null,
        'Dec\'2023': null,
        'Jan\'2024': null,
        'Feb\'2024': null,
        'Mar\'2024': null
      }
    }
  ];

  // ============ MOCK DEFECT DETAILS DATA ============

  const defectDetails: DefectDetails[] = [
    {
      fwNumber: 'FW2507',
      date: '10-Aug',
      forA: 'C for A',
      shiftForShifterRequested: 'TP-11213',
      qcOwner: 'M11P',
      model: '7.32E+08',
      telexNumber: 'NHS',
      supplier: '40929',
      description: 'ASSY,SPN',
      locationNumber: 'TTP99354',
      qty: '59200',
      supplierDoNumber: 'NHT2471944',
      serialNumber: '47560029',
      disposition: 'RELEASED',
      receiptDate: '45501',
      age: 13,
      buildShould: 'UPSAP',
      buildTest: 'THSAP',
      twoHundredUnits: 'TTP'
    },
    {
      fwNumber: 'FW2507',
      date: '10-Aug',
      forA: 'C for A',
      shiftForShifterRequested: 'TP-11214',
      qcOwner: 'LONGSPE',
      model: '7.53E+08',
      telexNumber: 'NHS',
      supplier: '40929',
      description: 'ASSY,SPN',
      locationNumber: 'TTP22065',
      qty: '46800',
      supplierDoNumber: 'NHT2470709',
      serialNumber: '47559694',
      disposition: 'RELEASED',
      receiptDate: '45484',
      age: 30,
      buildShould: 'UPSAP',
      buildTest: 'THSAP',
      twoHundredUnits: 'TTP'
    },
    {
      fwNumber: 'FW2507',
      date: '11-Aug',
      forA: 'B for A',
      shiftForShifterRequested: 'TP-11215',
      qcOwner: 'CIMARRO',
      model: '7.46E+08',
      telexNumber: 'NHS',
      supplier: '40929',
      description: 'ASSY,SPN',
      locationNumber: 'TTP18144',
      qty: '40800',
      supplierDoNumber: 'NHT2460635',
      serialNumber: '47557992',
      disposition: 'RELEASED',
      receiptDate: '45024',
      age: 2,
      buildShould: 'UPSAP',
      buildTest: 'THSAP',
      twoHundredUnits: 'TTP'
    },
    {
      fwNumber: 'FW2507',
      date: '11-Aug',
      forA: 'B for A',
      shiftForShifterRequested: 'TP-11215',
      qcOwner: 'LONGSPE',
      model: '7.53E+08',
      telexNumber: 'NHS',
      supplier: '40929',
      description: 'ASSY,SPN',
      locationNumber: 'TTP19112',
      qty: '46800',
      supplierDoNumber: 'NHT2480636',
      serialNumber: '47557993',
      disposition: 'RELEASED',
      receiptDate: '8/9/2024',
      age: 2,
      buildShould: 'UPSAP',
      buildTest: 'THSAP',
      twoHundredUnits: 'TTP'
    },
    {
      fwNumber: 'FW2507',
      date: '11-Aug',
      forA: 'B for A',
      shiftForShifterRequested: 'TP-11216',
      qcOwner: 'LONGSPE',
      model: '7.53E+08',
      telexNumber: 'NHS',
      supplier: '40929',
      description: 'ASSY,SPN',
      locationNumber: 'TTP19014',
      qty: '46000',
      supplierDoNumber: 'NHT2480632',
      serialNumber: '47559694',
      disposition: 'RELEASED',
      receiptDate: '8/9/2024',
      age: 2,
      buildShould: 'UPSAP',
      buildTest: 'THSAP',
      twoHundredUnits: 'TTP'
    }
  ];

  const monthColumns = ['Sep\'2023', 'Oct\'2023', 'Nov\'2023', 'Dec\'2023', 'Jan\'2024', 'Feb\'2024', 'Mar\'2024'];

  // ============ HELPER FUNCTIONS ============

  const getDefectColor = (defect: string | null) => {
    if (defect === null) return 'bg-gray-100 text-gray-500';
    
    switch (defect) {
      case 'Contamination':
        return 'bg-red-100 text-red-800 font-medium';
      case 'PZT crack':
        return 'bg-yellow-100 text-yellow-800 font-medium';
      case 'Dent':
        return 'bg-blue-100 text-blue-800 font-medium';
      default:
        return 'bg-gray-100 text-gray-800 font-medium';
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, fetch actual defect data here
      console.log('Top defect data refreshed');
    } catch (err) {
      setError('Failed to refresh top defect data');
    } finally {
      setLoading(false);
    }
  };



  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 py-6">

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

        {/* Analysis Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Defect Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Contamination</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-red-700">15 occurrences</span>
                    <p className="text-xs text-gray-600">Most frequent issue</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">PZT Crack</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-yellow-700">1 occurrence</span>
                    <p className="text-xs text-gray-600">Iris 20.4 - Jan 2024</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Dent</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-blue-700">1 occurrence</span>
                    <p className="text-xs text-gray-600">Iris 20.4 - Sep 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Astra-S</p>
                    <p className="text-xs text-red-600">100% Contamination issues</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">7 months</p>
                    <p className="text-xs text-gray-600">Consistent issue</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Iris 20.4</p>
                    <p className="text-xs text-gray-600">Mixed defect types</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">6 months</p>
                    <p className="text-xs text-green-600">Varied issues</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Iris 20.5.2</p>
                    <p className="text-xs text-green-600">No defects recorded</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">0 issues</p>
                    <p className="text-xs text-green-600">Best performer</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Trend Analysis */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Defect Trend Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Critical Issue</h4>
                  <p className="text-3xl font-bold text-red-600 mb-1">88%</p>
                  <p className="text-sm text-gray-600">Contamination Rate</p>
                  <div className="mt-3 bg-red-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Stable Products</h4>
                  <p className="text-3xl font-bold text-blue-600 mb-1">1</p>
                  <p className="text-sm text-gray-600">Zero Defect Products</p>
                  <div className="mt-3 bg-blue-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Variable Issues</h4>
                  <p className="text-3xl font-bold text-yellow-600 mb-1">1</p>
                  <p className="text-sm text-gray-600">Mixed Defect Products</p>
                  <div className="mt-3 bg-yellow-100 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Items */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                <div className="flex items-start p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">Critical: Astra-S Contamination</p>
                    <p className="text-sm text-red-700 mt-1">Contamination issues persist across all 7 months. Immediate process review and contamination control protocol implementation required.</p>
                  </div>
                </div>

                <div className="flex items-start p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-yellow-600 text-sm font-bold">⚠</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Monitor: Iris 20.4 Variability</p>
                    <p className="text-sm text-yellow-700 mt-1">Multiple defect types (Dent, Contamination, PZT crack). Root cause analysis needed to identify common factors.</p>
                  </div>
                </div>

                <div className="flex items-start p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Best Practice: Iris 20.5.2</p>
                    <p className="text-sm text-green-700 mt-1">Zero defects recorded across all months. Analyze and share manufacturing processes and quality control measures.</p>
                  </div>
                </div>

                <div className="flex items-start p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">i</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Action: Implement Preventive Measures</p>
                    <p className="text-sm text-blue-700 mt-1">Establish contamination prevention protocols, improve PZT handling procedures, and enhance dent prevention measures.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quality Metrics Summary */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Metrics Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-700">17</p>
                  <p className="text-sm text-primary-600 mt-1">Total Defects</p>
                  <p className="text-xs text-gray-600 mt-1">All Products</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">88%</p>
                  <p className="text-sm text-red-600 mt-1">Contamination</p>
                  <p className="text-xs text-gray-600 mt-1">Primary Issue</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">33%</p>
                  <p className="text-sm text-green-600 mt-1">Zero Defect Rate</p>
                  <p className="text-xs text-gray-600 mt-1">1 of 3 Products</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">7</p>
                  <p className="text-sm text-blue-600 mt-1">Months Tracked</p>
                  <p className="text-xs text-gray-600 mt-1">Sep 2023 - Mar 2024</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Defect Breakdown */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Defect Breakdown</h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4 min-w-full">
                  {monthColumns.map((month) => {
                    const monthDefects = topDefectData
                      .map(product => product.months[month])
                      .filter(defect => defect !== null);
                    
                    const contaminationCount = monthDefects.filter(d => d === 'Contamination').length;
                    const pztCount = monthDefects.filter(d => d === 'PZT crack').length;
                    const dentCount = monthDefects.filter(d => d === 'Dent').length;

                    return (
                      <div key={month} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">{month}</h4>
                        <div className="space-y-2">
                          {contaminationCount > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-red-600">Contamination</span>
                              <span className="font-semibold">{contaminationCount}</span>
                            </div>
                          )}
                          {pztCount > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-yellow-600">PZT crack</span>
                              <span className="font-semibold">{pztCount}</span>
                            </div>
                          )}
                          {dentCount > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-600">Dent</span>
                              <span className="font-semibold">{dentCount}</span>
                            </div>
                          )}
                          {monthDefects.length === 0 && (
                            <div className="text-xs text-gray-500">No defects</div>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs font-semibold text-gray-900">
                            Total: {monthDefects.length}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDateTimeFull(new Date())} | Defect data refreshed daily
          </p>
        </div>
      </div>
    </div>
  );
};

 

export default DefectAnalysisDashboardPage;
