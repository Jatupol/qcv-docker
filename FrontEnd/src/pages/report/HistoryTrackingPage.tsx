// client/src/pages/report/HistoryTrackingPage.tsx
// ===== HISTORY TRACKING REPORT PAGE =====

import React, { useState, useCallback } from 'react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getHistoryTracking } from '../../services/reportService';
import type { HistoryTrackingRecord } from '../../types/report';
import { apiBaseUrl } from '../../services/api';

// ============ CONSTANTS ============

const MAX_LOT_NUMBERS = 10;
const IMAGE_BASE_URL = apiBaseUrl('defect-image');

// ============ COMPONENT ============

const HistoryTrackingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lotNumbersText, setLotNumbersText] = useState('');
  const [data, setData] = useState<HistoryTrackingRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ============ HANDLERS ============

  const parseLotNumbers = useCallback((): string[] => {
    return lotNumbersText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [lotNumbersText]);

  const handleSearch = async () => {
    const lotNumbers = parseLotNumbers();

    if (lotNumbers.length === 0) {
      setError('Please enter at least one lot number');
      return;
    }

    if (lotNumbers.length > MAX_LOT_NUMBERS) {
      setError(`Maximum ${MAX_LOT_NUMBERS} lot numbers allowed. You entered ${lotNumbers.length}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryTracking(lotNumbers);

      if (response.success && response.data) {
        setData(response.data);
        setHasSearched(true);
        if (response.data.length === 0) {
          setError('No records found for the given lot numbers');
        }
      } else {
        setError(response.message || 'Failed to fetch history tracking data');
      }
    } catch (err) {
      setError('Failed to fetch history tracking data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageAsBase64 = async (imageId: number): Promise<{ base64: string; extension: 'jpeg' | 'png' } | null> => {
    try {
      const response = await fetch(`${IMAGE_BASE_URL}/${imageId}`, { credentials: 'include' });
      if (!response.ok) return null;
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const extension = blob.type === 'image/png' ? 'png' : 'jpeg';
      return { base64, extension };
    } catch {
      return null;
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) return;
    setExporting(true);

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('History Tracking');

      // Define columns
      const columns: { header: string; key: string; width: number }[] = [
        { header: 'No.', key: 'seq', width: 6 },
        { header: 'WW', key: 'ww', width: 8 },
        { header: 'Shift', key: 'shift', width: 8 },
        { header: 'Sampling Reason', key: 'sampling_reason_description', width: 20 },
        { header: 'Round', key: 'round', width: 8 },
        { header: 'Lot No', key: 'lotno', width: 20 },
        { header: 'Tab', key: 'tab', width: 10 },
        { header: 'Model', key: 'model', width: 15 },
        { header: 'Production Site', key: 'partsite', width: 15 },
        { header: 'Customer', key: 'customers', width: 15 },
        { header: 'Part No Customer', key: 'partno_customer', width: 20 },
        { header: 'MC Line No', key: 'mclineno', width: 12 },
        { header: 'FVI Lot Qty', key: 'fvi_lot_qty', width: 12 },
        { header: 'General Sampling Qty', key: 'general_sampling_qty', width: 18 },
        { header: 'Crack Sampling Qty', key: 'crack_sampling_qty', width: 18 },
        { header: 'QC Sampling Name', key: 'qc_name', width: 20 },
        { header: 'Judgment', key: 'judgment', width: 10 },
        { header: 'Reject Qty', key: 'rejqty', width: 10 },
        { header: 'Defect Type', key: 'defect_type', width: 15 },
        { header: 'Defect Name', key: 'defectname', width: 20 },
        { header: 'Photo', key: 'photo', width: 30 },
      ];

      worksheet.columns = columns;

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Add data rows
      for (let idx = 0; idx < data.length; idx++) {
        const row = data[idx];
        worksheet.addRow({
          seq: idx + 1,
          ww: row.ww,
          shift: row.shift || '',
          sampling_reason_description: row.sampling_reason_description || '',
          round: row.round,
          lotno: row.lotno,
          tab: row.tab || '',
          model: row.model || '',
          partsite: row.partsite || '',
          customers: row.customers || '',
          partno_customer: row.partno_customer || '',
          mclineno: row.mclineno || '',
          fvi_lot_qty: row.fvi_lot_qty ?? '',
          general_sampling_qty: row.general_sampling_qty ?? '',
          crack_sampling_qty: row.crack_sampling_qty ?? '',
          qc_name: row.qc_name || '',
          judgment: row.judgment === null ? '' : row.judgment ? 'Pass' : 'Fail',
          rejqty: row.rejqty ?? '',
          defect_type: row.defect_type || '',
          defectname: row.defectname || '',
          photo: '',
        });
      }

      // Embed images (up to 3 per row)
      const photoColIndex = columns.length - 1; // 0-based index for Photo column

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row.image_ids || row.image_ids.length === 0) continue;

        const excelRowIndex = i + 1; // +1 for header row (exceljs rows are 1-based, data starts at row 2)
        const dataRow = worksheet.getRow(excelRowIndex + 1);
        dataRow.height = 60;

        const imageIds = row.image_ids.slice(0, 3);
        const imageResults = await Promise.all(imageIds.map(id => fetchImageAsBase64(id)));

        let imgOffset = 0;
        for (const imgData of imageResults) {
          if (!imgData) continue;

          const imageId = workbook.addImage({
            base64: imgData.base64,
            extension: imgData.extension,
          });

          worksheet.addImage(imageId, {
            tl: { col: photoColIndex + imgOffset * 0.3, row: excelRowIndex },
            ext: { width: 60, height: 55 },
          });
          imgOffset++;
        }
      }

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `History_Tracking_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export Excel file');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenImages = (imageIds: number[]) => {
    if (imageIds && imageIds.length > 0) {
      setModalImages(imageIds);
      setCurrentImageIndex(0);
      setIsImageModalOpen(true);
    }
  };

  const handleCloseImages = () => {
    setIsImageModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">History Tracking Report</h1>
              <p className="text-gray-600 mt-1">
                Search inspection history by lot numbers (max {MAX_LOT_NUMBERS})
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={data.length === 0 || exporting}
                isLoading={exporting}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Numbers (one per line, max {MAX_LOT_NUMBERS})
              </label>
              <textarea
                value={lotNumbersText}
                onChange={(e) => setLotNumbersText(e.target.value)}
                placeholder={'Enter lot numbers, one per line...\nExample:\nLOT001\nLOT002\nLOT003'}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                {parseLotNumbers().length} / {MAX_LOT_NUMBERS} lot numbers entered
              </p>
            </div>
            <div className="pt-6">
              <Button
                onClick={handleSearch}
                isLoading={loading}
                className="flex items-center px-6"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
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

        {/* Results Table */}
        {hasSearched && data.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results ({data.length} records)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">No.</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">WW</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Shift</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Sampling Reason</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Round</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Lot No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tab</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Model</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Production Site</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Part No Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">MC Line No</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">FVI Lot Qty</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">General Sampling Qty</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Crack Sampling Qty</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">QC Sampling Name</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Judgment</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Reject Qty</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Defect Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Defect Name</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Photo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-center text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.ww}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.shift || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.sampling_reason_description || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.round}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{row.lotno}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.tab || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.model || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.partsite || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.customers || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.partno_customer || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.mclineno || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">{row.fvi_lot_qty ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">{row.general_sampling_qty ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">{row.crack_sampling_qty ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.qc_name || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        {row.judgment === null ? '-' : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.judgment
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.judgment ? 'Pass' : 'Fail'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">{row.rejqty ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.defect_type || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.defectname || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        {row.image_ids && row.image_ids.length > 0 ? (
                          <button
                            onClick={() => handleOpenImages(row.image_ids!)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="View photos"
                          >
                            <div className="flex -space-x-1">
                              {row.image_ids.slice(0, 3).map((imgId) => (
                                <img
                                  key={imgId}
                                  src={`${IMAGE_BASE_URL}/${imgId}`}
                                  alt="defect"
                                  className="w-8 h-8 rounded border-2 border-white object-cover shadow-sm"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                            {row.image_ids.length > 3 && (
                              <span className="text-xs text-gray-500">+{row.image_ids.length - 3}</span>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {hasSearched && data.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No records found for the given lot numbers</p>
          </div>
        )}

        {/* Image Modal */}
        {isImageModalOpen && modalImages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleCloseImages}>
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <span className="text-sm font-medium text-gray-700">
                  Photo {currentImageIndex + 1} of {modalImages.length}
                </span>
                <button
                  onClick={handleCloseImages}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center p-4 min-h-[400px]">
                <img
                  src={`${IMAGE_BASE_URL}/${modalImages[currentImageIndex]}`}
                  alt={`Defect photo ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              {/* Navigation */}
              {modalImages.length > 1 && (
                <div className="flex items-center justify-center gap-4 px-4 py-3 bg-gray-50 border-t">
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : modalImages.length - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {modalImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < modalImages.length - 1 ? prev + 1 : 0)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTrackingPage;
