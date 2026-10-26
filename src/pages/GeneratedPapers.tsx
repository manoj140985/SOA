import React, { useState, useMemo } from 'react';
import {
  Files,
  Search,
  Eye,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AssessmentPaper, PaperStatus, WorkflowStatus } from '../types/paper';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { CourseOutcome } from '../types/question';

export const GeneratedPapers: React.FC = () => {
  const { papers, cohorts } = useData();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterCohort, setFilterCohort] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<PaperStatus | 'ALL'>('ALL');
  const [filterWorkflow, setFilterWorkflow] = useState<WorkflowStatus | 'ALL'>('ALL');

  // Detail Modal
  const [selectedPaper, setSelectedPaper] = useState<AssessmentPaper | null>(null);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.subject.toLowerCase().includes(search.toLowerCase()) ||
        p.generatedBy.toLowerCase().includes(search.toLowerCase());

      const matchCohort = filterCohort === 'ALL' || p.cohortId === filterCohort;
      const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
      const matchWorkflow = filterWorkflow === 'ALL' || p.workflowStatus === filterWorkflow;

      return matchSearch && matchCohort && matchStatus && matchWorkflow;
    });
  }, [papers, search, filterCohort, filterStatus, filterWorkflow]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <Files className="w-3.5 h-3.5" />
            <span>Assessment Paper Repository</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Generated Papers Archive</h2>
          <p className="mt-1 text-xs text-slate-500">
            Immutable audit record of all assessment papers generated across cohorts with outcome coverage
            and Kafka workflow event verification.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Total Archived Papers: <strong className="text-slate-900 tabular-nums">{papers.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Paper ID or Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Cohort Filter */}
          <div>
            <select
              value={filterCohort}
              onChange={(e) => setFilterCohort(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="ALL">All Cohorts</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="ALL">All Coverage Statuses</option>
              <option value="COMPLETE">COMPLETE (100% Satisfied)</option>
              <option value="PARTIAL">PARTIAL (Gaps Detected)</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Workflow Filter */}
          <div>
            <select
              value={filterWorkflow}
              onChange={(e) => setFilterWorkflow(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="ALL">All Workflow States</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="EVENT_PUBLISHED">EVENT_PUBLISHED</option>
              <option value="PERSISTED">PERSISTED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {filteredPapers.length === 0 ? (
          <EmptyState
            title="No assessment papers match criteria"
            description="Adjust search query or filter by a different cohort."
            icon={Files}
            actionText="Reset Filters"
            onAction={() => {
              setSearch('');
              setFilterCohort('ALL');
              setFilterStatus('ALL');
              setFilterWorkflow('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Paper ID</th>
                  <th className="px-4 py-3 min-w-[260px]">Paper Title</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Generated By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Questions</th>
                  <th className="px-4 py-3">Coverage Status</th>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPapers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{p.title}</p>
                      <span className="text-[11px] text-slate-500">
                        {p.subject} · {p.examinationType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">{p.cohortId}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]">{p.generatedBy}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-500 text-[11px]">
                      {new Date(p.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800 font-medium">
                      {p.selectedQuestions.length} Qs ({p.totalMarks} M)
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status}>{p.status}</Badge>
                      {p.unsatisfiedCoverage && Object.keys(p.unsatisfiedCoverage).length > 0 && (
                        <span className="block text-[10px] text-amber-800 font-mono mt-0.5">
                          Deficit: {JSON.stringify(p.unsatisfiedCoverage)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.workflowStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPaper(p)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paper Details Modal */}
      <Modal
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
        title={selectedPaper ? `${selectedPaper.id} — ${selectedPaper.title}` : ''}
        description="Assessment paper questions, course outcome coverage, and Kafka workflow verification."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-mono">
              Event ID: {selectedPaper?.workflowEventId || 'evt-unknown'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Paper
              </button>
              <button
                onClick={() => setSelectedPaper(null)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        {selectedPaper && (
          <div className="space-y-5 text-xs">
            {/* Header Strip */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block">Cohort</span>
                <span className="font-mono font-bold text-slate-900">{selectedPaper.cohortId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <Badge variant={selectedPaper.status}>{selectedPaper.status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block">Marks</span>
                <span className="font-mono font-bold text-slate-900">{selectedPaper.totalMarks} Marks</span>
              </div>
              <div>
                <span className="text-slate-400 block">Questions Selected</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedPaper.selectedQuestions.length} Items
                </span>
              </div>
            </div>

            {/* Satisfaction Matrix */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Outcome Satisfaction Summary</h4>
              <div className="grid grid-cols-4 gap-2">
                {(['CO1', 'CO2', 'CO3', 'CO4'] as CourseOutcome[]).map((co) => {
                  const req = selectedPaper.requestedCounts[co] || 0;
                  const sel = selectedPaper.selectedCounts[co] || 0;
                  const gap = selectedPaper.unsatisfiedCoverage[co] || 0;
                  return (
                    <div
                      key={co}
                      className={`p-2.5 rounded border text-center ${
                        gap > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="font-mono font-bold block">{co}</span>
                      <span className="text-[11px] font-mono text-slate-700">
                        {sel} / {req}
                      </span>
                      {gap > 0 && (
                        <span className="block text-[10px] text-amber-800 font-semibold mt-0.5">
                          Gap: -{gap}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning if Partial */}
            {selectedPaper.status === 'PARTIAL' && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Partial generation: Exhausted questions were excluded according to cohort exposure rules.
                  No exhausted question was repeated.
                </p>
              </div>
            )}

            {/* Excluded Questions List */}
            {selectedPaper.excludedQuestions.length > 0 && (
              <div>
                <h4 className="font-bold text-rose-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Excluded Questions ({selectedPaper.excludedQuestions.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedPaper.excludedQuestions.map((ex) => (
                    <div
                      key={ex.questionId}
                      className="p-2.5 bg-rose-50/40 rounded border border-rose-200 text-[11px]"
                    >
                      <span className="font-mono font-bold text-rose-900">{ex.questionId}</span> ({ex.courseOutcome}):{' '}
                      {ex.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Questions */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                Assessment Questions ({selectedPaper.selectedQuestions.length})
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedPaper.selectedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-900">
                        {idx + 1}. [{q.id}] {q.courseOutcome} ({q.difficulty})
                      </span>
                      <span className="font-bold text-slate-800">{q.marks} Marks</span>
                    </div>
                    <p className="text-slate-800">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
