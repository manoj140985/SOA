import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Shield, User as UserIcon, LogOut, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { NotificationDrawer } from '../common/NotificationDrawer';

const ROUTE_NAMES: Record<string, { title: string; category: string }> = {
  '/': { title: 'Analytics & Overview', category: 'Dashboard' },
  '/questions': { title: 'Question Bank Management', category: 'Curriculum' },
  '/cohorts': { title: 'Cohort Exposure Ledger', category: 'Exposure Controls' },
  '/assembly': { title: 'Paper Assembly Workflow', category: 'Assessment Engine' },
  '/papers': { title: 'Generated Assessment Papers', category: 'Archive' },
  '/events': { title: 'Kafka Event Monitor', category: 'Event Streaming' },
  '/health': { title: 'Microservices Health Registry', category: 'Operations' },
  '/security': { title: 'Access & Security Matrix', category: 'Identity & JWT' },
  '/settings': { title: 'System Settings & Gateway', category: 'Configuration' },
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { user, loginAsDemoRole, logout } = useAuth();
  const { settings, unreadNotificationCount } = useSettings();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const routeInfo = ROUTE_NAMES[location.pathname] || { title: 'Assessment System', category: 'Portal' };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
        {/* Left: Breadcrumbs & Page Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>ExamGuard</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span>{routeInfo.category}</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">{routeInfo.title}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 leading-none mt-1">
            {routeInfo.title}
          </h1>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Environment Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">
              {settings.demoMode ? 'Development · Seeded Demo' : 'Connected to Gateway'}
            </span>
          </div>

          {/* Quick Assembly Link */}
          <Link
            to="/assembly"
            className="hidden md:inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            Generate Paper
          </Link>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="System notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
            )}
          </button>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
                {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'AU'}
              </div>
              <div className="hidden lg:flex flex-col text-xs leading-tight">
                <span className="font-semibold text-slate-900">{user?.fullName || 'Exam Author'}</span>
                <span className="text-[11px] text-slate-500 font-mono">{user?.role || 'examAuthor'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-slate-200 shadow-lg py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1 rounded">
                      Role: {user?.role}
                    </span>
                  </div>
                </div>

                {/* Role Switcher for local demo testing */}
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (Demo)
                </div>

                <button
                  onClick={() => {
                    loginAsDemoRole('examAuthor');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors ${
                    user?.role === 'examAuthor' ? 'text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>examAuthor</span>
                    <span className="text-[10px] text-slate-400">Can generate papers & orchestrate</span>
                  </div>
                  {user?.role === 'examAuthor' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  onClick={() => {
                    loginAsDemoRole('questionReviewer');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors ${
                    user?.role === 'questionReviewer' ? 'text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>questionReviewer</span>
                    <span className="text-[10px] text-slate-400">Can review & edit questions only</span>
                  </div>
                  {user?.role === 'questionReviewer' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <div className="mt-1 pt-1 border-t border-slate-100">
                  <Link
                    to="/security"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Security & Authorization Test
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
