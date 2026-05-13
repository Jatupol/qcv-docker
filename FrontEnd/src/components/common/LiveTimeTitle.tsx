// client/src/components/common/LiveTimeTitle.tsx

import React, { useEffect } from 'react';
import useLiveTime from '../../hooks/useLiveTime';

interface LiveTimeTitleProps {
  showInPageTitle?: boolean;
  showInComponent?: boolean;
  className?: string;
  format?: 'full' | 'time-only' | 'date-only' | 'short';
  prefix?: string;
}

/**
 * Live Time Title Component for EN-UK format
 * Displays live time in page title and/or as a component
 * Updates browser title with current time
 */
const LiveTimeTitle: React.FC<LiveTimeTitleProps> = ({
  showInPageTitle = true,
  showInComponent = true,
  className = '',
  format = 'full',
  prefix = 'Quality Control System',
}) => {
  const { currentTime, currentDate, fullDateTime, shortDateTime, isLoading } = useLiveTime({
    updateInterval: 1000, // Update every second
    timezone: 'Asia/Bangkok', // Thailand timezone
  });

  // Update browser page title with live time
  useEffect(() => {
    if (showInPageTitle && !isLoading) {
      let titleTime = '';
      
      switch (format) {
        case 'time-only':
          titleTime = currentTime;
          break;
        case 'date-only':
          titleTime = currentDate;
          break;
        case 'short':
          titleTime = shortDateTime;
          break;
        case 'full':
        default:
          titleTime = `${currentDate} ${currentTime}`;
          break;
      }
      
      document.title = `${prefix} - ${titleTime}`;
    }
  }, [showInPageTitle, isLoading, currentTime, currentDate, shortDateTime, format, prefix]);

  // Return null if only showing in page title
  if (!showInComponent) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Render component display
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Clock Icon */}
      <svg 
        className="w-4 h-4 text-primary-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      {/* Time Display */}
      <div className="text-sm font-medium text-text-primary">
        {format === 'full' && (
          <div className="flex flex-col sm:flex-row sm:space-x-2">
            <span className="text-primary-600">{currentDate}</span>
            <span className="hidden sm:block text-text-secondary">•</span>
            <span className="font-mono">{currentTime}</span>
          </div>
        )}
        
        {format === 'time-only' && (
          <span className="font-mono">{currentTime}</span>
        )}
        
        {format === 'date-only' && (
          <span className="text-primary-600">{currentDate}</span>
        )}
        
        {format === 'short' && (
          <span className="font-mono text-sm">{shortDateTime}</span>
        )}
      </div>
    </div>
  );
};

export default LiveTimeTitle;