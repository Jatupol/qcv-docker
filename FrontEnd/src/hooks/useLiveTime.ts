// client/src/hooks/useLiveTime.ts

import { useState, useEffect } from 'react';

interface LiveTimeOptions {
  updateInterval?: number; // milliseconds
  format?: 'full' | 'time-only' | 'date-only' | 'short';
  timezone?: string;
}

interface LiveTimeReturn {
  currentTime: string;
  currentDate: string;
  fullDateTime: string;
  shortDateTime: string;
  isLoading: boolean;
}

/**
 * Custom hook for live time display in EN-UK format
 * Updates every second by default and provides various format options
 */
const useLiveTime = (options: LiveTimeOptions = {}): LiveTimeReturn => {
  const {
    updateInterval = 1000, // Update every second
    timezone = 'Asia/Bangkok', // Thailand timezone
  } = options;

  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with current time
    setCurrentDateTime(new Date());
    setIsLoading(false);

    // Set up interval for live updates
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, updateInterval);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [updateInterval]);

  // Format time in EN-UK format (24-hour)
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date in EN-UK format (DD/MM/YYYY)
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format full date and time in EN-UK format
  const formatFullDateTime = (date: Date): string => {
    return date.toLocaleString('en-GB', {
      timeZone: timezone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Format short date and time
  const formatShortDateTime = (date: Date): string => {
    return date.toLocaleString('en-GB', {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return {
    currentTime: formatTime(currentDateTime),
    currentDate: formatDate(currentDateTime),
    fullDateTime: formatFullDateTime(currentDateTime),
    shortDateTime: formatShortDateTime(currentDateTime),
    isLoading,
  };
};

export default useLiveTime;