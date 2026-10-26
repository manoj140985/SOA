import { apiClient } from './apiClient';
import { KafkaEventRecord, WorkflowState } from '../types/workflow';

/**
 * Workflow Tracker Microservice API client
 * Interacts with WorkflowTracker Service consuming Kafka events
 */
export const workflowApi = {
  /**
   * GET /api/events
   * Topic: soa.s09.t14.events
   */
  async getEvents(topic: string = 'soa.s09.t14.events'): Promise<KafkaEventRecord[]> {
    const response = await apiClient.get<KafkaEventRecord[]>('/api/events', {
      params: { topic },
    });
    return response.data;
  },

  /**
   * GET /api/workflows/{paperId}
   * Fetches workflow execution history and event audit state
   */
  async getWorkflowByPaperId(paperId: string): Promise<WorkflowState> {
    const response = await apiClient.get<WorkflowState>(`/api/workflows/${paperId}`);
    return response.data;
  },
};
