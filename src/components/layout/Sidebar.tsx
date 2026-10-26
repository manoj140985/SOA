import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  FileText,
  Files,
  Radio,
  Activity,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/questions', label: 'Question Bank', icon: FileQuestion },
  { to: '/cohorts', label: 'Cohort Exposure', icon: Users },
  { to: '/assembly', label: 'Paper Assembly', icon: FileText, highlight: true },
  { to: '/papers', label: 'Generated Papers', icon: Files },
  { to: '/events', label: 'Event Monitor', icon: Radio },
  { to: '/health', label: 'Service Health', icon: Activity },
  { to: '/security', label: 'Access & Security', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                ExamGuard
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase truncate">
                Exposure Limits System
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${item.highlight && !isActive ? 'text-blue-900' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.highlight && (
                <span className="px-1.5 py-0.2 text-[10px] font-semibold text-blue-700 bg-blue-100/80 rounded">
                  Core
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Microservices Spec Footer */}
      {!collapsed ? (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-700">Spring Boot Architecture</div>
            <div className="text-[10px] text-slate-500 leading-tight">
              Kafka · Eureka · Gateway · JPA
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-1">Topic: soa.s09.t14.events</div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-100 flex justify-center text-[10px] font-mono text-slate-400">
          SOA
        </div>
      )}
    </aside>
  );
};
