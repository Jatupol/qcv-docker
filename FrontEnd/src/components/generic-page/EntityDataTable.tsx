// client/src/components/generic-page/EntityDataTable.tsx
// Data Table Component for Entity Pages
// Complete Separation Entity Architecture - Self-contained Table component

import React from 'react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import Pagination from '../ui/Pagination';
import { formatDate } from '../../utils/formatUtils';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

// ============ INTERFACES ============

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string; // CSS class for width
  render?: (value: any, entity: T) => React.ReactNode;
  className?: string;
}

export interface EntityDataTableProps<T = any> {
  // Data
  entities: T[];
  loading: boolean;
  error: string | null;
  
  // Table Configuration
  columns: TableColumn<T>[];
  
  // Row Actions
  onView?: (entity: T) => void;
  onEdit?: (entity: T) => void;
  onDelete?: (entity: T) => void;
  onToggleStatus?: (entity: T) => void;
  customRowActions?: (entity: T) => React.ReactNode;
  
  // Loading States
  statusToggleLoading?: Set<string>;
  getEntityId?: (entity: T) => string;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  
  // Empty State
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: string;
  onEmptyStateAction?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  
  // Styling
  className?: string;
  showSequenceNumber?: boolean; // Show sequence numbers
}


// ============ COMPONENT ============

const EntityDataTable = <T extends Record<string, any>>({
  entities,
  loading,
  error,
  columns,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  customRowActions,
  statusToggleLoading = new Set(),
  getEntityId = (entity) => entity.id || entity.code,
  sortBy,
  sortOrder,
  onSort,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  onEmptyStateAction,
  hasActiveFilters = false,
  onClearFilters,
  className = '',
  showSequenceNumber = true // Default to showing sequence numbers
}: EntityDataTableProps<T>) => {
  // Handle column sorting
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    onSort(columnKey);
  };

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return null;
    
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="h-3 w-3" />
    ) : (
      <ArrowDownIcon className="h-3 w-3" />
    );
  };

  // Default column renderers
  const defaultRenderers = {
    status: (value: boolean, entity: T) => {
      const entityId = getEntityId(entity);
      const isToggling = statusToggleLoading.has(entityId);
      
      return (
        <button
          onClick={() => onToggleStatus?.(entity)}
          disabled={isToggling || !onToggleStatus}
          className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors
            ${value 
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
            } ${isToggling || !onToggleStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isToggling ? (
            <LoadingSpinner size="xs" className="mr-1" />
          ) : value ? (
            <CheckCircleIcon className="w-3 h-3 mr-1" />
          ) : (
            <XCircleIcon className="w-3 h-3 mr-1" />
          )}
          {value ? 'Active' : 'Inactive'}
        </button>
      );
    },
    date: (value: string) => (
      <span className="text-sm text-gray-500">
        {formatDate(value, 'N/A')}
      </span>
    ),
    actions: (entity: T) => (
      <div className="flex items-center space-x-1">
        {onEdit && (
          <button
            onClick={() => onEdit(entity)}
            className="inline-flex items-center px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Edit"
          >
            <PencilIcon className="h-3 w-3 mr-1" />
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(entity)}
            className="inline-flex items-center px-2.5 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Delete"
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Delete
          </button>
        )}
        {onView && (
          <button
            onClick={() => onView(entity)}
            className="inline-flex items-center px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="View"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            View
          </button>
        )}
        {customRowActions?.(entity)}
      </div>
    )
  };

  // Render cell content
  const renderCellContent = (column: TableColumn<T>, entity: T) => {
    const value = entity[column.key];
    
    if (column.render) {
      return column.render(value, entity);
    }
    
    // Use default renderers for common column types
    if (column.key === 'is_active' || column.key === 'active' || column.key === 'status') {
      return defaultRenderers.status(value, entity);
    }
    
    if (column.key.includes('date') || column.key.includes('_at')) {
      return defaultRenderers.date(value);
    }
    
    if (column.key === 'actions') {
      return defaultRenderers.actions(entity);
    }
    
    // Special handling for code and id columns
    if (column.key === 'code' || column.key === 'id') {
      return (
        <div className="text-sm font-mono text-gray-900">
          {value}
        </div>
      );
    }
    
    // Special handling for name column
    if (column.key === 'name') {
      return (
        <div className="text-sm font-medium text-gray-900">
          {value}
        </div>
      );
    }
    
    // Special handling for description column
    if (column.key === 'description') {
      return (
        <div className="text-sm text-gray-600 max-w-xs">
          {value ? (
            value.length > 60 
              ? `${value.substring(0, 60)}...`
              : value
          ) : (
            <span className="text-gray-400 italic">No description</span>
          )}
        </div>
      );
    }
    
    // Default text rendering
    return (
      <div className="text-sm text-gray-900">
        {value || 'N/A'}
      </div>
    );
  };

  // Render table header
  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {/* Sequence Number Column */}
        {showSequenceNumber && (
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            #
          </th>
        )}
        
        {/* Dynamic Columns */}
        {columns.map((column) => (
          <th key={column.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {column.sortable && onSort ? (
              <button
                onClick={() => handleSort(column.key)}
                className="flex items-center gap-1 hover:text-orange-600"
              >
                {column.label}
                {renderSortIcon(column.key)}
              </button>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Render table row
  const renderTableRow = (entity: T, index: number) => {
    // Calculate sequence number based on current page and index
    const sequenceNumber = (currentPage - 1) * pageSize + index + 1;
    
    return (
      <tr 
        key={getEntityId(entity) || index} 
        className={`hover:bg-orange-25 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
      >
        {/* Sequence Number */}
        {showSequenceNumber && (
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {sequenceNumber}
          </td>
        )}
        
        {/* Dynamic Columns */}
        {columns.map((column) => (
          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
            {renderCellContent(column, entity)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-6">
          <EmptyState
            title="Error loading data"
            description={error}
            action={
              onEmptyStateAction
                ? {
                    label: "Try Again",
                    onClick: onEmptyStateAction
                  }
                : undefined
            }
          />
        </div>
      ) : entities.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title={emptyStateTitle || "No data found"}
            description={emptyStateDescription || "There are no items to display."}
            action={
              hasActiveFilters && onClearFilters
                ? {
                    label: "Clear Filters",
                    onClick: onClearFilters
                  }
                : onEmptyStateAction
                ? {
                    label: emptyStateAction || "Add New",
                    onClick: onEmptyStateAction
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {renderTableHeader()}
              <tbody className="bg-white divide-y divide-gray-200">
                {entities.map((entity, index) => renderTableRow(entity, index))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EntityDataTable;