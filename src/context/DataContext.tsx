import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Question, QuestionFormData, CourseOutcome } from '../types/question';
import { Cohort, CohortExposureSummary, QuestionExposureRecord } from '../types/exposure';
import { AssessmentPaper, PaperGenerationRequest, ExcludedQuestionReason, PaperStatus } from '../types/paper';
import { KafkaEventRecord, QuestionPaperGeneratedEvent } from '../types/workflow';
import { ServiceHealthInfo } from '../types/health';
import {
  SEEDED_QUESTIONS,
  SEEDED_COHORTS,
  INITIAL_PAPERS,
  INITIAL_KAFKA_EVENTS,
  INITIAL_SERVICES_HEALTH,
} from '../mocks/seedData';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiClient';

interface DataContextType {
  questions: Question[];
  cohorts: Cohort[];
  papers: AssessmentPaper[];
  events: KafkaEventRecord[];
  servicesHealth: ServiceHealthInfo[];
  selectedCohortId: string;
  setSelectedCohortId: (id: string) => void;
  getCohortSummary: (cohortId: string) => CohortExposureSummary;
  addQuestion: (formData: QuestionFormData) => Promise<Question>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<Question>;
  deleteQuestion: (id: string) => Promise<void>;
  generateAssessmentPaper: (request: PaperGenerationRequest) => Promise<AssessmentPaper>;
  runExhaustionDemo: () => Promise<AssessmentPaper>;
  refreshHealth: () => Promise<void>;
  getPaperById: (id: string) => AssessmentPaper | undefined;
  resetToSeededData: () => void;
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, addNotification } = useSettings();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('examguard_questions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_QUESTIONS;
  });

  const [cohorts, setCohorts] = useState<Cohort[]>(() => {
    const saved = localStorage.getItem('examguard_cohorts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_COHORTS;
  });

  const [papers, setPapers] = useState<AssessmentPaper[]>(() => {
    const saved = localStorage.getItem('examguard_papers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PAPERS;
  });

  const [events, setEvents] = useState<KafkaEventRecord[]>(() => {
    const saved = localStorage.getItem('examguard_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_KAFKA_EVENTS;
  });

  const [servicesHealth, setServicesHealth] = useState<ServiceHealthInfo[]>(INITIAL_SERVICES_HEALTH);
  const [selectedCohortId, setSelectedCohortId] = useState<string>(settings.defaultCohort || 'CSE-2026-A');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('examguard_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('examguard_cohorts', JSON.stringify(cohorts));
  }, [cohorts]);

  useEffect(() => {
    localStorage.setItem('examguard_papers', JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem('examguard_events', JSON.stringify(events));
  }, [events]);

  const resetToSeededData = () => {
    setQuestions(SEEDED_QUESTIONS);
    setCohorts(SEEDED_COHORTS);
    setPapers(INITIAL_PAPERS);
    setEvents(INITIAL_KAFKA_EVENTS);
    setServicesHealth(INITIAL_SERVICES_HEALTH);
    localStorage.removeItem('examguard_questions');
    localStorage.removeItem('examguard_cohorts');
    localStorage.removeItem('examguard_papers');
    localStorage.removeItem('examguard_events');
  };

  // Get cohort summary with dynamic remaining calculations
  const getCohortSummary = useCallback(
    (cohortId: string): CohortExposureSummary => {
      const cohort = cohorts.find((c) => c.id === cohortId) || cohorts[0];

      // Build question exposure records for this cohort
      const ledger: QuestionExposureRecord[] = questions.map((q) => {
        // Remaining capacity calculation: max(0, maximumExposure - currentExposure)
        const rem = Math.max(0, q.maximumExposure - q.currentExposure);
        let status = q.status;
        if (rem === 0) status = 'Exhausted';
        else if (rem === 1) status = 'Near Limit';
        else status = 'Available';

        return {
          questionId: q.id,
          questionText: q.text,
          courseOutcome: q.courseOutcome,
          difficulty: q.difficulty,
          marks: q.marks,
          exposureCount: q.currentExposure,
          maximumExposure: q.maximumExposure,
          remainingCapacity: rem,
          status,
          lastExposureDate: q.updatedAt || null,
          papersUsedIn: papers
            .filter((p) => p.cohortId === cohortId && p.selectedQuestions.some((sq) => sq.id === q.id))
            .map((p) => p.id),
        };
      });

      const exhaustedCount = ledger.filter((l) => l.remainingCapacity === 0).length;
      const nearLimitCount = ledger.filter((l) => l.remainingCapacity === 1).length;
      const availableCapacity = ledger.reduce((acc, curr) => acc + curr.remainingCapacity, 0);

      const distributionByCO = {
        CO1: {
          total: ledger.filter((l) => l.courseOutcome === 'CO1').length,
          exhausted: ledger.filter((l) => l.courseOutcome === 'CO1' && l.remainingCapacity === 0).length,
          available: ledger.filter((l) => l.courseOutcome === 'CO1' && l.remainingCapacity > 0).length,
        },
        CO2: {
          total: ledger.filter((l) => l.courseOutcome === 'CO2').length,
          exhausted: ledger.filter((l) => l.courseOutcome === 'CO2' && l.remainingCapacity === 0).length,
          available: ledger.filter((l) => l.courseOutcome === 'CO2' && l.remainingCapacity > 0).length,
        },
        CO3: {
          total: ledger.filter((l) => l.courseOutcome === 'CO3').length,
          exhausted: ledger.filter((l) => l.courseOutcome === 'CO3' && l.remainingCapacity === 0).length,
          available: ledger.filter((l) => l.courseOutcome === 'CO3' && l.remainingCapacity > 0).length,
        },
        CO4: {
          total: ledger.filter((l) => l.courseOutcome === 'CO4').length,
          exhausted: ledger.filter((l) => l.courseOutcome === 'CO4' && l.remainingCapacity === 0).length,
          available: ledger.filter((l) => l.courseOutcome === 'CO4' && l.remainingCapacity > 0).length,
        },
      };

      return {
        cohortId: cohort.id,
        cohortName: cohort.name,
        department: cohort.department,
        academicYear: cohort.academicYear,
        totalQuestionsExposed: ledger.filter((l) => l.exposureCount > 0).length,
        totalEligibleQuestions: ledger.length,
        availableCapacity,
        nearLimitCount,
        exhaustedCount,
        distributionByCO,
        ledger,
      };
    },
    [questions, cohorts, papers]
  );

  // Add question
  const addQuestion = async (formData: QuestionFormData): Promise<Question> => {
    if (!settings.demoMode) {
      try {
        const response = await apiClient.post('/api/questions', formData);
        const created: Question = response.data;
        setQuestions((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to create question on backend.');
      }
    }

    // Demo Mode: Generate new ID (e.g. Q104, Q204, etc.)
    const coPrefix = formData.courseOutcome.replace('CO', '');
    const existingIds = questions
      .filter((q) => q.id.startsWith(`Q${coPrefix}`))
      .map((q) => parseInt(q.id.replace(`Q${coPrefix}`, ''), 10))
      .filter((n) => !isNaN(n));

    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newId = `Q${coPrefix}${nextNum < 10 ? '0' + nextNum : nextNum}`;

    const newQuestion: Question = {
      id: newId,
      text: formData.text,
      subject: formData.subject,
      courseOutcome: formData.courseOutcome,
      difficulty: formData.difficulty,
      marks: Number(formData.marks),
      maximumExposure: Number(formData.maximumExposure),
      currentExposure: 0,
      remainingExposures: Number(formData.maximumExposure),
      status: 'Available',
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: user?.fullName || 'Exam Author',
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    addNotification({
      title: 'Question Bank Updated',
      message: `Created question ${newId} (${formData.courseOutcome}) with max exposure ${formData.maximumExposure}.`,
      type: 'success',
    });

    return newQuestion;
  };

  // Update question
  const updateQuestion = async (id: string, updates: Partial<Question>): Promise<Question> => {
    if (!settings.demoMode) {
      try {
        const response = await apiClient.put(`/api/questions/${id}`, updates);
        const updated: Question = response.data;
        setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
        return updated;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || `Failed to update question ${id} on backend.`);
      }
    }

    let updatedQuestion: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const maxExp = updates.maximumExposure !== undefined ? updates.maximumExposure : q.maximumExposure;
          const currExp = updates.currentExposure !== undefined ? updates.currentExposure : q.currentExposure;
          const rem = Math.max(0, maxExp - currExp);
          let status = q.status;
          if (rem === 0) status = 'Exhausted';
          else if (rem === 1) status = 'Near Limit';
          else status = 'Available';

          updatedQuestion = {
            ...q,
            ...updates,
            maximumExposure: maxExp,
            currentExposure: currExp,
            remainingExposures: rem,
            status,
            updatedAt: new Date().toISOString(),
          };
          return updatedQuestion;
        }
        return q;
      })
    );

    if (!updatedQuestion) throw new Error(`Question ${id} not found.`);
    return updatedQuestion;
  };

  // Delete question
  const deleteQuestion = async (id: string): Promise<void> => {
    if (!settings.demoMode) {
      try {
        await apiClient.delete(`/api/questions/${id}`);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        return;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || `Failed to delete question ${id} on backend.`);
      }
    }

    setQuestions((prev) => prev.filter((q) => q.id !== id));
    addNotification({
      title: 'Question Deleted',
      message: `Question ${id} was removed from the question bank.`,
      type: 'info',
    });
  };

  // GENERATE ASSESSMENT PAPER
  // Implements strict exposure rules:
  // remaining = max(0, maximumExposure - exposureCount)
  // An exhausted question must never be treated as available.
  // Never repeat exhausted questions.
  // Never invent extra questions to hide coverage gaps.
  const generateAssessmentPaper = async (request: PaperGenerationRequest): Promise<AssessmentPaper> => {
    setIsLoading(true);
    setError(null);

    if (!settings.demoMode) {
      try {
        const response = await apiClient.post('/api/papers/generate', request);
        const paper: AssessmentPaper = response.data;
        setPapers((prev) => [paper, ...prev]);
        setIsLoading(false);
        return paper;
      } catch (err: any) {
        setIsLoading(false);
        const msg = err.response?.data?.message || err.message || 'Paper generation failed on backend service.';
        setError(msg);
        throw new Error(msg);
      }
    }

    // DEMO MODE IMPLEMENTATION
    // Add artificial realistic delay (600ms) to reflect microservices coordination
    await new Promise((res) => setTimeout(res, 600));

    const paperId = `PAPER-${Math.floor(1002 + papers.length)}`;
    const coList: CourseOutcome[] = ['CO1', 'CO2', 'CO3', 'CO4'];

    const selectedQuestions: Question[] = [];
    const excludedQuestions: ExcludedQuestionReason[] = [];
    const unsatisfiedCoverage: Partial<Record<CourseOutcome, number>> = {};
    const selectedCounts = { CO1: 0, CO2: 0, CO3: 0, CO4: 0 };

    for (const co of coList) {
      const required = request.coRequirements[co] || 0;
      if (required === 0) continue;

      // Filter questions matching CO and subject
      const coQuestions = questions.filter((q) => q.courseOutcome === co);

      // Separate eligible vs exhausted
      const eligiblePool: Question[] = [];

      for (const q of coQuestions) {
        const remaining = Math.max(0, q.maximumExposure - q.currentExposure);
        if (remaining > 0) {
          eligiblePool.push(q);
        } else {
          // Question is EXHAUSTED for this cohort
          excludedQuestions.push({
            questionId: q.id,
            questionText: q.text,
            courseOutcome: q.courseOutcome,
            currentExposure: q.currentExposure,
            maximumExposure: q.maximumExposure,
            reason: `Question ${q.id} has reached its maximum exposure limit of ${q.maximumExposure} for cohort ${request.cohortId}.`,
          });
        }
      }

      // Pick eligible up to required count
      const picked = eligiblePool.slice(0, required);
      selectedQuestions.push(...picked);
      selectedCounts[co] = picked.length;

      if (picked.length < required) {
        unsatisfiedCoverage[co] = required - picked.length;
      }
    }

    // Determine status
    let totalRequested = Object.values(request.coRequirements).reduce((a, b) => a + b, 0);
    if (totalRequested === 0) totalRequested = 1;
    const totalSelected = selectedQuestions.length;
    const coveragePercentage = Math.round((totalSelected / totalRequested) * 100);

    let status: PaperStatus = 'COMPLETE';
    if (Object.keys(unsatisfiedCoverage).length > 0) {
      status = 'PARTIAL';
    }

    const eventId = `evt-${Math.floor(1002 + events.length)}`;
    const newPaper: AssessmentPaper = {
      id: paperId,
      title: request.title,
      cohortId: request.cohortId,
      subject: request.subject,
      semester: request.semester,
      examinationType: request.examinationType,
      totalMarks: selectedQuestions.reduce((sum, q) => sum + q.marks, 0),
      generatedAt: new Date().toISOString(),
      generatedBy: user?.fullName || 'Prof. Ramesh Narayanan',
      status,
      selectedQuestions,
      requestedCounts: { ...request.coRequirements },
      selectedCounts,
      unsatisfiedCoverage,
      excludedQuestions,
      coveragePercentage,
      workflowStatus: 'COMPLETED',
      workflowEventId: eventId,
      notes:
        status === 'PARTIAL'
          ? 'Generated with coverage gaps. Exhausted questions were strictly excluded according to cohort exposure limits.'
          : 'Complete paper generation meeting all requested outcome criteria.',
    };

    // Update questions exposure counters
    setQuestions((prev) =>
      prev.map((q) => {
        if (selectedQuestions.some((sq) => sq.id === q.id)) {
          const newExp = q.currentExposure + 1;
          const rem = Math.max(0, q.maximumExposure - newExp);
          let newStatus = q.status;
          if (rem === 0) newStatus = 'Exhausted';
          else if (rem === 1) newStatus = 'Near Limit';
          return {
            ...q,
            currentExposure: newExp,
            remainingExposures: rem,
            status: newStatus,
            lastUsedCohort: request.cohortId,
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      })
    );

    // Update cohort exposure count
    setCohorts((prev) =>
      prev.map((c) => {
        if (c.id === request.cohortId) {
          return {
            ...c,
            totalExposures: c.totalExposures + selectedQuestions.length,
            totalAvailableCapacity: Math.max(0, c.totalAvailableCapacity - selectedQuestions.length),
          };
        }
        return c;
      })
    );

    // Publish Kafka Event record
    const kafkaEvent: QuestionPaperGeneratedEvent = {
      eventId,
      eventType: 'QuestionPaperGenerated',
      paperId,
      cohortId: request.cohortId,
      status,
      selectedQuestionIds: selectedQuestions.map((q) => q.id),
      unsatisfiedCoverage,
      occurredAt: new Date().toISOString(),
      schemaVersion: 1,
    };

    const eventRecord: KafkaEventRecord = {
      id: `rec-${Math.floor(1002 + events.length)}`,
      topic: 'soa.s09.t14.events',
      partition: 0,
      offset: 143 + events.length,
      timestamp: new Date().toISOString(),
      event: kafkaEvent,
      consumerStatus: 'ACKNOWLEDGED',
      consumedByService: 'WorkflowTracker',
      sourceService: 'PaperAssembly',
      isSimulatedDemo: true,
    };

    setPapers((prev) => [newPaper, ...prev]);
    setEvents((prev) => [eventRecord, ...prev]);

    // System notification
    if (status === 'PARTIAL') {
      addNotification({
        title: `Partial Paper Generated: ${paperId}`,
        message: `Paper has unsatisfied outcome coverage (${coveragePercentage}% fulfilled). Excluded exhausted questions.`,
        type: 'warning',
      });
    } else {
      addNotification({
        title: `Paper Generated: ${paperId}`,
        message: `Successfully generated ${totalSelected} questions for cohort ${request.cohortId}.`,
        type: 'success',
      });
    }

    setIsLoading(false);
    return newPaper;
  };

  // Critical Demonstration Scenario: Exhausted CO2 questions
  // Cohort: CSE-2026-A
  // Q201: exposure 2/2 (exhausted)
  // Q202: exposure 2/2 (exhausted)
  // Q203: exposure 1/2 (available)
  // Requires 3 CO2 questions -> Only Q203 eligible!
  const runExhaustionDemo = async (): Promise<AssessmentPaper> => {
    return generateAssessmentPaper({
      title: 'Mid-Term Examination — Software Architecture (CO2 Exhaustion Benchmark)',
      subject: 'Software Architecture & Microservices',
      cohortId: 'CSE-2026-A',
      semester: 'Semester VI',
      examinationType: 'Mid-Term 1',
      totalMarks: 40,
      coRequirements: {
        CO1: 2,
        CO2: 3, // Requires 3 CO2 questions, but only Q203 is eligible!
        CO3: 2,
        CO4: 1,
      },
    });
  };

  const refreshHealth = async (): Promise<void> => {
    if (!settings.demoMode) {
      try {
        const response = await apiClient.get('/actuator/health');
        // Parse actuator health into service records
        const data = response.data;
        const now = new Date().toISOString();
        setServicesHealth((prev) =>
          prev.map((s) => ({
            ...s,
            status: data.status === 'UP' ? 'UP' : 'DOWN',
            lastCheckedTime: now,
            latencyMs: 12,
          }))
        );
      } catch {
        const now = new Date().toISOString();
        setServicesHealth((prev) =>
          prev.map((s) => ({
            ...s,
            status: 'DOWN',
            lastCheckedTime: now,
          }))
        );
      }
    } else {
      // Demo refresh
      const now = new Date().toISOString();
      setServicesHealth((prev) =>
        prev.map((s) => ({
          ...s,
          lastCheckedTime: now,
          latencyMs: Math.floor(8 + Math.random() * 20),
        }))
      );
    }
  };

  const getPaperById = (id: string): AssessmentPaper | undefined => {
    return papers.find((p) => p.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        questions,
        cohorts,
        papers,
        events,
        servicesHealth,
        selectedCohortId,
        setSelectedCohortId,
        getCohortSummary,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        generateAssessmentPaper,
        runExhaustionDemo,
        refreshHealth,
        getPaperById,
        resetToSeededData,
        isLoading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
