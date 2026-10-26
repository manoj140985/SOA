import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  RefreshCw,
  RotateCcw,
  Check,
  AlertCircle,
  FileCode,
  BookOpen,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useData } from '../context/DataContext';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { resetToSeededData } = useData();

  const [gatewayUrl, setGatewayUrl] = useState(settings.gatewayBaseUrl);
  const [demoMode, setDemoMode] = useState(settings.demoMode);
  const [defaultCohort, setDefaultCohort] = useState(settings.defaultCohort);
  const [refreshInterval, setRefreshInterval] = useState(settings.workflowRefreshIntervalSec);
  const [theme, setTheme] = useState(settings.themePreference);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate gateway URL
    if (!gatewayUrl.startsWith('http://') && !gatewayUrl.startsWith('https://')) {
      setErrorMsg('Gateway Base URL must start with http:// or https://');
      return;
    }

    updateSettings({
      gatewayBaseUrl: gatewayUrl.trim(),
      demoMode,
      defaultCohort,
      workflowRefreshIntervalSec: Number(refreshInterval),
      themePreference: theme,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all local storage and restore deterministic seed data?')) {
      resetToSeededData();
      resetSettings();
      setGatewayUrl('http://localhost:8080');
      setDemoMode(true);
      setDefaultCohort('CSE-2026-A');
      setRefreshInterval(10);
      setTheme('light');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Gateway & Application Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">System Settings & Topology</h2>
          <p className="mt-1 text-xs text-slate-500">
            Configure Spring Cloud Gateway REST base URL, toggle between demo mode and live microservices,
            and manage default workflow intervals.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Seed Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Configuration changes saved successfully.</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Application Operating Mode</h4>
                  <p className="text-[11px] text-slate-500">
                    Switch between self-contained seeded demonstration mode and live Spring Cloud Gateway REST calls.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={demoMode}
                    onChange={(e) => setDemoMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="pt-2 text-[11px]">
                {demoMode ? (
                  <span className="text-blue-700 font-semibold">
                    ✓ Demo Mode Enabled: Uses deterministic seed data (Q201/Q202 exhausted) without needing a
                    running Spring Boot backend.
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold">
                    ⚠ Backend Mode Enabled: API requests will be dispatched to Spring Cloud Gateway at{' '}
                    <code>{gatewayUrl}</code>. Ensure the microservices stack is running.
                  </span>
                )}
              </div>
            </div>

            {/* Backend Gateway Base URL */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Spring Cloud Gateway Base URL *
              </label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Default Spring Cloud Gateway port is 8080. Route rewrites redirect to QuestionBank (8081),
                ExposureLedger (8082), PaperAssembly (8083), WorkflowTracker (8084).
              </p>
            </div>

            {/* Default Cohort and Refresh Interval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Active Cohort</label>
                <input
                  type="text"
                  value={defaultCohort}
                  onChange={(e) => setDefaultCohort(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Workflow Polling Interval (seconds)
                </label>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            {/* Theme Preference */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Theme Preference</label>
              <div className="flex items-center gap-3">
                {['light', 'dark', 'system'].map((t) => (
                  <label key={t} className="flex items-center gap-1.5 capitalize text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={t}
                      checked={theme === t}
                      onChange={() => setTheme(t as any)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* API Contracts Documentation Card */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Required Backend API Contracts</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Centralized endpoint routing consumed through Spring Cloud Gateway:
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-emerald-700 font-bold">GET</span> /api/questions
              <span className="block text-[10px] text-slate-500 font-sans">
                Question Bank paginated query
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-blue-700 font-bold">POST</span> /api/questions
              <span className="block text-[10px] text-slate-500 font-sans">
                Create new question (Reviewer)
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-emerald-700 font-bold">GET</span> /api/exposures/{'{cohortId}'}
              <span className="block text-[10px] text-slate-500 font-sans">
                Cohort exposure ledger & capacity
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-blue-700 font-bold">POST</span> /api/papers/generate
              <span className="block text-[10px] text-slate-500 font-sans">
                PaperAssembly orchestration (Author only)
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-emerald-700 font-bold">GET</span> /api/papers
              <span className="block text-[10px] text-slate-500 font-sans">
                List generated assessment papers
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-emerald-700 font-bold">GET</span> /api/events
              <span className="block text-[10px] text-slate-500 font-sans">
                Topic soa.s09.t14.events audit log
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-emerald-700 font-bold">GET</span> /actuator/health
              <span className="block text-[10px] text-slate-500 font-sans">
                Cluster Actuator health registry
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
