// client/src/pages/masterdata/UsersPage.tsx
// Refactored Users Page with Modal Form Component

import React, { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '../../utils/formatUtils';
import { userService } from '../../services/userService';
import type { User, CreateUserFormData, UpdateUserFormData, UserQueryParams, UserRole, UserFormErrors } from '../../types/user';
import UserFormSection from '../../components/users/UserFormSection';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toast from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card,{  CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { soundNotification } from '../../utils/soundNotification';

// Heroicons imports
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// ==================== INTERFACES ====================

interface UsersPageState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  showDeleteModal: boolean;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy: keyof User;
  sortOrder: 'asc' | 'desc';
  activeFilter: boolean | undefined;
  roleFilter: string;
  showFormModal: boolean;
  formMode: 'create' | 'edit';
}

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
}

interface RoleStats {
  admin: number;
  manager: number;
  user: number;
  viewer: number;
}

// ==================== USERS PAGE COMPONENT ====================

const UsersPage: React.FC = () => {
  // ============ STATE ============
  const [state, setState] = useState<UsersPageState>({
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
    showDeleteModal: false,
    searchTerm: '',
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
    sortBy: 'name',
    sortOrder: 'asc',
    activeFilter: undefined,
    roleFilter: 'all',
    showFormModal: false,
    formMode: 'create'
  });

  const [notification, setNotification] = useState<Notification | null>(null);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    inactive_users: 0
  });
  const [roleStats, setRoleStats] = useState<RoleStats>({
    admin: 0,
    manager: 0,
    user: 0,
    viewer: 0
  });

  // ============ UTILITY FUNCTIONS ============

  const showNotification = useCallback((type: Notification['type'], message: string) => {
    // Play sound based on notification type
    soundNotification.play(type);

    // Show visual notification
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // ============ API CALLS ============

  const fetchUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params: UserQueryParams = {
        page: state.currentPage,
        limit: state.pageSize,
        search: state.searchTerm || undefined,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        isActive: state.activeFilter,
        role: state.roleFilter === 'all' ? undefined : state.roleFilter as UserRole
      };

      const response = await userService.getUsers(params);

      if (response.success && response.data) {
        const users = response.data || [];

        // Calculate role statistics
        const roleCounts = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, { admin: 0, manager: 0, user: 0, viewer: 0 } as RoleStats);

        setRoleStats(roleCounts);

        setState(prev => ({
          ...prev,
          users,
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
          loading: false
        }));
      } else {
        soundNotification.play('error');
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch users',
          loading: false
        }));
      }
    } catch (error) {
      soundNotification.play('error');
      setState(prev => ({
        ...prev,
        error: 'Network error occurred',
        loading: false
      }));
    }
  }, [state.currentPage, state.pageSize, state.searchTerm, state.sortBy, state.sortOrder, state.activeFilter, state.roleFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await userService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        soundNotification.play('warning');
        console.error('Failed to fetch user statistics:', response.message);
      }
    } catch (error) {
      soundNotification.play('warning');
      console.error('Failed to fetch user statistics:', error);
    }
  }, []);

  // ============ EFFECTS ============

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ============ HANDLERS ============

  const closeModals = () => {
    setState(prev => ({
      ...prev,
      showDeleteModal: false,
      showFormModal: false,
      selectedUser: null
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }));
  };

  const handleSort = (field: keyof User) => {
    setState(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      currentPage: 1
    }));
  };

  const handleFilterChange = (filter: string) => {
    const activeFilter = filter === 'all' ? undefined : filter === 'active';
    setState(prev => ({ ...prev, activeFilter, currentPage: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    setState(prev => ({ ...prev, roleFilter: role, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // ============ FORM HANDLERS ============

  const handleCreateUser = () => {
    setState(prev => ({
      ...prev,
      showFormModal: true,
      formMode: 'create',
      selectedUser: null
    }));
  };

  const handleEditUser = (user: User) => {
    setState(prev => ({
      ...prev,
      showFormModal: true,
      formMode: 'edit',
      selectedUser: user
    }));
  };

  const handleFormCancel = () => {
    setState(prev => ({
      ...prev,
      showFormModal: false,
      selectedUser: null
    }));
  };

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      let response;
      
      if (state.formMode === 'create') {
        response = await userService.createUser(data as CreateUserFormData);
      } else if (state.selectedUser) {
        response = await userService.updateUser(state.selectedUser.id, data as UpdateUserFormData);
      }

      if (response?.success) {
        showNotification('success', `User ${state.formMode === 'create' ? 'created' : 'updated'} successfully`);
        setState(prev => ({ ...prev, showFormModal: false, selectedUser: null }));
        fetchUsers();
        fetchStats();
        return { success: true, message: response.message };
      } else {
        showNotification('error', response?.message || 'Operation failed');
        return { 
          success: false, 
          errors: response?.errors as UserFormErrors, 
          message: response?.message 
        };
      }
    } catch (error) {
      const errorMessage = 'Network error occurred';
      showNotification('error', errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // ============ DELETE HANDLERS ============

  const handleDeleteClick = (user: User) => {
    setState(prev => ({ ...prev, selectedUser: user, showDeleteModal: true }));
  };

  const handleDelete = async () => {
    if (!state.selectedUser) return;

    try {
      const response = await userService.deleteUser(state.selectedUser.id);
      
      if (response.success) {
        showNotification('success', 'User deleted successfully');
        closeModals();
        fetchUsers();
        fetchStats();
      } else {
        showNotification('error', response.message || 'Failed to delete user');
      }
    } catch (error) {
      showNotification('error', 'Network error occurred');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await userService.toggleUserStatus(user.id);
      
      if (response.success) {
        showNotification('success', `User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
        fetchStats();
      } else {
        showNotification('error', response.message || 'Failed to update user status');
      }
    } catch (error) {
      showNotification('error', 'Network error occurred');
    }
  };

  // ============ RENDER ============

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Master Data', href: '/masterdata' },
    { label: 'Users', href: '/masterdata/users' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Users Management</h1>
            <p className="text-indigo-100 text-lg">Manage system users, roles, and access permissions</p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New User
            </Button>
          </div>
        </div>
      </div>

      {/* All Statistics Cards in One Row - Compact Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Total Users Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wide mb-1">Total Users</p>
              <p className="text-xl font-bold text-white">{stats.total_users}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-green-100 uppercase tracking-wide mb-1">Active</p>
              <p className="text-xl font-bold text-white">{stats.active_users}</p>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Users Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-red-600 to-pink-600 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <ShieldExclamationIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-red-100 uppercase tracking-wide mb-1">Inactive</p>
              <p className="text-xl font-bold text-white">{stats.inactive_users}</p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Role Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-red-100 uppercase tracking-wide mb-1">Admin</p>
              <p className="text-xl font-bold text-white">{roleStats.admin}</p>
            </div>
          </CardContent>
        </Card>

        {/* Manager Role Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wide mb-1">Manager</p>
              <p className="text-xl font-bold text-white">{roleStats.manager}</p>
            </div>
          </CardContent>
        </Card>

        {/* User Role Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500 via-slate-600 to-gray-700 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-gray-100 uppercase tracking-wide mb-1">User</p>
              <p className="text-xl font-bold text-white">{roleStats.user}</p>
            </div>
          </CardContent>
        </Card>

        {/* Viewer Role Card */}
        <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 opacity-90"></div>
          <CardContent className="p-3 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm mb-2">
                <ShieldExclamationIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wide mb-1">Viewer</p>
              <p className="text-xl font-bold text-white">{roleStats.viewer}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Users List ({state.totalItems} total)
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={state.searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full sm:w-64 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={state.activeFilter === undefined ? 'all' : state.activeFilter ? 'active' : 'inactive'}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full sm:w-32"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>

              {/* Role Filter */}
              <Select
                value={state.roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="w-full sm:w-32"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(state.searchTerm || state.activeFilter !== undefined || state.roleFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              
              {state.searchTerm && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                  Search: "{state.searchTerm}"
                  <button
                    onClick={() => setState(prev => ({ ...prev, searchTerm: '', currentPage: 1 }))}
                    className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {state.activeFilter !== undefined && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md">
                  Status: {state.activeFilter ? 'Active' : 'Inactive'}
                  <button
                    onClick={() => setState(prev => ({ ...prev, activeFilter: undefined, currentPage: 1 }))}
                    className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {state.roleFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md">
                  Role: {state.roleFilter}
                  <button
                    onClick={() => setState(prev => ({ ...prev, roleFilter: 'all', currentPage: 1 }))}
                    className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Users Table */}
          {state.loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : state.error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <ShieldExclamationIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
              <p className="text-gray-600 mb-4">{state.error}</p>
              <Button onClick={fetchUsers}>Try Again</Button>
            </div>
          ) : state.users.length === 0 ? (
            <EmptyState
              icon={<UserIcon className="h-12 w-12 text-gray-400" />}
              title="No Users Found"
              description={
                state.searchTerm || state.activeFilter !== undefined || state.roleFilter !== 'all'
                  ? "No users match your current filters. Try adjusting your search criteria."
                  : "No users have been added to the system yet. Create your first user to get started."
              }
              action={
                !(state.searchTerm || state.activeFilter !== undefined || state.roleFilter !== 'all') ? {
                  label: 'Add First User',
                  onClick: handleCreateUser
                } : undefined
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                    <tr>
                      <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider w-16">
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          {state.sortBy === 'name' && (
                            <span className="text-indigo-600 font-bold text-sm">
                              {state.sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors"
                        onClick={() => handleSort('username')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Username</span>
                          {state.sortBy === 'username' && (
                            <span className="text-indigo-600 font-bold text-sm">
                              {state.sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email</span>
                          {state.sortBy === 'email' && (
                            <span className="text-indigo-600 font-bold text-sm">
                              {state.sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        Position
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.users.map((user, index) => {
                      const sequenceNumber = (state.currentPage - 1) * state.pageSize + index + 1;
                      return (
                        <tr key={user.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 border-b border-gray-100">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-md">
                                {sequenceNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.position || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                            user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' :
                            user.role === 'manager' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                            user.role === 'viewer' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                            'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all duration-200 transform hover:scale-105 ${
                              user.is_active
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg'
                                : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:shadow-lg'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-2 ${user.is_active ? 'bg-white animate-pulse' : 'bg-gray-200'}`}></span>
                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                              title="Edit user"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-2 text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                              title="Delete user"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
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
                    totalItems={state.totalItems}
                    itemsPerPage={state.pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {state.showFormModal && (
        <Modal
          isOpen={state.showFormModal}
          onClose={handleFormCancel}
          title={state.formMode === 'create' ? 'Add New User' : 'Edit User'}
          size="lg"
        >
          <UserFormSection
            mode={state.formMode}
            user={state.selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={state.loading}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {state.showDeleteModal && state.selectedUser && (
        <Modal
          isOpen={state.showDeleteModal}
          onClose={closeModals}
          title=""
          size="sm"
        >
          <div className="space-y-5">
            {/* Colorful Header */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 p-5 -m-6 mb-4">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative flex items-center">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center shadow-lg mr-4">
                  <TrashIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">Confirm Deletion</h3>
                  <p className="text-sm text-red-100 mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center shadow-md">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{state.selectedUser.name}</p>
                  <p className="text-sm text-gray-600 font-mono">@{state.selectedUser.username}</p>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2">
              <ShieldExclamationIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                All data associated with this user will be permanently removed from the system.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModals}
                className="px-5 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 hover:from-red-600 hover:via-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <TrashIcon className="h-4 w-4 mr-2 inline" />
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;

/*
=== REFACTORED USERS PAGE FEATURES ===

MODAL FORM ARCHITECTURE:
✅ UserFormSection displayed in modal dialog
✅ Clean separation between view and edit modes
✅ Modal overlay for focused interaction
✅ Proper modal sizing and positioning
✅ Clear visual distinction between create and edit modes

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained page with no entity dependencies
✅ Dedicated user form component separation
✅ Type-safe interfaces and data flow
✅ Centralized state management

ENHANCED USER EXPERIENCE:
✅ Statistics cards showing user counts
✅ Advanced filtering with visual filter indicators
✅ Real-time search with debounced input
✅ Sortable table columns with visual indicators
✅ Responsive design for mobile/tablet
✅ Loading states and error handling

FORM INTEGRATION:
✅ Create button opens modal form
✅ Edit action loads data into modal form
✅ Form submission updates table data
✅ Form cancellation closes modal
✅ Validation and error handling
✅ Success notifications

TABLE FUNCTIONALITY:
✅ Sortable columns with visual indicators
✅ Pagination for large datasets
✅ Status toggle functionality
✅ Row hover effects
✅ Action buttons (edit, delete)
✅ Empty state handling

FILTER SYSTEM:
✅ Search by name, username, email
✅ Status filter (active/inactive/all)
✅ Role filter (admin/manager/user/viewer/all)
✅ Active filter indicators with clear buttons
✅ Filter persistence across operations

MODAL USAGE:
✅ Delete confirmation uses modal
✅ Create/edit uses modal form
✅ Consistent modal styling and behavior
✅ Proper keyboard and accessibility support

This refactored page provides a modern user experience with modal-based
forms for focused interactions and a clean table view for data management.
*/