// client/src/pages/interface/ImportUserOperationPage.tsx
// User Operation Interface Page - View and sync user/operator data from MSSQL

import React, { useState, useEffect } from 'react';
import type {
  InfUserOperationRecord,
  SyncStats,
  SyncStep,
  DataFilters
} from '../../types/inf-useroperation';
import { infUserOperationService } from '../../services/infUserOperationService';

const ImportUserOperationPage: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================

  // Data state
  const [data, setData] = useState<InfUserOperationRecord[]>([]);
  const [filteredData, setFilteredData] = useState<InfUserOperationRecord[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<SyncStep>(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({});
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Filter state
  const [filters, setFilters] = useState<DataFilters>({
    usernameSearch: '',
    operatorNameSearch: '',
    roleCodeFilter: '',
    lineNoIdFilter: '',
    workShiftIdFilter: '',
    isActiveFilter: null,
    isMrbFilter: null
  });

  // ==================== DATA LOADING ====================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await infUserOperationService.fetchUserOperationData({
        limit: 10000 // Fetch all records
      });

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to load data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Username search
    if (filters.usernameSearch) {
      filtered = filtered.filter(record =>
        record.username.toLowerCase().includes(filters.usernameSearch.toLowerCase())
      );
    }

    // Operator name search
    if (filters.operatorNameSearch) {
      filtered = filtered.filter(record =>
        record.operatorName?.toLowerCase().includes(filters.operatorNameSearch.toLowerCase())
      );
    }

    // Role filter
    if (filters.roleCodeFilter) {
      filtered = filtered.filter(record => record.roleCode === filters.roleCodeFilter);
    }

    // Line No filter
    if (filters.lineNoIdFilter) {
      filtered = filtered.filter(record => record.lineNoId === filters.lineNoIdFilter);
    }

    // Work Shift filter
    if (filters.workShiftIdFilter) {
      filtered = filtered.filter(record => record.workShiftId === filters.workShiftIdFilter);
    }

    // Active filter
    if (filters.isActiveFilter !== null) {
      filtered = filtered.filter(record => record.isActive === filters.isActiveFilter);
    }

    // MRB filter
    if (filters.isMrbFilter !== null) {
      filtered = filtered.filter(record => record.isMrb === filters.isMrbFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // ==================== SYNC HANDLER ====================

  const handleSync = async () => {
    setSyncing(true);
    setShowSyncModal(true);
    setError(null);

    try {
      // Step 1: Connect
      setSyncStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Fetch
      setSyncStep(2);
      const response = await infUserOperationService.syncData();

      // Step 3: Import
      setSyncStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Results
      setSyncStep(4);

      if (response.success && response.data) {
        setSyncStats(response.data);
        setSuccess(`Sync completed: ${response.data.imported} imported, ${response.data.updated} updated, ${response.data.skipped} skipped${response.data.failed ? `, ${response.data.failed} failed` : ''}`);
        await loadData();
      } else {
        const errorDetails = response.errors?.join(', ') || response.error || response.message || 'Sync failed';
        setError(`Sync failed: ${errorDetails}`);
        console.error('Sync error details:', response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(`Sync failed: ${errorMessage}`);
      console.error('Sync exception:', err);
    } finally {
      setSyncing(false);
    }
  };

  const closeSyncModal = () => {
    setShowSyncModal(false);
    setSyncStep(0);
    setSyncStats({});
  };

  // ==================== PAGINATION ====================

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Operation Interface</h1>
        <p className="text-gray-600 mt-1">View and sync user/operator data from external MSSQL database</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Filters Panel */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search username..."
            value={filters.usernameSearch}
            onChange={(e) => setFilters({...filters, usernameSearch: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Search operator name..."
            value={filters.operatorNameSearch}
            onChange={(e) => setFilters({...filters, operatorNameSearch: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Filter by Line No..."
            value={filters.lineNoIdFilter}
            onChange={(e) => setFilters({...filters, lineNoIdFilter: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.isActiveFilter === null ? '' : filters.isActiveFilter ? 'true' : 'false'}
            onChange={(e) => setFilters({...filters, isActiveFilter: e.target.value === '' ? null : e.target.value === 'true'})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Operator Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Line No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Shift</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Imported At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                currentItems.map((record, index) => (
                  <tr key={record.username} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.operatorName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.roleCode || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.lineNoId || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.workShiftId || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {infUserOperationService.formatDateTime(record.importedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} results
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Syncing from MSSQL</h2>

            <div className="space-y-4">
              {/* Step 1: Connect */}
              <div className={`flex items-center ${syncStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  syncStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  {syncStep > 1 ? '✓' : '1'}
                </div>
                <span>Connecting to MSSQL...</span>
                {syncStep === 1 && <div className="ml-auto animate-spin">⟳</div>}
              </div>

              {/* Step 2: Fetch */}
              <div className={`flex items-center ${syncStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  syncStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  {syncStep > 2 ? '✓' : '2'}
                </div>
                <span>Fetching records...</span>
                {syncStep === 2 && <div className="ml-auto animate-spin">⟳</div>}
              </div>

              {/* Step 3: Import */}
              <div className={`flex items-center ${syncStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  syncStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  {syncStep > 3 ? '✓' : '3'}
                </div>
                <span>Importing to database...</span>
                {syncStep === 3 && <div className="ml-auto animate-spin">⟳</div>}
              </div>

              {/* Step 4: Results */}
              {syncStep === 4 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">Sync Completed!</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>Imported: {syncStats.imported || 0}</div>
                    <div>Updated: {syncStats.updated || 0}</div>
                    <div>Skipped: {syncStats.skipped || 0}</div>
                    {syncStats.failed && syncStats.failed > 0 && (
                      <div className="text-red-600">Failed: {syncStats.failed}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeSyncModal}
                disabled={syncing}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportUserOperationPage;
