import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileQuestion,
  Users,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Activity,
  ArrowUpRight,
  Radio,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Overview: React.FC = () => {
  const { questions, cohorts, papers, events, servicesHealth, selectedCohortId } = useData();
  const { settings } = useSettings();

  // Metrics calculation
  const totalQuestions = questions.length;
  const activeCohorts = cohorts.length;
  const nearLimitQuestions = questions.filter((q) => q.status === 'Near Limit').length;
  const exhaustedQuestions = questions.filter((q) => q.status === 'Exhausted').length;
  const totalPapers = papers.length;
  const partialPapers = papers.filter((p) => p.status === 'PARTIAL').length;

  // Chart data: Exposure by Course Outcome
  const exposureByCO = [
    {
      outcome: 'CO1',
      total: questions.filter((q) => q.courseOutcome === 'CO1').length,
      exposed: questions
        .filter((q) => q.courseOutcome === 'CO1')
        .reduce((sum, q) => sum + q.currentExposure, 0),
      exhausted: questions.filter((q) => q.courseOutcome === 'CO1' && q.status === 'Exhausted').length,
    },
    {
      outcome: 'CO2',
      total: questions.filter((q) => q.courseOutcome === 'CO2').length,
      exposed: questions
        .filter((q) => q.courseOutcome === 'CO2')
        .reduce((sum, q) => sum + q.currentExposure, 0),
      exhausted: questions.filter((q) => q.courseOutcome === 'CO2' && q.status === 'Exhausted').length,
    },
    {
      outcome: 'CO3',
      total: questions.filter((q) => q.courseOutcome === 'CO3').length,
      exposed: questions
        .filter((q) => q.courseOutcome === 'CO3')
        .reduce((sum, q) => sum + q.currentExposure, 0),
      exhausted: questions.filter((q) => q.courseOutcome === 'CO3' && q.status === 'Exhausted').length,
    },
    {
      outcome: 'CO4',
      total: questions.filter((q) => q.courseOutcome === 'CO4').length,
      exposed: questions
        .filter((q) => q.courseOutcome === 'CO4')
        .reduce((sum, q) => sum + q.currentExposure, 0),
      exhausted: questions.filter((q) => q.courseOutcome === 'CO4' && q.status === 'Exhausted').length,
    },
  ];

  // Donut chart: Question Bank Capacity Distribution
  const capacityData = [
    { name: 'Available', value: questions.filter((q) => q.status === 'Available').length, color: '#10b981' },
    { name: 'Near Limit', value: nearLimitQuestions, color: '#f59e0b' },
    { name: 'Exhausted', value: exhaustedQuestions, color: '#ef4444' },
  ];

  // Top exposed questions
  const topExposedQuestions = [...questions]
    .sort((a, b) => b.currentExposure - a.currentExposure)
    .slice(0, 5);

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'DEMO':
        return <span className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'DOWN':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Academic Project Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exposure-Aware Question Paper Generation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Question Bank Exposure Limits & Outcome Coverage
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-3xl leading-relaxed">
            Tracks exposure counts across student cohorts, enforces strictly non-repeatable limits,
            and highlights course outcome (CO) coverage deficits instead of reusing exhausted questions.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/assembly"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            New Paper Assembly
          </Link>
          <Link
            to="/cohorts"
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            View Cohorts
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Questions"
          value={totalQuestions}
          subtext="Tagged by CO1–CO4"
          icon={FileQuestion}
        />
        <StatCard
          label="Active Cohorts"
          value={activeCohorts}
          subtext={`Selected: ${selectedCohortId}`}
          icon={Users}
        />
        <StatCard
          label="Near Exposure Limit"
          value={nearLimitQuestions}
          subtext="1 exposure remaining"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Exhausted Questions"
          value={exhaustedQuestions}
          subtext="Excluded from selection"
          icon={AlertOctagon}
          variant="danger"
        />
        <StatCard
          label="Papers Generated"
          value={totalPapers}
          subtext="Stored in archive"
          icon={FileText}
        />
        <StatCard
          label="Coverage Gaps"
          value={partialPapers}
          subtext="Partial outcome satisfaction"
          icon={Activity}
          variant="warning"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Exposure by Outcome */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Question Exposure by Course Outcome (CO)
              </h3>
              <p className="text-xs text-slate-500">
                Comparing total pool volume against cohort cumulative exposures and exhausted limits
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Cohort: {selectedCohortId}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureByCO} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="outcome" tickLine={false} stroke="#94a3b8" fontSize={12} />
                <YAxis tickLine={false} stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" name="Total in Bank" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exposed" name="Cumulative Exposures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exhausted" name="Exhausted Pool" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-300" />
              <span>Total in Bank</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span>Cumulative Exposures</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Exhausted Pool (Excluded)</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: Question Pool Availability */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Pool Capacity Status</h3>
            <p className="text-xs text-slate-500">
              Active availability breakdown for cohort {selectedCohortId}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} Questions`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 mt-2">
            <span className="font-semibold">Exposure Rule Invariant:</span> Exhausted questions (0 remaining) are
            strictly omitted during generation to protect exam integrity.
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Exposed Questions & Recent Kafka Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Frequently Exposed Questions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Most Frequently Exposed Questions</h3>
              <p className="text-xs text-slate-500">Ranked by cohort exposure count and remaining quota</p>
            </div>
            <Link
              to="/questions"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Question Bank <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">CO</th>
                  <th className="px-4 py-2.5">Question Excerpt</th>
                  <th className="px-4 py-2.5 text-right">Exposure</th>
                  <th className="px-4 py-2.5 text-right">Remaining</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {topExposedQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{q.id}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-slate-700">{q.courseOutcome}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[260px] truncate text-slate-700" title={q.text}>
                      {q.text}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                      {q.currentExposure} / {q.maximumExposure}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                      <span className={q.remainingExposures === 0 ? 'text-rose-600' : 'text-slate-700'}>
                        {q.remainingExposures}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={q.status}>{q.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Workflow Events */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Kafka Workflow Events</h3>
                <p className="text-xs text-slate-500">Topic: soa.s09.t14.events</p>
              </div>
            </div>
            <Link
              to="/events"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Event Monitor <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {events.slice(0, 4).map((evt) => (
              <div key={evt.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold text-slate-900">{evt.event.eventType}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{evt.event.paperId}</span>
                  </div>
                  <Badge variant={evt.event.status}>{evt.event.status}</Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Cohort: <strong className="text-slate-700">{evt.event.cohortId}</strong> · Offset:{' '}
                    <span className="font-mono tabular-nums">{evt.offset}</span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {evt.event.unsatisfiedCoverage && Object.keys(evt.event.unsatisfiedCoverage).length > 0 && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded border border-amber-200">
                    Deficit: {JSON.stringify(evt.event.unsatisfiedCoverage)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Microservices Health Summary Strip */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Microservices Mesh Health</h3>
            <p className="text-xs text-slate-500">
              Eureka discovery status, Spring Cloud Gateway routes, and Kafka broker connectivity
            </p>
          </div>
          <Link
            to="/health"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Full Health Registry <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {servicesHealth.map((svc) => (
            <div
              key={svc.name}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-900 truncate">{svc.name}</span>
                {getServiceStatusIcon(svc.status)}
              </div>
              <div className="mt-2 flex items-baseline justify-between text-[11px]">
                <Badge variant={svc.status}>{svc.status}</Badge>
                {svc.latencyMs && (
                  <span className="font-mono text-slate-400 tabular-nums">{svc.latencyMs}ms</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {settings.demoMode && (
          <p className="mt-3 text-[11px] text-slate-400">
            * Simulated health data active in local demonstration mode. When backend is live, data is pulled
            from /actuator/health and service discovery heartbeats.
          </p>
        )}
      </div>
    </div>
  );
};
