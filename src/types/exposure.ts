import { CourseOutcome, ExposureStatus } from './question';

export interface Cohort {
  id: string; // e.g. "CSE-2026-A"
  name: string;
  department: string;
  academicYear: string;
  semester: string;
  studentCount: number;
  totalExposures: number;
  totalAvailableCapacity: number;
  nearLimitCount: number;
  exhaustedCount: number;
}

export interface QuestionExposureRecord {
  questionId: string;
  questionText: string;
  courseOutcome: CourseOutcome;
  difficulty: string;
  marks: number;
  exposureCount: number;
  maximumExposure: number;
  remainingCapacity: number; // max(0, maximumExposure - exposureCount)
  status: ExposureStatus;
  lastExposureDate: string | null;
  papersUsedIn: string[];
}

export interface CohortExposureSummary {
  cohortId: string;
  cohortName: string;
  department: string;
  academicYear: string;
  totalQuestionsExposed: number;
  totalEligibleQuestions: number;
  availableCapacity: number;
  nearLimitCount: number;
  exhaustedCount: number;
  distributionByCO: {
    CO1: { total: number; exhausted: number; available: number };
    CO2: { total: number; exhausted: number; available: number };
    CO3: { total: number; exhausted: number; available: number };
    CO4: { total: number; exhausted: number; available: number };
  };
  ledger: QuestionExposureRecord[];
}
