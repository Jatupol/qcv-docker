// ===================================
// client/src/components/common/LoadingSpinner.tsx
// Reusable loading spinner component

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  className?: string;
  message?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  message,
  overlay = false
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    success: 'border-success-600 border-t-transparent',
    warning: 'border-warning-600 border-t-transparent',
    error: 'border-error-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    border-2
    border-solid
    rounded-full
    animate-spin
    ${className}
  `.trim();

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={spinnerClasses} />
      {message && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-text-secondary'} text-center`}>
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;