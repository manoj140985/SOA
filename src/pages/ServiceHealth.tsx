import React, { useState } from 'react';
import {
  Activity,
  RefreshCw,
  Server,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Radio,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { Badge } from '../components/common/Badge';

export const ServiceHealth: React.FC = () => {
  const { servicesHealth, refreshHealth } = useData();
  const { settings } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshHealth();
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'DEMO':
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />;
      case 'DOWN':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Infrastructure & Microservice Topology</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Service Health Registry</h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-time status of Eureka service registry, Spring Cloud Gateway routes, Kafka brokers, and
            domain services.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            Check Health (Actuator)
          </button>
        </div>
      </div>

      {/* Mode Transparency Banner */}
      <div
        className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
          settings.demoMode ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {settings.demoMode
              ? 'Demonstration Environment Active'
              : `Connected to Live Spring Cloud Gateway: ${settings.gatewayBaseUrl}`}
          </p>
          <p className="leading-relaxed">
            {settings.demoMode
              ? 'Microservice cards below reflect simulated demonstration health profiles. When connected to a live backend, the application polls /actuator/health and reports live response latencies directly from Spring Boot actuators.'
              : 'Polling live actuator health endpoints. If any service is unreachable, status transitions to DOWN with network error logging.'}
          </p>
        </div>
      </div>

      {/* Microservice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicesHealth.map((svc) => (
          <div
            key={svc.name}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-sm transition-shadow"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{svc.name}</h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Port: {svc.port || '8080'} · Route: {svc.endpoint || '/api'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(svc.status)}
                  <Badge variant={svc.status}>{svc.status}</Badge>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[40px]">
                {svc.description}
              </p>

              {/* Technical Details */}
              {svc.details && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-100 space-y-1 text-[11px] font-mono text-slate-600">
                  {Object.entries(svc.details).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400 capitalize">{key}:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(svc.lastCheckedTime).toLocaleTimeString()}
              </span>
              {svc.latencyMs && (
                <span className="font-mono text-slate-600 font-semibold tabular-nums">
                  Latency: {svc.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Spring Boot Microservices Reference Architecture Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Microservices Reference Architecture & Communication Protocol
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Service</th>
                <th className="px-4 py-2.5">Responsibility</th>
                <th className="px-4 py-2.5">Data Store</th>
                <th className="px-4 py-2.5">Communication Pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              <tr>
                <td className="px-4 py-2.5 font-bold font-mono text-slate-900">QuestionBank</td>
                <td className="px-4 py-2.5">Question CRUD, CO tagging, marks, difficulty</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">PostgreSQL (JPA)</td>
                <td className="px-4 py-2.5">Synchronous REST / Eureka</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold font-mono text-slate-900">ExposureLedger</td>
                <td className="px-4 py-2.5">Calculates cohort exposures and limits with locking</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">PostgreSQL (Ledger)</td>
                <td className="px-4 py-2.5">Synchronous REST / Eureka</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold font-mono text-slate-900">PaperAssembly</td>
                <td className="px-4 py-2.5">Outcome question selection, exclusion filtering</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">PostgreSQL (Papers)</td>
                <td className="px-4 py-2.5">Kafka Producer (Topic: soa.s09.t14.events)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold font-mono text-slate-900">WorkflowTracker</td>
                <td className="px-4 py-2.5">Consumer auditing and lifecycle state machine</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">PostgreSQL (Workflow)</td>
                <td className="px-4 py-2.5">Kafka Consumer / Idempotent Receiver</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
