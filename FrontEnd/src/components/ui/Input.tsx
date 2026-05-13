// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-input border-0 py-2.5 shadow-sm ring-1 ring-inset
            ${error 
              ? 'ring-error-300 placeholder:text-error-400 focus:ring-2 focus:ring-error-500 text-error-900' 
              : 'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 text-gray-900'
            }
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${rightIcon ? 'pr-10' : 'pr-3'}
            sm:text-sm sm:leading-6 transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-error-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-text-secondary" id={`${inputId}-description`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;