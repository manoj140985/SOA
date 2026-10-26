import React from 'react';
import { Drawer } from './Drawer';
import { useSettings } from '../../context/SettingsContext';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, clearNotifications } = useSettings();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="System Notifications & Alerts"
      subtitle="Kafka event logs, exposure thresholds, and generation notices"
      width="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={clearNotifications}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-lg border transition-colors ${
                n.read ? 'bg-white border-slate-200' : 'bg-blue-50/40 border-blue-200/70'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{n.title}</h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono tabular-nums">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};
