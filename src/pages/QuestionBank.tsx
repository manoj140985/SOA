import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Edit2,
  Trash2,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Question, CourseOutcome, Difficulty, ExposureStatus } from '../types/question';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { EmptyState } from '../components/common/EmptyState';

// Zod validation schema for Question form
const questionSchema = z.object({
  text: z.string().min(10, 'Question text must be at least 10 characters long.'),
  subject: z.string().min(3, 'Subject name is required.'),
  courseOutcome: z.enum(['CO1', 'CO2', 'CO3', 'CO4']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  marks: z.number().min(1, 'Marks must be at least 1').max(50, 'Marks cannot exceed 50'),
  maximumExposure: z.number().int().min(1, 'Maximum exposure limit must be at least 1'),
  tags: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export const QuestionBank: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion, selectedCohortId } = useData();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterCO, setFilterCO] = useState<CourseOutcome | 'ALL'>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ExposureStatus | 'ALL'>('ALL');

  // Sorting state
  const [sortField, setSortField] = useState<keyof Question>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // React Hook Form for Add / Edit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      subject: 'Software Architecture & Microservices',
      courseOutcome: 'CO1',
      difficulty: 'Medium',
      marks: 10,
      maximumExposure: 2,
      tags: '',
    },
  });

  const handleOpenAdd = () => {
    reset({
      text: '',
      subject: 'Software Architecture & Microservices',
      courseOutcome: 'CO1',
      difficulty: 'Medium',
      marks: 10,
      maximumExposure: 2,
      tags: '',
    });
    setEditingQuestion(null);
    setIsAddModalOpen(true);
    setActionError(null);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setValue('text', q.text);
    setValue('subject', q.subject);
    setValue('courseOutcome', q.courseOutcome);
    setValue('difficulty', q.difficulty);
    setValue('marks', q.marks);
    setValue('maximumExposure', q.maximumExposure);
    setValue('tags', q.tags ? q.tags.join(', ') : '');
    setIsAddModalOpen(true);
    setActionError(null);
  };

  const onSubmitForm = async (values: QuestionFormValues) => {
    try {
      setActionError(null);
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          text: values.text,
          subject: values.subject,
          courseOutcome: values.courseOutcome,
          difficulty: values.difficulty,
          marks: values.marks,
          maximumExposure: values.maximumExposure,
          tags: values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
        });
      } else {
        await addQuestion({
          text: values.text,
          subject: values.subject,
          courseOutcome: values.courseOutcome,
          difficulty: values.difficulty,
          marks: values.marks,
          maximumExposure: values.maximumExposure,
          tags: values.tags,
        });
      }
      setIsAddModalOpen(false);
      reset();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!deletingQuestion) return;
    try {
      await deleteQuestion(deletingQuestion.id);
      setDeletingQuestion(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete question');
    }
  };

  // Filter & Sort Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.id.toLowerCase().includes(search.toLowerCase()) ||
        q.text.toLowerCase().includes(search.toLowerCase()) ||
        q.subject.toLowerCase().includes(search.toLowerCase());

      const matchCO = filterCO === 'ALL' || q.courseOutcome === filterCO;
      const matchDiff = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
      const matchStat = filterStatus === 'ALL' || q.status === filterStatus;

      return matchSearch && matchCO && matchDiff && matchStat;
    });
  }, [questions, search, filterCO, filterDifficulty, filterStatus]);

  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredQuestions, sortField, sortOrder]);

  // Paginated Questions
  const totalPages = Math.ceil(sortedQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedQuestions.slice(start, start + pageSize);
  }, [sortedQuestions, page, pageSize]);

  const toggleSort = (field: keyof Question) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Question button */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Question Bank Repository</h2>
          <p className="mt-1 text-xs text-slate-500">
            Tagged by course outcome (CO1–CO4), difficulty, and configured with exposure thresholds for cohort{' '}
            <strong className="text-slate-700">{selectedCohortId}</strong>.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID (e.g. Q201) or question content..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={filterCO}
              onChange={(e) => {
                setFilterCO(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Outcomes (CO1–CO4)</option>
              <option value="CO1">CO1 (Architecture & Principles)</option>
              <option value="CO2">CO2 (Exposure Limits & Persistence)</option>
              <option value="CO3">CO3 (Discovery & Orchestration)</option>
              <option value="CO4">CO4 (Streaming & Automated Tests)</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={filterDifficulty}
              onChange={(e) => {
                setFilterDifficulty(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Exposure Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Near Limit">Near Limit</option>
              <option value="Exhausted">Exhausted</option>
            </select>
          </div>
        </div>

        {/* Active filter count & quick reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Showing <strong className="text-slate-800 font-mono tabular-nums">{filteredQuestions.length}</strong> of{' '}
              <strong className="text-slate-800 font-mono tabular-nums">{questions.length}</strong> questions in bank
            </span>
          </div>
          {(search || filterCO !== 'ALL' || filterDifficulty !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterCO('ALL');
                setFilterDifficulty('ALL');
                setFilterStatus('ALL');
                setPage(1);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {paginatedQuestions.length === 0 ? (
          <EmptyState
            title="No questions match filters"
            description="Try modifying search keywords or resetting difficulty and outcome filters."
            icon={FileQuestion}
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setFilterCO('ALL');
              setFilterDifficulty('ALL');
              setFilterStatus('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3 min-w-[280px]">Question Text</th>
                  <th className="px-4 py-3">Subject</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                    onClick={() => toggleSort('courseOutcome')}
                  >
                    <div className="flex items-center gap-1">
                      <span>CO Tag</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                    onClick={() => toggleSort('difficulty')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Difficulty</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Marks</th>
                  <th className="px-4 py-3 text-right">Max Limit</th>
                  <th className="px-4 py-3 text-right">Current</th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/70"
                    onClick={() => toggleSort('remainingExposures')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Remaining</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{q.id}</td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-2 text-slate-800 font-medium" title={q.text}>
                        {q.text}
                      </p>
                      {q.tags && q.tags.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                          {q.tags.slice(0, 2).map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]">{q.subject}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{q.courseOutcome}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          q.difficulty === 'Hard'
                            ? 'text-rose-600'
                            : q.difficulty === 'Medium'
                            ? 'text-amber-700'
                            : 'text-emerald-600'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800">
                      {q.marks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {q.maximumExposure}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800 font-medium">
                      {q.currentExposure}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">
                      <span className={q.remainingExposures === 0 ? 'text-rose-600' : 'text-slate-900'}>
                        {q.remainingExposures}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={q.status}>{q.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingQuestion(q)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingQuestion(q)}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Page <strong className="text-slate-800 font-mono">{page}</strong> of{' '}
              <strong className="text-slate-800 font-mono">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingQuestion ? `Edit Question: ${editingQuestion.id}` : 'Create Question Bank Entry'}
        description="Tag questions by course outcome, configure maximum exposure quota, and assign difficulty."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 text-xs">
          {actionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              {actionError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Question Content *</label>
            <textarea
              rows={3}
              {...register('text')}
              placeholder="e.g. Design a relational schema using JPA entities to track exposure limits..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
            {errors.text && <p className="mt-1 text-rose-600 text-[11px]">{errors.text.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Course *</label>
              <input
                type="text"
                {...register('subject')}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
              {errors.subject && (
                <p className="mt-1 text-rose-600 text-[11px]">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course Outcome (CO) *</label>
              <select
                {...register('courseOutcome')}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="CO1">CO1 — Architecture & Foundational Principles</option>
                <option value="CO2">CO2 — Exposure Limits & Persistence</option>
                <option value="CO3">CO3 — Discovery & Orchestration</option>
                <option value="CO4">CO4 — Event Streaming & Automated Testing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Difficulty *</label>
              <select
                {...register('difficulty')}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marks *</label>
              <input
                type="number"
                {...register('marks', { valueAsNumber: true })}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
              {errors.marks && <p className="mt-1 text-rose-600 text-[11px]">{errors.marks.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Exposure Limit *</label>
              <input
                type="number"
                {...register('maximumExposure', { valueAsNumber: true })}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
              {errors.maximumExposure && (
                <p className="mt-1 text-rose-600 text-[11px]">{errors.maximumExposure.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              {...register('tags')}
              placeholder="JPA, Concurrency, Kafka, Security"
              className="w-full p-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Question Details Drawer */}
      <Drawer
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        title={viewingQuestion ? `Question Details: ${viewingQuestion.id}` : ''}
        subtitle="Exposure ledger metadata and outcome tracking"
        width="lg"
      >
        {viewingQuestion && (
          <div className="space-y-6 text-xs">
            {/* Status overview banner */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Current Exposure Status</span>
                <div className="mt-1">
                  <Badge variant={viewingQuestion.status}>{viewingQuestion.status}</Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Remaining Quota</span>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {viewingQuestion.remainingExposures} of {viewingQuestion.maximumExposure}
                </p>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-1.5">Question Prompt</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed text-sm">
                {viewingQuestion.text}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block mb-1">Course Outcome</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {viewingQuestion.courseOutcome}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block mb-1">Marks Assigned</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {viewingQuestion.marks} Marks
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block mb-1">Difficulty Tier</span>
                <span className="font-semibold text-slate-800">{viewingQuestion.difficulty}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block mb-1">Subject</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {viewingQuestion.subject}
                </span>
              </div>
            </div>

            {/* Exposure Algorithm Invariant Box */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 space-y-2">
              <h5 className="font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-700" /> Exposure Ledger Formula
              </h5>
              <p className="text-[11px] leading-relaxed font-mono">
                remaining = max(0, maximumExposure - exposureCount)
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Formula evaluated: max(0, {viewingQuestion.maximumExposure} - {viewingQuestion.currentExposure}) ={' '}
                <strong>{viewingQuestion.remainingExposures}</strong>.
                {viewingQuestion.remainingExposures === 0 && (
                  <span className="block text-rose-700 font-semibold mt-1">
                    Exhausted question: Excluded from paper generation algorithms.
                  </span>
                )}
              </p>
            </div>

            {/* Author & Audit Info */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-slate-500">
              <div className="flex items-center justify-between">
                <span>Author / Reviewer</span>
                <span className="font-medium text-slate-800">{viewingQuestion.authorName || 'Dr. Anita Deshmukh'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created Date</span>
                <span className="font-mono tabular-nums">{new Date(viewingQuestion.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Used In Cohort</span>
                <span className="font-mono font-semibold text-slate-800">
                  {viewingQuestion.lastUsedCohort || 'Not yet allocated'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        title="Confirm Question Deletion"
        description="Are you sure you want to remove this question from the question bank?"
        maxWidth="sm"
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeletingQuestion(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-md font-semibold transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        }
      >
        <p className="text-xs text-slate-600">
          Question <strong className="text-slate-900 font-mono">{deletingQuestion?.id}</strong> will be
          permanently removed from all future paper assembly queries. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
