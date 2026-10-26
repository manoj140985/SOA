export type ServiceName =
  | 'QuestionBank'
  | 'ExposureLedger'
  | 'PaperAssembly'
  | 'WorkflowTracker'
  | 'Eureka Server'
  | 'API Gateway'
  | 'Kafka';

export type ServiceHealthStatus = 'UP' | 'DOWN' | 'UNKNOWN' | 'DEMO';

export interface ServiceHealthInfo {
  name: ServiceName;
  status: ServiceHealthStatus;
  description: string;
  endpoint?: string;
  port?: number;
  lastCheckedTime: string;
  latencyMs?: number;
  details?: Record<string, any>;
  isActuatorEndpoint?: boolean;
}
