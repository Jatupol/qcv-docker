// client/src/config/api.ts
// Centralized API Configuration from Environment Variables

/**
 * API Configuration - Environment-aware settings
 *
 * This configuration is used across all service files to ensure
 * consistent API endpoint construction based on environment.
 *
 * Values resolve at runtime via window.__APP_CONFIG__ (loaded from /config.js
 * before the bundle), falling back to build-time VITE_* env vars.
 */

import { getRuntimeEnv } from '../config/runtimeConfig';

// ==================== ENVIRONMENT CONFIGURATION ====================

export const API = {
  // Base URL for API requests (empty in development to use Vite proxy)
  BASE_URL: getRuntimeEnv('VITE_API_BASE_URL') ?? '',

  // API prefix (default: /api)
  PREFIX: getRuntimeEnv('VITE_API_PREFIX') || '/api',

  // Backend port (for reference and proxy configuration)
  BACKEND_PORT: getRuntimeEnv('VITE_BACKEND_PORT') || '8021',

  // Environment flags
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Build full API URL from endpoint
 *
 * @param endpoint - API endpoint (e.g., '/customers', '/auth/login')
 * @returns Full URL based on environment configuration
 *
 * Examples:
 * - Development: buildApiUrl('/customers') → '/api/customers' (uses proxy)
 * - Production: buildApiUrl('/customers') → 'http://server:8021/api/customers'
 */
export function buildApiUrl(endpoint: string): string {
  // If endpoint already has the prefix, use as-is
  const path = endpoint.startsWith(API.PREFIX)
    ? endpoint
    : `${API.PREFIX}${endpoint}`;

  // In development (or if BASE_URL is empty), use relative URLs with Vite proxy
  // In production, use full URL with base
  return API.BASE_URL ? `${API.BASE_URL}${path}` : path;
}

/**
 * Build base URL for a specific entity
 *
 * @param entityPath - Entity path (e.g., 'customers', 'defects', 'auth')
 * @returns Base URL for the entity
 *
 * Examples:
 * - apiBaseUrl('customers') → '/api/customers'
 * - apiBaseUrl('/customers') → '/api/customers' (handles leading slash)
 */
export function apiBaseUrl(entityPath: string): string {
  // Remove leading slash if present
  const cleanPath = entityPath.startsWith('/') ? entityPath.slice(1) : entityPath;
  return buildApiUrl(`/${cleanPath}`);
}

/**
 * Log API configuration on startup
 */
export function logApiConfig(): void {
  console.log('🔧 API Configuration:', {
    mode: API.MODE,
    baseUrl: API.BASE_URL || '(using relative URLs with proxy)',
    prefix: API.PREFIX,
    backendPort: API.BACKEND_PORT,
    isProduction: API.IS_PRODUCTION,
    isDevelopment: API.IS_DEVELOPMENT,
  });
}

// Log configuration on module load (only once)
if (typeof window !== 'undefined') {
  logApiConfig();
}


// ======================================= CENTRALIZED API FETCH UTILITY =======================================

/*
USAGE PATTERNS:

1. Direct function usage:
   ```typescript
   import { apiFetch, buildQueryString } from '../utils/apiFetch';

   const queryString = buildQueryString({ page: 1, limit: 10 });
   const result = await apiFetch<MyType>(`/api/endpoint${queryString}`);
   ```

2. Base service class:
   ```typescript
   import { BaseService } from '../utils/apiFetch';
   import { apiBaseUrl } from '../config/api.config';

   class MyService extends BaseService {
     constructor() {
       super(apiBaseUrl('my-entity'));
     }

     async getData(id: string) {
       return this.apiFetch<MyType>(`/${id}`);
     }
   }
   ```

3. Custom service class:
   ```typescript
   import { apiFetch, buildQueryString, ApiResponse } from '../utils/apiFetch';
   import { apiBaseUrl } from '../config/api.config';

   class MyService {
     private readonly baseUrl = apiBaseUrl('my-entity');

     async getData(id: string): Promise<ApiResponse<MyType>> {
       const url = `${this.baseUrl}/${id}`;
       return apiFetch<MyType>(url);
     }
   }
   ```
*/
// Shared fetch helper used by all service classes

/**
 * Generic API Response wrapper
 * Used across all services for consistent response handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Centralized API Fetch Configuration
 */
export interface ApiFetchOptions extends RequestInit {
  // Additional custom options can be added here
  timeout?: number;
}

/**
 * Centralized API fetch helper
 *
 * @param url - Full URL to fetch (including base URL)
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns ApiResponse with typed data
 *
 * Features:
 * - Automatic JSON parsing
 * - Error handling with try-catch
 * - Console logging for debugging
 * - Session cookie support (credentials: 'include')
 * - User-friendly error messages
 *
 * Usage:
 * ```typescript
 * const result = await apiFetch<MyType>('http://api/endpoint', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 * ```
 */
export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';

  console.log(`📡 ${method} ${url}`);

  const config: RequestInit = {
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    const hasJson = contentType && contentType.includes('application/json');

    let data: any;
    if (hasJson) {
      data = await response.json();
    } else {
      data = { success: response.ok };
    }

    if (!response.ok) {
      console.error(`❌ ${method} ${url} - ${response.status}:`, data);
      return {
        success: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        errors: data.errors || [data.error || 'API_ERROR']
      };
    }

    console.log(`✅ ${method} ${url} - Success`);
    return data;

  } catch (error: any) {
    console.error(`❌ ${method} ${url} - Error:`, error);
    return {
      success: false,
      message: error.message || 'Network request failed',
      errors: [error.message || 'NETWORK_ERROR']
    };
  }
}

/**
 * Helper to build query string from params
 *
 * @param params - Object with query parameters
 * @returns Query string (e.g., '?key1=value1&key2=value2') or empty string
 *
 * Features:
 * - Filters out undefined, null, and empty values
 * - URL encodes all values
 * - Returns empty string if no valid params
 *
 * Usage:
 * ```typescript
 * const queryString = buildQueryString({ page: 1, limit: 10, search: 'test' });
 * // Returns: '?page=1&limit=10&search=test'
 * ```
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .forEach(([key, value]) => {
      // Handle arrays by adding multiple parameters with the same key
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(key, String(item));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Base Service Class
 * Can be extended by all service classes for common functionality
 *
 * Usage:
 * ```typescript
 * class MyService extends BaseService {
 *   constructor() {
 *     super('my-entity'); // Sets baseUrl to '/api/my-entity'
 *   }
 *
 *   async getData(id: string) {
 *     return this.apiFetch<MyType>(`/${id}`);
 *   }
 * }
 * ```
 */
export abstract class BaseService {
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Protected fetch method for service classes
   * Automatically prepends baseUrl to endpoint
   */
  protected async apiFetch<T>(
    endpoint: string,
    options: ApiFetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return apiFetch<T>(url, options);
  }

  /**
   * Protected helper to build query string
   */
  protected buildQueryString(params: Record<string, any>): string {
    return buildQueryString(params);
  }
}


// ==================== DEFAULT EXPORT ====================

export default API;

/*
=== API CONFIGURATION GUIDE ===

USAGE IN SERVICES:

// Import the config
import { apiBaseUrl } from '@/config/api.config';

// Use in service class
class MyService {
  private readonly baseUrl = apiBaseUrl('my-entity');
  // Now baseUrl will be '/api/my-entity' or 'http://server:8021/api/my-entity'
}

ENVIRONMENT FILES:

Development (.env.development):
  VITE_API_BASE_URL=          # Empty to use Vite proxy
  VITE_API_PREFIX=/api
  VITE_BACKEND_HOST=localhost # Backend server host (or tnhkdds-app01)
  VITE_BACKEND_PORT=8021      # Backend server port

Production (.env.production):
  VITE_API_BASE_URL=http://your-server:8021
  VITE_API_PREFIX=/api
  VITE_BACKEND_HOST=your-server
  VITE_BACKEND_PORT=8021

BENEFITS:
✅ Single source of truth for API configuration
✅ Environment-aware (dev vs production)
✅ Consistent across all services
✅ Easy to update and maintain
✅ Type-safe configuration
*/
