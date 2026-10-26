import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Search,
  Code,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  ArrowRight,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { KafkaEventRecord } from '../types/workflow';
import { Badge } from '../components/common/Badge';
import { Drawer } from '../components/common/Drawer';
import { EmptyState } from '../components/common/EmptyState';

export const EventMonitor: React.FC = () => {
  const { events } = useData();
  const { settings } = useSettings();

  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<KafkaEventRecord | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.event.paperId.toLowerCase().includes(search.toLowerCase()) ||
      e.event.cohortId.toLowerCase().includes(search.toLowerCase()) ||
      e.event.eventType.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleCopyJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent.event, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            <span>Distributed Event-Driven Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Kafka Event Monitor</h2>
          <p className="mt-1 text-xs text-slate-500">
            Audit stream for topic <strong className="text-slate-800 font-mono">soa.s09.t14.events</strong>.
            Published by <em>PaperAssembly</em> and consumed idempotently by <em>WorkflowTracker</em>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Stream
          </button>
        </div>
      </div>

      {/* Stream Architecture Spec Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] block">Kafka Topic</span>
          <span className="text-blue-400 font-bold text-sm">soa.s09.t14.events</span>
          <p className="text-[11px] text-slate-400 font-sans">
            Partition: 0 · Schema Version: 1 · Replication: 3
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] block">Producer Service</span>
          <span className="text-emerald-400 font-bold text-sm">PaperAssembly</span>
          <p className="text-[11px] text-slate-400 font-sans">
            Emits QuestionPaperGenerated upon assembly completion
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] block">Consumer Service</span>
          <span className="text-amber-400 font-bold text-sm">WorkflowTracker</span>
          <p className="text-[11px] text-slate-400 font-sans">
            Guarantees idempotent audit log & workflow state updates
          </p>
        </div>
      </div>

      {/* Search and Mode Indicator */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Event ID, Paper ID, or Cohort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{settings.demoMode ? 'Simulated Demo Events' : 'Live Gateway REST Poller'}</span>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No events in Kafka topic"
            description="Generate a new assessment paper in Paper Assembly to emit a QuestionPaperGenerated event."
            icon={Radio}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Event ID</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Paper ID</th>
                  <th className="px-4 py-3">Cohort ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Consumer Processing</th>
                  <th className="px-4 py-3 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{e.event.eventId}</td>
                    <td className="px-4 py-3 font-sans font-medium text-slate-800">{e.event.eventType}</td>
                    <td className="px-4 py-3 font-bold text-blue-700">{e.event.paperId}</td>
                    <td className="px-4 py-3 text-slate-700">{e.event.cohortId}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.event.status}>{e.event.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] tabular-nums">
                      {new Date(e.event.occurredAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {e.consumerStatus} (offset: {e.offset})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => setSelectedEvent(e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Code className="w-3 h-3 text-slate-500" />
                        JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent ? `Kafka Event Payload: ${selectedEvent.event.eventId}` : ''}
        subtitle="Contract schema: QuestionPaperGenerated on topic soa.s09.t14.events"
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied to Clipboard' : 'Copy JSON'}
            </button>
            <button
              onClick={() => setSelectedEvent(null)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs font-mono">
            {/* Metadata tags */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-sans space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Topic:</span>
                <strong className="font-mono text-slate-900">{selectedEvent.topic}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Partition / Offset:</span>
                <span className="font-mono text-slate-800">
                  {selectedEvent.partition} / {selectedEvent.offset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consumer Service:</span>
                <span className="text-emerald-700 font-semibold">{selectedEvent.consumedByService}</span>
              </div>
            </div>

            {/* Formatted JSON display */}
            <div>
              <div className="flex items-center justify-between text-slate-500 font-sans mb-1 text-[11px]">
                <span>Event Contract Payload</span>
                <span>schemaVersion: {selectedEvent.event.schemaVersion}</span>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-xs leading-relaxed border border-slate-800">
                {JSON.stringify(selectedEvent.event, null, 2)}
              </pre>
            </div>

            {/* Unsatisfied coverage callout if present */}
            {selectedEvent.event.unsatisfiedCoverage &&
              Object.keys(selectedEvent.event.unsatisfiedCoverage).length > 0 && (
                <div className="p-3 bg-amber-50 rounded border border-amber-300 font-sans text-amber-900 text-[11px] leading-relaxed">
                  <span className="font-bold">Workflow Auditor Notice:</span> Unsatisfied course outcome coverage
                  was reported in this event payload. The audit record is committed to PostgreSQL by
                  WorkflowTracker.
                </div>
              )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
