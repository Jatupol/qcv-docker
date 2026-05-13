// client/src/components/ui/Card.tsx
// ===== CARD COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Card component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';

// ============ INTERFACES ============

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'orange-accent';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============ COMPONENT ============

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  variant = 'default',
  size = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = ''
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  // Variant styles with orange theme
  const variantStyles = {
    default: `
      bg-background-primary border border-border-primary
      shadow-soft
    `,
    elevated: `
      bg-background-primary border border-border-primary
      shadow-lg hover:shadow-xl
    `,
    bordered: `
      bg-background-primary border-2 border-border-secondary
      shadow-sm
    `,
    'orange-accent': `
      bg-background-primary border-l-4 border-l-primary-500 border-t border-r border-b border-border-primary
      shadow-orange
    `
  };

  // Interactive styles
  const interactiveStyles = hoverable || clickable
    ? `transition-all duration-200 ${hoverable ? 'hover:shadow-lg hover:-translate-y-1' : ''} ${clickable ? 'cursor-pointer hover:shadow-orange-lg' : ''}`
    : '';

  // Combine all styles
  // Only apply overflow-hidden if className doesn't contain overflow-*
  const hasOverflowClass = className.includes('overflow-');
  const cardClasses = `
    rounded-card ${hasOverflowClass ? '' : 'overflow-hidden'}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${interactiveStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Header */}
      {(title || subtitle || headerActions) && (
        <div className="mb-6 pb-4 border-b border-border-primary">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-text-secondary">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="ml-4 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-4 border-t border-border-primary">
          {footer}
        </div>
      )}
    </div>
  );
};

// ============ COMPOUND COMPONENTS ============

export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mb-6 pb-4 border-b border-border-primary ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  level?: 1 | 2 | 3 | 4;
}> = ({ children, className = '', level = 3 }) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClasses = {
    1: 'text-2xl',
    2: 'text-xl', 
    3: 'text-lg',
    4: 'text-base'
  };
  
  return (
    <Component className={`font-semibold text-text-primary ${sizeClasses[level]} ${className}`}>
      {children}
    </Component>
  );
};

export const CardSubtitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`text-sm text-text-secondary ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`flex-1 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-border-primary ${className}`}>
    {children}
  </div>
);

export const CardActions: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  align?: 'left' | 'center' | 'right';
}> = ({ children, className = '', align = 'right' }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end'
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// ============ SPECIALIZED CARD VARIANTS ============

export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, value, change, changeType = 'neutral', icon, className = '' }) => {
  const changeColors = {
    positive: 'text-success-600',
    negative: 'text-danger-600',
    neutral: 'text-text-secondary'
  };

  return (
    <Card variant="elevated" className={`relative overflow-hidden ${className}`}>
      {/* Orange accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-primary-50 rounded-lg">
            <div className="text-primary-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const AlertCard: React.FC<{
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actions?: React.ReactNode;
  className?: string;
}> = ({ type, title, message, actions, className = '' }) => {
  const typeStyles = {
    info: 'border-l-primary-500 bg-primary-50',
    warning: 'border-l-warning-500 bg-warning-50',
    error: 'border-l-danger-500 bg-danger-50',
    success: 'border-l-success-500 bg-success-50'
  };

  const iconColors = {
    info: 'text-primary-600',
    warning: 'text-warning-600', 
    error: 'text-danger-600',
    success: 'text-success-600'
  };

  const getIcon = () => {
    const iconClass = `w-5 h-5 ${iconColors[type]}`;
    
    switch (type) {
      case 'success':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <Card 
      variant="bordered" 
      className={`border-l-4 ${typeStyles[type]} ${className}`}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
          <p className="text-sm text-text-secondary mb-3">{message}</p>
          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Card;

 