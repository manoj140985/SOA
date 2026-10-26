import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { CourseOutcome, ExposureStatus } from '../types/question';

export const CohortExposure: React.FC = () => {
  const { cohorts, selectedCohortId, setSelectedCohortId, getCohortSummary } = useData();

  // Search & Filters for Ledger
  const [search, setSearch] = useState('');
  const [filterCO, setFilterCO] = useState<CourseOutcome | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ExposureStatus | 'ALL'>('ALL');

  // Active Cohort Summary
  const summary = useMemo(() => {
    return getCohortSummary(selectedCohortId);
  }, [selectedCohortId, getCohortSummary]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return summary.ledger.filter((item) => {
      const matchSearch =
        item.questionId.toLowerCase().includes(search.toLowerCase()) ||
        item.questionText.toLowerCase().includes(search.toLowerCase());

      const matchCO = filterCO === 'ALL' || item.courseOutcome === filterCO;
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;

      return matchSearch && matchCO && matchStatus;
    });
  }, [summary.ledger, search, filterCO, filterStatus]);

  const activeCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];

  return (
    <div className="space-y-6">
      {/* Cohort Selector Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Cohort Exposure Ledger Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {activeCohort.name} ({activeCohort.id})
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {activeCohort.department} · {activeCohort.academicYear} · {activeCohort.semester} ·{' '}
            <span className="font-mono tabular-nums">{activeCohort.studentCount} enrolled students</span>
          </p>
        </div>

        {/* Cohort Dropdown Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="cohort-select" className="text-xs font-medium text-slate-600">
            Select Cohort:
          </label>
          <select
            id="cohort-select"
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cohort Exposure KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Questions Exposed"
          value={summary.totalQuestionsExposed}
          subtext={`Out of ${summary.totalEligibleQuestions} in pool`}
          icon={Layers}
        />
        <StatCard
          label="Available Capacity"
          value={summary.availableCapacity}
          subtext="Total unused exposure slots"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label="Near Limit (1 Remaining)"
          value={summary.nearLimitCount}
          subtext="Approaching threshold"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Exhausted (0 Remaining)"
          value={summary.exhaustedCount}
          subtext="Strictly blocked from selection"
          icon={AlertOctagon}
          variant="danger"
        />
      </div>

      {/* Course Outcome Breakdown Grid */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Outcome Distribution & Capacity by CO</h3>
            <p className="text-xs text-slate-500">
              Breakdown of questions currently available vs exhausted for cohort {selectedCohortId}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total COs: 4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['CO1', 'CO2', 'CO3', 'CO4'] as CourseOutcome[]).map((co) => {
            const data = summary.distributionByCO[co];
            const isCritical = co === 'CO2' && data.exhausted >= 2;
            return (
              <div
                key={co}
                className={`p-4 rounded-lg border transition-all ${
                  isCritical ? 'bg-amber-50/60 border-amber-300 shadow-xs' : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-slate-900">{co}</span>
                  {isCritical ? (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded">
                      High Exhaustion
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">
                      {data.available} / {data.total} Available
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Pool:</span>
                    <span className="font-mono font-medium text-slate-900">{data.total}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Available Questions:</span>
                    <span className="font-mono font-semibold text-emerald-700">{data.available}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Exhausted (Excluded):</span>
                    <span className="font-mono font-semibold text-rose-700">{data.exhausted}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${data.total > 0 ? (data.available / data.total) * 100 : 0}%`,
                    }}
                    title={`${data.available} available`}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{
                      width: `${data.total > 0 ? (data.exhausted / data.total) * 100 : 0}%`,
                    }}
                    title={`${data.exhausted} exhausted`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Invariant Callout */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold">Microservice Exposure Invariant</p>
          <p className="leading-relaxed">
            Remaining capacity is computed strictly as:{' '}
            <code className="px-1 py-0.5 bg-blue-100 font-mono text-blue-950 rounded">
              remaining = max(0, maximumExposure - exposureCount)
            </code>
            . An exhausted question (remaining = 0) can never be selected by the PaperAssembly service.
            The frontend displays live ledger state and will never permit clients to bypass backend constraints.
          </p>
        </div>
      </div>

      {/* Exposure Ledger Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Cohort Exposure Ledger Records</h3>
            <p className="text-xs text-slate-500">Live exposure count per question in cohort {selectedCohortId}</p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterCO}
              onChange={(e) => setFilterCO(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="ALL">All COs</option>
              <option value="CO1">CO1</option>
              <option value="CO2">CO2</option>
              <option value="CO3">CO3</option>
              <option value="CO4">CO4</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="ALL">All Status</option>
              <option value="Available">Available</option>
              <option value="Near Limit">Near Limit</option>
              <option value="Exhausted">Exhausted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Question ID</th>
                <th className="px-4 py-3 min-w-[280px]">Question Text</th>
                <th className="px-4 py-3">CO Tag</th>
                <th className="px-4 py-3 text-right">Exposure Count</th>
                <th className="px-4 py-3 text-right">Max Exposure</th>
                <th className="px-4 py-3 text-right font-bold">Remaining Capacity</th>
                <th className="px-4 py-3">Last Exposure</th>
                <th className="px-4 py-3">Exposure Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.map((item) => (
                <tr
                  key={item.questionId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.status === 'Exhausted' ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.questionId}</td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 text-slate-800 font-medium" title={item.questionText}>
                      {item.questionText}
                    </p>
                    {item.papersUsedIn.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Used in: {item.papersUsedIn.join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.courseOutcome}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800 font-medium">
                    {item.exposureCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                    {item.maximumExposure}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">
                    <span className={item.remainingCapacity === 0 ? 'text-rose-600' : 'text-slate-900'}>
                      {item.remainingCapacity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px] tabular-nums">
                    {item.lastExposureDate ? new Date(item.lastExposureDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status}>{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
