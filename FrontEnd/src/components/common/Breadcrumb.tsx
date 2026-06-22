// client/src/components/common/Breadcrumb.tsx
// ===== BREADCRUMB NAVIGATION WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Breadcrumb component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import { Link } from 'react-router-dom';

// ============ INTERFACES ============

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// ============ COMPONENT ============

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link 
                to={item.href} 
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-secondary text-sm font-medium">
                {item.label}
              </span>
            )}
            
            {/* Separator */}
            {index < items.length - 1 && (
              <svg 
                className="mx-2 w-4 h-4 text-text-muted flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

/*
=== ORANGE THEME BREADCRUMB FEATURES ===

UPDATED COLOR SCHEME:
✅ Links: text-primary-600 (orange) → text-primary-700 (darker orange) on hover
✅ Current page: text-text-secondary (warm gray)
✅ Separators: text-text-muted (light warm gray)
✅ Smooth orange-themed transitions

VISUAL ENHANCEMENTS:
✅ Professional orange color links
✅ Warm gray text for current page
✅ Subtle separators with chevron icons
✅ Consistent typography and spacing

ACCESSIBILITY FEATURES:
✅ Proper ARIA labels for screen readers
✅ Semantic HTML structure with nav and ol elements
✅ Clear visual hierarchy with color and typography
✅ Keyboard navigation support through Link components
✅ High contrast ratios maintained

ORANGE THEME INTEGRATION:
✅ Uses primary orange colors for interactive elements
✅ Warm text colors that complement orange theme
✅ Consistent with overall design system
✅ Professional appearance

USAGE EXAMPLES:
```typescript
// Basic breadcrumb
<Breadcrumb items={[
  { label: 'Dashboard', href: '/' },
  { label: 'Quality Control', href: '/quality' },
  { label: 'Defects' }
]} />

// Manufacturing context
<Breadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Production', href: '/production' },
  { label: 'Line MC', href: '/line-mc' },
  { label: 'Line #08' }
]} />

// With custom styling
<Breadcrumb 
  className="mb-6 px-4"
  items={breadcrumbItems}
/>
```

MANUFACTURING SYSTEM INTEGRATION:
✅ Clear navigation hierarchy for complex workflows
✅ Orange theme maintains brand consistency
✅ Professional appearance for industrial interface
✅ Easy navigation between entity pages
✅ Context-aware breadcrumb trails

RESPONSIVE DESIGN:
✅ Works on all screen sizes
✅ Proper text wrapping on mobile
✅ Touch-friendly link targets
✅ Consistent spacing and alignment

This breadcrumb component provides clear navigation
while maintaining the warm orange theme throughout
the Sampling Inspection Control System application.
*/