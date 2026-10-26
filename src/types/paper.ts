import { CourseOutcome, Question } from './question';

export type PaperStatus = 'COMPLETE' | 'PARTIAL' | 'FAILED';

export type WorkflowStatus = 'PENDING' | 'EVENT_PUBLISHED' | 'PERSISTED' | 'ACKNOWLEDGED' | 'COMPLETED' | 'FAILED';

export interface CoRequirements {
  CO1: number;
  CO2: number;
  CO3: number;
  CO4: number;
}

export interface PaperGenerationRequest {
  title: string;
  subject: string;
  cohortId: string;
  semester: string;
  examinationType: 'Mid-Term 1' | 'Mid-Term 2' | 'End-Semester' | 'Quiz' | 'Supplementary';
  totalMarks: number;
  coRequirements: CoRequirements;
  maxExposureOverride?: number;
}

export interface ExcludedQuestionReason {
  questionId: string;
  questionText: string;
  courseOutcome: CourseOutcome;
  currentExposure: number;
  maximumExposure: number;
  reason: string;
}

export interface AssessmentPaper {
  id: string; // e.g. "PAPER-1001"
  title: string;
  cohortId: string;
  subject: string;
  semester: string;
  examinationType: string;
  totalMarks: number;
  generatedAt: string;
  generatedBy: string;
  status: PaperStatus;
  selectedQuestions: Question[];
  requestedCounts: CoRequirements;
  selectedCounts: CoRequirements;
  unsatisfiedCoverage: Partial<Record<CourseOutcome, number>>;
  excludedQuestions: ExcludedQuestionReason[];
  coveragePercentage: number;
  workflowStatus: WorkflowStatus;
  workflowEventId?: string;
  notes?: string;
}

export interface PaperFilterParams {
  cohortId?: string;
  status?: PaperStatus | 'ALL';
  workflowStatus?: WorkflowStatus | 'ALL';
  search?: string;
  startDate?: string;
  endDate?: string;
}
