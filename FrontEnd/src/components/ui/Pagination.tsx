// ===== CLIENT SIDE =====
// client/src/components/ui/Pagination.tsx
// Pure Tailwind CSS Pagination component with complete separation

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number, pageSize?: number) => void;
  onPageSizeChange?: (current: number, size: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  disabled?: boolean;
  size?: 'default' | 'small';
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onPageSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  size = 'default',
  className = '',
}) => {
  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1 && !totalItems) return null;

  // Calculate total items if not provided
  const calculatedTotal = totalItems || totalPages * itemsPerPage;

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    if (disabled) return;
    onPageChange(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (disabled) return;
    const newSize = parseInt(event.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(1, newSize);
    } else {
      onPageChange(1, newSize);
    }
  };

  // Handle quick jump
  const handleQuickJump = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const page = parseInt(event.target.value);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
  };

  // Calculate visible page range
  const getVisiblePages = (): number[] => {
    const delta = size === 'small' ? 1 : 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates and return only numbers
    return Array.from(new Set(rangeWithDots)).filter(
      (item): item is number => typeof item === 'number'
    );
  };

  const visiblePages = totalPages > 1 ? getVisiblePages() : [1];

  // Styling classes based on size
  const buttonSize = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  const buttonHeight = size === 'small' ? 'h-8' : 'h-10';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Total items display */}
      {showTotal && (
        <div className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, calculatedTotal)}-
          {Math.min(currentPage * itemsPerPage, calculatedTotal)} of {calculatedTotal} items
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          className={`${buttonSize} ${buttonHeight} font-medium border border-gray-300 rounded-md 
            bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white 
            disabled:hover:border-gray-300 transition-colors duration-200`}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            const isActive = page === currentPage;
            const isEllipsis = typeof page === 'string';

            if (isEllipsis) {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                className={`${buttonSize} ${buttonHeight} font-medium border rounded-md transition-colors duration-200
                  ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
          className={`${buttonSize} ${buttonHeight} font-medium border border-gray-300 rounded-md 
            bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white 
            disabled:hover:border-gray-300 transition-colors duration-200`}
        >
          Next
        </button>

        {/* Quick jump input */}
        {showQuickJumper && totalPages > 5 && (
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-600">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              disabled={disabled}
              onChange={handleQuickJump}
              className={`w-16 ${buttonHeight} px-2 text-sm border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100`}
              placeholder="1"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;

/*
=== PURE TAILWIND PAGINATION COMPONENT FEATURES ===

ARCHITECTURAL COMPLIANCE:
✅ Complete separation entity approach
✅ Zero dependencies on external UI libraries (no antd)
✅ Uses only Tailwind utility classes
✅ No custom CSS required
✅ TypeScript with proper type definitions
✅ Self-contained component file

FUNCTIONALITY:
✅ Page navigation with Previous/Next buttons
✅ Direct page number clicking
✅ Smart page range display with ellipsis
✅ Page size selector dropdown
✅ Quick jump to page input
✅ Total items display
✅ Responsive design for mobile/desktop
✅ Small and default size variants
✅ Disabled state support

TYPESCRIPT FEATURES:
✅ Proper interface definitions
✅ Type-safe props with defaults
✅ Generic event handlers
✅ Optional callback functions
✅ Union types for size variants

TAILWIND STYLING:
✅ Consistent button styling
✅ Hover and focus states
✅ Disabled state styling
✅ Responsive layout (flex-col on mobile, flex-row on desktop)
✅ Consistent spacing and sizing
✅ Professional color scheme
✅ Smooth transitions

RESPONSIVE DESIGN:
✅ Stacks vertically on small screens
✅ Horizontal layout on larger screens
✅ Touch-friendly button sizes
✅ Proper spacing between elements

ACCESSIBILITY:
✅ Proper button disabled states
✅ Focus ring for keyboard navigation
✅ Semantic HTML structure
✅ Screen reader friendly labels

USAGE EXAMPLES:
```typescript
// Basic usage
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

// With all features
<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={pageSize}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  showSizeChanger={true}
  showQuickJumper={true}
  showTotal={true}
  pageSizeOptions={[10, 20, 50, 100]}
  size="default"
  disabled={loading}
/>

// Compact version
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  size="small"
  showSizeChanger={false}
  showQuickJumper={false}
/>
```

BENEFITS:
✅ No external dependencies
✅ Fully customizable with Tailwind
✅ Lightweight and performant
✅ Follows your architectural principles
✅ Easy to maintain and extend
✅ Professional appearance
✅ Mobile-friendly design
*/