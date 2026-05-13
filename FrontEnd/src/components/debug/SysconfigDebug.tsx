// client/src/components/debug/SysconfigDebug.tsx
// Debug component for testing sysconfig dropdown functionality

import React, { useState, useEffect } from 'react';
import {
  sysconfigService,
  getProductFamilyOptions,
  getSiteOptions,
  getTabOptions,
  getProductTypeOptions,
  getCustomerOptions
} from '../../services/sysconfigService';

import {
  ProductFamilySelector,
  SiteSelector,
  TabSelector,
  ProductTypeSelector,
  CustomerSelector
} from '../selectors/SysconfigSelector';

const SysconfigDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [testValues, setTestValues] = useState({
    productFamily: '',
    site: '',
    tab: '',
    productType: '',
    customer: ''
  });

  const runDebugTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log('🔧 Starting sysconfig debug tests...');

      // Test 1: Get raw sysconfig
      try {
        console.log('📋 Test 1: Raw sysconfig data');
        const rawSysconfig = await sysconfigService.getSysconfig();
        results.rawSysconfig = rawSysconfig;
        console.log('✅ Raw sysconfig:', rawSysconfig);
      } catch (error) {
        results.rawSysconfigError = error;
        console.error('❌ Raw sysconfig error:', error);
      }

      // Test 2: Get parsed sysconfig
      try {
        console.log('📋 Test 2: Parsed sysconfig data');
        const parsedSysconfig = await sysconfigService.getParsedSysconfig();
        results.parsedSysconfig = parsedSysconfig;
        console.log('✅ Parsed sysconfig:', parsedSysconfig);
      } catch (error) {
        results.parsedSysconfigError = error;
        console.error('❌ Parsed sysconfig error:', error);
      }

      // Test 3: Individual dropdown functions
      const dropdownTests = [
        { name: 'Product Families', fn: getProductFamilyOptions },
        { name: 'Sites', fn: getSiteOptions },
        { name: 'Tabs', fn: getTabOptions },
        { name: 'Product Types', fn: getProductTypeOptions },
        { name: 'Customers', fn: getCustomerOptions }
      ];

      for (const test of dropdownTests) {
        try {
          console.log(`📋 Test: ${test.name}`);
          const options = await test.fn();
          results[`${test.name.toLowerCase().replace(' ', '_')}_options`] = options;
          console.log(`✅ ${test.name} options:`, options);
        } catch (error) {
          results[`${test.name.toLowerCase().replace(' ', '_')}_error`] = error;
          console.error(`❌ ${test.name} error:`, error);
        }
      }

      setDebugInfo(results);
    } catch (error) {
      console.error('❌ Debug test error:', error);
      setDebugInfo({ globalError: error });
    } finally {
      setLoading(false);
      console.log('🔧 Debug tests completed');
    }
  };

  useEffect(() => {
    runDebugTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🔧 Sysconfig Debug Panel</h2>
        <button
          onClick={runDebugTests}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Testing...
            </div>
          ) : (
            'Run Tests'
          )}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}

        {Object.keys(debugInfo).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click "Run Tests" to start debugging
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-4">🧪 Live Dropdown Testing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Family</label>
            <ProductFamilySelector
              value={testValues.productFamily}
              onChange={(value) => setTestValues(prev => ({ ...prev, productFamily: value }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {testValues.productFamily || 'None'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
            <SiteSelector
              value={testValues.site}
              onChange={(value) => setTestValues(prev => ({ ...prev, site: value }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {testValues.site || 'None'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tab</label>
            <TabSelector
              value={testValues.tab}
              onChange={(value) => setTestValues(prev => ({ ...prev, tab: value }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {testValues.tab || 'None'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <ProductTypeSelector
              value={testValues.productType}
              onChange={(value) => setTestValues(prev => ({ ...prev, productType: value }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {testValues.productType || 'None'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <CustomerSelector
              value={testValues.customer}
              onChange={(value) => setTestValues(prev => ({ ...prev, customer: value }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {testValues.customer || 'None'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🔍 Debugging Steps:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Check the console for detailed logs</li>
          <li>2. Verify API endpoints are working</li>
          <li>3. Check if sysconfig data exists in database</li>
          <li>4. Verify data format matches expected structure</li>
          <li>5. Test individual dropdown functions</li>
          <li>6. Test the live dropdown components above</li>
        </ol>
        <p className="text-sm text-blue-700 mt-2">
          🧪 <strong>Test Mode:</strong> Using mock data in development mode for immediate testing
        </p>
      </div>
    </div>
  );
};

export default SysconfigDebug;