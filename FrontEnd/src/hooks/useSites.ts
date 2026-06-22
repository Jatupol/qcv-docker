// client/src/hooks/useSites.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { siteService } from '../services/siteService';
import type { 
  Code ,
  UseCodesResult,
  CodeQueryParams,  
  CreateCodeRequest,
  UpdateCodeRequest ,
  Notification
} from '../types/generic-code';

import { 
  LOADING_STATE,
  ERROR_STATE
} from '../types/generic-code';

// ==================== LOADING AND ERROR STATES ====================
  const initialLoadingState = LOADING_STATE;
  const initialErrorState = ERROR_STATE;
// ==================== MAIN SITES HOOK ====================
export function useSites(initialParams?: CodeQueryParams) {
  const [sites, setSites] = useState<Code[]>([]);
  const [loading, setLoading] = useState<UseCodesResult['loading']>(initialLoadingState);
  const [errors, setErrors] = useState<UseCodesResult['errors']>(initialErrorState);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  } | null>(null);

  // ==================== UTILITY FUNCTIONS ====================
  const setLoadingState = useCallback((key: keyof UseCodesResult['loading'], value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const setErrorState = useCallback((key: keyof UseCodesResult['errors'], value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after timeout
    if (notification.timeout !== 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.timeout || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors(initialErrorState);
  }, []);

  const clearError = useCallback((key: keyof UseCodesResult['errors']) => {
    setErrorState(key, null);
  }, [setErrorState]);

  // ==================== API OPERATIONS ====================
  const fetchSites = useCallback(async (params: CodeQueryParams = {}): 
  Promise<{ success: boolean; error?: string }> => {
  setLoadingState('list', true);
  setErrorState('list', null);

  try {
    const response = await siteService.getSites(params);
    if (response.success) {
      
      let sitesArray: Code[] = [];
      if (Array.isArray(response.data)) {
        sitesArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const dataObj = response.data as any;
        if (Array.isArray(dataObj.data)) {
          sitesArray = dataObj.data;
        } else if (Array.isArray(dataObj.sites)) {
          sitesArray = dataObj.sites;
        } else {
          const possibleArrays = Object.values(dataObj).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            sitesArray = possibleArrays[0] as Code[];
          }
        }
        
        // Handle pagination if present
        if (dataObj.pagination) {
          setPagination(dataObj.pagination);
        }
      } else {
        console.log('❌ No valid array found in response');
      }
      
      const validSitesArray = Array.isArray(sitesArray) ? sitesArray : [];
      setSites(validSitesArray);
      
      return { success: true };
    } else {
      const errorMessage = response.message || 'Failed to fetch sites';
      setErrorState('list', errorMessage);
      setSites([]);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setErrorState('list', errorMessage);
    setSites([]);
    return { success: false, error: errorMessage };
  } finally {
    setLoadingState('list', false);
  }
}, [setLoadingState, setErrorState]);

  const createSite = useCallback(async (data: CreateCodeRequest): 
    Promise<{ success: boolean; data?: Code; error?: string }> => {
    setLoadingState('create', true);
    setErrorState('create', null);

    try {
      const response = await siteService.createSite(data);
      
      if (response.success && response.data) {
        // Add to local state
        setSites(prev => [response.data!, ...prev]);
        
        // Update pagination
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total + 1
        } : null);

        addNotification({
          type: 'success',
          title: 'Site Created',
          message: `Site "${data.code}" has been created successfully.`
        });

        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to create site';
        setErrorState('create', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorState('create', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingState('create', false);
    }
  }, [setLoadingState, setErrorState, addNotification]);

  const updateSite = useCallback(async (code: string, data: UpdateCodeRequest): 
    Promise<{ success: boolean; data?: Code; error?: string }> => {
    setLoadingState('update', true);
    setErrorState('update', null);

    try {
      const response = await siteService.updateSite(code, data);
      
      if (response.success && response.data) {
        // Update local state
        setSites(prev => prev.map(site => 
          site.code === code ? response.data! : site
        ));

        addNotification({
          type: 'success',
          title: 'Site Updated',
          message: `Site "${code}" has been updated successfully.`
        });

        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to update site';
        setErrorState('update', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorState('update', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingState('update', false);
    }
  }, [setLoadingState, setErrorState, addNotification]);

  const deleteSite = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    setLoadingState('delete', true);
    setErrorState('delete', null);

    try {
      const response = await siteService.deleteSite(code);
      
      if (response.success) {
        // Remove from local state
        setSites(prev => prev.filter(site => site.code !== code));
        
        // Update pagination
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total - 1
        } : null);

        addNotification({
          type: 'success',
          title: 'Site Deleted',
          message: `Site "${code}" has been deleted successfully.`
        });

        return { success: true };
      } else {
        const errorMessage = response.message || 'Failed to delete site';
        setErrorState('delete', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorState('delete', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingState('delete', false);
    }
  }, [setLoadingState, setErrorState, addNotification]);

  const toggleSiteStatus = useCallback(async (code: string): 
    Promise<{ success: boolean; data?: Code; error?: string }> => {
    setLoadingState('toggle', true);
    setErrorState('toggle', null);

    try {
      const site = sites.find(s => s.code === code);
      if (!site) {
        throw new Error('Site not found');
      }

      const response = await siteService.updateSite(code, {
        is_active: !site.is_active
      });
      
      if (response.success && response.data) {
        // Update local state
        setSites(prev => prev.map(s => 
          s.code === code ? response.data! : s
        ));

        const action = response.data.is_active ? 'activated' : 'deactivated';
        addNotification({
          type: 'success',
          title: 'Site Status Updated',
          message: `Site "${code}" has been ${action}.`
        });

        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to toggle site status';
        setErrorState('toggle', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorState('toggle', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingState('toggle', false);
    }
  }, [sites, setLoadingState, setErrorState, addNotification]);

  const searchSites = useCallback(async (term: string): 
    Promise<{ success: boolean; data?: Code[]; error?: string }> => {
    setLoadingState('search', true);
    setErrorState('search', null);

    try {
      const response = await siteService.getSites({ search: term });
      
      if (response.success) {
        return { success: true, data: response.data || [] };
      } else {
        const errorMessage = response.message || 'Search failed';
        setErrorState('search', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setErrorState('search', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingState('search', false);
    }
  }, [setLoadingState, setErrorState]);


  const exportSites = useCallback(async (format: 'csv' | 'excel' = 'csv'): Promise<{ success: boolean; error?: string }> => {
    setLoadingState('export', true);
    setErrorState('export', null);

    try {
      // Get all sites for export
      const response = await siteService.getSites({ limit: 10000 });
      
      if (response.success && response.data) {
        const data = response.data;
        
        if (format === 'csv') {
          const csv = convertToCSV(data);
          downloadFile(csv, 'sites.csv', 'text/csv');
        } else {
          // Implement Excel export if needed
          throw new Error('Excel export not implemented yet');
        }

        addNotification({
          type: 'success',
          title: 'Export Complete',
          message: `${data.length} sites exported successfully.`
        });

        return { success: true };
      } else {
        const errorMessage = response.message || 'Export failed';
        setErrorState('export', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setErrorState('export', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingState('export', false);
    }
  }, [setLoadingState, setErrorState, addNotification]);

  // ==================== UTILITY FUNCTIONS ====================

  const convertToCSV = (data: Code[]): string => {
    const headers = ['Code', 'Name', 'Status', 'Created By', 'Updated By', 'Created', 'Updated'];
    const rows = data.map(site => [
      site.code,
      site.name.replace(/,/g, ';'), // Replace commas to avoid CSV issues
      site.is_active ? 'Active' : 'Inactive',
      site.created_by?.toString() || '',
      site.updated_by?.toString() || '',
      new Date(site.created_at).toISOString(),
      new Date(site.updated_at).toISOString()
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ==================== COMPUTED VALUES ====================

  const activeSites = useMemo(() => sites.filter(site => site.is_active), [sites]);
  const inactiveSites = useMemo(() => sites.filter(site => !site.is_active), [sites]);
  
  const siteStats = useMemo(() => ({
    total: sites.length,
    active: activeSites.length,
    inactive: inactiveSites.length,
    recentlyUpdated: sites.filter(site => {
      const updatedAt = new Date(site.updated_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updatedAt > weekAgo;
    }).length
  }), [sites, activeSites, inactiveSites]);

  // Auto-fetch sites on mount
  useEffect(() => {
    if (initialParams) {
      fetchSites(initialParams);
    }
  }, [fetchSites, initialParams]);

  // ==================== RETURN HOOK INTERFACE ====================

  return {
    // Data
    sites,
    activeSites,
    inactiveSites,
    pagination,
    siteStats,
    
    // State
    loading,
    errors,
    notifications,
    
    // Operations
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
    toggleSiteStatus,
    searchSites,
    //getStats,
    exportSites,
    
    
    // Utilities
    clearErrors,
    clearError,
    removeNotification
  };
}

