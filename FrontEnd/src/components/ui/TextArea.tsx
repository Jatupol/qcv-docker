// client/src/components/ui/TextArea.tsx
// Reusable TextArea component following project UI patterns

import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const textAreaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textAreaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          id={textAreaId}
          rows={rows}
          className={`
            block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset resize-y
            ${error 
              ? 'ring-red-300 placeholder:text-red-400 focus:ring-2 focus:ring-red-500 text-red-900' 
              : 'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 text-gray-900'
            }
            sm:text-sm sm:leading-6 transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${textAreaId}-error`}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-600" id={`${textAreaId}-description`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;