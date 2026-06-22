// client/src/hooks/useSysconfig.ts
/**
 * React Hook for System Configuration
 * 
 * Provides easy access to sysconfig data with caching and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { sysconfigService, type ParsedSysconfig } from '../services/sysconfigService';

export interface UseSysconfigReturn {
  config: ParsedSysconfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export function useSysconfig(): UseSysconfigReturn {
  const [config, setConfig] = useState<ParsedSysconfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedConfig = await sysconfigService.getParsedSysconfig();
      setConfig(parsedConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      setError(errorMessage);
      console.error('Error loading sysconfig:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    sysconfigService.clearCache();
    await loadConfig();
  }, [loadConfig]);

  const clearCache = useCallback(() => {
    sysconfigService.clearCache();
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    refresh,
    clearCache
  };
}

// ==================== SPECIFIC HOOKS FOR ENTITIES ====================

export function useDefectTypes() {
  const { config, loading, error } = useSysconfig();
  
  return {
    defectTypes: config?.defect_type || [],
    loading,
    error
  };
}

export function useShifts() {
  const { config, loading, error } = useSysconfig();
  
  return {
    shifts: config?.shift || [],
    loading,
    error
  };
}

export function useSites() {
  const { config, loading, error } = useSysconfig();
  
  return {
    sites: config?.site || [],
    loading,
    error
  };
}

export function useGroups() {
  const { config, loading, error } = useSysconfig();
  
  return {
    groups: config?.grps || [],
    loading,
    error
  };
}

export function useZones() {
  const { config, loading, error } = useSysconfig();
  
  return {
    zones: config?.zones || [],
    loading,
    error
  };
}

export function useTabs() {
  const { config, loading, error } = useSysconfig();
  
  return {
    tabs: config?.tabs || [],
    loading,
    error
  };
}

export function useProductTypes() {
  const { config, loading, error } = useSysconfig();
  
  return {
    productTypes: config?.product_type || [],
    loading,
    error
  };
}

export function useProductFamilies() {
  const { config, loading, error } = useSysconfig();
  
  return {
    productFamilies: config?.product_families || [],
    loading,
    error
  };
}