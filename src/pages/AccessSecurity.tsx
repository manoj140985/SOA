import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  AlertOctagon,
  CheckCircle,
  KeyRound,
  Play,
  ShieldAlert,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { UserRole, AuthTestResult } from '../types/auth';
import { Badge } from '../components/common/Badge';

export const AccessSecurity: React.FC = () => {
  const {
    user,
    token,
    isAuthenticated,
    loginAsDemoRole,
    loginWithCredentials,
    logout,
    runAuthorizationTest,
    lastAuthTestResult,
  } = useAuth();

  const { settings } = useSettings();

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authorization tester state
  const [testEndpoint, setTestEndpoint] = useState('/api/papers/generate');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('POST');
  const [isTesting, setIsTesting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    const result = await loginWithCredentials(usernameInput, passwordInput);
    setIsSubmitting(false);
    if (!result.success) {
      setLoginError(result.error || 'Authentication failed');
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    await runAuthorizationTest(testEndpoint, testMethod);
    setIsTesting(false);
  };

  const handlePresetForbiddenTest = async () => {
    // Switch role to questionReviewer and test POST /api/papers/generate
    loginAsDemoRole('questionReviewer');
    setTestEndpoint('/api/papers/generate');
    setTestMethod('POST');
    setIsTesting(true);
    await runAuthorizationTest('/api/papers/generate', 'POST');
    setIsTesting(false);
  };

  const handlePresetAllowedTest = async () => {
    // Switch role to examAuthor and test POST /api/papers/generate
    loginAsDemoRole('examAuthor');
    setTestEndpoint('/api/papers/generate');
    setTestMethod('POST');
    setIsTesting(true);
    await runAuthorizationTest('/api/papers/generate', 'POST');
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control & JWT Authorization</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Access & Security Verification</h2>
          <p className="mt-1 text-xs text-slate-500">
            Enforces Spring Security method-level authorities via Spring Cloud Gateway. Tests endpoint access
            policies and verifies HTTP 403 Forbidden boundaries.
          </p>
        </div>

        {/* Quick Role Toggle Bar */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => loginAsDemoRole('examAuthor')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              user?.role === 'examAuthor'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            examAuthor
          </button>
          <button
            onClick={() => loginAsDemoRole('questionReviewer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              user?.role === 'questionReviewer'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            questionReviewer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active User Identity & JWT Token Details */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Current Session Identity</h3>
              <Badge variant={user ? 'up' : 'down'}>{user ? 'AUTHENTICATED' : 'ANONYMOUS'}</Badge>
            </div>

            {user ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Username:</span>
                    <strong className="font-mono text-slate-900">{user.username}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="text-slate-800">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Granted Role:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 rounded">
                      ROLE_{user.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">{user.department}</span>
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="space-y-1 text-slate-600">
                  <span className="font-semibold block text-slate-800">Granted Authorities:</span>
                  {user.role === 'examAuthor' ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-800">
                      <li>AUTHORITY_PAPER_GENERATE (POST /api/papers/generate)</li>
                      <li>AUTHORITY_PAPER_READ (GET /api/papers/**)</li>
                      <li>AUTHORITY_EXPOSURE_READ (GET /api/exposures/**)</li>
                    </ul>
                  ) : (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                      <li>AUTHORITY_QUESTION_WRITE (POST /api/questions)</li>
                      <li>AUTHORITY_QUESTION_READ (GET /api/questions/**)</li>
                      <li className="text-rose-700 font-semibold line-through">
                        AUTHORITY_PAPER_GENERATE (Blocked by Security)
                      </li>
                    </ul>
                  )}
                </div>

                {/* JWT Bearer Token Preview */}
                <div>
                  <span className="text-slate-500 block mb-1">JWT Bearer Token (Header):</span>
                  <div className="p-2.5 bg-slate-900 text-slate-300 font-mono text-[10px] rounded-lg break-all max-h-20 overflow-y-auto leading-relaxed border border-slate-800">
                    Bearer {token}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active user authenticated.</p>
            )}
          </div>

          {/* Login Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Custom Credentials Login</h3>
            <p className="text-xs text-slate-500">
              Submit credentials to Spring Security authentication filter (/api/auth/login).
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              {loginError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="examAuthor or questionReviewer"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In'}
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg"
                  >
                    Logout
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (2 cols): Interactive Authorization Test Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Authorization Test Workbench */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Spring Security Authorization Tester</h3>
                <p className="text-xs text-slate-500">
                  Execute live requests with active JWT to verify Gateway filter enforcement and 403 Forbidden
                  rejections.
                </p>
              </div>
              <Terminal className="w-5 h-5 text-slate-400" />
            </div>

            {/* Quick Demonstration Preset Scenarios */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Required Demonstration Scenarios (Click to test):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePresetForbiddenTest}
                  disabled={isTesting}
                  className="p-3 text-left bg-white rounded-lg border border-rose-200 hover:border-rose-400 hover:bg-rose-50/20 transition-all text-xs space-y-1 shadow-xs group"
                >
                  <div className="flex items-center justify-between text-rose-700 font-bold">
                    <span>1. Test HTTP 403 Forbidden</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Switch to <strong>questionReviewer</strong> and attempt POST /api/papers/generate.
                    Must return <strong>HTTP 403 FORBIDDEN</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handlePresetAllowedTest}
                  disabled={isTesting}
                  className="p-3 text-left bg-white rounded-lg border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all text-xs space-y-1 shadow-xs group"
                >
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>2. Test HTTP 200 Authorized</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Switch to <strong>examAuthor</strong> and execute POST /api/papers/generate.
                    Must return <strong>HTTP 200 OK</strong>.
                  </p>
                </button>
              </div>
            </div>

            {/* Endpoint Selector Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HTTP Method</label>
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Protected Endpoint</label>
                <input
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isTesting ? 'Evaluating Gateway Filters...' : `Dispatch Request as ${user?.role || 'Guest'}`}
            </button>

            {/* Test Result Inspection Box */}
            {lastAuthTestResult && (
              <div
                className={`p-4 rounded-lg border space-y-3 ${
                  lastAuthTestResult.outcome === 'FORBIDDEN'
                    ? 'bg-rose-50/70 border-rose-300'
                    : lastAuthTestResult.outcome === 'ALLOWED'
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                        lastAuthTestResult.statusCode === 403
                          ? 'bg-rose-600 text-white'
                          : lastAuthTestResult.statusCode === 200
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      HTTP {lastAuthTestResult.statusCode}
                    </span>
                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {lastAuthTestResult.outcome}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {new Date(lastAuthTestResult.testedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-semibold">User:</span>
                    <span className="font-mono text-slate-800">
                      {lastAuthTestResult.user.username} ({lastAuthTestResult.user.role})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-semibold">Endpoint:</span>
                    <span className="font-mono text-slate-800">
                      {lastAuthTestResult.method} {lastAuthTestResult.endpoint}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200/80 font-mono text-xs text-slate-800 leading-relaxed break-words">
                  {lastAuthTestResult.responseMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
