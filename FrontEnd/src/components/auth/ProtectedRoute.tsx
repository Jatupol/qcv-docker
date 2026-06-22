// client/src/components/auth/ProtectedRoute.tsx
// Backend Compatible Protected Route Component
// Sampling Inspection Control System - Session-based Authentication

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { User, UserRole } from '../../types/user';

// ==================== TYPES ====================

// Re-export for backward compatibility
export type { User, UserRole };

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuthentication?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
  // Optional props for compatibility with existing usage
  authService?: any;
  debugMode?: boolean;
  showAccessDenied?: boolean;
  onAccessDenied?: () => void;
}

// ==================== LOADING COMPONENT ====================

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Checking authentication...</p>
    </div>
  </div>
);

// ==================== ACCESS DENIED COMPONENT ====================

const AccessDenied: React.FC<{
  user: User | null;
  requiredRoles: UserRole[];
  onNavigateHome: () => void;
}> = ({ user, requiredRoles, onNavigateHome }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md p-8">
      <div className="mb-6">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Your role: <span className="font-medium">{user?.role || 'Unknown'}</span></p>
          <p>Required: <span className="font-medium">{requiredRoles.join(' or ')}</span></p>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onNavigateHome}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full text-gray-600 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
);

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if user has required role
 */
function hasRequiredRole(user: User | null, requiredRoles: UserRole[]): boolean {
  if (!user || !requiredRoles.length) return true;
  
  // Normalize role comparison
  const userRole = user.role?.toLowerCase() as UserRole;
  const normalizedRoles = requiredRoles.map(role => role.toLowerCase() as UserRole);
  
  return normalizedRoles.includes(userRole);
}

/**
 * Check role hierarchy (admin > manager > user)
 */
function hasRoleHierarchy(user: User | null, minimumRole: UserRole): boolean {
  if (!user) return false;
  
  const roleHierarchy = { 'admin': 3, 'manager': 2, 'user': 1 };
  const userLevel = roleHierarchy[user.role?.toLowerCase() as UserRole] || 0;
  const requiredLevel = roleHierarchy[minimumRole.toLowerCase() as UserRole] || 0;
  
  return userLevel >= requiredLevel;
}

// ==================== MAIN PROTECTED ROUTE COMPONENT ====================

/**
 * Protected Route Component - Compatible with Backend Session Authentication
 * 
 * Features:
 * ✅ Session-based authentication check
 * ✅ Role-based access control
 * ✅ Loading states during auth check
 * ✅ User-friendly error messages
 * ✅ Compatible with your backend /api/auth/status
 * ✅ Compatible with existing App.tsx usage patterns
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuthentication = true,
  fallback,
  redirectTo = '/login',
  // Optional props for compatibility
  authService,
  debugMode = false,
  showAccessDenied = true,
  onAccessDenied
}) => {
  // Use either provided authService or useAuth hook
  const contextAuth = useAuth();
  const auth = authService || contextAuth;
  
  // Handle different property names for compatibility
  const user = auth.user;
  const isAuthenticated = auth.isAuthenticated;
  const loading = auth.loading || auth.isLoading; // Support both property names
  
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  // Check authentication requirement
  if (requireAuthentication && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user account is active (if user exists)
  if (user && user.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">Account Inactive</h2>
          <p className="text-gray-600 mb-4">Your account has been deactivated.</p>
          <p className="text-sm text-gray-500">Please contact your administrator.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && user) {
    const hasAccess = hasRequiredRole(user, requiredRoles);
    
    if (debugMode) {
      console.log('ProtectedRoute: Role check result', { user, requiredRoles, hasAccess });
    }

    if (!hasAccess) {
      if (onAccessDenied) onAccessDenied();
      
      if (!showAccessDenied) {
        return null;
      }
      
      return (
        <AccessDenied
          user={user}
          requiredRoles={requiredRoles}
          onNavigateHome={() => window.location.href = '/dashboard'}
        />
      );
    }
  }

  // All checks passed - render children
  return <>{children}</>;
};

// ==================== CONVENIENCE HOCs ====================

/**
 * Admin-only route wrapper
 */
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['admin']} />
);

/**
 * Manager+ route wrapper (admin or manager)
 */
export const ManagerRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['admin', 'manager']} />
);

/**
 * Any authenticated user route wrapper
 */
export const AuthenticatedRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles' | 'requireAuthentication'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={[]} requireAuthentication={true} />
);

/**
 * Public route wrapper (no authentication required)
 */
export const PublicRoute: React.FC<Omit<ProtectedRouteProps, 'requireAuthentication'>> = (props) => (
  <ProtectedRoute {...props} requireAuthentication={false} />
);

// ==================== USAGE EXAMPLES ====================

/*
BASIC USAGE:

// Protect any route - requires authentication
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Admin only route
<AdminRoute>
  <UsersManagementPage />
</AdminRoute>

// Manager or Admin route
<ManagerRoute>
  <ReportsPage />
</ManagerRoute>

// Specific roles
<ProtectedRoute requiredRoles={['manager', 'admin']}>
  <QualityControlPage />
</ProtectedRoute>

// With custom redirect
<ProtectedRoute redirectTo="/unauthorized">
  <SensitiveDataPage />
</ProtectedRoute>

// Public route (no auth required)
<PublicRoute>
  <AboutPage />
</PublicRoute>

ROUTER INTEGRATION:

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <UsersPage />
      </AdminRoute>
    )
  },
  {
    path: "/quality/reports",
    element: (
      <ManagerRoute>
        <QualityReportsPage />
      </ManagerRoute>
    )
  }
]);
*/

export default ProtectedRoute;