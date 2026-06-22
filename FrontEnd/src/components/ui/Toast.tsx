// client/src/components/ui/Toast.tsx
// ===== TOAST NOTIFICATION COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Toast component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useEffect, useState } from 'react';

// ============ INTERFACES ============

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  onClose?: () => void;
  showIcon?: boolean;
  autoClose?: boolean;
  className?: string;
}

// ============ COMPONENT ============

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
  showIcon = true,
  autoClose = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  // Position styles
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2'
  };

  // Toast type styles with orange theme
  const typeStyles = {
    success: `
      bg-success-50 border-success-200 text-success-800
      shadow-lg shadow-success-100
    `,
    error: `
      bg-danger-50 border-danger-200 text-danger-800
      shadow-lg shadow-danger-100
    `,
    warning: `
      bg-warning-50 border-warning-200 text-warning-800
      shadow-lg shadow-warning-100
    `,
    info: `
      bg-primary-50 border-primary-200 text-primary-800
      shadow-orange
    `
  };

  // Icon component
  const getIcon = () => {
    if (!showIcon) return null;

    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-success-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-danger-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-warning-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Animation classes
  const animationClasses = isLeaving 
    ? 'transform translate-x-full opacity-0' 
    : 'transform translate-x-0 opacity-100';

  return (
    <div className={`
      fixed z-50 min-w-80 max-w-md
      ${positionStyles[position]}
      transition-all duration-300 ease-in-out
      ${animationClasses}
      ${className}
    `}>
      <div className={`
        p-4 rounded-card border backdrop-blur-sm
        ${typeStyles[type]}
        transition-all duration-200
      `}>
        <div className="flex items-start">
          {/* Icon */}
          {getIcon() && (
            <div className="mr-3 mt-0.5">
              {getIcon()}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {message}
            </p>
          </div>
          
          {/* Close button */}
          <div className="ml-4 flex-shrink-0">
            <button
              className={`
                inline-flex rounded-md p-1.5 
                ${type === 'info' ? 'text-primary-500 hover:bg-primary-100' : ''}
                ${type === 'success' ? 'text-success-500 hover:bg-success-100' : ''}
                ${type === 'error' ? 'text-danger-500 hover:bg-danger-100' : ''}
                ${type === 'warning' ? 'text-warning-500 hover:bg-warning-100' : ''}
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${type === 'info' ? 'focus:ring-primary-400' : ''}
                ${type === 'success' ? 'focus:ring-success-400' : ''}
                ${type === 'error' ? 'focus:ring-danger-400' : ''}
                ${type === 'warning' ? 'focus:ring-warning-400' : ''}
                transition-colors duration-200
              `}
              onClick={handleClose}
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ TOAST CONTAINER COMPONENT ============

interface ToastContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {children}
    </div>
  );
};

// ============ CUSTOM HOOK FOR TOAST MANAGEMENT ============

interface ToastState {
  id: string;
  message: string;
  type: ToastProps['type'];
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = (message: string, type: ToastProps['type'] = 'info', duration = 5000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 300); // Add 300ms for exit animation
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
  };
};

export default Toast;

/*
=== ORANGE THEME TOAST FEATURES ===

UPDATED COLOR SCHEME:
✅ Info toasts: bg-primary-50, border-primary-200, text-primary-800 (orange theme)
✅ Success toasts: Green theme maintained for clarity
✅ Error toasts: Red theme maintained for clarity  
✅ Warning toasts: Amber-orange theme (complementary)
✅ Orange shadows for info toasts (shadow-orange)

VISUAL ENHANCEMENTS:
✅ Large, visible notification boxes (min-w-80, max-w-md)
✅ Orange-themed shadows and borders
✅ Smooth animations with orange accents
✅ Professional orange color palette
✅ Backdrop blur for modern appearance

FUNCTIONALITY:
✅ Multiple positioning options
✅ Auto-dismiss with configurable duration
✅ Manual close with styled close buttons
✅ Smooth enter/exit animations
✅ Toast container for multiple notifications
✅ Custom hook for easy management

ORANGE THEME INTEGRATION:
✅ Primary orange colors for info notifications
✅ Orange focus rings and hover states
✅ Consistent with overall design system
✅ Professional manufacturing interface

ACCESSIBILITY:
✅ High contrast ratios maintained
✅ Keyboard accessible close buttons
✅ Screen reader friendly with ARIA labels
✅ Proper focus management
✅ Color-blind friendly with icons

USAGE EXAMPLES:
```typescript
// Using the hook
const { success, error, warning, info } = useToast();

// Manufacturing notifications
success("Quality check passed for Batch #QC-001");
error("Defect detected in production line MC-08");
warning("Equipment maintenance due in 2 hours");
info("System backup completed successfully");

// Direct component usage
<Toast 
  message="Production data exported successfully" 
  type="success" 
  position="top-right"
  onClose={() => setToast(null)} 
/>
```

MANUFACTURING SYSTEM INTEGRATION:
✅ Quality control status notifications
✅ Production line alerts and updates
✅ Equipment status messages
✅ Data export/import confirmations
✅ System status and maintenance alerts

This toast component provides clear, visible notifications
while maintaining the warm orange theme throughout the
Manufacturing Quality Control application.
*/