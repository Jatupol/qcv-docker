// client/src/components/ui/Modal.tsx
// Modern Modal Component with Enhanced Design - Complete Separation Entity Architecture

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============ INTERFACES ============

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full' | 'half';
  className?: string;
  headerClassName?: string; // Custom header styling
  titleClassName?: string;  // Custom title styling
  contentClassName?: string; // Custom content styling
  closeButtonClassName?: string; // Custom close button styling
  backdropClassName?: string; // Custom backdrop styling
  showCloseButton?: boolean; // Option to hide close button
  closeOnBackdropClick?: boolean; // Option to disable backdrop close
  closeOnEscape?: boolean; // Option to disable escape key close
  icon?: React.ReactNode; // Header icon
  subtitle?: string; // Header subtitle
  footer?: React.ReactNode; // Custom footer content
  loading?: boolean; // Loading state
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'; // Theme variants
}

// ============ MODERN MODAL COMPONENT ============

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  headerClassName = '',
  titleClassName = '',
  contentClassName = '',
  closeButtonClassName = '',
  backdropClassName = '',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  icon,
  subtitle,
  footer,
  loading = false,
  variant = 'default',
}) => {
  
  // ============ KEYBOARD AND BODY SCROLL HANDLING ============
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape, loading]);

  // ============ EARLY RETURN FOR CLOSED MODAL ============
  
  if (!isOpen) return null;

  // ============ SIZE CONFIGURATION ============
  
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    '4xl': 'max-w-[90vw]',
    full: 'max-w-[95vw] max-h-[95vh]',
    half: 'max-w-[50vw]', // 1/2 screen width
  };

  // ============ VARIANT THEMES ============
  
  const variantStyles = {
    default: {
      header: 'bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200',
      title: 'text-gray-900',
      icon: 'text-gray-500',
    },
    success: {
      header: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200',
      title: 'text-emerald-900',
      icon: 'text-emerald-500',
    },
    warning: {
      header: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
      title: 'text-amber-900',
      icon: 'text-amber-500',
    },
    error: {
      header: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
      title: 'text-red-900',
      icon: 'text-red-500',
    },
    info: {
      header: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
      title: 'text-blue-900',
      icon: 'text-blue-500',
    },
  };

  // ============ DYNAMIC CLASSES ============
  
  const currentVariant = variantStyles[variant];
  const defaultHeaderClasses = `flex items-center justify-between px-6 py-5 border-b backdrop-blur-sm ${currentVariant.header}`;
  const defaultTitleClasses = `text-xl font-bold ${currentVariant.title}`;
  const defaultSubtitleClasses = `text-sm font-medium text-gray-600 mt-1`;
  const defaultContentClasses = 'bg-white relative';
  const defaultCloseButtonClasses = 'text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 p-2.5 rounded-xl hover:bg-white/50 active:scale-95';
  const defaultBackdropClasses = 'fixed inset-0 bg-gradient-to-br from-gray-900/50 via-gray-900/25 to-slate-900/50 backdrop-blur-md transition-all duration-300';

  // ============ BACKDROP CLICK HANDLER ============
  
  const handleBackdropClick = () => {
    if (closeOnBackdropClick && !loading) {
      onClose();
    }
  };

  // ============ LOADING OVERLAY ============
  
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-sm font-medium text-gray-600 animate-pulse">Processing...</p>
      </div>
    </div>
  );

  // ============ MODAL CONTENT ============
  
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
      <div className="flex min-h-full items-center justify-center">
        {/* Backdrop */}
        <div
          className={`${defaultBackdropClasses} ${backdropClassName}`}
          onClick={handleBackdropClick}
        />
        
        {/* Modal Panel */}
        <div 
          className={`
            relative transform transition-all duration-300 ease-out
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            w-full ${sizeClasses[size]} ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className={`${defaultHeaderClasses} ${headerClassName}`}>
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                {/* Icon */}
                {icon && (
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center ${currentVariant.icon}`}>
                    {icon}
                  </div>
                )}
                
                {/* Title and Subtitle */}
                <div className="min-w-0 flex-1">
                  <h3 className={`${defaultTitleClasses} ${titleClassName} truncate`}>
                    {title}
                  </h3>
                  {subtitle && (
                    <p className={`${defaultSubtitleClasses} truncate`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              {showCloseButton && (
                <div className="flex-shrink-0 ml-4">
                  <button
                    type="button"
                    className={`${defaultCloseButtonClasses} ${closeButtonClassName}`}
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className={`${defaultContentClasses} ${contentClassName}`}>
              {/* Loading Overlay */}
              {loading && <LoadingOverlay />}
              
              {/* Main Content */}
              <div className={`${loading ? 'pointer-events-none' : ''}`}>
                {children}
              </div>
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER WITH PORTAL ============
  
  return createPortal(modalContent, document.body);
};

// ============ MODERN FORM WRAPPER COMPONENT ============

interface ModalFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  loading?: boolean;
}

export const ModalForm: React.FC<ModalFormProps> = ({ 
  children, 
  onSubmit, 
  className = '',
  loading = false 
}) => (
  <form 
    onSubmit={onSubmit} 
    className={`space-y-6 p-6 ${className}`}
  >
    {children}
  </form>
);

// ============ MODERN FORM SECTION COMPONENT ============

interface ModalFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const ModalFormSection: React.FC<ModalFormSectionProps> = ({ 
  title, 
  description, 
  children, 
  icon,
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center space-x-3">
      {icon && (
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <div className="text-orange-600">
            {icon}
          </div>
        </div>
      )}
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-4 pl-11">
      {children}
    </div>
  </div>
);

// ============ MODERN FORM ACTIONS COMPONENT ============

interface ModalFormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export const ModalFormActions: React.FC<ModalFormActionsProps> = ({ 
  children, 
  align = 'right',
  className = '' 
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex items-center space-x-3 pt-6 border-t border-gray-200 ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// ============ EXPORTS ============

export default Modal;
 

 