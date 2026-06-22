// client/src/components/ui/Button.tsx
// ===== UI BUTTON COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Button component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';

// ============ INTERFACES ============

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
}

// ============ COMPONENT ============

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200 ease-in-out
    border focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:transform active:scale-95
  `;

  // Variant styles - Updated for Orange Theme
  const variantStyles = {
    primary: `
      bg-primary-500 border-primary-500 text-white
      hover:bg-primary-600 hover:border-primary-600
      focus:ring-primary-400
      shadow-orange hover:shadow-orange-lg
    `,
    secondary: `
      bg-secondary-500 border-secondary-500 text-white
      hover:bg-secondary-600 hover:border-secondary-600
      focus:ring-secondary-400
      shadow-md hover:shadow-lg
    `,
    success: `
      bg-success-600 border-success-600 text-white
      hover:bg-success-700 hover:border-success-700
      focus:ring-success-500
      shadow-md hover:shadow-lg
    `,
    danger: `
      bg-danger-600 border-danger-600 text-white
      hover:bg-danger-700 hover:border-danger-700
      focus:ring-danger-500
      shadow-md hover:shadow-lg
    `,
    warning: `
      bg-warning-500 border-warning-500 text-white
      hover:bg-warning-600 hover:border-warning-600
      focus:ring-warning-400
      shadow-md hover:shadow-lg
    `,
    info: `
      bg-info-600 border-info-600 text-white
      hover:bg-info-700 hover:border-info-700
      focus:ring-info-500
      shadow-md hover:shadow-lg
    `,
    ghost: `
      bg-transparent border-border-primary text-text-primary
      hover:bg-background-tertiary hover:border-border-secondary
      focus:ring-primary-400
    `,
    link: `
      bg-transparent border-transparent text-primary-600
      hover:text-primary-700 hover:underline
      focus:ring-primary-400 focus:ring-offset-0
      shadow-none
    `
  };

  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs leading-4 min-h-6',
    sm: 'px-3 py-1.5 text-sm leading-4 min-h-8',
    md: 'px-4 py-2 text-sm leading-5 min-h-10',
    lg: 'px-6 py-3 text-base leading-6 min-h-12',
    xl: 'px-8 py-4 text-lg leading-7 min-h-14'
  };

  // Border radius styles
  const radiusStyles = rounded ? 'rounded-full' : 'rounded-button';

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Combine all styles
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${radiusStyles}
    ${widthStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="mr-2 flex-shrink-0">
          {leftIcon}
        </span>
      )}
      
      {/* Button content */}
      <span className="flex-1">
        {isLoading && loadingText ? loadingText : children}
      </span>
      
      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className="ml-2 flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;

/*
=== ORANGE THEME BUTTON FEATURES ===

UPDATED COLOR VARIANTS:
✅ primary - Orange theme (primary-500 → primary-600 on hover)
✅ secondary - Warm cream/beige theme (secondary-500 → secondary-600)
✅ success - Green (maintained for universal understanding)
✅ danger - Red (maintained for universal understanding)
✅ warning - Amber-orange (complementary to theme)
✅ info - Blue-gray (neutral professional)
✅ ghost - Uses new border and text colors
✅ link - Orange text links (primary-600 → primary-700)

ORANGE THEME ENHANCEMENTS:
✅ Custom orange shadows (shadow-orange, shadow-orange-lg)
✅ Uses primary orange colors for main actions
✅ Consistent with warm color palette
✅ Professional orange-based design system

ACCESSIBILITY MAINTAINED:
✅ High contrast ratios preserved
✅ Focus rings use appropriate colors
✅ Disabled states clearly visible
✅ Screen reader friendly

USAGE EXAMPLES WITH ORANGE THEME:
```typescript
// Primary orange button
<Button variant="primary">Save Changes</Button>

// Secondary warm cream button
<Button variant="secondary">Cancel</Button>

// Orange link-style button
<Button variant="link">Learn More</Button>

// Ghost button with orange accents
<Button variant="ghost">View Details</Button>

// Primary button with orange loading state
<Button variant="primary" isLoading={saving}>
  Saving...
</Button>
```

MANUFACTURING SYSTEM INTEGRATION:
✅ Orange primary buttons for main actions (Create, Save, Submit)
✅ Warm secondary buttons for secondary actions
✅ Maintains semantic colors for success/danger
✅ Professional warm color scheme throughout
✅ Consistent with orange branding

BENEFITS:
✅ Cohesive orange theme implementation
✅ Maintains all existing functionality
✅ Professional warm color palette
✅ Excellent visual hierarchy
✅ Brand consistency
✅ Accessibility compliant
✅ Modern design system approach
*/