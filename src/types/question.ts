export type CourseOutcome = 'CO1' | 'CO2' | 'CO3' | 'CO4';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ExposureStatus = 'Available' | 'Near Limit' | 'Exhausted';

export interface Question {
  id: string; // e.g. "Q101"
  text: string;
  subject: string;
  courseOutcome: CourseOutcome;
  difficulty: Difficulty;
  marks: number;
  maximumExposure: number; // Maximum times allowed for a cohort
  currentExposure: number; // Current exposure count in current cohort context
  remainingExposures: number; // max(0, maximumExposure - currentExposure)
  status: ExposureStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastUsedCohort?: string;
  authorName?: string;
}

export interface QuestionFilterParams {
  search?: string;
  courseOutcome?: CourseOutcome | 'ALL';
  difficulty?: Difficulty | 'ALL';
  status?: ExposureStatus | 'ALL';
  subject?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Question;
  sortOrder?: 'asc' | 'desc';
}

export interface QuestionFormData {
  text: string;
  subject: string;
  courseOutcome: CourseOutcome;
  difficulty: Difficulty;
  marks: number;
  maximumExposure: number;
  tags?: string;
}
