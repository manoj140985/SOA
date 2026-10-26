export interface QuestionPaperGeneratedEvent {
  eventId: string;
  eventType: 'QuestionPaperGenerated';
  paperId: string;
  cohortId: string;
  status: 'COMPLETE' | 'PARTIAL' | 'FAILED';
  selectedQuestionIds: string[];
  unsatisfiedCoverage: Partial<Record<string, number>>;
  occurredAt: string;
  schemaVersion: number;
}

export interface KafkaEventRecord {
  id: string;
  topic: string; // "soa.s09.t14.events"
  partition: number;
  offset: number;
  timestamp: string;
  event: QuestionPaperGeneratedEvent;
  consumerStatus: 'ACKNOWLEDGED' | 'PROCESSED' | 'FAILED' | 'PENDING';
  consumedByService: 'WorkflowTracker';
  sourceService: 'PaperAssembly';
  isSimulatedDemo?: boolean;
}

export interface WorkflowState {
  paperId: string;
  currentState: 'GENERATED' | 'EVENT_EMITTED' | 'EXPOSURE_UPDATED' | 'AUDITED' | 'PERSISTED';
  stepHistory: Array<{
    step: string;
    timestamp: string;
    status: 'SUCCESS' | 'FAILED';
    details: string;
  }>;
}
