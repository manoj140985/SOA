import { apiClient } from './apiClient';
import { Question, QuestionFilterParams, QuestionFormData } from '../types/question';

/**
 * Question Bank Microservice API client
 * Interacts with QuestionBank Service through Spring Cloud Gateway
 */
export const questionBankApi = {
  /**
   * GET /api/questions
   * Fetches paginated, filtered questions
   */
  async getQuestions(params?: QuestionFilterParams): Promise<Question[]> {
    const response = await apiClient.get<Question[]>('/api/questions', { params });
    return response.data;
  },

  /**
   * GET /api/questions/{id}
   */
  async getQuestionById(id: string): Promise<Question> {
    const response = await apiClient.get<Question>(`/api/questions/${id}`);
    return response.data;
  },

  /**
   * POST /api/questions
   */
  async createQuestion(data: QuestionFormData): Promise<Question> {
    const response = await apiClient.post<Question>('/api/questions', data);
    return response.data;
  },

  /**
   * PUT /api/questions/{id}
   */
  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const response = await apiClient.put<Question>(`/api/questions/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/questions/{id}
   */
  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/api/questions/${id}`);
  },
};
