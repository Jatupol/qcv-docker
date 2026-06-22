// client/src/components/selectors/SysconfigSelector.tsx
// Modern Sysconfig-based Selector Component
// Fetches dropdown data from sysconfig entity

import React, { useState, useEffect } from 'react';
import {
  getProductFamilyOptions,
  getSiteOptions,
  getTabOptions,
  getProductTypeOptions,
  getCustomerOptions,
  type DropdownOption
} from '../../services/sysconfigService';

// ============ INTERFACES ============

interface SysconfigSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  category: 'product_families' | 'site' | 'tabs' | 'product_type' | 'customer';
  allowEmpty?: boolean;
  emptyLabel?: string;
}

// ============ CATEGORY FETCHERS MAP ============

const categoryFetchers = {
  product_families: getProductFamilyOptions,
  site: getSiteOptions,
  tabs: getTabOptions,
  product_type: getProductTypeOptions,
  customer: getCustomerOptions
};

// ============ MAIN COMPONENT ============

const SysconfigSelector: React.FC<SysconfigSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select option...',
  required = false,
  disabled = false,
  className = '',
  category,
  allowEmpty = true,
  emptyLabel = '-- None --'
}) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Load options when category changes
  useEffect(() => {
    const loadOptions = async () => {
      console.log(`🔄 SysconfigSelector loading options for category: ${category}`);
      setLoading(true);
      setError(null);

      try {
        const fetcher = categoryFetchers[category];
        if (!fetcher) {
          throw new Error(`Unknown category: ${category}`);
        }

        console.log(`📞 Calling fetcher for ${category}...`);
        const fetchedOptions = await fetcher();
        console.log(`✅ Fetched ${fetchedOptions.length} options for ${category}:`, fetchedOptions);

        setOptions(fetchedOptions);
        setDebugInfo(`Loaded ${fetchedOptions.length} options`);
      } catch (err) {
        console.error(`❌ Error loading ${category} options:`, err);
        setError(err instanceof Error ? err.message : `Failed to load ${category} options`);
        setOptions([]);
        setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        console.log(`✅ Finished loading options for ${category}`);
        setLoading(false);
      }
    };

    loadOptions();
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const baseClasses = `
    block w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
    hover:border-gray-400 focus:shadow-lg
    ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
    text-sm font-medium
  `;

  if (loading) {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${baseClasses} ${className} border-red-300 bg-red-50`}>
        <div className="flex items-center justify-between py-2">
          <span className="text-red-600 text-sm">⚠ {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
    >
      {/* Empty option */}
      {allowEmpty && (
        <option value="">
          {placeholder}
        </option>
      )}

      {/* No empty option but placeholder */}
      {!allowEmpty && !value && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {/* Options from sysconfig */}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}

      {/* Show empty state when no options */}
      {options.length === 0 && (
        <option value="" disabled>
          No {category.replace('_', ' ')} available
        </option>
      )}
    </select>
  );
};

export default SysconfigSelector;

// ============ SPECIFIC SELECTOR COMPONENTS ============

export const ProductFamilySelector: React.FC<Omit<SysconfigSelectorProps, 'category'>> = (props) => (
  <SysconfigSelector {...props} category="product_families" />
);

export const SiteSelector: React.FC<Omit<SysconfigSelectorProps, 'category'>> = (props) => (
  <SysconfigSelector {...props} category="site" />
);

export const TabSelector: React.FC<Omit<SysconfigSelectorProps, 'category'>> = (props) => (
  <SysconfigSelector {...props} category="tabs" />
);

export const ProductTypeSelector: React.FC<Omit<SysconfigSelectorProps, 'category'>> = (props) => (
  <SysconfigSelector {...props} category="product_type" />
);

export const CustomerSelector: React.FC<Omit<SysconfigSelectorProps, 'category'>> = (props) => (
  <SysconfigSelector {...props} category="customer" />
);

/*
=== SYSCONFIG SELECTOR FEATURES ===

DYNAMIC DATA LOADING:
✅ Fetches data from sysconfig entity
✅ Automatic caching (5-minute TTL)
✅ Category-specific data fetching
✅ Error handling with user feedback

MODERN UI/UX:
✅ Loading states with spinner
✅ Error states with warning icons
✅ Modern styling with transitions
✅ Hover and focus effects
✅ Responsive design

FLEXIBLE CONFIGURATION:
✅ Support for all sysconfig categories
✅ Optional empty/placeholder options
✅ Customizable styling
✅ Required field support
✅ Disabled state support

CATEGORY MAPPING:
✅ Product Family -> product_families
✅ Production Site -> site
✅ Tab -> tabs
✅ Product Type -> product_type
✅ Customer -> customer (using grps)

SPECIFIC COMPONENTS:
✅ ProductFamilySelector
✅ SiteSelector
✅ TabSelector
✅ ProductTypeSelector
✅ CustomerSelector

This component provides a complete solution for dropdown
selectors that automatically fetch and display data from
the sysconfig entity, with modern styling and robust
error handling.
*/