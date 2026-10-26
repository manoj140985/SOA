import { apiClient } from './apiClient';
import { AuthTokenResponse } from '../types/auth';

/**
 * Authentication and Security API client
 */
export const authApi = {
  /**
   * POST /api/auth/login
   */
  async login(credentials: { username: string; password?: string }): Promise<AuthTokenResponse> {
    const response = await apiClient.post<AuthTokenResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },
};
