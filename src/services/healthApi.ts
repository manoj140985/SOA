import { apiClient } from './apiClient';
import { ServiceHealthInfo } from '../types/health';

/**
 * Actuator and Health Monitoring API client
 */
export const healthApi = {
  /**
   * GET /actuator/health
   * Standard Spring Boot Actuator endpoint
   */
  async getGatewayActuatorHealth(): Promise<any> {
    const response = await apiClient.get('/actuator/health');
    return response.data;
  },

  /**
   * GET /api/services/health
   * Microservices cluster health registry summary
   */
  async getAllServicesHealth(): Promise<ServiceHealthInfo[]> {
    const response = await apiClient.get<ServiceHealthInfo[]>('/api/services/health');
    return response.data;
  },
};
