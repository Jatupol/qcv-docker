// client/src/pages/report/FVIInspectionPage.tsx
// ===== VALIDATION WITH DBFVI =====

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { getFVIInspection, deleteFVILotInput } from '../../services/reportService';
import { formatDateTime, getTodayDateString } from '../../utils/formatUtils';
import { exportToExcel, ExcelFormatters } from '../../utils/excelUtils';

// ============ INTERFACES ============

interface FVIInspectionRecord {
  inputdate: string | null;
  lotno: string;
  partsite: string | null;
  lineno: string | null;
  itemno: string | null;
  model: string | null;
  version: string | null;
  station: string | null;
  round: number | null;
  fvilineno: string | null;
  judgment: boolean | null;
  inspection_date: string | null;
}

// ============ COMPONENT ============

const FVIInspectionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null); // lotno being deleted
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [data, setData] = useState<FVIInspectionRecord[]>([]);

  // Pagination
  const PAGE_SIZE = 30;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const today = getTodayDateString();
  const [inputDateFrom, setInputDateFrom] = useState(today);
  const [inputDateTo, setInputDateTo] = useState(today);
  const [lotno, setLotno] = useState('');
  const [judgment, setJudgment] = useState<string>('');

  // ============ FETCH DATA ============

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (inputDateFrom) params.inputDateFrom = inputDateFrom;
      if (inputDateTo) params.inputDateTo = inputDateTo;
      if (lotno.trim()) params.lotno = lotno.trim();
      if (judgment) params.judgment = judgment;

      const result = await getFVIInspection(params);

      if (result.success && result.data) {
        setData(result.data);
        setCurrentPage(1);
      } else {
        setError(result.message || 'Failed to fetch FVI Inspection data');
      }
    } catch (err) {
      setError('Failed to fetch FVI Inspection data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputDateFrom('');
    setInputDateTo('');
    setLotno('');
    setJudgment('');
    setData([]);
    setCurrentPage(1);
  };

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetLot, setDeleteTargetLot] = useState<string | null>(null);

  const openDeleteModal = (lotnoToDelete: string) => {
    setDeleteTargetLot(lotnoToDelete);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetLot) return;

    setDeleteModalOpen(false);
    setDeleting(deleteTargetLot);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await deleteFVILotInput(deleteTargetLot);
      if (result.success) {
        setSuccessMsg(`Deleted lot ${deleteTargetLot} successfully`);
        setData(prev => prev.filter(row => row.lotno !== deleteTargetLot));
      } else {
        setError(result.message || 'Failed to delete lot');
      }
    } catch (err) {
      setError('Failed to delete lot');
      console.error(err);
    } finally {
      setDeleting(null);
      setDeleteTargetLot(null);
    }
  };

  const handleExportExcel = () => {
    if (data.length === 0) return;
    exportToExcel(data, {
      filename: `Validation_DBFVI_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Validation with DBFVI',
      columns: [
        { key: 'inputdate', header: 'Input Date', width: 18, formatter: ExcelFormatters.datetime },
        { key: 'lotno', header: 'Lot No', width: 25 },
        { key: 'partsite', header: 'Part Site', width: 12 },
        { key: 'lineno', header: 'Line No', width: 10 },
        { key: 'itemno', header: 'Item No', width: 15 },
        { key: 'model', header: 'Model', width: 15 },
        { key: 'version', header: 'Version', width: 10 },
        { key: 'station', header: 'Station', width: 10 },
        { key: 'round', header: 'Round', width: 8 },
        { key: 'fvilineno', header: 'FVI Line No', width: 12 },
        { key: 'judgment', header: 'Judgment', width: 12, formatter: (val: boolean | null) => val === true ? 'Pass' : val === false ? 'Reject' : 'Not Inspect' },
        { key: 'inspection_date', header: 'Inspection Date', width: 18, formatter: ExcelFormatters.datetime },
      ],
    });
  };

  // Pagination helpers
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startRow = (currentPage - 1) * PAGE_SIZE;

  // ============ HELPERS ============

  // formatDate and formatDateTime are imported from ../../utils/formatUtils

  const getJudgmentDisplay = (val: boolean | null) => {
    if (val === true) return { text: 'Pass', className: 'bg-green-500 text-white' };
    if (val === false) return { text: 'Reject', className: 'bg-red-500 text-white' };
    return { text: 'Not Inspect', className: 'bg-gray-200 text-gray-500' };
  };

  const highlightLotno = (text: string) => {
    if (!lotno.trim() || !text) return text;
    const regex = new RegExp(`(${lotno.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <span key={i} className="bg-yellow-300 font-bold">{part}</span>
        : part
    );
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Validation with DBFVI</h1>
              <p className="text-gray-600 mt-2">Validation with DBFVI tracking report</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={data.length === 0}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
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
            <Alert variant="error" title="Error" message={error} dismissible onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6">
            <Alert variant="success" title="Success" message={successMsg} dismissible onDismiss={() => setSuccessMsg(null)} />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl shadow-sm mb-6 border border-gray-200">
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 px-4 py-2.5 flex items-center gap-2 rounded-t-xl">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-white text-sm font-semibold tracking-wide">Filters</span>
          </div>
          <div className="bg-white p-4 rounded-b-xl">
            <div className="flex flex-wrap items-end gap-3">
              {/* Input Date From */}
              <div className="w-44">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Input Date From</label>
                <input
                  type="date"
                  value={inputDateFrom}
                  onChange={(e) => setInputDateFrom(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40"
                />
              </div>

              {/* Input Date To */}
              <div className="w-44">
                <label className="block text-xs font-semibold text-orange-600 mb-0.5">Input Date To</label>
                <input
                  type="date"
                  value={inputDateTo}
                  onChange={(e) => setInputDateTo(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/40"
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Lot No */}
              <div className="w-52">
                <label className="block text-xs font-semibold text-blue-600 mb-0.5">Lot No</label>
                <input
                  type="text"
                  value={lotno}
                  onChange={(e) => setLotno(e.target.value)}
                  placeholder="Search lot number..."
                  className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/40"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Judgment */}
              <div className="w-40">
                <label className="block text-xs font-semibold text-purple-600 mb-0.5">Judgment</label>
                <select
                  value={judgment}
                  onChange={(e) => setJudgment(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 bg-purple-50/40"
                >
                  <option value="">All</option>
                  <option value="true">Pass</option>
                  <option value="false">Reject</option>
                  <option value="null">Not Inspect</option>
                </select>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex items-center px-5 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg hover:from-orange-600 hover:to-rose-600 shadow-sm transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Validation with DBFVI Results
                {data.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({data.length.toLocaleString()} records)</span>
                )}
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            {data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No data available. Please set filters and click Search.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Input Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Lot No</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Part Site</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Line No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Item No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Version</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Station</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Round</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">FVI Line No</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Judgment</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Inspection Date</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row, index) => {
                    const jdg = getJudgmentDisplay(row.judgment);
                    const rowNum = startRow + index + 1;
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{rowNum}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{formatDateTime(row.inputdate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{highlightLotno(row.lotno)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{row.partsite || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{row.lineno || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.itemno || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.model || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{row.version || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{row.station || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{row.round ?? '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{row.fvilineno || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${jdg.className}`}>
                            {jdg.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{formatDateTime(row.inspection_date)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {row.judgment === null && (
                            <button
                              onClick={() => openDeleteModal(row.lotno)}
                              disabled={deleting === row.lotno}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={`Delete lot ${row.lotno} from inf_lotinput`}
                            >
                              {deleting === row.lotno ? (
                                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data.length > PAGE_SIZE && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(startRow + 1).toLocaleString()}–{Math.min(startRow + PAGE_SIZE, data.length).toLocaleString()} of {data.length.toLocaleString()} records
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`dot-${idx}`} className="px-1 text-gray-400 text-sm">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={`px-3 py-1 text-sm rounded border ${
                          currentPage === item
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-orange-500 font-bold'
                            : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTargetLot(null); }}
        title="Confirm Delete"
        size="sm"
        variant="error"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setDeleteModalOpen(false); setDeleteTargetLot(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-3">
            Are you sure you want to delete this lot from <span className="font-semibold">inf_lotinput</span>?
          </p>
          {deleteTargetLot && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Lot No:</span>
                <span className="text-sm font-bold text-red-800">{deleteTargetLot}</span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3">
            This action cannot be undone. All records for this lot will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FVIInspectionPage;
