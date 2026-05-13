// client/src/services/systemService.ts
// System management service - server restart and status

import { apiBaseUrl, apiFetch, type ApiResponse } from './api';

export interface SystemStatus {
  uptime: number;
  startTime: string;
  nodeVersion: string;
  platform: string;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  pid: number;
  env: string;
}

export interface RestartResult {
  requestedBy: string;
  requestedAt: string;
}

const baseUrl = apiBaseUrl('system');

const systemService = {
  async getStatus(): Promise<ApiResponse<SystemStatus>> {
    return apiFetch<SystemStatus>(`${baseUrl}/status`);
  },

  async restartServer(): Promise<ApiResponse<RestartResult>> {
    return apiFetch<RestartResult>(`${baseUrl}/restart`, { method: 'POST' });
  },
};

export default systemService;
