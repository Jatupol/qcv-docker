// client/src/components/common/Footer.tsx
// ===== FOOTER COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Footer component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState, useEffect } from 'react';
import sysconfigService from '../../services/sysconfigService';
import { formatDate } from '../../utils/formatUtils';
import { getCurrentFiscalYear, getCurrentFiscalWeek } from '@qcv/shared';

// ============ INTERFACES ============

interface FooterProps {
  className?: string;
}

interface SystemInfo {
  system_name: string;
  system_version: string;
  system_updated: Date | null;
}

// ============ COMPONENT ============

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    system_name: 'Quality Control System',
    system_version: '2.1.0',
    system_updated: null
  });

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const response = await sysconfigService.getActiveSystemSetup();
      if (response.success && response.data) {
        setSystemInfo({
          system_name: response.data.system_name || 'Quality Control System',
          system_version: response.data.system_version || '2.1.0',
          system_updated: response.data.system_updated || null
        });
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
      // Keep default values on error
    }
  };

  return (
    <footer className={`
      bg-background-primary border-t border-border-primary py-4 mt-auto
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section - Copyright and Status */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {/* Left Section - Copyright */}
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <span>&copy; {currentYear} {systemInfo.system_name}</span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse-orange"></div>
              System Status: Online
            </span>
          </div>

          {/* Center Section - Production Date & WW */}
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <span style={{ fontWeight: 700, color: '#1d4ed8' }}>
              {formatDate(new Date())} | FY{getCurrentFiscalYear()} WW{String(getCurrentFiscalWeek()).padStart(2, '0')}
            </span>
          </div>

          {/* Right Section - Version Info */}
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-xs text-text-tertiary">
            <span className="font-medium">Version {systemInfo.system_version}</span>
            <span className="hidden sm:block">•</span>
            <span>Last updated: {formatDate(systemInfo.system_updated, formatDate(new Date()))}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

 
 