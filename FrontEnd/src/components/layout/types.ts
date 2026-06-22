// client/src/components/layout/types.ts
// Type definitions for Layout components

import type { ReactNode } from 'react';

/**
 * Main Layout Props
 */
export interface LayoutProps {
  children: ReactNode;
}

/**
 * Navigation Item Structure
 */
export interface NavigationItem {
  name: string;
  href?: string;
  icon: JSX.Element;
  children?: NavigationItem[];
  roles?: string[]; // Array of roles that can access this menu item (undefined = all roles)
}

/**
 * System Configuration
 */
export interface SystemConfig {
  system_name?: string;
  company_name?: string;
  version?: string;
}
