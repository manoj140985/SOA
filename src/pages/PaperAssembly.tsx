import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Printer,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AssessmentPaper, PaperGenerationRequest } from '../types/paper';
import { CourseOutcome } from '../types/question';
import { Badge } from '../components/common/Badge';

export const PaperAssembly: React.FC = () => {
  const {
    cohorts,
    selectedCohortId,
    setSelectedCohortId,
    questions,
    generateAssessmentPaper,
    runExhaustionDemo,
    isLoading,
    error: apiError,
  } = useData();

  const { user } = useAuth();

  // Workflow steps: 1 = Details, 2 = Outcome Requirements, 3 = Preview, 4 = Result
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState('Mid-Term Examination — Software Architecture');
  const [subject, setSubject] = useState('Software Architecture & Microservices');
  const [cohortId, setCohortId] = useState(selectedCohortId || 'CSE-2026-A');
  const [semester, setSemester] = useState('Semester VI');
  const [examinationType, setExaminationType] = useState<
    'Mid-Term 1' | 'Mid-Term 2' | 'End-Semester' | 'Quiz' | 'Supplementary'
  >('Mid-Term 1');
  const [totalMarks, setTotalMarks] = useState(40);

  // Requirements per CO
  const [co1Count, setCo1Count] = useState<number>(2);
  const [co2Count, setCo2Count] = useState<number>(3); // 3 requires Q203 + 2 more (which are exhausted!)
  const [co3Count, setCo3Count] = useState<number>(2);
  const [co4Count, setCo4Count] = useState<number>(1);

  // Generated Paper Result
  const [generatedPaper, setGeneratedPaper] = useState<AssessmentPaper | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-generation Availability Preview Calculation
  const preview = useMemo(() => {
    const counts = { CO1: co1Count, CO2: co2Count, CO3: co3Count, CO4: co4Count };
    const coList: CourseOutcome[] = ['CO1', 'CO2', 'CO3', 'CO4'];

    const breakdown: Record<
      CourseOutcome,
      {
        required: number;
        eligible: number;
        exhaustedCount: number;
        potentialGap: number;
        exhaustedQuestionIds: string[];
      }
    > = {
      CO1: { required: 0, eligible: 0, exhaustedCount: 0, potentialGap: 0, exhaustedQuestionIds: [] },
      CO2: { required: 0, eligible: 0, exhaustedCount: 0, potentialGap: 0, exhaustedQuestionIds: [] },
      CO3: { required: 0, eligible: 0, exhaustedCount: 0, potentialGap: 0, exhaustedQuestionIds: [] },
      CO4: { required: 0, eligible: 0, exhaustedCount: 0, potentialGap: 0, exhaustedQuestionIds: [] },
    };

    let totalGaps = 0;

    for (const co of coList) {
      const coQuestions = questions.filter((q) => q.courseOutcome === co);
      const eligible = coQuestions.filter((q) => q.maximumExposure - q.currentExposure > 0);
      const exhausted = coQuestions.filter((q) => q.maximumExposure - q.currentExposure <= 0);
      const req = counts[co];
      const gap = Math.max(0, req - eligible.length);
      if (gap > 0) totalGaps += gap;

      breakdown[co] = {
        required: req,
        eligible: eligible.length,
        exhaustedCount: exhausted.length,
        potentialGap: gap,
        exhaustedQuestionIds: exhausted.map((q) => q.id),
      };
    }

    return { breakdown, totalGaps };
  }, [questions, co1Count, co2Count, co3Count, co4Count]);

  // Handle Form Submission
  const handleGenerate = async () => {
    setSubmitError(null);
    try {
      // Authorization Check
      if (user?.role === 'questionReviewer') {
        throw new Error(
          'HTTP 403 FORBIDDEN: User role "questionReviewer" is not authorized to generate assessment papers. Switch to "examAuthor" to proceed.'
        );
      }

      const requestPayload: PaperGenerationRequest = {
        title,
        subject,
        cohortId,
        semester,
        examinationType,
        totalMarks: Number(totalMarks),
        coRequirements: {
          CO1: Number(co1Count),
          CO2: Number(co2Count),
          CO3: Number(co3Count),
          CO4: Number(co4Count),
        },
      };

      const result = await generateAssessmentPaper(requestPayload);
      setGeneratedPaper(result);
      setActiveStep(4);
    } catch (err: any) {
      setSubmitError(err.message || 'Generation failed');
    }
  };

  // Critical Demonstration Scenario Trigger
  const handleRunExhaustionDemo = async () => {
    setSubmitError(null);
    try {
      // Pre-fill demo state
      setTitle('Mid-Term Examination — Software Architecture (CO2 Exhaustion Benchmark)');
      setCohortId('CSE-2026-A');
      setSelectedCohortId('CSE-2026-A');
      setCo1Count(2);
      setCo2Count(3); // Critical benchmark
      setCo3Count(2);
      setCo4Count(1);

      const result = await runExhaustionDemo();
      setGeneratedPaper(result);
      setActiveStep(4);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to run exhaustion demo');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Microservices Orchestration Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Assessment Paper Assembly</h2>
          <p className="mt-1 text-xs text-slate-500">
            Enforces strict question bank exposure limits. Guarantees exhausted questions are never repeated and
            explicitly flags unsatisfied outcome requirements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRunExhaustionDemo}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors shadow-xs"
            title="Prepopulates form and tests CO2 question exhaustion (Q201, Q202 excluded; Q203 selected)"
          >
            <Play className="w-3.5 h-3.5 fill-amber-900" />
            Run Exhaustion Demo
          </button>
        </div>
      </div>

      {/* Workflow Navigation Steps */}
      <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-xs flex flex-wrap sm:flex-nowrap gap-1">
        {[
          { step: 1, label: '1. Paper Details' },
          { step: 2, label: '2. Outcome Coverage (CO)' },
          { step: 3, label: '3. Availability Preview' },
          { step: 4, label: '4. Generation Result' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => {
              if (item.step === 4 && !generatedPaper) return;
              setActiveStep(item.step);
            }}
            disabled={item.step === 4 && !generatedPaper}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors text-center ${
              activeStep === item.step
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error Alert Box */}
      {(submitError || apiError) && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 space-y-1">
            <span className="font-bold">Generation Request Failed</span>
            <p className="leading-relaxed">{submitError || apiError}</p>
          </div>
        </div>
      )}

      {/* STEP 1: PAPER DETAILS */}
      {activeStep === 1 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Step 1: Examination & Cohort Metadata</h3>
            <p className="text-xs text-slate-500">
              Provide assessment title, target cohort, subject, and examination parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Paper Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Mid-Term Examination — Software Architecture"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Course *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Cohort *</label>
              <select
                value={cohortId}
                onChange={(e) => {
                  setCohortId(e.target.value);
                  setSelectedCohortId(e.target.value);
                }}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Examination Type *</label>
              <select
                value={examinationType}
                onChange={(e) => setExaminationType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Mid-Term 1">Mid-Term 1</option>
                <option value="Mid-Term 2">Mid-Term 2</option>
                <option value="End-Semester">End-Semester</option>
                <option value="Quiz">Diagnostic Quiz</option>
                <option value="Supplementary">Supplementary</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={() => setActiveStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              Continue to Outcome Requirements <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COURSE OUTCOME REQUIREMENTS */}
      {activeStep === 2 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Step 2: Course Outcome Question Counts</h3>
            <p className="text-xs text-slate-500">
              Specify the exact number of questions required for each course outcome (CO1–CO4).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">CO1 Requirement</span>
                <span className="text-[10px] text-slate-500">Foundations</span>
              </div>
              <p className="text-[11px] text-slate-600">Single responsibility, microservice principles</p>
              <label className="block font-semibold text-slate-700 pt-1">Required Count:</label>
              <input
                type="number"
                min={0}
                max={10}
                value={co1Count}
                onChange={(e) => setCo1Count(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-slate-300 rounded-md font-mono text-center font-bold"
              />
            </div>

            <div className="p-4 rounded-lg border border-amber-300 bg-amber-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 font-mono">CO2 Requirement</span>
                <span className="text-[10px] text-amber-800 font-semibold">Exhaustion Test</span>
              </div>
              <p className="text-[11px] text-amber-900">JPA persistence, exposure ledger limits</p>
              <label className="block font-semibold text-amber-900 pt-1">Required Count:</label>
              <input
                type="number"
                min={0}
                max={10}
                value={co2Count}
                onChange={(e) => setCo2Count(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-amber-300 rounded-md font-mono text-center font-bold text-amber-950"
              />
              <span className="block text-[10px] text-amber-800">
                * Cohort CSE-2026-A has only 1 available CO2 question (Q203).
              </span>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">CO3 Requirement</span>
                <span className="text-[10px] text-slate-500">Orchestration</span>
              </div>
              <p className="text-[11px] text-slate-600">Eureka discovery, circuit breakers</p>
              <label className="block font-semibold text-slate-700 pt-1">Required Count:</label>
              <input
                type="number"
                min={0}
                max={10}
                value={co3Count}
                onChange={(e) => setCo3Count(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-slate-300 rounded-md font-mono text-center font-bold"
              />
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">CO4 Requirement</span>
                <span className="text-[10px] text-slate-500">Streaming</span>
              </div>
              <p className="text-[11px] text-slate-600">Kafka event streaming, Testcontainers</p>
              <label className="block font-semibold text-slate-700 pt-1">Required Count:</label>
              <input
                type="number"
                min={0}
                max={10}
                value={co4Count}
                onChange={(e) => setCo4Count(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-slate-300 rounded-md font-mono text-center font-bold"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Total questions to select:{' '}
              <strong className="text-slate-900 font-mono tabular-nums">
                {co1Count + co2Count + co3Count + co4Count} Questions
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                Proceed to Availability Preview <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW AVAILABILITY */}
      {activeStep === 3 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Step 3: Pre-Generation Availability Preview</h3>
              <p className="text-xs text-slate-500">
                Checking eligible questions against cohort <strong className="text-slate-800">{cohortId}</strong>{' '}
                exposure ledger.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview only — Backend makes final selection</span>
            </div>
          </div>

          {/* Availability Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3 text-right">Required</th>
                  <th className="px-4 py-3 text-right">Eligible in Bank</th>
                  <th className="px-4 py-3 text-right">Exhausted (Excluded)</th>
                  <th className="px-4 py-3">Projected Status</th>
                  <th className="px-4 py-3">Exclusion Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(['CO1', 'CO2', 'CO3', 'CO4'] as CourseOutcome[]).map((co) => {
                  const item = preview.breakdown[co];
                  const hasDeficit = item.potentialGap > 0;
                  return (
                    <tr
                      key={co}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        hasDeficit ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">{co}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{item.required}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {item.eligible}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-600">
                        {item.exhaustedCount}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        {hasDeficit ? (
                          <span className="text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Deficit: -{item.potentialGap}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Satisfiable
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans text-xs">
                        {item.exhaustedQuestionIds.length > 0 ? (
                          <span className="text-slate-600">
                            Excluded due to quota: <strong>{item.exhaustedQuestionIds.join(', ')}</strong>
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Gap Warning Banner if any deficit */}
          {preview.totalGaps > 0 && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <span className="font-bold">Projected Outcome Coverage Gap Detected</span>
                <p className="leading-relaxed">
                  The requested pool requires more questions than are currently available in the eligible ledger.
                  Exhausted questions will strictly NOT be repeated. The backend will return a{' '}
                  <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">PARTIAL</code> status
                  paper with unsatisfied coverage logged.
                </p>
              </div>
            </div>
          )}

          {/* Footer with Prominent Generate Button */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button onClick={() => setActiveStep(2)} className="text-xs text-slate-600 hover:text-slate-800">
              Back to Requirements
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                {isLoading ? 'Orchestrating Microservices...' : 'Generate Assessment Paper'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATED PAPER RESULT (SECTION 7 & 8) */}
      {activeStep === 4 && generatedPaper && (
        <div className="space-y-6">
          {/* Status Header Banner */}
          <div
            className={`p-6 rounded-lg border shadow-xs ${
              generatedPaper.status === 'COMPLETE'
                ? 'bg-emerald-50/80 border-emerald-300'
                : generatedPaper.status === 'PARTIAL'
                ? 'bg-amber-50/90 border-amber-300'
                : 'bg-rose-50 border-rose-300'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={generatedPaper.status}>{generatedPaper.status}</Badge>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {generatedPaper.id}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-600 font-mono">
                    Cohort: <strong>{generatedPaper.cohortId}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{generatedPaper.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Generated by {generatedPaper.generatedBy} on{' '}
                  <span className="font-mono tabular-nums">
                    {new Date(generatedPaper.generatedAt).toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export
                </button>
                <button
                  onClick={() => setActiveStep(1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Generation
                </button>
              </div>
            </div>

            {/* CRITICAL DEMONSTRATION WARNING CALLOUT (Section 8) */}
            {generatedPaper.unsatisfiedCoverage?.CO2 !== undefined && (
              <div className="mt-4 p-4 bg-white/90 rounded-lg border border-amber-400 text-xs text-amber-950 space-y-1 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>CO2 Coverage Gap Detected — Invariant Enforced</span>
                </div>
                <p className="leading-relaxed">
                  “CO2 coverage gap detected. Only{' '}
                  <strong className="font-mono">{generatedPaper.selectedCounts.CO2}</strong> of{' '}
                  <strong className="font-mono">{generatedPaper.requestedCounts.CO2}</strong> required questions
                  could be selected. Two additional CO2 questions are unavailable because the eligible question
                  pool is exhausted. No exhausted question was repeated.”
                </p>
              </div>
            )}
          </div>

          {/* Outcome Coverage Statistics Breakdown */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Course Outcome Satisfaction Report
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(['CO1', 'CO2', 'CO3', 'CO4'] as CourseOutcome[]).map((co) => {
                const req = generatedPaper.requestedCounts[co] || 0;
                const sel = generatedPaper.selectedCounts[co] || 0;
                const gap = generatedPaper.unsatisfiedCoverage[co] || 0;
                const isSatisfied = gap === 0;

                return (
                  <div
                    key={co}
                    className={`p-3 rounded-lg border ${
                      isSatisfied ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/60 border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{co}</span>
                      <span className="text-[10px] font-mono font-semibold">
                        {sel} / {req} Selected
                      </span>
                    </div>
                    <div className="mt-2 text-[11px]">
                      {gap > 0 ? (
                        <span className="text-amber-800 font-semibold">Missing: -{gap} Questions</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">100% Satisfied</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Questions Excluded Due to Exposure Limits */}
          {generatedPaper.excludedQuestions.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Questions Excluded Due to Cohort Exposure Limits ({generatedPaper.excludedQuestions.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    These questions were blocked to prevent overuse in cohort {generatedPaper.cohortId}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {generatedPaper.excludedQuestions.map((ex) => (
                  <div key={ex.questionId} className="p-3.5 bg-rose-50/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-rose-900">{ex.questionId}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-700">{ex.courseOutcome}</span>
                      </div>
                      <span className="font-mono text-rose-700 text-[11px]">
                        Exposure: {ex.currentExposure} / {ex.maximumExposure} (Quota Reached)
                      </span>
                    </div>
                    <p className="text-slate-700">{ex.questionText}</p>
                    <p className="text-[11px] text-rose-800 font-medium">{ex.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Questions for Assessment Paper */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Selected Questions ({generatedPaper.selectedQuestions.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Grouped by course outcome · Total Marks:{' '}
                  <span className="font-mono font-bold text-slate-800">{generatedPaper.totalMarks}</span>
                </p>
              </div>
              <Badge variant="available">Eligible Selection</Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {generatedPaper.selectedQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 hover:bg-slate-50/70 transition-colors text-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{q.id}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono font-semibold text-slate-700">{q.courseOutcome}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{q.difficulty}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{q.marks} Marks</span>
                  </div>

                  <p className="text-slate-800 text-sm leading-relaxed pl-7">{q.text}</p>

                  <div className="pl-7 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>
                      New Exposure: {q.currentExposure} / {q.maximumExposure}
                    </span>
                    <span>Remaining: {q.remainingExposures}</span>
                    {q.tags && <span>Tags: {q.tags.join(', ')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kafka Event Dispatch Information */}
          <div className="p-4 rounded-lg bg-slate-900 text-white text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-blue-400 font-semibold">
                Kafka Topic: soa.s09.t14.events
              </span>
              <span className="text-emerald-400 font-mono">Event: QuestionPaperGenerated</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
              PaperAssembly emitted event ID: <strong>{generatedPaper.workflowEventId}</strong>.
              WorkflowTracker has registered the transaction for cohort {generatedPaper.cohortId}.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <Link to="/events" className="text-blue-400 hover:text-blue-300 underline text-xs">
                View in Event Monitor &rarr;
              </Link>
              <Link to="/papers" className="text-slate-300 hover:text-white underline text-xs">
                View in Paper Archive &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
