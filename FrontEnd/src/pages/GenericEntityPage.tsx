// client/src/pages/GenericEntityPage.tsx
// Generic Entity Page - Reusable CRUD page for entities with id/name/description/isActive pattern

import React, { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../utils/formatUtils';
import GenericEntityForm from '../components/forms/GenericEntityForm';
import type { EntityData, EntityFormData, UpdateEntityFormData } from '../components/forms/GenericEntityForm';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';

// ============ INTERFACES ============

interface EntityService<T extends EntityData> {
  getEntities: (params: any) => Promise<{ success: boolean; data?: T[]; message?: string; errors?: Record<string, string[]>; pagination?: any }>;
  createEntity: (data: EntityFormData) => Promise<{ success: boolean; data?: T; message?: string; errors?: Record<string, string[]> }>;
  updateEntity: (id: number, data: UpdateEntityFormData) => Promise<{ success: boolean; data?: T; message?: string; errors?: Record<string, string[]> }>;
  deleteEntity: (id: number) => Promise<{ success: boolean; message?: string }>;
  toggleEntityStatus: (id: number) => Promise<{ success: boolean; data?: T; message?: string }>;
}

interface GenericEntityPageProps<T extends EntityData> {
  entityName: string;
  entityNamePlural: string;
  entityDescription: string;
  service: EntityService<T>;
  nameValidationRules?: {
    minLength?: number;
    maxLength?: number;
  };
  descriptionValidationRules?: {
    minLength?: number;
    maxLength?: number;
  };
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  useIdField?: boolean;
  showDescriptionField?: boolean;
}

interface EntityPageState<T extends EntityData> {
  entities: T[];
  loading: boolean;
  error: string | null;
  selectedEntity: T | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy: keyof T;
  sortOrder: 'asc' | 'desc';
  activeFilter: boolean | undefined;
}

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ============ GENERIC ENTITY PAGE COMPONENT ============

function GenericEntityPage<T extends EntityData>({
  entityName,
  entityNamePlural,
  entityDescription,
  service,
  nameValidationRules,
  descriptionValidationRules,
  namePlaceholder,
  descriptionPlaceholder,
  useIdField = true,
  showDescriptionField = false
}: GenericEntityPageProps<T>) {
  // ============ STATE ============
  const [state, setState] = useState<EntityPageState<T>>({
    entities: [],
    loading: true,
    error: null,
    selectedEntity: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    searchTerm: '',
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    sortBy: 'id' as keyof T,
    sortOrder: 'desc',
    activeFilter: undefined
  });

  const [operationLoading, setOperationLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // ============ HELPER FUNCTIONS ============

  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatDateDisplay = (dateString: string | Date | undefined): string => {
    return formatDate(dateString as Date | string | null | undefined, 'N/A');
  };

  const truncateText = (text: string | undefined, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calculate number of columns for colSpan
  const getColumnCount = (): number => {
    let count = 2; // Row number + Name (always present)
    if (useIdField) count += 1; // ID
    if (showDescriptionField) count += 1; // Description
    count += 3; // Status + Created + Actions (always present)
    return count;
  };

  // ============ API FUNCTIONS ============

  const fetchEntities = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = {
        page: state.currentPage,
        limit: state.pageSize,
        search: state.searchTerm,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        ...(state.activeFilter !== undefined && { isActive: state.activeFilter })
      };

      const response = await service.getEntities(params);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          entities: response.data!,
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || `Failed to fetch ${entityNamePlural.toLowerCase()}`,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error fetching ${entityNamePlural.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false
      }));
    }
  }, [state.currentPage, state.pageSize, state.searchTerm, state.sortBy, state.sortOrder, state.activeFilter, service, entityNamePlural]);

  // ============ EVENT HANDLERS ============

  const handleSearch = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term, currentPage: 1 }));
  };

  const handleSort = (column: keyof T) => {
    setState(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      currentPage: 1
    }));
  };

  const handleFilterChange = (filter: string) => {
    const activeFilter = filter === 'all' ? undefined : filter === 'active';
    setState(prev => ({ ...prev, activeFilter, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  // ============ MODAL HANDLERS ============

  const openCreateModal = () => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  };

  const closeModals = () => {
    setState(prev => ({
      ...prev,
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedEntity: null
    }));
  };

  const handleEdit = (entity: T) => {
    setState(prev => ({
      ...prev,
      selectedEntity: entity,
      showEditModal: true
    }));
  };

  const handleDeleteClick = (entity: T) => {
    setState(prev => ({
      ...prev,
      selectedEntity: entity,
      showDeleteModal: true
    }));
  };

  // ============ CRUD OPERATIONS ============

  const handleCreateEntity = async (data: EntityFormData): Promise<{ success: boolean; errors?: Record<string, string[]>; message?: string }> => {
    setOperationLoading(true);
    try {
      const response = await service.createEntity(data);
      
      if (response.success) {
        showNotification('success', `${entityName} created successfully`);
        closeModals();
        fetchEntities();
        return { success: true, message: response.message };
      } else {
        showNotification('error', response.message || `Failed to create ${entityName.toLowerCase()}`);
        return { 
          success: false, 
          message: response.message, 
          errors: response.errors 
        };
      }
    } catch (error) {
      const errorMessage = `Error creating ${entityName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      showNotification('error', errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateEntity = async (data: UpdateEntityFormData): Promise<{ success: boolean; errors?: Record<string, string[]>; message?: string }> => {
    if (!state.selectedEntity) return { success: false, message: 'No entity selected' };
    
    setOperationLoading(true);
    try {
      const response = await service.updateEntity(state.selectedEntity.id, data);
      
      if (response.success) {
        showNotification('success', `${entityName} updated successfully`);
        closeModals();
        fetchEntities();
        return { success: true, message: response.message };
      } else {
        showNotification('error', response.message || `Failed to update ${entityName.toLowerCase()}`);
        return { 
          success: false, 
          message: response.message, 
          errors: response.errors 
        };
      }
    } catch (error) {
      const errorMessage = `Error updating ${entityName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      showNotification('error', errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setOperationLoading(false);
    }
  };

  // Combined handler for form submission
  const handleFormSubmit = async (data: EntityFormData | UpdateEntityFormData): Promise<{ success: boolean; errors?: Record<string, string[]>; message?: string }> => {
    if (state.showCreateModal) {
      return handleCreateEntity(data as EntityFormData);
    } else if (state.showEditModal) {
      return handleUpdateEntity(data as UpdateEntityFormData);
    }
    return { success: false, message: 'Invalid form state' };
  };

  const handleDeleteEntity = async () => {
    if (!state.selectedEntity) return;
    
    setOperationLoading(true);
    try {
      const response = await service.deleteEntity(state.selectedEntity.id);
      
      if (response.success) {
        showNotification('success', `${entityName} deleted successfully`);
        closeModals();
        fetchEntities();
      } else {
        showNotification('error', response.message || `Failed to delete ${entityName.toLowerCase()}`);
      }
    } catch (error) {
      showNotification('error', `Error deleting ${entityName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleStatus = async (entity: T) => {
    try {
      const response = await service.toggleEntityStatus(entity.id);
      
      if (response.success) {
        showNotification('success', `${entityName} status updated successfully`);
        fetchEntities();
      } else {
        showNotification('error', response.message || `Failed to update ${entityName.toLowerCase()} status`);
      }
    } catch (error) {
      showNotification('error', `Error updating ${entityName.toLowerCase()} status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ============ EFFECTS ============

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{entityNamePlural}</h1>
          <p className="mt-2 text-gray-600">
            Manage your {entityDescription}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder={`Search ${entityNamePlural.toLowerCase()}...`}
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filter */}
              <div className="min-w-[150px]">
                <Select
                  value={state.activeFilter === undefined ? 'all' : state.activeFilter ? 'active' : 'inactive'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </Select>
              </div>

              {/* Page Size */}
              <div className="min-w-[120px]">
                <Select
                  value={state.pageSize.toString()}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="w-full"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </Select>
              </div>
            </div>

            {/* Add Button */}
            <Button onClick={openCreateModal} variant="primary">
              Add {entityName}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {!state.loading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {state.entities.length} of {state.totalItems} {entityNamePlural.toLowerCase()}
          </div>
        )}

        {/* Table */}
        {state.loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <LoadingSpinner />
          </div>
        ) : state.error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center text-red-600">
              <p>{state.error}</p>
              <Button onClick={fetchEntities} variant="secondary" className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        ) : state.entities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <EmptyState
              title={`No ${entityNamePlural.toLowerCase()} found`}
              description={state.searchTerm || state.activeFilter !== undefined 
                ? `No ${entityNamePlural.toLowerCase()} match your current filters`
                : `Get started by creating your first ${entityName.toLowerCase()}`
              }
              action={{
                label: `Add ${entityName}`,
                onClick: openCreateModal
              }}
            />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Row Number Column */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    
                    {/* ID Column */}
                    {useIdField && (
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id' as keyof T)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>ID</span>
                          {state.sortBy === 'id' && (
                            <span className="text-blue-600">
                              {state.sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    
                    {/* Name Column */}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name' as keyof T)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {state.sortBy === 'name' && (
                          <span className="text-blue-600">
                            {state.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    
                    {/* Description Column */}
                    {showDescriptionField && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    )}
                    
                    {/* Status Column */}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('isActive' as keyof T)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {state.sortBy === 'isActive' && (
                          <span className="text-blue-600">
                            {state.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    
                    {/* Created Column */}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt' as keyof T)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created</span>
                        {state.sortBy === 'createdAt' && (
                          <span className="text-blue-600">
                            {state.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    
                    {/* Actions Column */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.entities.map((entity, index) => {
                    // Calculate the row number based on current page and index
                    const rowNumber = (state.currentPage - 1) * state.pageSize + index + 1;
                    
                    return (
                      <tr key={entity.id} className="hover:bg-gray-50">
                        {/* Row Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-500">
                            {rowNumber}
                          </span>
                        </td>
                        
                        {/* ID */}
                        {useIdField && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            #{entity.id}
                          </td>
                        )}
                        
                        {/* Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {entity.name}
                          </div>
                        </td>
                        
                        {/* Description */}
                        {showDescriptionField && (
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600" title={entity.description || ''}>
                              {truncateText(entity.description)}
                            </div>
                          </td>
                        )}
                        
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(entity)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              entity.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {entity.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        
                        {/* Created */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDateDisplay(entity.createdAt)}
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(entity)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(entity)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={state.currentPage}
                  totalPages={state.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {state.showCreateModal && (
        <GenericEntityForm
          mode="create"
          isOpen={state.showCreateModal}
          onClose={closeModals}
          onSubmit={handleFormSubmit}
          loading={operationLoading}
          entityName={entityName}
          entityDescription={entityDescription}
          nameValidationRules={nameValidationRules}
          descriptionValidationRules={descriptionValidationRules}
          namePlaceholder={namePlaceholder}
          descriptionPlaceholder={descriptionPlaceholder}
          showDescriptionField={showDescriptionField}
        />
      )}

      {/* Edit Modal */}
      {state.showEditModal && state.selectedEntity && (
        <GenericEntityForm
          mode="edit"
          entity={state.selectedEntity}
          isOpen={state.showEditModal}
          onClose={closeModals}
          onSubmit={handleFormSubmit}
          loading={operationLoading}
          entityName={entityName}
          entityDescription={entityDescription}
          nameValidationRules={nameValidationRules}
          descriptionValidationRules={descriptionValidationRules}
          namePlaceholder={namePlaceholder}
          descriptionPlaceholder={descriptionPlaceholder}
          showDescriptionField={showDescriptionField}
        />
      )}

      {/* Delete Modal */}
      {state.showDeleteModal && state.selectedEntity && (
        <Modal
          isOpen={state.showDeleteModal}
          onClose={closeModals}
          title={`Delete ${entityName}`}
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{state.selectedEntity.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button onClick={closeModals} variant="secondary">
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteEntity} 
                variant="danger"
                loading={operationLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default GenericEntityPage;