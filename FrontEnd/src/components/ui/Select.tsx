// ===================================
// client/src/components/ui/Select.tsx
// Fixed Select component with proper types

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
  options?: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  children,
  options = [],
  className = '',
  placeholder,
  onChange,
  ...props
}) => {
  const selectId = props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'block px-3 py-2 border rounded-lg text-sm bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none';
  
  const stateClasses = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

  const widthClasses = fullWidth ? 'w-full' : '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          className={`${baseClasses} ${stateClasses} ${widthClasses} ${className} pr-10`}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.length > 0 ? (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Select;