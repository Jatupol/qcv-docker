// client/src/components/ui/LoadingOverlay.tsx
// Professional loading overlay component with green theme
// This component shows a loading overlay on top of existing content

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  /** Whether to show the loading overlay */
  isLoading: boolean;
  /** Loading message to display */
  message?: string;
  /** Content to wrap with overlay */
  children: React.ReactNode;
  /** Backdrop style */
  backdrop?: 'light' | 'dark' | 'blur';
  /** Size of the loading spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the loading card/container */
  showCard?: boolean;
  /** Custom loading content */
  customLoader?: React.ReactNode;
  /** Z-index for the overlay */
  zIndex?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...', 
  children,
  backdrop = 'light',
  size = 'lg',
  className = '',
  showCard = true,
  customLoader,
  zIndex = 50
}) => {
  const backdropClasses = {
    light: 'bg-white bg-opacity-75',
    dark: 'bg-black bg-opacity-50',
    blur: 'bg-white bg-opacity-75 backdrop-blur-sm',
  };

  const zIndexClass = `z-${zIndex}`;

  const renderLoader = () => {
    if (customLoader) {
      return customLoader;
    }

    if (showCard) {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-border-light max-w-xs mx-auto">
          <LoadingSpinner size={size} className="mx-auto mb-4" />
          {message && (
            <p className="text-text-secondary text-sm font-medium animate-pulse">
              {message}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        {message && (
          <p className="text-text-secondary text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div 
          className={`
            absolute inset-0 flex items-center justify-center 
            ${backdropClasses[backdrop]} ${zIndexClass}
            transition-opacity duration-300 ease-in-out
          `}
          role="status" 
          aria-live="polite" 
          aria-label={message}
        >
          {renderLoader()}
        </div>
      )}
    </div>
  );
};

// Export the component as default
export default LoadingOverlay;

// Named export for convenience
export { LoadingOverlay };

// Alternative full-screen loading overlay
export const FullScreenLoadingOverlay: React.FC<{
  isLoading: boolean;
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isLoading, message = 'Loading...', size = 'xl' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="text-center p-8 bg-white rounded-xl shadow-2xl border border-border-light">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        {message && (
          <p className="text-text-secondary text-lg font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Simple loading overlay without card
export const SimpleLoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isLoading, children, size = 'lg' }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <LoadingSpinner size={size} />
        </div>
      )}
    </div>
  );
};