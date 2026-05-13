// client/src/components/generic-page/EntityPageHeader.tsx
// Header Section Component for Entity Pages
// Complete Separation Entity Architecture - Self-contained Header component

import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../ui/Button';
import {
  BuildingOfficeIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// ============ INTERFACES ============

export interface EntityStats {
  total: number;
  active: number;
  inactive: number;
  [key: string]: any; // Allow additional stats
}

export interface EntityPageHeaderProps {
  entityName: string;
  entityNamePlural: string;
  entityDescription: string;
  stats?: EntityStats;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  customActions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

// ============ COMPONENT ============

const EntityPageHeader: React.FC<EntityPageHeaderProps> = ({
  entityName,
  entityNamePlural,
  entityDescription,
  stats,
  breadcrumbItems,
  loading = false,
  onRefresh,
  onExport,
  customActions,
  icon,
  className = ''
}) => {
  // Default icon if none provided
  const headerIcon = icon || <BuildingOfficeIcon className="h-7 w-7 text-white" />;

  // Debug logging for stats
  React.useEffect(() => {
    console.log('🔍 EntityPageHeader - Stats received:', stats);
    console.log('🔍 EntityPageHeader - Entity info:', { entityName, entityNamePlural, entityDescription });
  }, [stats, entityName, entityNamePlural, entityDescription]);

  return (
    <>
      {/* Breadcrumb Section - Outside Header */}
      {breadcrumbItems && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb 
              items={breadcrumbItems} 
              className="text-gray-600 [&_.breadcrumb-item]:text-gray-600 [&_.breadcrumb-separator]:text-gray-400 [&_.breadcrumb-link]:text-orange-600 [&_.breadcrumb-link]:hover:text-orange-700"
            />
          </div>
        </div>
      )}

      {/* Header Content Section */}
      <div className={`bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              {/* Left Side - Title and Description */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mr-4 flex-shrink-0">
                  {headerIcon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {entityNamePlural} Management
                  </h1>
                  <p className="text-orange-100 mt-1">
                    Manage {entityDescription}
                  </p>
                </div>
              </div>

              {/* Right Side - Stats and Actions */}
              <div className="flex items-center space-x-8">
                {/* Stats Cards */}
                <div className="flex space-x-6">
                  <div className="text-center bg-white bg-opacity-10 rounded-lg px-4 py-3">
                    <div className="text-3xl font-bold text-white">
                      {stats ? (stats.total ?? 0) : (loading ? '...' : '0')}
                    </div>
                    <div className="text-orange-100 text-sm font-medium">Total</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-10 rounded-lg px-4 py-3">
                    <div className="text-3xl font-bold text-white">
                      {stats ? (stats.active ?? 0) : (loading ? '...' : '0')}
                    </div>
                    <div className="text-orange-100 text-sm font-medium">Active</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-10 rounded-lg px-4 py-3">
                    <div className="text-3xl font-bold text-white">
                      {stats ? (stats.inactive ?? 0) : (loading ? '...' : '0')}
                    </div>
                    <div className="text-orange-100 text-sm font-medium">Inactive</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {/* Refresh Button */}
                  {onRefresh && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onRefresh}
                      disabled={loading}
                      className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}

                  {/* Export Button */}
                  {onExport && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onExport}
                      className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}

                  {/* Custom Actions */}
                  {customActions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntityPageHeader;