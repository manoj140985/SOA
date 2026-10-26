import { apiClient } from './apiClient';
import { Cohort, CohortExposureSummary } from '../types/exposure';

/**
 * Exposure Ledger Microservice API client
 * Interacts with ExposureLedger Service through Spring Cloud Gateway
 */
export const exposureApi = {
  /**
   * GET /api/cohorts
   */
  async getCohorts(): Promise<Cohort[]> {
    const response = await apiClient.get<Cohort[]>('/api/cohorts');
    return response.data;
  },

  /**
   * GET /api/exposures/{cohortId}
   * Retrieves exposure ledger for cohort
   */
  async getCohortSummary(cohortId: string): Promise<CohortExposureSummary> {
    const response = await apiClient.get<CohortExposureSummary>(`/api/exposures/${cohortId}`);
    return response.data;
  },

  /**
   * GET /api/exposures/{cohortId}/questions/{questionId}
   */
  async getQuestionExposure(cohortId: string, questionId: string): Promise<{
    questionId: string;
    cohortId: string;
    exposureCount: number;
    maximumExposure: number;
    remainingCapacity: number;
  }> {
    const response = await apiClient.get(`/api/exposures/${cohortId}/questions/${questionId}`);
    return response.data;
  },
};
