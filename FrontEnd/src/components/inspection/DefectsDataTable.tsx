// client/src/components/inspection/DefectsDataTable.tsx
// Reusable Defects DataTable Component
// Displays defect records in a professional datatable format
// Can work with either passed defects data OR fetch from API by inspectionNo

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ExclamationTriangleIcon, PhotoIcon, XMarkIcon, TrashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { type DefectDetail } from '../../types/inspectiondata';
import { defectDataService } from '../../services/defectDataService';
import { defectCustomerDataService } from '../../services/defectCustomerDataService';
import { formatDate } from '../../utils/formatUtils';
import { API } from '../../services/api';

// ==================== HELPER FUNCTIONS ====================

/**
 * Get full image URL by prepending API base URL to relative paths
 * This ensures images load correctly in both development and production
 */
const getImageUrl = (url: string): string => {
  if (!url) return '';
  // If URL is already absolute (starts with http:// or https://), return as-is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Prepend API base URL to relative paths
  return API.BASE_URL ? `${API.BASE_URL}${url}` : url;
};

// ==================== INTERFACES ====================

interface DefectsDataTableProps {
  defects?: DefectDetail[];  // Optional: Pass defects directly
  inspectionNo?: string;      // Optional: Fetch by inspection number
  showHeader?: boolean;
  showStatistics?: boolean;   // Optional: Show statistics below table
  showDelete?: boolean;       // Optional: Show delete button
  showResendEmail?: boolean;  // Optional: Show resend email button (subject to email conditions)
  serviceType?: 'defectdata' | 'defectdata-customer'; // Optional: Which service to use (default: 'defectdata')
  onDelete?: (defectId: number) => void; // Optional: Callback after delete
  onSuccess?: (message: string) => void; // Optional: Success callback for toast
  onError?: (message: string) => void;   // Optional: Error callback for toast
  className?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if email should be sent based on inspection_no and defect_type
 *
 * Email sending conditions (same logic as backend):
 * 1. OQA inspections: Send email if defect_type is 'Abnormal defect ≥1' or 'Normal repeat problem & area ≥3'
 * 2. OBA inspections: Send email if defect_type is 'Normal defect' or 'Abnormal defect ≥1' or 'Normal repeat problem & area ≥3'
 *
 * @param inspection_no - The inspection number
 * @param defect_type - The defect type
 * @returns boolean - True if email should be sent (and resend button should show), false otherwise
 */
const shouldShowResendEmailButton = (inspection_no: string, defect_type?: string): boolean => {
  if (!inspection_no || !defect_type) {
    return false;
  }

  // Extract first 3 digits of inspection_no
  const inspectionPrefix = inspection_no.substring(0, 3).toUpperCase();

  // Define email trigger conditions
  const oqaDefectTypes = [
    'Abnormal defect ≥1',
    'Normal repeat problem & area ≥3'
  ];

  const obaDefectTypes = [
    'Normal defect',
    'Abnormal defect ≥1',
    'Normal repeat problem & area ≥3'
  ];

  // Check conditions
  if (inspectionPrefix === 'OQA' || inspectionPrefix === 'SIV') {
    return oqaDefectTypes.includes(defect_type);
  } else if (inspectionPrefix === 'OBA') {
    return obaDefectTypes.includes(defect_type);
  }

  // Default: don't show button for other inspection types
  return false;
};

// ==================== MEMOIZED TABLE ROW COMPONENT ====================

interface TableRowProps {
  defect: DefectDetail;
  index: number;
  showDelete: boolean;
  showResendEmail: boolean; // Global setting - will be further filtered by email conditions
  sendingEmailId: number | null;
  onOpenImages: (images: string[]) => void;
  onDeleteClick: (id: number) => void;
  onResendEmailClick: (id: number) => void;
}

const TableRow = React.memo<TableRowProps>(({
  defect,
  index,
  showDelete,
  showResendEmail,
  sendingEmailId,
  onOpenImages,
  onDeleteClick,
  onResendEmailClick
}) => {
  return (
    <tr className="hover:bg-red-50 transition-colors">
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {index}
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {formatDate(defect.defect_date)}
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700 font-medium">
        {defect.inspector_fullname} ({defect.inspector})
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.qc_fullname  || '-'} ({defect.qc_name})
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.qclead_fullname || '-'} ({defect.qclead_name})
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.mbr_fullname ||'-'} ({defect.mbr_name})
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.linevi}
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.groupvi}
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.station}
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.defect_type || '-'}
      </td>
      <td className="border border-red-300 px-2 py-2 text-gray-700">
        {defect.defect_name && <div className="text-xs text-gray-600">{defect.defect_name}</div>}
      </td>
      <td className="border border-red-300 px-2 py-2 text-center">
        <span className="bg-red-600 text-white px-2 py-1 rounded-full font-bold">
          {defect.ng_qty}
        </span>
      </td>
      <td className="border border-red-300 px-2 py-2 text-center">
        {defect.image_urls && defect.image_urls.length > 0 ? (
          <button
            onClick={() => onOpenImages(defect.image_urls || [])}
            className="flex items-center justify-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors w-full"
            title="Click to view images"
          >
            <PhotoIcon className="h-4 w-4 text-blue-600 mr-1" />
            <span className="font-semibold text-blue-600">{defect.image_urls.length}</span>
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      {(showDelete || showResendEmail) && defect.id && (
        <td className="border border-red-300 px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            {showResendEmail && shouldShowResendEmailButton(defect.inspection_no, defect.defect_type) && (
              <button
                onClick={() => onResendEmailClick(defect.id!)}
                disabled={sendingEmailId === defect.id}
                className={`inline-flex items-center justify-center p-1 rounded transition-colors ${
                  sendingEmailId === defect.id
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'hover:bg-green-100'
                }`}
                title="Resend defect notification email"
              >
                {sendingEmailId === defect.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                ) : (
                  <EnvelopeIcon className="h-4 w-4 text-green-600" />
                )}
              </button>
            )}
            {showDelete && (
              <button
                onClick={() => onDeleteClick(defect.id!)}
                className="inline-flex items-center justify-center p-1 hover:bg-red-100 rounded transition-colors"
                title="Delete defect record"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

// ==================== COMPONENT ====================

const DefectsDataTableComponent: React.FC<DefectsDataTableProps> = ({
  defects: propDefects,
  inspectionNo,
  showHeader = true,
  showStatistics = false,
  showDelete = false,
  showResendEmail = false,
  serviceType = 'defectdata',
  onDelete,
  onSuccess,
  onError,
  className = ''
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // State for fetched defects
  const [fetchedDefects, setFetchedDefects] = useState<DefectDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page

  // State for email sending
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);

  // State for confirmation modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [selectedDefectId, setSelectedDefectId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch defects when inspectionNo is provided
  useEffect(() => {
    const fetchDefects = async () => {
      if (!inspectionNo) return;

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching defect details for inspection:', inspectionNo, 'using service:', serviceType);

        // Select the appropriate service based on serviceType
        const service = serviceType === 'defectdata-customer' ? defectCustomerDataService : defectDataService;

        // Fetch enriched defect details (includes fullnames and image_urls from backend)
        const response = await service.getDetailByInspectionNo(inspectionNo);

        if (response.success && response.data) {
          console.log('✅ Loaded defect details with images:', response.data);

          // Map response data to DefectDetail format
          // Backend already includes image_urls from v_defect_image view
          const defectsWithImages = response.data.map((defect: any) => {
            return {
              ...defect,
              // Ensure image_urls is an array (backend provides it)
              image_urls: defect.image_urls || []
            } as DefectDetail;
          });

          setFetchedDefects(defectsWithImages);
          console.log('✅ Set defects with images:', defectsWithImages.length, 'defects');
        } else {
          setError(response.message || 'Failed to load defects');
          console.error('❌ Failed to load defects:', response.message);
        }
      } catch (err) {
        setError('Network error loading defects');
        console.error('❌ Error fetching defects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, [inspectionNo, serviceType]);

  // Use either prop defects or fetched defects
  const defects = propDefects || fetchedDefects;

  // Reset to page 1 when defects change
  useEffect(() => {
    setCurrentPage(1);
  }, [defects.length]);

  // Memoize expensive calculations
  const totalNG = useMemo(() => {
    return defects ? defects.reduce((sum, d) => sum + d.ng_qty, 0) : 0;
  }, [defects]);

  // Paginated defects
  const paginatedDefects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return defects.slice(startIndex, endIndex);
  }, [defects, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(defects.length / itemsPerPage);
  }, [defects.length, itemsPerPage]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleOpenImages = useCallback((images: string[]) => {
    if (images && images.length > 0) {
      setSelectedImages(images);
      setCurrentImageIndex(0);
      setIsImageModalOpen(true);
    }
  }, []);

  const handleCloseImages = useCallback(() => {
    setIsImageModalOpen(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  }, []);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : selectedImages.length - 1));
  }, [selectedImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : 0));
  }, [selectedImages.length]);

  // Open delete confirmation modal
  const handleDeleteClick = (defectId: number) => {
    setSelectedDefectId(defectId);
    setShowDeleteModal(true);
  };

  // Open resend email confirmation modal
  const handleResendEmailClick = (defectId: number) => {
    setSelectedDefectId(defectId);
    setShowResendModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedDefectId) return;

    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting defect:', selectedDefectId);
      // Select the appropriate service based on serviceType
      const service = serviceType === 'defectdata-customer' ? defectCustomerDataService : defectDataService;
      const response = await service.delete(selectedDefectId);

      if (response.success) {
        console.log('✅ Defect deleted successfully');

        // Show success message
        if (onSuccess) {
          onSuccess('Defect record deleted successfully');
        }

        // Call the onDelete callback if provided
        if (onDelete) {
          onDelete(selectedDefectId);
        }

        // If using inspectionNo mode, refetch the data
        if (inspectionNo) {
          setFetchedDefects(prev => prev.filter(d => d.id !== selectedDefectId));
        }

        // Close modal
        setShowDeleteModal(false);
        setSelectedDefectId(null);
      } else {
        // Extract error message from response
        let errorMsg = 'Unknown error';
        if (response.message) {
          errorMsg = response.message;
        } else if (response.errors && response.errors.length > 0) {
          errorMsg = response.errors[0].message;
        }

        console.error('❌ Failed to delete defect:', errorMsg, response);

        if (onError) {
          onError('Failed to delete defect: ' + errorMsg);
        }

        // Close modal on error too
        setShowDeleteModal(false);
        setSelectedDefectId(null);
      }
    } catch (err) {
      console.error('❌ Error deleting defect:', err);

      if (onError) {
        onError('Error deleting defect. Please try again.');
      }

      // Close modal on exception
      setShowDeleteModal(false);
      setSelectedDefectId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm resend email
  const confirmResendEmail = async () => {
    if (!selectedDefectId) return;

    try {
      setSendingEmailId(selectedDefectId);
      console.log('📧 Resending defect email for defect:', selectedDefectId);

      // Select the appropriate service based on serviceType
      const service = serviceType === 'defectdata-customer' ? defectCustomerDataService : defectDataService;
      const response = await service.resendEmail(selectedDefectId);

      if (response.success) {
        console.log('✅ Email sent successfully');

        if (onSuccess) {
          onSuccess('Email sent successfully!');
        }

        // Close modal
        setShowResendModal(false);
        setSelectedDefectId(null);
      } else {
        // Extract error message from response
        let errorMsg = 'Unknown error';
        if (response.message) {
          errorMsg = response.message;
        } else if (response.errors && response.errors.length > 0) {
          errorMsg = response.errors[0].message;
        }

        console.error('❌ Failed to send email:', errorMsg, response);

        if (onError) {
          onError('Failed to send email: ' + errorMsg);
        }

        // Close modal on error too
        setShowResendModal(false);
        setSelectedDefectId(null);
      }
    } catch (err) {
      console.error('❌ Error sending email:', err);

      if (onError) {
        onError('Error sending email. Please try again.');
      }

      // Close modal on exception
      setShowResendModal(false);
      setSelectedDefectId(null);
    } finally {
      setSendingEmailId(null);
    }
  };

  // Cancel modals
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDefectId(null);
  };

  const cancelResendEmail = () => {
    setShowResendModal(false);
    setSelectedDefectId(null);
  };

  // Keyboard navigation for image viewer
  React.useEffect(() => {
    if (!isImageModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseImages();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen, selectedImages.length]);

  // Render conditional states
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
        <p className="text-gray-600 text-sm mt-4">Loading defect records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Error loading defects: {error}</p>
      </div>
    );
  }

  if (!defects || defects.length === 0) {
    if (!inspectionNo) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No inspection data available</p>
          <p className="text-sm text-gray-400 mt-2">Please complete the inspection form above first</p>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No defect records yet</p>
        <p className="text-sm text-gray-400 mt-2">Defect records will appear here once submitted</p>
      </div>
    );
  }

  return (
    <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-3 ${className}`}>
      {showHeader && (
        <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Defect Records ({defects.length} defects, Total NG: {totalNG})
        </h4>
      )}

      {/* Defect DataTable */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-red-100 sticky top-0">
            <tr>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">#</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Date</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Inspector</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">QC Name</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">QC Leader</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">FVI Leader</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Line</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Group</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Station</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Defect Type</th>
              <th className="border border-red-300 px-2 py-2 text-left font-semibold text-red-900">Defect</th>
              <th className="border border-red-300 px-2 py-2 text-center font-semibold text-red-900">NG Qty</th>
              <th className="border border-red-300 px-2 py-2 text-center font-semibold text-red-900">Photos</th>
              {(showDelete || showResendEmail) && (
                <th className="border border-red-300 px-2 py-2 text-center font-semibold text-red-900">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedDefects.map((defect, index) => (
              <TableRow
                key={defect.id || index}
                defect={defect}
                index={(currentPage - 1) * itemsPerPage + index + 1}
                showDelete={showDelete}
                showResendEmail={showResendEmail}
                sendingEmailId={sendingEmailId}
                onOpenImages={handleOpenImages}
                onDeleteClick={handleDeleteClick}
                onResendEmailClick={handleResendEmailClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-red-200 pt-3">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, defects.length)} of {defects.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {isImageModalOpen && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]" onClick={handleCloseImages}>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={handleCloseImages}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              title="Close (ESC)"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm z-10">
              {currentImageIndex + 1} / {selectedImages.length}
            </div>

            {/* Previous Button */}
            {selectedImages.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all z-10"
                title="Previous (←)"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image */}
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={getImageUrl(selectedImages[currentImageIndex])}
                alt={`Defect image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next Button */}
            {selectedImages.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all z-10"
                title="Next (→)"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Keyboard Navigation Hint */}
            {selectedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-xs z-10">
                Use ← → arrow keys to navigate
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={cancelDelete}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Delete Defect Record</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this defect record? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resend Email Confirmation Modal */}
      {showResendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={cancelResendEmail}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Resend Email Notification</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to resend the defect notification email?
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelResendEmail}
                  disabled={sendingEmailId !== null}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResendEmail}
                  disabled={sendingEmailId !== null}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingEmailId !== null ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {showStatistics && defects && defects.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-700">{defects.length}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">Total Records</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-3xl font-bold text-red-700">
                {defects.reduce((sum, record) => sum + record.ng_qty, 0)}
              </div>
              <div className="text-xs text-red-600 font-semibold mt-1">Total Defects</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const DefectsDataTable = React.memo(DefectsDataTableComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.inspectionNo === nextProps.inspectionNo &&
    prevProps.showHeader === nextProps.showHeader &&
    prevProps.showStatistics === nextProps.showStatistics &&
    prevProps.showDelete === nextProps.showDelete &&
    prevProps.showResendEmail === nextProps.showResendEmail &&
    prevProps.serviceType === nextProps.serviceType &&
    prevProps.defects === nextProps.defects &&
    prevProps.className === nextProps.className
  );
});

export default DefectsDataTable;
