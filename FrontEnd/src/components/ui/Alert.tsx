// client/src/components/ui/Alert.tsx
// ===== ALERT COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Alert component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState } from 'react';

// ============ INTERFACES ============

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  showIcon?: boolean;
  onDismiss?: () => void;
  className?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  size?: 'sm' | 'md' | 'lg';
}

// ============ COMPONENT ============

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  children,
  dismissible = false,
  showIcon = true,
  onDismiss,
  className = '',
  borderStyle = 'solid',
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  // Size styles
  const sizeStyles = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base'
  };

  // Variant styles with orange theme
  const variantStyles = {
    info: `
      bg-primary-50 border-primary-200 text-primary-800
      ${borderStyle === 'solid' ? 'border' : borderStyle === 'dashed' ? 'border-dashed border-2' : 'border-dotted border-2'}
    `,
    success: `
      bg-success-50 border-success-200 text-success-800
      ${borderStyle === 'solid' ? 'border' : borderStyle === 'dashed' ? 'border-dashed border-2' : 'border-dotted border-2'}
    `,
    warning: `
      bg-warning-50 border-warning-200 text-warning-800
      ${borderStyle === 'solid' ? 'border' : borderStyle === 'dashed' ? 'border-dashed border-2' : 'border-dotted border-2'}
    `,
    error: `
      bg-danger-50 border-danger-200 text-danger-800
      ${borderStyle === 'solid' ? 'border' : borderStyle === 'dashed' ? 'border-dashed border-2' : 'border-dotted border-2'}
    `
  };

  // Icon component
  const getIcon = () => {
    if (!showIcon) return null;

    const iconClasses = 'w-5 h-5 flex-shrink-0';
    
    switch (variant) {
      case 'success':
        return (
          <svg className={`${iconClasses} text-success-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconClasses} text-danger-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconClasses} text-warning-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={`${iconClasses} text-primary-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`
      rounded-card transition-all duration-200
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
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
          {/* Title */}
          {title && (
            <h3 className="font-semibold mb-1">
              {title}
            </h3>
          )}
          
          {/* Message */}
          {message && (
            <p className="text-sm opacity-90">
              {message}
            </p>
          )}
          
          {/* Children content */}
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
        </div>
        
        {/* Dismiss button */}
        {dismissible && (
          <div className="ml-4 flex-shrink-0">
            <button
              className={`
                inline-flex rounded-md p-1.5 
                ${variant === 'info' ? 'text-primary-500 hover:bg-primary-100' : ''}
                ${variant === 'success' ? 'text-success-500 hover:bg-success-100' : ''}
                ${variant === 'error' ? 'text-danger-500 hover:bg-danger-100' : ''}
                ${variant === 'warning' ? 'text-warning-500 hover:bg-warning-100' : ''}
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${variant === 'info' ? 'focus:ring-primary-400' : ''}
                ${variant === 'success' ? 'focus:ring-success-400' : ''}
                ${variant === 'error' ? 'focus:ring-danger-400' : ''}
                ${variant === 'warning' ? 'focus:ring-warning-400' : ''}
                transition-colors duration-200
              `}
              onClick={handleDismiss}
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ COMPOUND COMPONENTS ============

export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={`font-semibold mb-1 ${className}`}>
    {children}
  </h3>
);

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <p className={`text-sm opacity-90 ${className}`}>
    {children}
  </p>
);

export const AlertActions: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`mt-3 flex flex-col sm:flex-row gap-2 ${className}`}>
    {children}
  </div>
);

export default Alert;

/*
=== ORANGE THEME ALERT FEATURES ===

UPDATED COLOR SCHEME:
✅ Info alerts: bg-primary-50, border-primary-200, text-primary-800 (orange theme)
✅ Success alerts: Green theme maintained for universal understanding
✅ Error alerts: Red theme maintained for universal understanding
✅ Warning alerts: Amber-orange theme (complementary to main orange)
✅ Orange icons and interactive elements for info variant

VISUAL ENHANCEMENTS:
✅ Professional orange color palette for informational alerts
✅ Consistent border styles (solid, dashed, dotted)
✅ Multiple size options (sm, md, lg)
✅ Orange-themed icons and interactive elements
✅ Smooth transitions and hover states

FUNCTIONALITY:
✅ Dismissible alerts with orange-themed close buttons
✅ Compound components for flexible content structure
✅ Multiple border styles for different contexts
✅ Size variants for different use cases
✅ Automatic icon matching based on variant

ORANGE THEME INTEGRATION:
✅ Primary orange colors for info/general alerts
✅ Orange focus rings and hover states
✅ Consistent with overall design system
✅ Professional manufacturing interface aesthetic

ACCESSIBILITY:
✅ High contrast ratios maintained
✅ Keyboard accessible dismiss buttons
✅ Screen reader friendly with semantic HTML
✅ Proper focus management
✅ Color-blind friendly with icons

USAGE EXAMPLES:
```typescript
// Basic orange-themed info alert
<Alert 
  variant="info" 
  title="System Update" 
  message="Production data has been synchronized successfully."
/>

// Manufacturing Quality Control alert
<Alert 
  variant="warning" 
  title="Quality Check Required"
  message="Batch #QC-2024-001 requires immediate inspection."
  dismissible
  borderStyle="dashed"
/>

// Success notification
<Alert variant="success" title="Export Complete">
  <AlertDescription>
    Quality control report has been exported successfully.
  </AlertDescription>
  <AlertActions>
    <Button size="sm" variant="ghost">Download Report</Button>
    <Button size="sm" variant="link">View Details</Button>
  </AlertActions>
</Alert>

// Error alert for production issues
<Alert 
  variant="error"
  title="Production Line Error"
  message="Line MC-08 has encountered a critical error and requires immediate attention."
  dismissible
  size="lg"
/>
```

MANUFACTURING SYSTEM INTEGRATION:
✅ Quality control status alerts
✅ Production line notifications
✅ Equipment maintenance reminders
✅ Data export/import status messages
✅ System status and operational updates

COMPOUND COMPONENTS:
✅ AlertTitle - Structured titles with consistent styling
✅ AlertDescription - Detailed message content
✅ AlertActions - Action buttons and links
✅ Flexible content composition

This alert component provides clear, professional notifications
while maintaining the warm orange theme throughout the
Manufacturing Quality Control application.
*/