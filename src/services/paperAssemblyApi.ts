import { apiClient } from './apiClient';
import { AssessmentPaper, PaperGenerationRequest, PaperFilterParams } from '../types/paper';

/**
 * Paper Assembly Microservice API client
 * Interacts with PaperAssembly Service through Spring Cloud Gateway
 */
export const paperAssemblyApi = {
  /**
   * POST /api/papers/generate
   * Generates assessment paper using exposure-aware selection algorithms
   */
  async generatePaper(payload: PaperGenerationRequest): Promise<AssessmentPaper> {
    const response = await apiClient.post<AssessmentPaper>('/api/papers/generate', payload);
    return response.data;
  },

  /**
   * GET /api/papers
   */
  async getPapers(params?: PaperFilterParams): Promise<AssessmentPaper[]> {
    const response = await apiClient.get<AssessmentPaper[]>('/api/papers', { params });
    return response.data;
  },

  /**
   * GET /api/papers/{paperId}
   */
  async getPaperById(paperId: string): Promise<AssessmentPaper> {
    const response = await apiClient.get<AssessmentPaper>(`/api/papers/${paperId}`);
    return response.data;
  },
};
